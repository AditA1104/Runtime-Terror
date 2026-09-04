import { expect, test } from "@playwright/test"
import { BUSY_CENTRE, queueRows, signIn, waitForQueue } from "./helpers"

test.describe("officer desk — mock mode", () => {
  test("sign-in gate blocks until name and centre are set", async ({ page }) => {
    await page.goto("/")

    const open = page.getByRole("button", { name: "Open the desk" })
    await expect(open).toBeDisabled()

    await page.getByLabel("Officer name").fill("S. Test")
    await expect(open).toBeDisabled() // centre still missing

    await page.getByRole("combobox").click()
    await page.getByRole("option", { name: new RegExp(`^${BUSY_CENTRE}`) }).click()

    await expect(open).toBeEnabled()
    await open.click()

    await expect(page.getByText("Demo data")).toBeVisible()
    await expect(page.getByRole("tab", { name: "Queue desk" })).toBeVisible()
  })

  test("queue desk lists the seeded bookings", async ({ page }) => {
    await signIn(page)

    const rows = queueRows(page)
    await expect(rows.first()).toBeVisible()
    expect(await rows.count()).toBeGreaterThan(10)

    // Every seeded token for this centre carries the BLR- prefix.
    await expect(rows.first().getByText(/BLR-\d{4}/)).toBeVisible()
  })

  test("status filters narrow the list", async ({ page }) => {
    await signIn(page)

    const total = await queueRows(page).count()

    await page.getByRole("button", { name: /^Expected/ }).click()
    const expected = await queueRows(page).count()
    expect(expected).toBeGreaterThan(0)
    expect(expected).toBeLessThan(total)

    // Every visible row in this filter must be BOOKED.
    await expect(
      queueRows(page).filter({ hasText: "Booked" }),
    ).toHaveCount(expected)
  })

  test("search matches, and a miss shows the empty state", async ({ page }) => {
    await signIn(page)

    const search = page.getByPlaceholder(/Search token, name, phone/)
    await search.fill("BLR-1001")
    await expect(queueRows(page)).toHaveCount(1)

    await search.fill("zzz-no-such-token")
    await expect(page.getByText("No tokens match")).toBeVisible()
  })

  test("tabs switch between queue, metrics and quota", async ({ page }) => {
    await signIn(page)

    await page.getByRole("tab", { name: "Today" }).click()
    await expect(page.getByText("Tokens issued today")).toBeVisible()
    await expect(page.getByText("Farmers on the floor right now")).toBeVisible()

    await page.getByRole("tab", { name: "Quota" }).click()
    await expect(page.getByRole("heading", { name: "Quota & capacity" })).toBeVisible()
    await expect(page.getByLabel("Daily capacity (kg)")).toHaveValue("60000")
  })

  test("checking a farmer in advances the row", async ({ page }) => {
    await signIn(page)

    await page.getByRole("button", { name: /^Expected/ }).click()
    const firstBooked = queueRows(page).first()
    const token = (await firstBooked.getByText(/BLR-\d{4}/).textContent())!.trim()

    await firstBooked.getByRole("button", { name: "Check in" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog.getByText(token)).toBeVisible()
    await dialog.getByRole("button", { name: "Check in" }).click()

    await expect(page.getByText(new RegExp(`${token}.*check in done`, "i"))).toBeVisible()

    // Find the row again on the All filter — it should now read "Checked in".
    await page.getByRole("button", { name: /^All/ }).click()
    await page.getByPlaceholder(/Search token, name, phone/).fill(token)
    await expect(queueRows(page).first().getByText("Checked in")).toBeVisible()
  })
})

test("mock mutations broadcast across tabs without a reload", async ({ context }) => {
  const deskA = await context.newPage()
  await signIn(deskA)

  // Second tab reuses the persisted session, so it opens straight onto the desk.
  const deskB = await context.newPage()
  await deskB.goto("/")
  await waitForQueue(deskB)

  await deskA.getByRole("button", { name: /^Expected/ }).click()
  const row = queueRows(deskA).first()
  const token = (await row.getByText(/BLR-\d{4}/).textContent())!.trim()

  await row.getByRole("button", { name: "Check in" }).click()
  const dialog = deskA.getByRole("dialog")
  await dialog.getByRole("button", { name: "Check in" }).click()
  await expect(deskA.getByText(new RegExp(`${token}.*check in done`, "i"))).toBeVisible()

  // deskB never reloaded — the BroadcastChannel echo must move the row.
  await deskB.getByPlaceholder(/Search token, name, phone/).fill(token)
  await expect(queueRows(deskB).first().getByText("Checked in")).toBeVisible({ timeout: 10_000 })
})

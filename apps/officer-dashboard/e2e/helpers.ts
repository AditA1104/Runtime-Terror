import { expect, type Page } from "@playwright/test"

/** The busiest seeded centre — deterministic 34-booking desk. See src/data/mock.ts. */
export const BUSY_CENTRE = "Lasalgaon APMC"

/**
 * Walk the sign-in card: type an officer name, pick a centre, open the desk.
 * Leaves the page on the Queue desk tab with the table loaded.
 */
export async function signIn(page: Page, centre = BUSY_CENTRE, officer = "S. Test") {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "AgriQ officer desk" })).toBeVisible()
  const open = page.getByRole("button", { name: "Open the desk" })
  await expect(open).toBeDisabled()

  await page.getByLabel("Officer name").fill(officer)

  await page.getByRole("combobox").click()
  await page.getByRole("option", { name: new RegExp(`^${centre}`) }).click()

  await expect(open).toBeEnabled()
  await open.click()

  await expect(page.getByText("Demo data")).toBeVisible()
  await waitForQueue(page)
}

/** Wait for the skeleton rows to be replaced by real data. */
export async function waitForQueue(page: Page) {
  await expect(page.getByRole("tabpanel").locator("table tbody tr").first()).toBeVisible({
    timeout: 15_000,
  })
}

/** Rows currently rendered in the queue table body. */
export function queueRows(page: Page) {
  return page.getByRole("tabpanel").locator("table tbody tr")
}

# 📱 AgriQ — P4: USSD Gateway & Feature-Phone SMS Simulator
**SIH 2026 | Problem Statement 26032 | Team: Runtime-Terror | Karnataka State APMC Edition**

---

## 🎯 What is this Module?
This module provides **100% digital mandi procurement access for farmers without smartphones, internet, or data plans**. 

By dialing `*99#` on any basic 2G feature phone (Nokia, JioPhone, etc.), a farmer can:
1. **Book a time-bound mandi slot** (token generated instantly).
2. **Check their live token & queue position**.
3. **Check commodity mandi rates & optimal sell-date forecasts** (powered by P5's predictive engine).
4. **Receive proactive simulated SMS alerts** at every stage (Check-in → Weighbridge → Quality Assayer → DBT Payment).

---

## 🛠️ Architecture & Tech Alignment
- **Frontend**: Custom retro feature-phone chassis with LCD screen, audio synthesised bleeps, and live SMS notification feed.
- **Backend / Database**: Maps directly to Supabase **Schema v2**:
  - `ussd_sessions`: Tracks multi-step numeric session navigation.
  - `slots_available` View: Fetches open slot capacities.
  - `daily_rates_cache`: Fast plain-text forecast lookup from P5.
  - `transition_booking_status()`: Enforces state-machine checkpoint progression.
- **Fail-Safe Mode**: Includes built-in mock fallback so the demo never fails even if WiFi or backend is temporarily down.

---

## 🚀 How to Run the Simulator
Simply open `index.html` in any web browser:
- **Double click** `index.html` in File Explorer, OR
- In VS Code, right-click `index.html` → **Open with Live Server**.

---

## 📋 60-Second Demo Pitch for Judges (Demo Script)

1. **The Hook (10s):**
   > *"While our web PWA serves smartphone users, over 60% of Indian farmers rely on basic feature phones with no internet. We built a zero-data USSD gateway on `*99#` so no farmer is left behind."*

2. **The Booking Flow (25s):**
   - Click **CALL** on `*99#` → Press `1` (Book Slot)
   - Press `1` (Ragi) → Press `1` (Bengaluru APMC (Yeshwanthpur)) → Press `1` (Tomorrow 08:00 AM)
   - Enter `1500` kg → Press `1` (Confirm)
   - Point out: **Token `BLR-XXXX` is allocated, and an SMS confirmation immediately appears in the SMS feed on the right.**

3. **The Live Mandi Flow (20s):**
   - Click the checkpoint buttons in the **Officer Checkpoint Simulator** card:
     - Click **1. Check-In** → Watch Gate Pass SMS arrive.
     - Click **2. Weighbridge** → Watch Weight SMS arrive (`1,450 kg`).
     - Click **3. Quality** → Watch Grade-A SMS arrive.
     - Click **4. Payment** → Watch DBT Payment SMS arrive (`₹31,525`).
   - Open USSD `*99#` → Press `2` (Check Status) → Screen shows live updated state: `COMPLETED`.

4. **The Conclusion (5s):**
   > *"Every single action reads and writes to the exact same Postgres database as the officer's desktop and the farmer's smartphone app."*

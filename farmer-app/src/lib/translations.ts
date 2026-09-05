export type SupportedLang = 'en' | 'hi' | 'mr' | 'kn' | 'te' | 'pa';

export interface LangInfo {
  code: SupportedLang;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LangInfo[] = [
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', flag: '🟡' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🟠' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🌐' },
];

export const translations: Record<SupportedLang, Record<string, string>> = {
  en: {
    // App header & nav
    app_title: 'AgriQ Farmer',
    app_tagline: 'Smart Mandi Token & Procurement Companion',
    nav_home: 'Home',
    nav_book: 'Book Slot',
    nav_tokens: 'My Tokens',
    nav_insights: 'Best Day AI',
    nav_alerts: 'SMS Alerts',
    offline_badge: 'Offline Mode Active',
    offline_msg: 'Cached pass available. Changes will sync when online.',
    live_sync: 'Live Sync',
    demo_ready: 'Demo Ready',
    login_btn_text: 'Login',

    // PWA promo
    pwa_install_title: 'Install AgriQ Farmer App',
    pwa_install_desc: 'Access offline token pass inside mandi yard',
    btn_install: 'Install',

    // Auth & Profile
    login_title: 'Farmer Login',
    login_subtitle: 'Enter your 10-digit mobile number to receive digital token passes',
    phone_label: 'Mobile Number',
    phone_placeholder: 'e.g. 9876543210',
    otp_label: 'Enter 4-Digit OTP',
    otp_placeholder: '• • • •',
    btn_send_otp: 'Get OTP (SMS)',
    btn_verify_otp: 'Verify & Login',
    btn_change_phone: 'Change Number',
    otp_demo_hint: 'Demo OTP: Use 1234 or any 4 digits',
    profile_welcome: 'Welcome, Farmer',
    profile_edit: 'Edit Profile',
    farmer_name: 'Full Name',
    village_name: 'Village / Town',
    district_name: 'District',
    state_name: 'State',
    preferred_lang: 'Preferred Language',
    save_profile: 'Save Profile',
    profiles_modal_title: 'Farmer Profiles & Accounts',
    profiles_modal_sub: 'Switch between farmers or add a new phone account',
    tab_switch: 'Switch',
    tab_add_account: '+ Add Account',
    tab_edit_profile: 'Edit Profile',
    saved_profiles: 'Saved Farmer Profiles',
    active_badge: 'Active',
    login_another_phone: '+ Login with another mobile number',
    quick_add_demo_title: '1-Tap Quick Add Demo Profiles:',
    otp_sent_to: 'OTP sent to',
    change_number: 'Change',
    verifying_btn: 'Verifying...',
    saving_btn: 'Saving...',

    // Quick Stats & Hero
    hero_title: 'Smart Procurement, Zero Queue Hassle',
    hero_subtitle: 'Book your digital mandi gate pass, track live queue, and know the best day to sell.',
    active_token_banner: 'You have an Active Mandi Token today!',
    btn_view_pass: 'View Digital Pass',
    btn_new_booking: 'Book Mandi Token',
    btn_new_booking_sub: 'Select crop & mandi slot',
    no_active_pass: 'No active pass',
    view_details: 'View Details →',
    refresh_live_data: 'Refresh Live Data',
    no_active_tokens_title: 'No Active Mandi Tokens',
    no_active_tokens_desc: 'Book a digital slot to get your gate entry QR pass and avoid long mandi queues.',
    token_history_title: 'Your Token History',

    // Best Day Card & Forecast
    best_day_title: 'AI Smart Dispatch Advisor',
    best_day_badge: 'Best Day to Sell',
    best_day_reason_high_price: 'High price trend, low crowd anticipated',
    best_day_reason_moderate: 'Stable rates, moderate queue load',
    best_day_reason_rush: 'Heavy rush expected, consider booking later',
    msp_guarantee: 'Government MSP Rate',
    current_forecast: 'Predicted Price',
    queue_penalty: 'Queue Load Penalty',
    recommended_date: 'Recommended Selling Date',
    predicted_rate_label: 'Predicted Rate',
    best_day_explanation: 'Our predictive dispatch engine scores booking load and commodity trends to prevent mandi yard bottlenecks and maximize your selling price.',
    govt_msp_protected: 'Govt MSP Protected',
    btn_book_for_this_day: 'Book for this Day',
    price_trend_title: '7-Day Mandi Price & Rush Forecast',
    price_trend_desc: 'Predictive AI model balances expected market rate against mandi arrival queues.',
    badge_best: '★ Best',
    ai_dispatch_formula: 'AI Dispatch Formula: Score = Price Trend − Booking Congestion Penalty',
    live_scored: 'Live Scored',
    select_crop_forecast: 'Select Commodity to Forecast:',
    ai_insights_sub: 'Real-time smart dispatch optimizer for agricultural commodities',

    // 4-Step Booking Wizard
    wizard_step1_title: 'Select Crop',
    wizard_step1_desc: 'Choose the crop you want to sell at the mandi center',
    wizard_step2_title: 'Select Mandi Center',
    wizard_step2_desc: 'Choose an authorized APMC procurement center nearby',
    wizard_step3_title: 'Date & Time Slot',
    wizard_step3_desc: 'Select preferred day and available time window',
    wizard_step4_title: 'Confirm & Generate Pass',
    wizard_step4_desc: 'Enter estimated quantity and receive your digital QR token',
    step_progress: 'Step',
    of_steps: 'of',
    cancel: 'Cancel',

    // Crops
    crop_ragi: 'Ragi (Finger Millet / ರಾಗಿ)',
    crop_tur: 'Tur / Red Gram (ತೊಗರಿ / अरहर)',
    crop_wheat: 'Wheat (गेहूं)',
    crop_soybean: 'Soybean (सोयाबीन)',
    crop_cotton: 'Cotton (कपास)',
    crop_paddy: 'Paddy / Rice (धान)',
    crop_mustard: 'Mustard (सरसों)',
    crop_chana: 'Gram / Chana (चना)',
    crop_onion: 'Onion (प्याज)',
    crop_maize: 'Maize (मक्का)',

    // Step 1
    msp_guaranteed_banner: 'Government Minimum Support Price (MSP) Guaranteed',
    msp_guaranteed_desc: 'All prices shown are direct APMC procurement rates per quintal (100 kg).',

    // Step 2
    all_mandis: 'All Mandis',
    karnataka_tab: 'Karnataka (ಕರ್ನಾಟಕ)',
    maharashtra_tab: 'Maharashtra (महाराष्ट्र)',
    authorized_centers_for: 'Authorized APMC centers procuring',
    centers_count: 'Centers',
    no_centers_found: 'No centers found in this state for',
    show_all_centers: 'Show all available APMC centers',
    apmc_verified: 'APMC Verified',
    daily_quota: 'Daily Quota',
    tons: 'Tons',
    hourly_limit: 'Hourly Limit',
    farmers_per_hr: 'farmers/hr',
    avg_process: 'Avg Process',

    // Step 3
    forecast_rate_label: 'Forecast Rate:',
    select_recommended_day: '⚡ Select this recommended day →',
    no_slots_found: 'No open slots found for this date. Please select another day.',
    slot_full_label: 'Full',
    left_suffix: 'left',
    of_label: 'of',
    booked_label: 'booked',
    full_pct_label: 'full',

    // Step 4
    procurement_summary: 'Procurement Summary',
    apmc_center_label: 'APMC Center',
    selling_date_label: 'Selling Date',
    assigned_gate_slot: 'Assigned Gate Slot',
    farmer_label: 'Farmer:',
    unit_kg: 'Kilograms (Kg)',
    unit_quintal: 'Quintals (q)',
    quick_presets: 'Quick:',
    direct_bank_dbt: 'Direct Bank DBT',
    generating_pass: 'Generating Digital Pass...',

    // Booking Details
    select_date: 'Select Selling Date',
    available_slots: 'Available Time Slots',
    slots_remaining: 'slots left',
    slot_full: 'Slot Full',
    est_quantity: 'Estimated Produce Quantity',
    in_quintals: 'Quintals (1 Quintal = 100 kg)',
    in_kg: 'Kilograms (Kg)',
    est_total_payout: 'Estimated Total Value (at MSP)',
    btn_next: 'Continue',
    btn_back: 'Back',
    btn_confirm_token: 'Confirm & Generate Gate Pass',
    booking_success: 'Booking Confirmed!',
    booking_success_msg: 'Your digital token pass has been generated. QR code is ready for gate scan.',

    // Token Pass Card
    token_pass_title: 'Mandi Gate Entry Pass',
    apmc_smart_pass_header: 'APMC Smart Procurement Pass',
    created_via: 'Created Via',
    token_number: 'Token No.',
    gate_entry_time: 'Assigned Slot',
    queue_position_label: 'Current Queue Position',
    queue_in_line: 'in queue',
    est_wait_time: 'Est. Wait Time',
    mins: 'mins',
    qr_instruction: 'Show this QR code to the Mandi gate officer for instant check-in',
    btn_download_pass: 'Save Pass Offline',
    btn_share_sms: 'Share via SMS/WhatsApp',
    btn_cancel_booking: 'Cancel Token',
    status_slot_confirmed: 'Slot Confirmed',
    status_checked_in: 'Checked-in at Gate',
    status_weighed: 'Weight Logged',
    status_quality_approved: 'Quality Approved',
    status_payment_initiated: 'DBT Initiated',
    status_procurement_done: 'Procurement Done',
    status_cancelled: 'Cancelled',
    at_checkpoint: 'At Checkpoint',
    date_label: 'Date',
    gate_window: 'Gate Window',
    crop_declared_weight: 'Crop & Declared Weight',
    dbt_payout: 'DBT Payout',
    track_live_progress: 'Track Live Mandi Checkpoint Progress',
    view_tracker_btn: 'View Tracker →',
    pass_downloaded: 'Pass Downloaded!',
    generating_pass_btn: 'Generating Pass...',

    // 6-Stage Realtime Status Tracker
    tracker_title: 'Live Procurement Status',
    tracker_subtitle: 'Updates in real-time as your vehicle moves across checkpoints',
    live_queue_sync: 'Live Mandi Queue Sync',
    next_action: 'Next Action:',
    status_in_process: 'In Process',
    status_done: 'Done',
    in_progress_badge: 'In Progress',
    completed_badge: 'Completed',
    checked_in_at: 'Checked in at:',
    official_receipt: 'Official APMC Procurement Receipt',
    download_btn: 'Download',

    stage_booked: 'Token Booked',
    stage_booked_desc: 'Slot confirmed. Present QR pass at the entrance gate.',
    stage_checked_in: 'Checked In at Gate',
    stage_checked_in_desc: 'Vehicle verified and admitted into the mandi yard.',
    stage_weighed: 'Weighbridge Gross/Net Weight',
    stage_weighed_desc: 'Produce gross & tare weight recorded on digital scale.',
    stage_quality_approved: 'Quality Assayer Approved',
    stage_quality_approved_desc: 'Moisture and quality graded by government assayer.',
    stage_payment_initiated: 'DBT Payment Initiated',
    stage_payment_initiated_desc: 'Direct Benefit Transfer sent directly to your Aadhaar-linked bank account.',
    stage_completed: 'Procurement Completed',
    stage_completed_desc: 'Final bill & tax receipt generated. Procurement cycle done.',

    action_booked: 'Waiting for Arrival / Gate Check-in',
    action_checked_in: 'Proceed to Weighbridge (Lane 2)',
    action_weighed: 'Proceed to Quality Assayer Booth',
    action_quality_approved: 'Proceed to Accounts Desk for DBT',
    action_payment_initiated: 'DBT Payment Transfer in Progress',
    action_completed: 'Procurement Cycle Completed',
    action_cancelled: 'Token Cancelled',

    // Stage field details
    field_quantity: 'Gross Weight',
    field_grade: 'Assigned Grade',
    field_payment: 'Amount Paid (DBT)',
    field_turnaround: 'Turnaround Time',

    // Share Modal
    share_modal_title: 'Share Token Pass',
    share_modal_desc: 'Send digital pass to a driver or family member.',
    share_via_apps: 'Share via Any App / Messaging',
    copy_text: 'Copy Text',
    copied: 'Copied!',
    or_send_via_sms: 'or send via SMS',
    send_sms_btn: 'Send SMS Pass Link',
    sms_dispatched_title: 'SMS Dispatched!',
    sms_dispatched_desc: 'Sent pass details & QR verification link.',
    enter_mobile_placeholder: 'Enter 10-digit mobile',

    // Notifications Feed
    notifications_title: 'SMS Alerts & Logs',
    notifications_sub: 'Simulated SMS & Mandi alerts delivered to your phone',
    notifications_empty: 'No notifications yet. Alerts will appear here when your status updates.',
    logs_badge: 'Logs',
    via_gateway: 'via SMS Gateway',
    view_pass_link: 'View Digital Pass →',
  },

  kn: {
    // App header & nav
    app_title: 'ಅಗ್ರಿ-ಕ್ಯೂ ರೈತ ಮಿತ್ರ',
    app_tagline: 'ಸ್ಮಾರ್ಟ್ ಮಾರುಕಟ್ಟೆ ಟೋಕನ್ ಮತ್ತು ಖರೀದಿ ವ್ಯವಸ್ಥೆ',
    nav_home: 'ಮುಖಪುಟ',
    nav_book: 'ಟೋಕನ್ ಬುಕ್',
    nav_tokens: 'ಟೋಕನ್‌ಗಳು',
    nav_insights: 'ಮಾರಾಟ AI',
    nav_alerts: 'ಎಸ್‌ಎಂಎಸ್',
    offline_badge: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    offline_msg: 'ಪಾಸ್ ಸುರಕ್ಷಿತವಾಗಿದೆ. ಇಂಟರ್ನೆಟ್ ಬಂದಾಗ ಸಿಂಕ್ ಆಗುತ್ತದೆ.',
    live_sync: 'ಲೈವ್ ಸಿಂಕ್',
    demo_ready: 'ಡೆಮೊ ಸಿದ್ಧ',
    login_btn_text: 'ಲಾಗಿನ್',

    // PWA promo
    pwa_install_title: 'AgriQ ರೈತ ಆ್ಯಪ್ ಸ್ಥಾಪಿಸಿ',
    pwa_install_desc: 'ಮಂಡಿ ಆವರಣದಲ್ಲಿ ಆಫ್‌ಲೈನ್ ಟೋಕನ್ ಪಾಸ್ ಬಳಸಿ',
    btn_install: 'ಸ್ಥಾಪಿಸಿ',

    // Auth & Profile
    login_title: 'ರೈತರ ಲಾಗಿನ್',
    login_subtitle: 'ಡಿಜಿಟಲ್ ಟೋಕನ್ ಪಡೆಯಲು ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
    phone_label: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    phone_placeholder: 'ಉದಾ. 9876543210',
    otp_label: '4 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ',
    otp_placeholder: '• • • •',
    btn_send_otp: 'OTP ಕಳುಹಿಸಿ (SMS)',
    btn_verify_otp: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲಾಗಿನ್ ಮಾಡಿ',
    btn_change_phone: 'ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ',
    otp_demo_hint: 'ಡೆಮೊ OTP: 1234 ಅಥವಾ ಯಾವುದೇ 4 ಅಂಕಿಗಳನ್ನು ನಮೂದಿಸಿ',
    profile_welcome: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ',
    profile_edit: 'ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ',
    farmer_name: 'ಪೂರ್ಣ ಹೆಸರು',
    village_name: 'ಗ್ರಾಮ / ಪಟ್ಟಣ',
    district_name: 'ಜಿಲ್ಲೆ',
    state_name: 'ರಾಜ್ಯ',
    preferred_lang: 'ಆದ್ಯತೆಯ ಭಾಷೆ',
    save_profile: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ',
    profiles_modal_title: 'ರೈತರ ಪ್ರೊಫೈಲ್‌ಗಳು ಮತ್ತು ಖಾತೆಗಳು',
    profiles_modal_sub: 'ರೈತರ ನಡುವೆ ಬದಲಾಯಿಸಿ ಅಥವಾ ಹೊಸ ಖಾತೆ ಸೇರಿಸಿ',
    tab_switch: 'ಖಾತೆ ಬದಲಾಯಿಸಿ',
    tab_add_account: '+ ಖಾತೆ ಸೇರಿಸಿ',
    tab_edit_profile: 'ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ',
    saved_profiles: 'ಉಳಿಸಿದ ರೈತರ ಪ್ರೊಫೈಲ್‌ಗಳು',
    active_badge: 'ಸಕ್ರಿಯ',
    login_another_phone: '+ ಇನ್ನೊಂದು ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
    quick_add_demo_title: '1-ಕ್ಲಿಕ್ ಡೆಮೊ ಪ್ರೊಫೈಲ್‌ಗಳು:',
    otp_sent_to: 'OTP ಕಳುಹಿಸಲಾದ ಸಂಖ್ಯೆ:',
    change_number: 'ಬದಲಾಯಿಸಿ',
    verifying_btn: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    saving_btn: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',

    // Quick Stats & Hero
    hero_title: 'ಸ್ಮಾರ್ಟ್ ಖರೀದಿ, ಸರತಿ ಸಾಲಿನ ಮುಕ್ತಿ',
    hero_subtitle: 'ಮನೆಯಲ್ಲೇ ಮಂಡಿ ಟೋಕನ್ ಪಡೆಯಿರಿ, ಲೈವ್ ಸರತಿ ಸಾಲು ಗಮನಿಸಿ ಮತ್ತು ಉತ್ತಮ ಮಾರಾಟ ದಿನ ತಿಳಿಯಿರಿ.',
    active_token_banner: 'ನಿಮ್ಮ ಇಂದಿನ ಮಂಡಿ ಟೋಕನ್ ಸಕ್ರಿಯವಾಗಿದೆ!',
    btn_view_pass: 'ಡಿಜಿಟಲ್ ಪಾಸ್ ವೀಕ್ಷಿಸಿ',
    btn_new_booking: 'ಹೊಸ ಟೋಕನ್ ಬುಕ್ ಮಾಡಿ',
    btn_new_booking_sub: 'ಬೆಳೆ ಮತ್ತು ಮಂಡಿ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ',
    no_active_pass: 'ಯಾವುದೇ ಸಕ್ರಿಯ ಪಾಸ್ ಇಲ್ಲ',
    view_details: 'ವಿವರಗಳನ್ನು ನೋಡಿ →',
    refresh_live_data: 'ಲೈವ್ ಡೇಟಾ ನವೀಕರಿಸಿ',
    no_active_tokens_title: 'ಯಾವುದೇ ಸಕ್ರಿಯ ಮಂಡಿ ಟೋಕನ್‌ಗಳಿಲ್ಲ',
    no_active_tokens_desc: 'ಗೇಟ್ ಪ್ರವೇಶ QR ಪಾಸ್ ಪಡೆಯಲು ಮತ್ತು ಉದ್ದನೆಯ ಸರತಿ ಸಾಲನ್ನು ತಪ್ಪಿಸಲು ಡಿಜಿಟಲ್ ಸ್ಲಾಟ್ ಕಾಯ್ದಿರಿಸಿ.',
    token_history_title: 'ನಿಮ್ಮ ಟೋಕನ್ ಇತಿಹಾಸ',

    // Best Day Card & Forecast
    best_day_title: 'AI ಮಾರಾಟ ದಿನ ಸಲಹೆಗಾರ',
    best_day_badge: 'ಮಾರಾಟಕ್ಕೆ ಅತ್ಯುತ್ತಮ ದಿನ',
    best_day_reason_high_price: 'ಹೆಚ್ಚಿನ ಬೆಲೆ ಮತ್ತು ಮಂಡಿಯಲ್ಲಿ ಕಡಿಮೆ ಜನಸಂದಣಿ ನಿರೀಕ್ಷೆ',
    best_day_reason_moderate: 'ಸ್ಥಿರ ದರ ಮತ್ತು ಸಾಧಾರಣ ಸರತಿ',
    best_day_reason_rush: 'ಹೆಚ್ಚಿನ ದಟ್ಟಣೆ ನಿರೀಕ್ಷೆ, ಮುಂದಿನ ದಿನ ಆರಿಸಿ',
    msp_guarantee: 'ಸರ್ಕಾರಿ ಬೆಂಬಲ ಬೆಲೆ (MSP)',
    current_forecast: 'ನಿರೀಕ್ಷಿತ ಬೆಲೆ',
    queue_penalty: 'ದಟ್ಟಣೆ ಸೂಚ್ಯಂಕ',
    recommended_date: 'ಶಿಫಾರಸು ಮಾಡಿದ ದಿನಾಂಕ',
    predicted_rate_label: 'ನಿರೀಕ್ಷಿತ ದರ',
    best_day_explanation: 'ನಮ್ಮ ಮುನ್ಸೂಚಕ ವ್ಯವಸ್ಥೆಯು ಮಂಡಿ ಜನದಟ್ಟಣೆಯನ್ನು ತಡೆಯಲು ಮತ್ತು ನಿಮಗೆ ಗರಿಷ್ಠ ಬೆಲೆ ಒದಗಿಸಲು ಬೆಲೆ ಟ್ರೆಂಡ್ ಹಾಗೂ ಬುಕಿಂಗ್ ಲೋಡ್ ಅನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ.',
    govt_msp_protected: 'ಸರ್ಕಾರಿ ಬೆಂಬಲ ಬೆಲೆ (MSP) ರಕ್ಷಣೆ',
    btn_book_for_this_day: 'ಈ ದಿನಕ್ಕೆ ಕಾಯ್ದಿರಿಸಿ',
    price_trend_title: '7 ದಿನಗಳ ಮಂಡಿ ದರ ಮತ್ತು ಜನದಟ್ಟಣೆ ಮುನ್ಸೂಚನೆ',
    price_trend_desc: 'ಮುನ್ಸೂಚಕ AI ಮಾದರಿಯು ಮಾರುಕಟ್ಟೆ ದರ ಮತ್ತು ಮಂಡಿ ಆಗಮನದ ಸರತಿ ಸಾಲನ್ನು ಸಮತೋಲನಗೊಳಿಸುತ್ತದೆ.',
    badge_best: '★ ಅತ್ಯುತ್ತಮ',
    ai_dispatch_formula: 'AI ಡಿಸ್ಪ್ಯಾಚ್ ಸೂತ್ರ: ಸ್ಕೋರ್ = ಬೆಲೆ ಟ್ರೆಂಡ್ − ದಟ್ಟಣೆ ದಂಡ',
    live_scored: 'ಲೈವ್ ಸ್ಕೋರ್',
    select_crop_forecast: 'ಮುನ್ಸೂಚನೆಗಾಗಿ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ:',
    ai_insights_sub: 'ಕೃಷಿ ಉತ್ಪನ್ನಗಳಿಗಾಗಿ ನೈಜ ಸಮಯದ ಸ್ಮಾರ್ಟ್ ಡಿಸ್ಪ್ಯಾಚ್ ಆಪ್ಟಿಮೈಜರ್',

    // 4-Step Booking Wizard
    wizard_step1_title: 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ',
    wizard_step1_desc: 'ನೀವು ಮಂಡಿಯಲ್ಲಿ ಮಾರಾಟ ಮಾಡಲು ಬಯಸುವ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    wizard_step2_title: 'ಮಂಡಿ ಕೇಂದ್ರವನ್ನು ಆರಿಸಿ',
    wizard_step2_desc: 'ಹತ್ತಿರದ ಅಧಿಕೃತ APMC ಕೇಂದ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    wizard_step3_title: 'ದಿನಾಂಕ ಮತ್ತು ಸಮಯದ ಸ್ಲಾಟ್',
    wizard_step3_desc: 'ಅನುಕೂಲಕರ ದಿನ ಮತ್ತು ಲಭ್ಯವಿರುವ ಸಮಯವನ್ನು ಆರಿಸಿ',
    wizard_step4_title: 'ಪ್ರಮಾಣ ನಮೂದಿಸಿ ಪಾಸ್ ಪಡೆಯಿರಿ',
    wizard_step4_desc: 'ಅಂದಾಜು ತೂಕ ನಮೂದಿಸಿ ಮತ್ತು QR ಕೋಡ್ ಪಾಸ್ ಪಡೆಯಿರಿ',
    step_progress: 'ಹಂತ',
    of_steps: 'ರ',
    cancel: 'ರದ್ದುಮಾಡಿ',

    // Crops
    crop_ragi: 'ರಾಗಿ (Ragi / Finger Millet)',
    crop_tur: 'ತೊಗರಿ / ತೊಗರಿ ಬೇಳೆ (Tur Dal)',
    crop_wheat: 'ಗೋಧಿ (Wheat)',
    crop_soybean: 'ಸೋಯಾಬೀನ್ (Soybean)',
    crop_cotton: 'ಹತ್ತಿ (Cotton)',
    crop_paddy: 'ಭತ್ತ (Paddy)',
    crop_mustard: 'ಸಾಸಿವೆ (Mustard)',
    crop_chana: 'ಕಡಲೆ (Gram)',
    crop_onion: 'ಈರುಳ್ಳಿ (Onion)',
    crop_maize: 'ಮೆಕ್ಕೆಜೋಳ (Maize)',

    // Step 1
    msp_guaranteed_banner: 'ಸರ್ಕಾರಿ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಖಾತರಿ',
    msp_guaranteed_desc: 'ತೋರಿಸಲಾದ ಎಲ್ಲಾ ಬೆಲೆಗಳು ಪ್ರತಿ ಕ್ವಿಂಟಾಲ್ (100 ಕೆಜಿ) ನೇರ APMC ಖರೀದಿ ದರಗಳಾಗಿವೆ.',

    // Step 2
    all_mandis: 'ಎಲ್ಲಾ ಮಂಡಿಗಳು',
    karnataka_tab: 'ಕರ್ನಾಟಕ (Karnataka)',
    maharashtra_tab: 'ಮಹಾರಾಷ್ಟ್ರ (Maharashtra)',
    authorized_centers_for: 'ಖರೀದಿಸುವ ಅಧಿಕೃತ APMC ಕೇಂದ್ರಗಳು',
    centers_count: 'ಕೇಂದ್ರಗಳು',
    no_centers_found: 'ಈ ರಾಜ್ಯದಲ್ಲಿ ಈ ಬೆಳೆಗೆ ಯಾವುದೇ ಕೇಂದ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    show_all_centers: 'ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ APMC ಕೇಂದ್ರಗಳನ್ನು ತೋರಿಸಿ',
    apmc_verified: 'APMC ಪರಿಶೀಲಿತ',
    daily_quota: 'ದೈನಂದಿನ ಕೋಟಾ',
    tons: 'ಟನ್‌ಗಳು',
    hourly_limit: 'ಗಂಟೆಯ ಮಿತಿ',
    farmers_per_hr: 'ರೈತರು/ಗಂಟೆ',
    avg_process: 'ಸರಾಸರಿ ಸಮಯ',

    // Step 3
    forecast_rate_label: 'ಮುನ್ಸೂಚನೆ ದರ:',
    select_recommended_day: '⚡ ಈ ಶಿಫಾರಸು ಮಾಡಿದ ದಿನವನ್ನು ಆರಿಸಿ →',
    no_slots_found: 'ಈ ದಿನಾಂಕಕ್ಕೆ ಯಾವುದೇ ತೆರೆದ ಸ್ಲಾಟ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಇನ್ನೊಂದು ದಿನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    slot_full_label: 'ಭರ್ತಿಯಾಗಿದೆ',
    left_suffix: 'ಉಳಿದಿದೆ',
    of_label: 'ರ',
    booked_label: 'ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ',
    full_pct_label: 'ಭರ್ತಿ',

    // Step 4
    procurement_summary: 'ಖರೀದಿ ಸಾರಾಂಶ',
    apmc_center_label: 'APMC ಕೇಂದ್ರ',
    selling_date_label: 'ಮಾರಾಟದ ದಿನಾಂಕ',
    assigned_gate_slot: 'ನಿಯೋಜಿತ ಗೇಟ್ ಸ್ಲಾಟ್',
    farmer_label: 'ರೈತರು:',
    unit_kg: 'ಕಿಲೋಗ್ರಾಂ (Kg)',
    unit_quintal: 'ಕ್ವಿಂಟಾಲ್ (q)',
    quick_presets: 'ತ್ವರಿತ ಆಯ್ಕೆ:',
    direct_bank_dbt: 'ನೇರ ಬ್ಯಾಂಕ್ DBT',
    generating_pass: 'ಡಿಜಿಟಲ್ ಪಾಸ್ ರಚಿಸಲಾಗುತ್ತಿದೆ...',

    // Booking Details
    select_date: 'ಮಾರಾಟದ ದಿನಾಂಕ ಆರಿಸಿ',
    available_slots: 'ಲಭ್ಯವಿರುವ ಸಮಯ ಸ್ಲಾಟ್‌ಗಳು',
    slots_remaining: 'ಸ್ಥಳಗಳು ಉಳಿದಿವೆ',
    slot_full: 'ಸ್ಲಾಟ್ ಭರ್ತಿಯಾಗಿದೆ',
    est_quantity: 'ಅಂದಾಜು ಬೆಳೆ ತೂಕ',
    in_quintals: 'ಕ್ವಿಂಟಾಲ್ (1 ಕ್ವಿಂಟಾಲ್ = 100 ಕೆಜಿ)',
    in_kg: 'ಕಿಲೋಗ್ರಾಂ (Kg)',
    est_total_payout: 'ಒಟ್ಟು ಅಂದಾಜು ಮೊತ್ತ (MSP ಪ್ರಕಾರ)',
    btn_next: 'ಮುಂದೆ',
    btn_back: 'ಹಿಂದೆ',
    btn_confirm_token: 'ದೃಢೀಕರಿಸಿ ಮತ್ತು ಟೋಕನ್ ಪಡೆಯಿರಿ',
    booking_success: 'ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿದೆ!',
    booking_success_msg: 'ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಪಾಸ್ ಸಿದ್ಧವಾಗಿದೆ. ಗೇಟ್‌ನಲ್ಲಿ QR ಕೋಡ್ ತೋರಿಸಿ.',

    // Token Pass Card
    token_pass_title: 'ಮಂಡಿ ಪ್ರವೇಶ ಇ-ಪಾಸ್',
    apmc_smart_pass_header: 'APMC ಸ್ಮಾರ್ಟ್ ಖರೀದಿ ಪಾಸ್',
    created_via: 'ಮೂಲಕ ರಚಿಸಲಾಗಿದೆ',
    token_number: 'ಟೋಕನ್ ಸಂಖ್ಯೆ',
    gate_entry_time: 'ಪ್ರವೇಶ ಸಮಯ ಸ್ಲಾಟ್',
    queue_position_label: 'ಪ್ರಸ್ತುತ ಸರತಿ ಸ್ಥಾನ',
    queue_in_line: 'ಸರತಿಯಲ್ಲಿದ್ದಾರೆ',
    est_wait_time: 'ಅಂದಾಜು ಕಾಯುವ ಸಮಯ',
    mins: 'ನಿಮಿಷಗಳು',
    qr_instruction: 'ತಕ್ಷಣದ ಪ್ರವೇಶಕ್ಕಾಗಿ ಈ QR ಕೋಡ್ ಅನ್ನು ಅಧಿಕಾರಿಗೆ ತೋರಿಸಿ',
    btn_download_pass: 'ಪಾಸ್ ಉಳಿಸಿ',
    btn_share_sms: 'SMS/WhatsApp ಮೂಲಕ ಹಂಚಿಕೊಳ್ಳಿ',
    btn_cancel_booking: 'ಟೋಕನ್ ರದ್ದುಮಾಡಿ',
    status_slot_confirmed: 'ಸ್ಲಾಟ್ ದೃಢಪಟ್ಟಿದೆ',
    status_checked_in: 'ಗೇಟ್‌ನಲ್ಲಿ ಚೆಕ್-ಇನ್',
    status_weighed: 'ತೂಕ ದಾಖಲಾಗಿದೆ',
    status_quality_approved: 'ಗುಣಮಟ್ಟ ಅನುಮೋದಿತ',
    status_payment_initiated: 'DBT ಪ್ರಾರಂಭವಾಗಿದೆ',
    status_procurement_done: 'ಖರೀದಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
    status_cancelled: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
    at_checkpoint: 'ಚೆಕ್‌ಪಾಯಿಂಟ್‌ನಲ್ಲಿದ್ದಾರೆ',
    date_label: 'ದಿನಾಂಕ',
    gate_window: 'ಗೇಟ್ ಪ್ರವೇಶ ಸಮಯ',
    crop_declared_weight: 'ಬೆಳೆ ಮತ್ತು ಘೋಷಿತ ತೂಕ',
    dbt_payout: 'DBT ಪಾವತಿ',
    track_live_progress: 'ಲೈವ್ ಮಂಡಿ ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    view_tracker_btn: 'ಟ್ರ್ಯಾಕರ್ ನೋಡಿ →',
    pass_downloaded: 'ಪಾಸ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!',
    generating_pass_btn: 'ಪಾಸ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',

    // 6-Stage Realtime Status Tracker
    tracker_title: 'ಲೈವ್ ಖರೀದಿ ಪ್ರಗತಿ ಟ್ರ್ಯಾಕರ್',
    tracker_subtitle: 'ಪ್ರತಿ ಚೆಕ್‌ಪಾಯಿಂಟ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಿತಿ ನೈಜ ಸಮಯದಲ್ಲಿ ಬದಲಾಗುತ್ತದೆ',
    live_queue_sync: 'ಲೈವ್ ಮಂಡಿ ಸರತಿ ಸಿಂಕ್',
    next_action: 'ಮುಂದಿನ ಕ್ರಮ:',
    status_in_process: 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ',
    status_done: 'ಪೂರ್ಣವಾಗಿದೆ',
    in_progress_badge: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    completed_badge: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    checked_in_at: 'ಚೆಕ್-ಇನ್ ಸಮಯ:',
    official_receipt: 'ಅಧಿಕೃತ APMC ಖರೀದಿ ರಸೀದಿ',
    download_btn: 'ಡೌನ್‌ಲೋಡ್',

    stage_booked: 'ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ',
    stage_booked_desc: 'ಸ್ಲಾಟ್ ದೃಢಪಟ್ಟಿದೆ. ಗೇಟ್‌ನಲ್ಲಿ QR ಪಾಸ್ ತೋರಿಸಿ.',
    stage_checked_in: 'ಗೇಟ್ ಚೆಕ್-ಇನ್ ಪೂರ್ಣ',
    stage_checked_in_desc: 'ವಾಹನ ಪರಿಶೀಲಿಸಿ ಮಂಡಿ ಆವರಣಕ್ಕೆ ಪ್ರವೇಶ ನೀಡಲಾಗಿದೆ.',
    stage_weighed: 'ತೂಕ ಮಾಪನ (ವೇಬ್ರಿಡ್ಜ್)',
    stage_weighed_desc: 'ಒಟ್ಟು ಮತ್ತು ನಿವ್ವಳ ಬೆಳೆಯ ತೂಕ ದಾಖಲಿಸಲಾಗಿದೆ.',
    stage_quality_approved: 'ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ ಅನುಮೋದನೆ',
    stage_quality_approved_desc: 'ಗುಣಮಟ್ಟ ಮತ್ತು ತೇವಾಂಶ ಅಧಿಕಾರಿಗಳಿಂದ ಅಂಗೀಕೃತ.',
    stage_payment_initiated: 'DBT ಪಾವತಿ ಪ್ರಾರಂಭ',
    stage_payment_initiated_desc: 'ಹಣವನ್ನು ನೇರವಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ ಮಾಡಲಾಗುತ್ತಿದೆ.',
    stage_completed: 'ಖರೀದಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
    stage_completed_desc: 'ಅಂತಿಮ ರಸೀದಿ ಬಿಡುಗಡೆಯಾಗಿದೆ. ಖರೀದಿ ಮುಕ್ತಾಯ.',

    action_booked: 'ಮಂಡಿ ಆಗಮನ / ಗೇಟ್ ಚೆಕ್-ಇನ್‌ಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ',
    action_checked_in: 'ವೇಬ್ರಿಡ್ಜ್ (ಲೇನ್ 2) ಗೆ ತೆರಳಿ',
    action_weighed: 'ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಾ ಬೂತ್‌ಗೆ ತೆರಳಿ',
    action_quality_approved: 'DBT ಗಾಗಿ ಅಕೌಂಟ್ಸ್ ಕೌಂಟರ್‌ಗೆ ತೆರಳಿ',
    action_payment_initiated: 'DBT ಪಾವತಿ ವರ್ಗಾವಣೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ',
    action_completed: 'ಖರೀದಿ ಪ್ರಕ್ರಿಯೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
    action_cancelled: 'ಟೋಕನ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',

    // Stage field details
    field_quantity: 'ದಾಖಲಾದ ತೂಕ',
    field_grade: 'ಅನುಮೋದಿತ ಗ್ರೇಡ್',
    field_payment: 'ಪಾವತಿ ಮೊತ್ತ (DBT)',
    field_turnaround: 'ತೆಗೆದುಕೊಂಡ ಸಮಯ',

    // Share Modal
    share_modal_title: 'ಟೋಕನ್ ಪಾಸ್ ಹಂಚಿಕೊಳ್ಳಿ',
    share_modal_desc: 'ಚಾಲಕ ಅಥವಾ ಕುಟುಂಬದ ಸದಸ್ಯರಿಗೆ ಡಿಜಿಟಲ್ ಪಾಸ್ ಕಳುಹಿಸಿ',
    share_via_apps: 'ಯಾವುದೇ ಆ್ಯಪ್ / ಸಂದೇಶದ ಮೂಲಕ ಹಂಚಿಕೊಳ್ಳಿ',
    copy_text: 'ಪಠ್ಯ ನಕಲಿಸಿ',
    copied: 'ನಕಲಿಸಲಾಗಿದೆ!',
    or_send_via_sms: 'ಅಥವಾ SMS ಮೂಲಕ ಕಳುಹಿಸಿ',
    send_sms_btn: 'SMS ಪಾಸ್ ಲಿಂಕ್ ಕಳುಹಿಸಿ',
    sms_dispatched_title: 'SMS ರವಾನಿಸಲಾಗಿದೆ!',
    sms_dispatched_desc: 'ಪಾಸ್ ವಿವರಗಳು ಮತ್ತು ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ.',
    enter_mobile_placeholder: '10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ನಮೂದಿಸಿ',

    // Notifications Feed
    notifications_title: 'ಎಸ್‌ಎಂಎಸ್ ಎಚ್ಚರಿಕೆಗಳು',
    notifications_sub: 'ನಿಮ್ಮ ಫೋನ್‌ಗೆ ತಲುಪಿಸಲಾದ SMS ಮತ್ತು ಮಂಡಿ ಎಚ್ಚರಿಕೆಗಳು',
    notifications_empty: 'ಯಾವುದೇ ಹೊಸ ಸಂದೇಶಗಳಿಲ್ಲ.',
    logs_badge: 'ದಾಖಲೆಗಳು',
    via_gateway: 'SMS ಗೇಟ್‌ವೇ ಮೂಲಕ',
    view_pass_link: 'ಡಿಜಿಟಲ್ ಪಾಸ್ ನೋಡಿ →',
  },

  hi: {
    // App header & nav
    app_title: 'एग्री-क्यू किसान साथी',
    app_tagline: 'डिजिटल मंडी टोकन एवं पारदर्शी खरीद प्रणाली',
    nav_home: 'होम',
    nav_book: 'टोकन बुक',
    nav_tokens: 'मेरे टोकन',
    nav_insights: 'बिक्री सलाह AI',
    nav_alerts: 'एसएमएस',
    offline_badge: 'ऑफलाइन मोड सक्रिय',
    offline_msg: 'पास सुरक्षित है। नेटवर्क आने पर डेटा स्वतः सिंक होगा।',
    live_sync: 'लाइव सिंक',
    demo_ready: 'डेमो तैयार',
    login_btn_text: 'लॉगिन',

    // PWA promo
    pwa_install_title: 'AgriQ किसान ऐप इंस्टॉल करें',
    pwa_install_desc: 'मंडी यार्ड में ऑफलाइन टोकन पास इस्तेमाल करें',
    btn_install: 'इंस्टॉल करें',

    // Auth & Profile
    login_title: 'किसान लॉगिन',
    login_subtitle: 'डिजिटल टोकन प्राप्त करने के लिए अपना 10 अंकों का मोबाइल नंबर दर्ज करें',
    phone_label: 'मोबाइल नंबर',
    phone_placeholder: 'उदा. 9876543210',
    otp_label: '4 अंकों का OTP दर्ज करें',
    otp_placeholder: '• • • •',
    btn_send_otp: 'OTP भेजें (SMS)',
    btn_verify_otp: 'सत्यापित करें एवं लॉगिन',
    btn_change_phone: 'नंबर बदलें',
    otp_demo_hint: 'डेमो OTP: 1234 या कोई भी 4 अंक डालें',
    profile_welcome: 'नमस्ते किसान भाई',
    profile_edit: 'प्रोफ़ाइल बदलें',
    farmer_name: 'पूरा नाम',
    village_name: 'गांव / कस्बा',
    district_name: 'जिला',
    state_name: 'राज्य',
    preferred_lang: 'पसंदीदा भाषा',
    save_profile: 'प्रोफ़ाइल सुरक्षित करें',
    profiles_modal_title: 'किसान प्रोफाइल एवं खाते',
    profiles_modal_sub: 'किसानों के बीच स्विच करें या नया खाता जोड़ें',
    tab_switch: 'स्विच करें',
    tab_add_account: '+ नया खाता जोड़ें',
    tab_edit_profile: 'प्रोफाइल बदलें',
    saved_profiles: 'सुरक्षित किसान प्रोफाइल',
    active_badge: 'सक्रिय',
    login_another_phone: '+ दूसरे मोबाइल नंबर से लॉगिन करें',
    quick_add_demo_title: '1-क्लिक डेमो प्रोफाइल:',
    otp_sent_to: 'OTP भेजा गया:',
    change_number: 'बदलें',
    verifying_btn: 'सत्यापित हो रहा है...',
    saving_btn: 'सुरक्षित हो रहा है...',

    // Quick Stats & Hero
    hero_title: 'स्मार्ट खरीद, कतारों से आजादी',
    hero_subtitle: 'घर बैठे मंडी टोकन पाएं, लाइव कतार ट्रैक करें और फसल बेचने का सबसे सही दिन जानें।',
    active_token_banner: 'आज का आपका मंडी टोकन सक्रिय है!',
    btn_view_pass: 'डिजिटल पास देखें',
    btn_new_booking: 'नया टोकन बुक करें',
    btn_new_booking_sub: 'फसल और मंडी स्लॉट चुनें',
    no_active_pass: 'कोई सक्रिय पास नहीं',
    view_details: 'विवरण देखें →',
    refresh_live_data: 'ताजा डेटा प्राप्त करें',
    no_active_tokens_title: 'कोई सक्रिय मंडी टोकन नहीं है',
    no_active_tokens_desc: 'गेट एंट्री क्यूआर पास पाने और लंबी कतारों से बचने के लिए डिजिटल स्लॉट बुक करें।',
    token_history_title: 'आपका टोकन इतिहास',

    // Best Day Card & Forecast
    best_day_title: 'AI बिक्री सलाहकार (Best Day to Sell)',
    best_day_badge: 'बेचने का सबसे उत्तम दिन',
    best_day_reason_high_price: 'उच्च बाजार भाव एवं मंडी में कम भीड़ की संभावना',
    best_day_reason_moderate: 'सामान्य भाव एवं मध्यम कतार',
    best_day_reason_rush: 'मंडी में भारी भीड़ की संभावना, बाद का दिन चुनें',
    msp_guarantee: 'सरकारी न्यूनतम समर्थन मूल्य (MSP)',
    current_forecast: 'अनुमानित भाव',
    queue_penalty: 'भीड़ भार सूचकांक',
    recommended_date: 'अनुशंसित बिक्री तिथि',
    predicted_rate_label: 'अनुमानित भाव',
    best_day_explanation: 'हमारा पूर्वानुमानित इंजन मंडी में भीड़ रोकने और आपको सर्वोत्तम मूल्य दिलाने के लिए बुकिंग लोड और मूल्य रुझान का विश्लेषण करता है।',
    govt_msp_protected: 'सरकारी MSP गारंटी',
    btn_book_for_this_day: 'इस दिन के लिए बुक करें',
    price_trend_title: '7-दिवसीय मंडी भाव एवं भीड़ का पूर्वानुमान',
    price_trend_desc: 'पूर्वानुमानित AI मॉडल अपेक्षित बाजार भाव और मंडी आगमन कतार को संतुलित करता है।',
    badge_best: '★ सर्वोत्तम',
    ai_dispatch_formula: 'AI प्रेषण सूत्र: स्कोर = मूल्य रुझान − भीड़ दंड',
    live_scored: 'लाइव स्कोर्ड',
    select_crop_forecast: 'पूर्वानुमान के लिए फसल चुनें:',
    ai_insights_sub: 'कृषि जिंसों के लिए रीयल-टाइम स्मार्ट प्रेषण अनुकूलक',

    // 4-Step Booking Wizard
    wizard_step1_title: 'फसल चुनें',
    wizard_step1_desc: 'वह फसल चुनें जिसे आप मंडी में बेचना चाहते हैं',
    wizard_step2_title: 'मंडी केंद्र चुनें',
    wizard_step2_desc: 'अपने नजदीकी अधिकृत APMC खरीद केंद्र का चयन करें',
    wizard_step3_title: 'तिथि एवं समय स्लॉट',
    wizard_step3_desc: 'उपयुक्त दिन और खुला हुआ समय स्लॉट चुनें',
    wizard_step4_title: 'मात्रा दर्ज कर पास बनाएं',
    wizard_step4_desc: 'अनुमानित फसल वजन दर्ज करें और डिजिटल क्यूआर पास प्राप्त करें',
    step_progress: 'चरण',
    of_steps: 'का',
    cancel: 'रद्द करें',

    // Crops
    crop_ragi: 'रागी / मड़ुआ (Ragi)',
    crop_tur: 'अरहर / तुअर (Tur / Red Gram)',
    crop_wheat: 'गेहूं (Wheat)',
    crop_soybean: 'सोयाबीन (Soybean)',
    crop_cotton: 'कपास (Cotton)',
    crop_paddy: 'धान / चावल (Paddy)',
    crop_mustard: 'सरसों (Mustard)',
    crop_chana: 'चना (Gram)',
    crop_onion: 'प्याज (Onion)',
    crop_maize: 'मक्का (Maize)',

    // Step 1
    msp_guaranteed_banner: 'सरकारी न्यूनतम समर्थन मूल्य (MSP) गारंटी',
    msp_guaranteed_desc: 'दिखाए गए सभी मूल्य प्रति क्विंटल (100 किग्रा) सीधे APMC खरीद दर हैं।',

    // Step 2
    all_mandis: 'सभी मंडियां',
    karnataka_tab: 'कर्नाटक (Karnataka)',
    maharashtra_tab: 'महाराष्ट्र (Maharashtra)',
    authorized_centers_for: 'खरीदने वाले अधिकृत APMC केंद्र',
    centers_count: 'केंद्र',
    no_centers_found: 'इस राज्य में इस फसल के लिए कोई केंद्र नहीं मिला',
    show_all_centers: 'सभी उपलब्ध APMC केंद्र दिखाएं',
    apmc_verified: 'APMC सत्यापित',
    daily_quota: 'दैनिक कोटा',
    tons: 'टन',
    hourly_limit: 'प्रति घंटा सीमा',
    farmers_per_hr: 'किसान/घंटा',
    avg_process: 'औसत समय',

    // Step 3
    forecast_rate_label: 'अनुमानित भाव:',
    select_recommended_day: '⚡ यह अनुशंसित दिन चुनें →',
    no_slots_found: 'इस तिथि के लिए कोई खुला स्लॉट नहीं मिला। कृपया दूसरा दिन चुनें।',
    slot_full_label: 'फुल',
    left_suffix: 'शेष',
    of_label: 'में से',
    booked_label: 'बुक',
    full_pct_label: 'भरा हुआ',

    // Step 4
    procurement_summary: 'खरीद सारांश',
    apmc_center_label: 'APMC केंद्र',
    selling_date_label: 'बिक्री की तिथि',
    assigned_gate_slot: 'आवंटित गेट स्लॉट',
    farmer_label: 'किसान:',
    unit_kg: 'किलोग्राम (Kg)',
    unit_quintal: 'क्विंटल (q)',
    quick_presets: 'त्वरित:',
    direct_bank_dbt: 'सीधे बैंक खाते में DBT',
    generating_pass: 'डिजिटल पास तैयार हो रहा है...',

    // Booking Details
    select_date: 'बिक्री की तिथि चुनें',
    available_slots: 'उपलब्ध समय स्लॉट',
    slots_remaining: 'स्थान शेष',
    slot_full: 'स्लॉट भर चुका है',
    est_quantity: 'अनुमानित फसल मात्रा',
    in_quintals: 'क्विंटल (1 क्विंटल = 100 किग्रा)',
    in_kg: 'किलोग्राम (Kg)',
    est_total_payout: 'कुल अनुमानित भुगतान (MSP अनुसार)',
    btn_next: 'आगे बढ़ें',
    btn_back: 'पीछे जाएं',
    btn_confirm_token: 'पुष्टि करें एवं टोकन बनाएं',
    booking_success: 'बुकिंग सफल!',
    booking_success_msg: 'आपका डिजिटल गेट पास तैयार है। प्रवेश द्वार पर क्यूआर कोड दिखाएं।',

    // Token Pass Card
    token_pass_title: 'मंडी प्रवेश ई-पास',
    apmc_smart_pass_header: 'APMC स्मार्ट खरीद पास',
    created_via: 'द्वारा निर्मित',
    token_number: 'टोकन संख्या',
    gate_entry_time: 'प्रवेश समय स्लॉट',
    queue_position_label: 'वर्तमान कतार स्थिति',
    queue_in_line: 'कतार में आगे',
    est_wait_time: 'अनुमानित प्रतीक्षा',
    mins: 'मिनट',
    qr_instruction: 'तुरंत प्रवेश के लिए यह QR कोड मंडी गेट अधिकारी को दिखाएं',
    btn_download_pass: 'पास सुरक्षित करें',
    btn_share_sms: 'SMS/व्हाट्सएप पर भेजें',
    btn_cancel_booking: 'टोकन रद्द करें',
    status_slot_confirmed: 'स्लॉट कन्फर्म',
    status_checked_in: 'गेट पर चेक-इन',
    status_weighed: 'वजन दर्ज',
    status_quality_approved: 'गुणवत्ता स्वीकृत',
    status_payment_initiated: 'DBT शुरू',
    status_procurement_done: 'खरीद पूर्ण',
    status_cancelled: 'रद्द किया गया',
    at_checkpoint: 'चेकपॉइंट पर',
    date_label: 'तिथि',
    gate_window: 'गेट प्रवेश समय',
    crop_declared_weight: 'फसल और दर्ज वजन',
    dbt_payout: 'DBT भुगतान',
    track_live_progress: 'लाइव मंडी चेकपॉइंट प्रगति ट्रैक करें',
    view_tracker_btn: 'ट्रैकर देखें →',
    pass_downloaded: 'पास डाउनलोड हुआ!',
    generating_pass_btn: 'पास बन रहा है...',

    // 6-Stage Realtime Status Tracker
    tracker_title: 'लाइव खरीद प्रगति ट्रैकर',
    tracker_subtitle: 'मंडी में प्रत्येक चेकपॉइंट पर आपकी स्थिति स्वतः अपडेट होती है',
    live_queue_sync: 'लाइव मंडी कतार सिंक',
    next_action: 'अगला कदम:',
    status_in_process: 'प्रक्रिया जारी',
    status_done: 'पूर्ण',
    in_progress_badge: 'प्रगति में',
    completed_badge: 'पूर्ण',
    checked_in_at: 'चेक-इन समय:',
    official_receipt: 'आधिकारिक APMC खरीद रसीद',
    download_btn: 'डाउनलोड',

    stage_booked: 'टोकन बुक हुआ',
    stage_booked_desc: 'स्लॉट सुरक्षित। मंडी गेट पर क्यूआर कोड दिखाएं।',
    stage_checked_in: 'गेट पर चेक-इन',
    stage_checked_in_desc: 'वाहन सत्यापित और मंडी परिसर में प्रवेश दिया गया।',
    stage_weighed: 'धर्मकांटा वजन (तौल)',
    stage_weighed_desc: 'डिजिटल कांटे पर कुल और खाली वाहन का वजन दर्ज।',
    stage_quality_approved: 'गुणवत्ता परीक्षण उत्तीर्ण',
    stage_quality_approved_desc: 'सरकारी परख अधिकारी द्वारा ग्रेड एवं नमी स्वीकृत।',
    stage_payment_initiated: 'DBT भुगतान शुरू',
    stage_payment_initiated_desc: 'आधार लिंक बैंक खाते में राशि हस्तांतरित की जा रही है।',
    stage_completed: 'खरीद पूर्ण',
    stage_completed_desc: 'अंतिम रसीद जारी। खरीद चक्र सफलतापूर्वक संपन्न।',

    action_booked: 'मंडी आगमन / गेट चेक-इन की प्रतीक्षा',
    action_checked_in: 'धर्मकांटा (लेन 2) पर आगे बढ़ें',
    action_weighed: 'गुणवत्ता परख काउंटर पर जाएं',
    action_quality_approved: 'DBT के लिए लेखा डेस्क पर जाएं',
    action_payment_initiated: 'DBT बैंक ट्रांसफर प्रक्रिया जारी है',
    action_completed: 'खरीद चक्र सफलतापूर्वक पूर्ण',
    action_cancelled: 'टोकन रद्द किया गया',

    // Stage field details
    field_quantity: 'दर्ज कुल वजन',
    field_grade: 'स्वीकृत ग्रेड',
    field_payment: 'भुगतान राशि (DBT)',
    field_turnaround: 'कुल लगा समय',

    // Share Modal
    share_modal_title: 'टोकन पास साझा करें',
    share_modal_desc: 'ड्राइवर या परिवार के सदस्य को डिजिटल पास भेजें',
    share_via_apps: 'किसी भी ऐप / मैसेजिंग द्वारा साझा करें',
    copy_text: 'टेक्स्ट कॉपी करें',
    copied: 'कॉपी हुआ!',
    or_send_via_sms: 'या SMS द्वारा भेजें',
    send_sms_btn: 'SMS पास लिंक भेजें',
    sms_dispatched_title: 'SMS भेज दिया गया!',
    sms_dispatched_desc: 'पास विवरण और लिंक भेजा गया।',
    enter_mobile_placeholder: '10 अंकों का मोबाइल नंबर दर्ज करें',

    // Notifications Feed
    notifications_title: 'एसएमएस अलर्ट एवं सूचनाएं',
    notifications_sub: 'आपके फोन पर भेजे गए एसएमएस एवं मंडी अलर्ट',
    notifications_empty: 'फिलहाल कोई सूचना नहीं है। स्थिति बदलने पर यहां मैसेज दिखेगा।',
    logs_badge: 'लॉग',
    via_gateway: 'SMS गेटवे द्वारा',
    view_pass_link: 'डिजिटल पास देखें →',
  },

  mr: {
    // App header & nav
    app_title: 'अ‍ॅग्री-क्यू शेतकरी मित्र',
    app_tagline: 'स्मार्ट बाजार समिती टोकन व पारदर्शक खरेदी प्रणाली',
    nav_home: 'मुख्यपृष्ठ',
    nav_book: 'टोकन बुक',
    nav_tokens: 'माझे टोकन',
    nav_insights: 'विक्री सल्ला AI',
    nav_alerts: 'एसएमएस',
    offline_badge: 'ऑफलाइन मोड सुरू',
    offline_msg: 'पास सुरक्षित आहे. इंटरनेट आल्यावर आपोआप सिंक होईल.',
    live_sync: 'थेट सिंक',
    demo_ready: 'डेमो सज्ज',
    login_btn_text: 'लॉगिन',

    // PWA promo
    pwa_install_title: 'AgriQ शेतकरी अ‍ॅप इंस्टॉल करा',
    pwa_install_desc: 'मार्केट यार्डमध्ये ऑफलाइन टोकन पास वापरा',
    btn_install: 'इंस्टॉल करा',

    // Auth & Profile
    login_title: 'शेतकरी लॉगिन',
    login_subtitle: 'डिजिटल टोकन मिळवण्यासाठी आपला १० अंकी मोबाईल नंबर टाका',
    phone_label: 'मोबाईल नंबर',
    phone_placeholder: 'उदा. 9876543210',
    otp_label: '४ अंकी OTP टाका',
    otp_placeholder: '• • • •',
    btn_send_otp: 'OTP पाठवा (SMS)',
    btn_verify_otp: 'सत्यापित करा व लॉगिन करा',
    btn_change_phone: 'नंबर बदला',
    otp_demo_hint: 'डेमो OTP: 1234 किंवा कोणतेही ४ अंक टाका',
    profile_welcome: 'नमस्कार शेतकरी बांधव',
    profile_edit: 'माहिती बदला',
    farmer_name: 'पूर्ण नाव',
    village_name: 'गाव / शहर',
    district_name: 'जिल्हा',
    state_name: 'राज्य',
    preferred_lang: 'पसंतीची भाषा',
    save_profile: 'माहिती सेव्ह करा',
    profiles_modal_title: 'शेतकरी प्रोफाईल आणि खाती',
    profiles_modal_sub: 'शेतकऱ्यांमध्ये स्विच करा किंवा नवीन खाते जोडा',
    tab_switch: 'बदला',
    tab_add_account: '+ खाते जोडा',
    tab_edit_profile: 'माहिती बदला',
    saved_profiles: 'जतन केलेल्या शेतकरी प्रोफाईल',
    active_badge: 'सक्रिय',
    login_another_phone: '+ दुसऱ्या मोबाईल नंबरने लॉगिन करा',
    quick_add_demo_title: '१-क्लिक डेमो प्रोफाईल:',
    otp_sent_to: 'OTP पाठवला गेला:',
    change_number: 'बदला',
    verifying_btn: 'सत्यापित होत आहे...',
    saving_btn: 'जतन होत आहे...',

    // Quick Stats & Hero
    hero_title: 'स्मार्ट खरेदी, रांगांचा त्रास नाही',
    hero_subtitle: 'घरबसल्या मंडी टोकन मिळवा, थेट रांग पहा आणि शेतमाल विकण्याचा सर्वोत्तम दिवस ओळखा.',
    active_token_banner: 'तुमचा आजचा मंडी टोकन सक्रिय आहे!',
    btn_view_pass: 'डिजिटल पास पहा',
    btn_new_booking: 'नवीन टोकन बुक करा',
    btn_new_booking_sub: 'पीक आणि बाजार स्लॉट निवडा',
    no_active_pass: 'सक्रिय पास नाही',
    view_details: 'तपशील पहा →',
    refresh_live_data: 'थेट डेटा रिफ्रेश करा',
    no_active_tokens_title: 'कोणताही सक्रिय टोकन नाही',
    no_active_tokens_desc: 'गेट एंट्री क्यूआर पास मिळवण्यासाठी आणि लांब रांगा टाळण्यासाठी डिजिटल स्लॉट बुक करा.',
    token_history_title: 'तुमचा टोकन इतिहास',

    // Best Day Card & Forecast
    best_day_title: 'AI सर्वोत्तम विक्री दिवस सल्लागार',
    best_day_badge: 'माल विकण्यासाठी सर्वोत्तम दिवस',
    best_day_reason_high_price: 'चांगला दर आणि बाजार समितीत कमी गर्दीची शक्यता',
    best_day_reason_moderate: 'स्थिर दर आणि मध्यम गर्दी',
    best_day_reason_rush: 'मार्केटमध्ये प्रचंड गर्दीची शक्यता, दुसरा दिवस निवडा',
    msp_guarantee: 'शासकीय हमीभाव (MSP)',
    current_forecast: 'अपेक्षित बाजारभाव',
    queue_penalty: 'गर्दी निर्देशांक',
    recommended_date: 'शिफारस केलेली तारीख',
    predicted_rate_label: 'अपेक्षित दर',
    best_day_explanation: 'आमची प्रेडिक्टिव्ह सिस्टीम बाजार समितीतील गर्दी रोखण्यासाठी आणि कमाल भाव मिळवून देण्यासाठी बुकिंग लोड व ट्रेंडचे विश्लेषण करते.',
    govt_msp_protected: 'शासकीय हमीभाव हमी',
    btn_book_for_this_day: 'या दिवसासाठी बुक करा',
    price_trend_title: '७-दिवसीय बाजारभाव व गर्दी अंदाज',
    price_trend_desc: 'प्रेडिक्टिव्ह AI मॉडेल बाजारभाव आणि मार्केटमधील गर्दीचे संतुलन साधते.',
    badge_best: '★ सर्वोत्तम',
    ai_dispatch_formula: 'AI सूत्र: स्कोअर = दर कल − गर्दी निर्देशांक',
    live_scored: 'थेट स्कोअर',
    select_crop_forecast: 'अंदाजासाठी पीक निवडा:',
    ai_insights_sub: 'शेतमालासाठी रिअल-टाइम स्मार्ट डिस्पॅच ऑप्टिमायझर',

    // 4-Step Booking Wizard
    wizard_step1_title: 'पीक निवडा',
    wizard_step1_desc: 'तुम्हाला बाजारात विकायचे असलेले पीक निवडा',
    wizard_step2_title: 'बाजार समिती केंद्र निवडा',
    wizard_step2_desc: 'जवळचे अधिकृत APMC केंद्र निवडा',
    wizard_step3_title: 'तारीख व वेळ स्लॉट',
    wizard_step3_desc: 'सोयीस्कर दिवस व उपलब्ध स्लॉट निवडा',
    wizard_step4_title: 'वजन नोंदवून पास तयार करा',
    wizard_step4_desc: 'अंदाजे वजन टाका व डिजिटल क्यूआर पास मिळवा',
    step_progress: 'टप्पा',
    of_steps: 'पैकी',
    cancel: 'रद्द करा',

    // Crops
    crop_ragi: 'नाचणी / रागी (Ragi)',
    crop_tur: 'तूर / तूर डाळ (Tur Dal)',
    crop_wheat: 'गहू (Wheat)',
    crop_soybean: 'सोयाबीन (Soybean)',
    crop_cotton: 'कापूस (Cotton)',
    crop_paddy: 'भात / धान (Paddy)',
    crop_mustard: 'मोहरी (Mustard)',
    crop_chana: 'हरभरा (Gram)',
    crop_onion: 'कांदा (Onion)',
    crop_maize: 'मका (Maize)',

    // Step 1
    msp_guaranteed_banner: 'शासकीय हमीभाव (MSP) हमी',
    msp_guaranteed_desc: 'दाखवलेले सर्व दर प्रति क्विंटल (१०० किलो) थेट APMC खरेदी दर आहेत.',

    // Step 2
    all_mandis: 'सर्व बाजार समित्या',
    karnataka_tab: 'कर्नाटक (Karnataka)',
    maharashtra_tab: 'महाराष्ट्र (Maharashtra)',
    authorized_centers_for: 'खरेदी करणारी अधिकृत APMC केंद्रे',
    centers_count: 'केंद्रे',
    no_centers_found: 'या राज्यात या पिकासाठी कोणतेही केंद्र आढळले नाही',
    show_all_centers: 'सर्व उपलब्ध APMC केंद्रे दाखवा',
    apmc_verified: 'APMC प्रमाणित',
    daily_quota: 'दैनिक कोटा',
    tons: 'टन',
    hourly_limit: 'प्रति तास मर्यादा',
    farmers_per_hr: 'शेतकरी/तास',
    avg_process: 'सरासरी वेळ',

    // Step 3
    forecast_rate_label: 'अपेक्षित दर:',
    select_recommended_day: '⚡ हा शिफारस केलेला दिवस निवडा →',
    no_slots_found: 'या तारखेसाठी कोणताही स्लॉट उपलब्ध नाही. कृपया दुसरा दिवस निवडा.',
    slot_full_label: 'फुल',
    left_suffix: 'शिल्लक',
    of_label: 'पैकी',
    booked_label: 'बुक',
    full_pct_label: 'भरले',

    // Step 4
    procurement_summary: 'खरेदी सारांश',
    apmc_center_label: 'APMC केंद्र',
    selling_date_label: 'विक्री तारीख',
    assigned_gate_slot: 'नेमून दिलेला गेट स्लॉट',
    farmer_label: 'शेतकरी:',
    unit_kg: 'किलोग्रॅम (Kg)',
    unit_quintal: 'क्विंटल (q)',
    quick_presets: 'त्वरित:',
    direct_bank_dbt: 'थेट बँक DBT',
    generating_pass: 'डिजिटल पास तयार होत आहे...',

    // Booking Details
    select_date: 'विक्रीची तारीख निवडा',
    available_slots: 'उपलब्ध वेळ स्लॉट',
    slots_remaining: 'जागा शिल्लक',
    slot_full: 'स्लॉट पूर्ण भरला आहे',
    est_quantity: 'अंदाजे पीक वजन',
    in_quintals: 'क्विंटल (१ क्विंटल = १०० किलो)',
    in_kg: 'किलोग्रॅम (Kg)',
    est_total_payout: 'एकूण अंदाजे रक्कम (हमीभावानुसार)',
    btn_next: 'पुढे जा',
    btn_back: 'मागे या',
    btn_confirm_token: 'खात्री करा व टोकन तयार करा',
    booking_success: 'बुकिंग यशस्वी!',
    booking_success_msg: 'आपला डिजिटल पास तयार झाला आहे. गेटवर हा क्यूआर कोड दाखवा.',

    // Token Pass Card
    token_pass_title: 'बाजार समिती प्रवेश ई-पास',
    apmc_smart_pass_header: 'APMC स्मार्ट खरेदी पास',
    created_via: 'द्वारे तयार',
    token_number: 'टोकन क्रमांक',
    gate_entry_time: 'प्रवेश वेळ स्लॉट',
    queue_position_label: 'सध्याचे रांगेतील स्थान',
    queue_in_line: 'रांगेत पुढे',
    est_wait_time: 'अंदाजे प्रतीक्षा वेळ',
    mins: 'मिनिटे',
    qr_instruction: 'तातडीच्या प्रवेशासाठी हा QR कोड गेट अधिकाऱ्याला दाखवा',
    btn_download_pass: 'पास सेव्ह करा',
    btn_share_sms: 'SMS/व्हॉट्सअ‍ॅपवर पाठवा',
    btn_cancel_booking: 'टोकन रद्द करा',
    status_slot_confirmed: 'स्लॉट निश्चित',
    status_checked_in: 'गेटवर चेक-इन',
    status_weighed: 'वजन नोंदवले',
    status_quality_approved: 'गुणवत्ता मंजूर',
    status_payment_initiated: 'DBT सुरू',
    status_procurement_done: 'खरेदी पूर्ण',
    status_cancelled: 'रद्द केले',
    at_checkpoint: 'तपासणी नाक्यावर',
    date_label: 'तारीख',
    gate_window: 'गेट प्रवेश वेळ',
    crop_declared_weight: 'पीक व नोंदवलेले वजन',
    dbt_payout: 'DBT जमा रक्कम',
    track_live_progress: 'थेट तपासणी प्रगती ट्रॅक करा',
    view_tracker_btn: 'ट्रॅकर पहा →',
    pass_downloaded: 'पास डाउनलोड झाला!',
    generating_pass_btn: 'पास तयार होत आहे...',

    // 6-Stage Realtime Status Tracker
    tracker_title: 'थेट खरेदी प्रगती ट्रॅकर',
    tracker_subtitle: 'प्रत्येक तपासणी नाक्यावर तुमची स्थिती आपोआप बदलते',
    live_queue_sync: 'थेट बाजार समिती रांग सिंक',
    next_action: 'पुढील कृती:',
    status_in_process: 'प्रक्रियेत आहे',
    status_done: 'पूर्ण',
    in_progress_badge: 'सुरू आहे',
    completed_badge: 'पूर्ण झाले',
    checked_in_at: 'चेक-इन वेळ:',
    official_receipt: 'अधिकृत APMC खरेदी पावती',
    download_btn: 'डाउनलोड',

    stage_booked: 'टोकन नोंदवले',
    stage_booked_desc: 'स्लॉट निश्चित. गेटवर QR पास दाखवा.',
    stage_checked_in: 'गेटवर चेक-इन पूर्ण',
    stage_checked_in_desc: 'गाडी तपासली व आवारात प्रवेश दिला.',
    stage_weighed: 'धर्मकाटा वजन नोंद',
    stage_weighed_desc: 'गाडीचे वजन व निव्वळ शेतमाल वजन नोंदवले.',
    stage_quality_approved: 'गुणवत्ता तपासणी उत्तीर्ण',
    stage_quality_approved_desc: 'ग्रेड व आर्द्रता तपासणी अधिकाऱ्याकडून मंजूर.',
    stage_payment_initiated: 'DBT थेट पेमेंट सुरू',
    stage_payment_initiated_desc: 'रक्कम थेट आपल्या बँक खात्यात जमा होत आहे.',
    stage_completed: 'खरेदी प्रक्रिया पूर्ण',
    stage_completed_desc: 'अंतिम पावती तयार. खरेदी यशस्वीरित्या पूर्ण.',

    action_booked: 'मार्केट आगमन / गेट चेक-इनची प्रतीक्षा',
    action_checked_in: 'वजन काटा (लेन २) कडे जा',
    action_weighed: 'गुणवत्ता तपासणी केंद्राकडे जा',
    action_quality_approved: 'DBT खात्यासाठी अकौंट्स डेस्ककडे जा',
    action_payment_initiated: 'DBT बँक ट्रान्सफर प्रक्रिया सुरू आहे',
    action_completed: 'खरेदी प्रक्रिया यशस्वीरित्या पूर्ण',
    action_cancelled: 'टोकन रद्द केले',

    // Stage field details
    field_quantity: 'नोंदवलेले निव्वळ वजन',
    field_grade: 'मंजूर ग्रेड',
    field_payment: 'जमा रक्कम (DBT)',
    field_turnaround: 'एकूण लागलेला वेळ',

    // Share Modal
    share_modal_title: 'टोकन पास शेअर करा',
    share_modal_desc: 'ड्रायव्हर किंवा कुटुंबातील सदस्याला डिजिटल पास पाठवा',
    share_via_apps: 'कोणत्याही अ‍ॅप / मेसेजद्वारे शेअर करा',
    copy_text: 'मजकूर कॉपी करा',
    copied: 'कॉपी झाले!',
    or_send_via_sms: 'किंवा SMS द्वारे पाठवा',
    send_sms_btn: 'SMS पास लिंक पाठवा',
    sms_dispatched_title: 'SMS पाठवला गेला!',
    sms_dispatched_desc: 'पास तपशील आणि लिंक पाठवली गेली.',
    enter_mobile_placeholder: '१० अंकी मोबाईल नंबर टाका',

    // Notifications Feed
    notifications_title: 'एसएमएस व संदेश',
    notifications_sub: 'आपल्या फोनवर पाठवलेल्या एसएमएस व बाजार सूचना',
    notifications_empty: 'अजून कोणतीही सूचना नाही.',
    logs_badge: 'नोंदी',
    via_gateway: 'SMS गेटवे द्वारे',
    view_pass_link: 'डिजिटल पास पहा →',
  },

  te: {
    // App header & nav
    app_title: 'అగ్రి-క్యూ రైతు మిత్ర',
    app_tagline: 'స్మార్ట్ మార్కెట్ టోకెన్ మరియు సేకరణ వ్యవస్థ',
    nav_home: 'హోమ్',
    nav_book: 'టోకెన్ బుక్',
    nav_tokens: 'నా టోకెన్లు',
    nav_insights: 'అమ్మకపు సలహా AI',
    nav_alerts: 'SMS',
    offline_badge: 'ఆఫ్‌లైన్ మోడ్ యాక్టివ్',
    offline_msg: 'పాస్ భద్రంగా ఉంది. ఇంటర్నెట్ రాగానే సింక్ అవుతుంది.',
    live_sync: 'లైవ్ సింక్',
    demo_ready: 'డెమో సిద్ధం',
    login_btn_text: 'లాగిన్',

    // PWA promo
    pwa_install_title: 'AgriQ రైతు యాప్ ఇన్‌స్టాల్ చేయండి',
    pwa_install_desc: 'మార్కెట్ యార్డ్‌లో ఆఫ్‌లైన్ టోకెన్ పాస్ వాడండి',
    btn_install: 'ఇన్‌స్టాల్',

    // Auth & Profile
    login_title: 'రైతు లాగిన్',
    login_subtitle: 'డిజిటల్ టోకెన్ పాస్ కోసం మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి',
    phone_label: 'మొబైల్ నంబర్',
    phone_placeholder: 'ఉదా. 9876543210',
    otp_label: '4 అంకెల OTP నమోదు చేయండి',
    otp_placeholder: '• • • •',
    btn_send_otp: 'OTP పంపండి (SMS)',
    btn_verify_otp: 'ధృవీకరించి లాగిన్ అవ్వండి',
    btn_change_phone: 'నంబర్ మార్చండి',
    otp_demo_hint: 'డెమో OTP: 1234 లేదా ఏదైనా 4 అంకెలు వాడండి',
    profile_welcome: 'నమస్కారం రైతు సోదరులారా',
    profile_edit: 'ప్రొఫైల్ మార్చు',
    farmer_name: 'పూర్తి పేరు',
    village_name: 'గ్రామం / పట్టణం',
    district_name: 'జిల్లా',
    state_name: 'రాష్ట్రం',
    preferred_lang: 'ప్రాధాన్య భాష',
    save_profile: 'ప్రొఫైల్ భద్రపరుచు',
    profiles_modal_title: 'రైతు ప్రొఫైల్స్ మరియు ఖాతాలు',
    profiles_modal_sub: 'రైతుల మధ్య మారండి లేదా కొత్త ఖాతా జోడించండి',
    tab_switch: 'మారండి',
    tab_add_account: '+ ఖాతా జోడించు',
    tab_edit_profile: 'ప్రొఫైల్ మార్చు',
    saved_profiles: 'భద్రపరిచిన రైతు ప్రొఫైల్స్',
    active_badge: 'యాక్టివ్',
    login_another_phone: '+ వేరే మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి',
    quick_add_demo_title: '1-క్లిక్ డెమో ప్రొఫైల్స్:',
    otp_sent_to: 'OTP పంపబడిన నంబర్:',
    change_number: 'మార్చండి',
    verifying_btn: 'ధృవీకరిస్తోంది...',
    saving_btn: 'భద్రపరుస్తోంది...',

    // Quick Stats & Hero
    hero_title: 'స్మార్ట్ కొనుగోలు, క్యూల సమస్య లేదు',
    hero_subtitle: 'ఇంట్లోనే మార్కెట్ టోకెన్ పొందండి, ప్రత్యక్ష క్యూ చూడండి మరియు సరైన అమ్మకపు రోజు తెలుసుకోండి.',
    active_token_banner: 'మీ నేటి మార్కెట్ టోకెన్ యాక్టివ్‌గా ఉంది!',
    btn_view_pass: 'డిజిటల్ పాస్ చూడండి',
    btn_new_booking: 'కొత్త టోకెన్ బుక్ చేయండి',
    btn_new_booking_sub: 'పంట మరియు మార్కెట్ స్లాట్ ఎంచుకోండి',
    no_active_pass: 'యాక్టివ్ పాస్ లేదు',
    view_details: 'వివరాలు చూడండి →',
    refresh_live_data: 'తాజా సమాచారం పొందండి',
    no_active_tokens_title: 'సక్రియ మార్కెట్ టోకెన్లు లేవు',
    no_active_tokens_desc: 'గేట్ ఎంట్రీ క్యూఆర్ పాస్ పొందడానికి మరియు క్యూలను నివారించడానికి డిజిటల్ స్లాట్ బుక్ చేయండి.',
    token_history_title: 'మీ టోకెన్ చరిత్ర',

    // Best Day Card & Forecast
    best_day_title: 'AI ఉత్తమ అమ్మకపు రోజు సలహాదారు',
    best_day_badge: 'అమ్మకానికి ఉత్తమ రోజు',
    best_day_reason_high_price: 'మంచి ధర మరియు మార్కెట్లో తక్కువ రద్దీ అవకాశం',
    best_day_reason_moderate: 'స్థిరమైన ధర మరియు సాధారణ క్యూ',
    best_day_reason_rush: 'భారీ రద్దీ అంచనా, తర్వాతి రోజు ఎంచుకోండి',
    msp_guarantee: 'ప్రభుత్వ మద్దతు ధర (MSP)',
    current_forecast: 'అంచనా ధర',
    queue_penalty: 'రద్దీ సూచిక',
    recommended_date: 'సిఫార్సు చేయబడిన తేదీ',
    predicted_rate_label: 'అంచనా ధర',
    best_day_explanation: 'మార్కెట్లో రద్దీని నివారించడానికి మరియు సరైన ధరను అందించడానికి మా AI వ్యవస్థ విశ్లేషిస్తుంది.',
    govt_msp_protected: 'ప్రభుత్వ MSP రక్షణ',
    btn_book_for_this_day: 'ఈ రోజు కోసం బుక్ చేయండి',
    price_trend_title: '7 రోజుల మార్కెట్ ధర మరియు రద్దీ సూచన',
    price_trend_desc: 'AI మోడల్ మార్కెట్ ధర మరియు క్యూను సమతుల్యం చేస్తుంది.',
    badge_best: '★ ఉత్తమ',
    ai_dispatch_formula: 'AI సూత్రం: స్కోరు = ధర ధోరణి − రద్దీ పెనాల్టీ',
    live_scored: 'లైవ్ స్కోర్',
    select_crop_forecast: 'అంచనా కోసం పంటను ఎంచుకోండి:',
    ai_insights_sub: 'వ్యవసాయ ఉత్పత్తుల కోసం రియల్-టైమ్ స్మార్ట్ డిస్పాచ్ ఆప్టిమైజర్',

    // 4-Step Booking Wizard
    wizard_step1_title: 'పంటను ఎంచుకోండి',
    wizard_step1_desc: 'మార్కెట్లో అమ్మాలనుకుంటున్న పంటను ఎంచుకోండి',
    wizard_step2_title: 'మార్కెట్ కేంద్రాన్ని ఎంచుకోండి',
    wizard_step2_desc: 'సమీపంలోని అధీకృత APMC కేంద్రాన్ని ఎంచుకోండి',
    wizard_step3_title: 'తేదీ & సమయం స్లాట్',
    wizard_step3_desc: 'అనుకూలమైన రోజు మరియు సమయ స్లాట్ ఎంచుకోండి',
    wizard_step4_title: 'పరిమాణం నమోదు చేసి పాస్ పొందండి',
    wizard_step4_desc: 'అంచనా దిగుబడి బరువు నమోదు చేసి QR కోడ్ పాస్ పొందండి',
    step_progress: 'దశ',
    of_steps: 'లో',
    cancel: 'రద్దు చేయి',

    // Crops
    crop_ragi: 'రాగులు (Ragi / Finger Millet)',
    crop_tur: 'కందులు (Tur / Red Gram)',
    crop_wheat: 'గోధుమలు (Wheat)',
    crop_soybean: 'సోయాబీన్ (Soybean)',
    crop_cotton: 'పత్తి (Cotton)',
    crop_paddy: 'వరి / ధాన్యం (Paddy)',
    crop_mustard: 'ఆవాలు (Mustard)',
    crop_chana: 'శనగలు (Gram)',
    crop_onion: 'ఉల్లిపాయ (Onion)',
    crop_maize: 'మొక్కజొన్న (Maize)',

    // Step 1
    msp_guaranteed_banner: 'ప్రభుత్వ కనీస మద్దతు ధర (MSP) హామీ',
    msp_guaranteed_desc: 'చూపించిన ధరలన్నీ క్వింటాలుకు (100 కిలోలు) నేరుగా APMC కొనుగోలు ధరలు.',

    // Step 2
    all_mandis: 'అన్ని మార్కెట్లు',
    karnataka_tab: 'కర్ణాటక (Karnataka)',
    maharashtra_tab: 'మహారాష్ట్ర (Maharashtra)',
    authorized_centers_for: 'కొనుగోలు చేసే అధీకృత APMC కేంద్రాలు',
    centers_count: 'కేంద్రాలు',
    no_centers_found: 'ఈ రాష్ట్రంలో ఈ పంటకు కేంద్రాలు కనుగొనబడలేదు',
    show_all_centers: 'అందుబాటులో ఉన్న అన్ని APMC కేంద్రాలను చూపించు',
    apmc_verified: 'APMC ధృవీకరించబడింది',
    daily_quota: 'రోజువారీ కోటా',
    tons: 'టన్నులు',
    hourly_limit: 'గంట పరిమితి',
    farmers_per_hr: 'రైతులు/గంట',
    avg_process: 'సగటు సమయం',

    // Step 3
    forecast_rate_label: 'అంచనా ధర:',
    select_recommended_day: '⚡ ఈ సిఫార్సు చేసిన రోజును ఎంచుకోండి →',
    no_slots_found: 'ఈ తేదీకి స్లాట్లు అందుబాటులో లేవు. దయచేసి వేరే రోజును ఎంచుకోండి.',
    slot_full_label: 'పూర్తి',
    left_suffix: 'మిగిలి ఉంది',
    of_label: 'లో',
    booked_label: 'బుక్ అయింది',
    full_pct_label: 'నిండింది',

    // Step 4
    procurement_summary: 'సేకరణ సారాంశం',
    apmc_center_label: 'APMC కేంద్రం',
    selling_date_label: 'అమ్మకపు తేదీ',
    assigned_gate_slot: 'కేటాయించిన గేట్ స్లాట్',
    farmer_label: 'రైతు:',
    unit_kg: 'కిలోగ్రాములు (Kg)',
    unit_quintal: 'క్వింటాళ్ళు (q)',
    quick_presets: 'త్వరిత ఎంపిక:',
    direct_bank_dbt: 'నేరుగా బ్యాంక్ DBT',
    generating_pass: 'డిజిటల్ పాస్ తయారవుతోంది...',

    // Booking Details
    select_date: 'అమ్మకపు తేదీ ఎంచుకోండి',
    available_slots: 'అందుబాటులో ఉన్న సమయ స్లాట్లు',
    slots_remaining: 'స్థలాలు మిగిలి ఉన్నాయి',
    slot_full: 'స్లాట్ నిండిపోయింది',
    est_quantity: 'అంచనా పంట బరువు',
    in_quintals: 'క్వింటాళ్ళు (1 క్వింటాల్ = 100 కిలోలు)',
    in_kg: 'కిలోగ్రాములు (Kg)',
    est_total_payout: 'మొత్తం అంచనా చెల్లింపు (MSP ప్రకారం)',
    btn_next: 'ముందుకు',
    btn_back: 'వెనుకకు',
    btn_confirm_token: 'ధృవీకరించి టోకెన్ పొందండి',
    booking_success: 'బుకింగ్ విజయవంతమైంది!',
    booking_success_msg: 'మీ డిజిటల్ పాస్ సిద్ధమైంది. గేట్ వద్ద ఈ QR కోడ్ చూపించండి.',

    // Token Pass Card
    token_pass_title: 'మార్కెట్ ప్రవేశ ఈ-పాస్',
    apmc_smart_pass_header: 'APMC స్మార్ట్ కొనుగోలు పాస్',
    created_via: 'ద్వారా సృష్టించబడింది',
    token_number: 'టోకెన్ సంఖ్య',
    gate_entry_time: 'ప్రవేశ సమయ స్లాట్',
    queue_position_label: 'ప్రస్తుత క్యూ స్థానం',
    queue_in_line: 'క్యూలో ఉన్నారు',
    est_wait_time: 'అంచనా వేచి ఉండే సమయం',
    mins: 'నిమిషాలు',
    qr_instruction: 'తక్షణ ప్రవేశం కోసం ఈ QR కోడ్‌ను మార్కెట్ గేట్ అధికారికి చూపించండి',
    btn_download_pass: 'పాస్ సేవ్ చేయండి',
    btn_share_sms: 'SMS/WhatsApp లో పంపండి',
    btn_cancel_booking: 'టోకెన్ రద్దు చేయండి',
    status_slot_confirmed: 'స్లాట్ ఖరారైంది',
    status_checked_in: 'గేట్ చెక్-ఇన్ పూర్తయింది',
    status_weighed: 'బరువు నమోదైంది',
    status_quality_approved: 'నాణ్యత ఆమోదం',
    status_payment_initiated: 'DBT ప్రారంభం',
    status_procurement_done: 'సేకరణ పూర్తయింది',
    status_cancelled: 'రద్దు చేయబడింది',
    at_checkpoint: 'చెక్ పాయింట్ వద్ద',
    date_label: 'తేదీ',
    gate_window: 'గేట్ సమయం',
    crop_declared_weight: 'పంట & ప్రకటించిన బరువు',
    dbt_payout: 'DBT చెల్లింపు',
    track_live_progress: 'లైవ్ ప్రోగ్రెస్ ట్రాక్ చేయండి',
    view_tracker_btn: 'ట్రాకర్ చూడండి →',
    pass_downloaded: 'పాస్ డౌన్‌లోడ్ అయింది!',
    generating_pass_btn: 'పాస్ తయారవుతోంది...',

    // 6-Stage Realtime Status Tracker
    tracker_title: 'లైవ్ సేకరణ స్థితి ట్రాకర్',
    tracker_subtitle: 'మార్కెట్లో ప్రతి చెక్‌పాయింట్ వద్ద మీ స్థితి స్వయంచాలకంగా మారుతుంది',
    live_queue_sync: 'లైవ్ మార్కెట్ క్యూ సింక్',
    next_action: 'తదుపరి చర్య:',
    status_in_process: 'ప్రక్రియలో ఉంది',
    status_done: 'పూర్తయింది',
    in_progress_badge: 'పురోగతిలో ఉంది',
    completed_badge: 'పూర్తయింది',
    checked_in_at: 'చెక్-ఇన్ సమయం:',
    official_receipt: 'అధికారిక APMC సేకరణ రసీదు',
    download_btn: 'డౌన్‌లోడ్',

    stage_booked: 'టోకెన్ బుక్ అయింది',
    stage_booked_desc: 'స్లాట్ ఖరారైంది. గేట్ వద్ద QR పాస్ చూపించండి.',
    stage_checked_in: 'గేట్ చెక్-ఇన్ పూర్తయింది',
    stage_checked_in_desc: 'వాహనం ధృవీకరించబడి మార్కెట్ ఆవరణలోకి అనుమతించబడింది.',
    stage_weighed: 'ధర్మకాటా బరువు నమోదు (వేబ్రిడ్జ్)',
    stage_weighed_desc: 'మొత్తం మరియు ఖాళీ వాహనం బరువు నమోదు చేయబడింది.',
    stage_quality_approved: 'నాణ్యత తనిఖీ ఆమోదం',
    stage_quality_approved_desc: 'నాణ్యత మరియు తేమ శాతాన్ని అధికారి ఆమోదించారు.',
    stage_payment_initiated: 'DBT చెల్లింపు ప్రారంభం',
    stage_payment_initiated_desc: 'డబ్బు నేరుగా మీ బ్యాంక్ ఖాతాకు బదిలీ చేయబడుతోంది.',
    stage_completed: 'సేకరణ పూర్తయింది',
    stage_completed_desc: 'తుది రసీదు జారీ చేయబడింది. సేకరణ విజయవంతంగా ముగిసింది.',

    action_booked: 'మార్కెట్ రాక / గేట్ చెక్-ఇన్ కోసం వేచి ఉంది',
    action_checked_in: 'వేబ్రిడ్జ్ (లేన్ 2) కి వెళ్ళండి',
    action_weighed: 'నాణ్యత తనిఖీ బూత్ కి వెళ్ళండి',
    action_quality_approved: 'DBT కోసం అకౌంట్స్ డెస్క్ కి వెళ్ళండి',
    action_payment_initiated: 'DBT చెల్లింపు బదిలీ పురోగతిలో ఉంది',
    action_completed: 'సేకరణ చక్రం పూర్తయింది',
    action_cancelled: 'టోకెన్ రద్దు చేయబడింది',

    // Stage field details
    field_quantity: 'నమోదైన నికర బరువు',
    field_grade: 'ఆమోదించిన గ్రేడ్',
    field_payment: 'చెల్లింపు మొత్తం (DBT)',
    field_turnaround: 'పట్టిన మొత్తం సమయం',

    // Share Modal
    share_modal_title: 'టోకెన్ పాస్ పంచుకోండి',
    share_modal_desc: 'డ్రైవర్ లేదా కుటుంబ సభ్యులకు డిజిటల్ పాస్ పంపండి',
    share_via_apps: 'ఏదైనా యాప్ ద్వారా షేర్ చేయండి',
    copy_text: 'టెక్స్ట్ కాపీ చేయండి',
    copied: 'కాపీ అయింది!',
    or_send_via_sms: 'లేదా SMS ద్వారా పంపండి',
    send_sms_btn: 'SMS పాస్ లింక్ పంపండి',
    sms_dispatched_title: 'SMS పంపబడింది!',
    sms_dispatched_desc: 'పాస్ వివరాలు మరియు లింక్ పంపబడ్డాయి.',
    enter_mobile_placeholder: '10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి',

    // Notifications Feed
    notifications_title: 'SMS హెచ్చరికలు',
    notifications_sub: 'మీ ఫోన్‌కు పంపిన SMS మరియు మార్కెట్ హెచ్చరికలు',
    notifications_empty: 'ప్రస్తుతం సందేశాలు లేవు.',
    logs_badge: 'లాగ్‌లు',
    via_gateway: 'SMS గేట్‌వే ద్వారా',
    view_pass_link: 'డిజిటల్ పాస్ చూడండి →',
  },

  pa: {
    // App header & nav
    app_title: 'ਐਗਰੀ-ਕਿਊ ਕਿਸਾਨ ਸਾਥੀ',
    app_tagline: 'ਸਮਾਰਟ ਮੰਡੀ ਟੋਕਨ ਅਤੇ ਪਾਰਦਰਸ਼ੀ ਖਰੀਦ ਪ੍ਰਣਾਲੀ',
    nav_home: 'ਮੁੱਖ ਪੰਨਾ',
    nav_book: 'ਟੋਕਨ ਬੁੱਕ',
    nav_tokens: 'ਮੇਰੇ ਟੋਕਨ',
    nav_insights: 'ਵਿਕਰੀ ਸਲਾਹ AI',
    nav_alerts: 'SMS',
    offline_badge: 'ਆਫਲਾਈਨ ਮੋਡ ਚਾਲੂ',
    offline_msg: 'ਪਾਸ ਸੁਰੱਖਿਅਤ ਹੈ। ਇੰਟਰਨੈਟ ਆਉਣ ਤੇ ਸਿੰਕ ਹੋ ਜਾਵੇਗਾ।',
    live_sync: 'ਲਾਈਵ ਸਿੰਕ',
    demo_ready: 'ਡੈਮੋ ਤਿਆਰ',
    login_btn_text: 'ਲਾਗਇਨ',

    // PWA promo
    pwa_install_title: 'AgriQ ਕਿਸਾਨ ਐਪ ਇੰਸਟਾਲ ਕਰੋ',
    pwa_install_desc: 'ਮੰਡੀ ਅੰਦਰ ਆਫਲਾਈਨ ਟੋਕਨ ਪਾਸ ਵਰਤੋ',
    btn_install: 'ਇੰਸਟਾਲ ਕਰੋ',

    // Auth & Profile
    login_title: 'ਕਿਸਾਨ ਲਾਗਇਨ',
    login_subtitle: 'ਡਿਜੀਟਲ ਟੋਕਨ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਆਪਣਾ 10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    phone_label: 'ਮੋਬਾਈਲ ਨੰਬਰ',
    phone_placeholder: 'ਜਿਵੇਂ 9876543210',
    otp_label: '4 ਅੰਕਾਂ ਦਾ OTP ਦਰਜ ਕਰੋ',
    otp_placeholder: '• • • •',
    btn_send_otp: 'OTP ਭੇਜੋ (SMS)',
    btn_verify_otp: 'ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਲਾਗਇਨ',
    btn_change_phone: 'ਨੰਬਰ ਬਦਲੋ',
    otp_demo_hint: 'ਡੈਮੋ OTP: 1234 ਜਾਂ ਕੋਈ ਵੀ 4 ਅੰਕ ਵਰਤੋ',
    profile_welcome: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ',
    profile_edit: 'ਪ੍ਰੋਫਾਈਲ ਬਦਲੋ',
    farmer_name: 'ਪੂਰਾ ਨਾਮ',
    village_name: 'ਪਿੰਡ / ਸ਼ਹਿਰ',
    district_name: 'ਜ਼ਿਲ੍ਹਾ',
    state_name: 'ਸੂਬਾ',
    preferred_lang: 'ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ',
    save_profile: 'ਪ੍ਰੋਫਾਈਲ ਸੰਭਾਲੋ',
    profiles_modal_title: 'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਖਾਤੇ',
    profiles_modal_sub: 'ਕਿਸਾਨਾਂ ਵਿੱਚ ਬਦਲੋ ਜਾਂ ਨਵਾਂ ਖਾਤਾ ਜੋੜੋ',
    tab_switch: 'ਬਦਲੋ',
    tab_add_account: '+ ਖਾਤਾ ਜੋੜੋ',
    tab_edit_profile: 'ਪ੍ਰੋਫਾਈਲ ਬਦਲੋ',
    saved_profiles: 'ਸੰਭਾਲੇ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ',
    active_badge: 'ਸਰਗਰਮ',
    login_another_phone: '+ ਹੋਰ ਮੋਬਾਈਲ ਨੰਬਰ ਨਾਲ ਲਾਗਇਨ ਕਰੋ',
    quick_add_demo_title: '1-ਕਲਿੱਕ ਡੈਮੋ ਪ੍ਰੋਫਾਈਲ:',
    otp_sent_to: 'OTP ਭੇਜਿਆ ਗਿਆ:',
    change_number: 'ਬਦਲੋ',
    verifying_btn: 'ਪੁਸ਼ਟੀ ਹੋ ਰਹੀ ਹੈ...',
    saving_btn: 'ਸੰਭਾਲਿਆ ਜਾ ਰਿਹਾ ਹੈ...',

    // Quick Stats & Hero
    hero_title: 'ਸਮਾਰਟ ਖਰੀਦ, ਲੰਬੀਆਂ ਲਾਈਨਾਂ ਤੋਂ ਛੁਟਕਾਰਾ',
    hero_subtitle: 'ਘਰ ਬੈਠੇ ਮੰਡੀ ਟੋਕਨ ਪ੍ਰਾਪਤ ਕਰੋ, ਲਾਈਵ ਲਾਈਨ ਦੇਖੋ ਅਤੇ ਫਸਲ ਵੇਚਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਦਿਨ ਜਾਣੋ।',
    active_token_banner: 'ਤੁਹਾਡਾ ਅੱਜ ਦਾ ਮੰਡੀ ਟੋਕਨ ਚਾਲੂ ਹੈ!',
    btn_view_pass: 'ਡਿਜੀਟਲ ਪਾਸ ਦੇਖੋ',
    btn_new_booking: 'ਨਵਾਂ ਟੋਕਨ ਬੁੱਕ ਕਰੋ',
    btn_new_booking_sub: 'ਫਸਲ ਅਤੇ ਮੰਡੀ ਸਲਾਟ ਚੁਣੋ',
    no_active_pass: 'ਕੋਈ ਸਰਗਰਮ ਪਾਸ ਨਹੀਂ',
    view_details: 'ਵੇਰਵਾ ਦੇਖੋ →',
    refresh_live_data: 'ਤਾਜ਼ਾ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ',
    no_active_tokens_title: 'ਕੋਈ ਸਰਗਰਮ ਮੰਡੀ ਟੋਕਨ ਨਹੀਂ',
    no_active_tokens_desc: 'ਗੇਟ ਐਂਟਰੀ QR ਪਾਸ ਲੈਣ ਅਤੇ ਕਤਾਰਾਂ ਤੋਂ ਬਚਣ ਲਈ ਡਿਜੀਟਲ ਸਲਾਟ ਬੁੱਕ ਕਰੋ।',
    token_history_title: 'ਤੁਹਾਡਾ ਟੋਕਨ ਇਤਿਹਾਸ',

    // Best Day Card & Forecast
    best_day_title: 'AI ਵਧੀਆ ਵਿਕਰੀ ਦਿਨ ਸਲਾਹਕਾਰ',
    best_day_badge: 'ਵੇਚਣ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਦਿਨ',
    best_day_reason_high_price: 'ਚੰਗਾ ਰੇਟ ਅਤੇ ਮੰਡੀ ਵਿੱਚ ਘੱਟ ਭੀੜ ਦੀ ਸੰਭਾਵਨਾ',
    best_day_reason_moderate: 'ਸਥਿਰ ਭਾਅ ਅਤੇ ਦਰਮਿਆਨੀ ਲਾਈਨ',
    best_day_reason_rush: 'ਮੰਡੀ ਵਿੱਚ ਭਾਰੀ ਭੀੜ ਦੀ ਸੰਭਾਵਨਾ, ਅਗਲਾ ਦਿਨ ਚੁਣੋ',
    msp_guarantee: 'ਸਰਕਾਰੀ ਘੱਟੋ-ਘੱਟ ਸਮਰਥਨ ਮੁੱਲ (MSP)',
    current_forecast: 'ਅਨੁਮਾਨਿਤ ਭਾਅ',
    queue_penalty: 'ਭੀੜ ਸੂਚਕਾਂਕ',
    recommended_date: 'ਸਿਫਾਰਸ਼ ਕੀਤੀ ਮਿਤੀ',
    predicted_rate_label: 'ਅਨੁਮਾਨਿਤ ਭਾਅ',
    best_day_explanation: 'ਮੰਡੀ ਵਿੱਚ ਭੀੜ ਰੋਕਣ ਅਤੇ ਵਧੀਆ ਭਾਅ ਦਿਵਾਉਣ ਲਈ ਸਾਡਾ AI ਸਿਸਟਮ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਦਾ ਹੈ।',
    govt_msp_protected: 'ਸਰਕਾਰੀ MSP ਗਾਰੰਟੀ',
    btn_book_for_this_day: 'ਇਸ ਦਿਨ ਲਈ ਬੁੱਕ ਕਰੋ',
    price_trend_title: '7 ਦਿਨਾਂ ਦਾ ਮੰਡੀ ਭਾਅ ਅਤੇ ਭੀੜ ਪੂਰਵ-ਅਨੁਮਾਨ',
    price_trend_desc: 'AI ਮਾਡਲ ਅਨੁਮਾਨਿਤ ਰੇਟ ਅਤੇ ਮੰਡੀ ਕਤਾਰ ਨੂੰ ਸੰਤੁਲਿਤ ਕਰਦਾ ਹੈ।',
    badge_best: '★ ਵਧੀਆ',
    ai_dispatch_formula: 'AI ਫਾਰਮੂਲਾ: ਸਕੋਰ = ਭਾਅ ਰੁਝਾਨ − ਭੀੜ ਜੁਰਮਾਨਾ',
    live_scored: 'ਲਾਈਵ ਸਕੋਰ',
    select_crop_forecast: 'ਪੂਰਵ-ਅਨੁਮਾਨ ਲਈ ਫਸਲ ਚੁਣੋ:',
    ai_insights_sub: 'ਖੇਤੀਬਾੜੀ ਵਸਤੂਆਂ ਲਈ ਰੀਅਲ-ਟਾਈਮ ਸਮਾਰਟ ਡਿਸਪੈਚ ਆਪਟੀਮਾਈਜ਼ਰ',

    // 4-Step Booking Wizard
    wizard_step1_title: 'ਫਸਲ ਚੁਣੋ',
    wizard_step1_desc: 'ਉਹ ਫਸਲ ਚੁਣੋ ਜੋ ਤੁਸੀਂ ਮੰਡੀ ਵਿੱਚ ਵੇਚਣਾ ਚਾਹੁੰਦੇ ਹੋ',
    wizard_step2_title: 'ਮੰਡੀ ਕੇਂਦਰ ਚੁਣੋ',
    wizard_step2_desc: 'ਆਪਣਾ ਨੇੜਲਾ ਅਧਿਕਾਰਤ APMC ਖਰੀਦ ਕੇਂਦਰ ਚੁਣੋ',
    wizard_step3_title: 'ਮਿਤੀ ਅਤੇ ਸਮਾਂ ਸਲਾਟ',
    wizard_step3_desc: 'ਸੁਵਿਧਾਜਨਕ ਦਿਨ ਅਤੇ ਉਪਲਬਧ ਸਮਾਂ ਸਲਾਟ ਚੁਣੋ',
    wizard_step4_title: 'ਮਾਤਰਾ ਦਰਜ ਕਰਕੇ ਪਾਸ ਪ੍ਰਾਪਤ ਕਰੋ',
    wizard_step4_desc: 'ਅੰਦਾਜ਼ਨ ਫਸਲ ਭਾਰ ਦਰਜ ਕਰੋ ਅਤੇ ਡਿਜੀਟਲ QR ਪਾਸ ਪ੍ਰਾਪਤ ਕਰੋ',
    step_progress: 'ਕਦਮ',
    of_steps: 'ਵਿੱਚੋਂ',
    cancel: 'ਰੱਦ ਕਰੋ',

    // Crops
    crop_ragi: 'ਰਾਗੀ (Ragi / Finger Millet)',
    crop_tur: 'ਤੂਰ / ਅਰਹਰ (Tur Dal)',
    crop_wheat: 'ਕਣਕ (Wheat)',
    crop_soybean: 'ਸੋਇਆਬੀਨ (Soybean)',
    crop_cotton: 'ਨਰਮਾ / ਕਪਾਹ (Cotton)',
    crop_paddy: 'ਝੋਨਾ / ਧਾਨ (Paddy)',
    crop_mustard: 'ਸਰ੍ਹੋਂ (Mustard)',
    crop_chana: 'ਛੋਲੇ (Gram)',
    crop_onion: 'ਪਿਆਜ਼ (Onion)',
    crop_maize: 'ਮੱਕੀ (Maize)',

    // Step 1
    msp_guaranteed_banner: 'ਸਰਕਾਰੀ ਘੱਟੋ-ਘੱਟ ਸਮਰਥਨ ਮੁੱਲ (MSP) ਗਾਰੰਟੀ',
    msp_guaranteed_desc: 'ਦਿਖਾਏ ਗਏ ਸਾਰੇ ਰੇਟ ਪ੍ਰਤੀ ਕੁਇੰਟਲ (100 ਕਿੱਲੋ) ਸਿੱਧੇ APMC ਖਰੀਦ ਰੇਟ ਹਨ।',

    // Step 2
    all_mandis: 'ਸਾਰੀਆਂ ਮੰਡੀਆਂ',
    karnataka_tab: 'ਕਰਨਾਟਕ (Karnataka)',
    maharashtra_tab: 'ਮਹਾਰਾਸ਼ਟਰ (Maharashtra)',
    authorized_centers_for: 'ਖਰੀਦ ਕਰਨ ਵਾਲੇ ਅਧਿਕਾਰਤ APMC ਕੇਂਦਰ',
    centers_count: 'ਕੇਂਦਰ',
    no_centers_found: 'ਇਸ ਰਾਜ ਵਿੱਚ ਇਸ ਫਸਲ ਲਈ ਕੋਈ ਕੇਂਦਰ ਨਹੀਂ ਮਿਲਿਆ',
    show_all_centers: 'ਸਾਰੇ ਉਪਲਬਧ APMC ਕੇਂਦਰ ਦਿਖਾਓ',
    apmc_verified: 'APMC ਪ੍ਰਮਾਣਿਤ',
    daily_quota: 'ਰੋਜ਼ਾਨਾ ਕੋਟਾ',
    tons: 'ਟਨ',
    hourly_limit: 'ਪ੍ਰਤੀ ਘੰਟਾ ਸੀਮਾ',
    farmers_per_hr: 'ਕਿਸਾਨ/ਘੰਟਾ',
    avg_process: 'ਔਸਤ ਸਮਾਂ',

    // Step 3
    forecast_rate_label: 'ਅਨੁਮਾਨਿਤ ਭਾਅ:',
    select_recommended_day: '⚡ ਇਹ ਸਿਫਾਰਸ਼ ਕੀਤਾ ਦਿਨ ਚੁਣੋ →',
    no_slots_found: 'ਇਸ ਮਿਤੀ ਲਈ ਕੋਈ ਸਲਾਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਕੋਈ ਹੋਰ ਦਿਨ ਚੁਣੋ।',
    slot_full_label: 'ਭਰ ਗਿਆ',
    left_suffix: 'ਬਾਕੀ',
    of_label: 'ਵਿੱਚੋਂ',
    booked_label: 'ਬੁੱਕ',
    full_pct_label: 'ਭਰਿਆ',

    // Step 4
    procurement_summary: 'ਖਰੀਦ ਸਾਰ',
    apmc_center_label: 'APMC ਕੇਂਦਰ',
    selling_date_label: 'ਵਿਕਰੀ ਦੀ ਮਿਤੀ',
    assigned_gate_slot: 'ਮਿਲਿਆ ਗੇਟ ਸਲਾਟ',
    farmer_label: 'ਕਿਸਾਨ:',
    unit_kg: 'ਕਿਲੋਗ੍ਰਾਮ (Kg)',
    unit_quintal: 'ਕੁਇੰਟਲ (q)',
    quick_presets: 'ਤੁਰੰਤ ਚੋਣ:',
    direct_bank_dbt: 'ਸਿੱਧਾ ਬੈਂਕ DBT',
    generating_pass: 'ਡਿਜੀਟਲ ਪਾਸ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',

    // Booking Details
    select_date: 'ਵਿਕਰੀ ਦੀ ਮਿਤੀ ਚੁਣੋ',
    available_slots: 'ਉਪਲਬਧ ਸਮਾਂ ਸਲਾਟ',
    slots_remaining: 'ਜਗ੍ਹਾ ਬਾਕੀ ਹੈ',
    slot_full: 'ਸਲਾਟ ਭਰ ਗਿਆ ਹੈ',
    est_quantity: 'ਅੰਦਾਜ਼ਨ ਫਸਲ ਮਾਤਰਾ',
    in_quintals: 'ਕੁਇੰਟਲ (1 ਕੁਇੰਟਲ = 100 ਕਿਲੋ)',
    in_kg: 'ਕਿਲੋਗ੍ਰਾਮ (Kg)',
    est_total_payout: 'ਕੁੱਲ ਅੰਦਾਜ਼ਨ ਰਕਮ (MSP ਮੁਤਾਬਕ)',
    btn_next: 'ਅੱਗੇ ਵਧੋ',
    btn_back: 'ਪਿੱਛੇ ਜਾਓ',
    btn_confirm_token: 'ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਟੋਕਨ ਬਣਾਓ',
    booking_success: 'ਬੁਕਿੰਗ ਸਫਲ!',
    booking_success_msg: 'ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਗੇਟ ਪਾਸ ਤਿਆਰ ਹੈ। ਮੰਡੀ ਗੇਟ ਤੇ QR ਕੋਡ ਦਿਖਾਓ।',

    // Token Pass Card
    token_pass_title: 'ਮੰਡੀ ਐਂਟਰੀ ਈ-ਪਾਸ',
    apmc_smart_pass_header: 'APMC ਸਮਾਰਟ ਖਰੀਦ ਪਾਸ',
    created_via: 'ਰਾਹੀਂ ਬਣਾਇਆ ਗਿਆ',
    token_number: 'ਟੋਕਨ ਨੰਬਰ',
    gate_entry_time: 'ਦਾਖਲਾ ਸਮਾਂ ਸਲਾਟ',
    queue_position_label: 'ਮੌਜੂਦਾ ਲਾਈਨ ਸਥਿਤੀ',
    queue_in_line: 'ਲਾਈਨ ਵਿੱਚ ਅੱਗੇ',
    est_wait_time: 'ਅੰਦਾਜ਼ਨ ਉਡੀਕ ਸਮਾਂ',
    mins: 'ਮਿੰਟ',
    qr_instruction: 'ਤੁਰੰਤ ਦਾਖਲੇ ਲਈ ਇਹ QR ਕੋਡ ਮੰਡੀ ਗੇਟ ਅਧਿਕਾਰੀ ਨੂੰ ਦਿਖਾਓ',
    btn_download_pass: 'ਪਾਸ ਸੰਭਾਲੋ',
    btn_share_sms: 'SMS/WhatsApp ਰਾਹੀਂ ਭੇਜੋ',
    btn_cancel_booking: 'ਟੋਕਨ ਰੱਦ ਕਰੋ',
    status_slot_confirmed: 'ਸਲਾਟ ਪੱਕਾ',
    status_checked_in: 'ਗੇਟ ਤੇ ਚੈੱਕ-ਇਨ',
    status_weighed: 'ਵਜ਼ਨ ਦਰਜ',
    status_quality_approved: 'ਗੁਣਵੱਤਾ ਮਨਜ਼ੂਰ',
    status_payment_initiated: 'DBT ਸ਼ੁਰੂ',
    status_procurement_done: 'ਖਰੀਦ ਮੁਕੰਮਲ',
    status_cancelled: 'ਰੱਦ ਕੀਤਾ ਗਿਆ',
    at_checkpoint: 'ਚੌਕੀ ਤੇ',
    date_label: 'ਮਿਤੀ',
    gate_window: 'ਗੇਟ ਦਾਖਲਾ ਸਮਾਂ',
    crop_declared_weight: 'ਫਸਲ ਅਤੇ ਦਰਜ ਵਜ਼ਨ',
    dbt_payout: 'DBT ਭੁਗਤਾਨ',
    track_live_progress: 'ਲਾਈਵ ਪ੍ਰਗਤੀ ਦੇਖੋ',
    view_tracker_btn: 'ਟਰੈਕਰ ਦੇਖੋ →',
    pass_downloaded: 'ਪਾਸ ਡਾਊਨਲੋਡ ਹੋ ਗਿਆ!',
    generating_pass_btn: 'ਪਾਸ ਬਣ ਰਿਹਾ ਹੈ...',

    // 6-Stage Realtime Status Tracker
    tracker_title: 'ਲਾਈਵ ਖਰੀਦ ਪ੍ਰਗਤੀ ਟ੍ਰੈਕਰ',
    tracker_subtitle: 'ਮੰਡੀ ਵਿੱਚ ਹਰ ਚੌਕੀ ਤੇ ਤੁਹਾਡੀ ਸਥਿਤੀ ਤੁਰੰਤ ਅਪਡੇਟ ਹੁੰਦੀ ਹੈ',
    live_queue_sync: 'ਲਾਈਵ ਮੰਡੀ ਲਾਈਨ ਸਿੰਕ',
    next_action: 'ਅਗਲਾ ਕਦਮ:',
    status_in_process: 'ਜਾਰੀ ਹੈ',
    status_done: 'ਮੁਕੰਮਲ',
    in_progress_badge: 'ਜਾਰੀ ਹੈ',
    completed_badge: 'ਮੁਕੰਮਲ',
    checked_in_at: 'ਚੈੱਕ-ਇਨ ਸਮਾਂ:',
    official_receipt: 'ਅਧਿਕਾਰਤ APMC ਖਰੀਦ ਰਸੀਦ',
    download_btn: 'ਡਾਊਨਲੋਡ',

    stage_booked: 'ਟੋਕਨ ਬੁੱਕ ਹੋਇਆ',
    stage_booked_desc: 'ਸਲਾਟ ਪੱਕਾ। ਗੇਟ ਤੇ QR ਪਾਸ ਦਿਖਾਓ।',
    stage_checked_in: 'ਗੇਟ ਤੇ ਚੈੱਕ-ਇਨ ਪੂਰਾ',
    stage_checked_in_desc: 'ਗੱਡੀ ਦੀ ਜਾਂਚ ਕਰਕੇ ਮੰਡੀ ਅੰਦਰ ਦਾਖਲ ਕੀਤਾ ਗਿਆ।',
    stage_weighed: 'ਕੰਡੇ ਤੇ ਵਜ਼ਨ (ਤੋਲ)',
    stage_weighed_desc: 'ਗੱਡੀ ਦਾ ਕੁੱਲ ਅਤੇ ਖਾਲੀ ਵਜ਼ਨ ਦਰਜ ਕੀਤਾ ਗਿਆ।',
    stage_quality_approved: 'ਗੁਣਵੱਤਾ ਜਾਂਚ ਪਾਸ',
    stage_quality_approved_desc: 'ਸਰਕਾਰੀ ਪਰਖ ਅਧਿਕਾਰੀ ਵੱਲੋਂ ਗ੍ਰੇਡ ਅਤੇ ਨਮੀ ਮਨਜ਼ੂਰ।',
    stage_payment_initiated: 'DBT ਭੁਗਤਾਨ ਸ਼ੁਰੂ',
    stage_payment_initiated_desc: 'ਰਕਮ ਸਿੱਧੀ ਤੁਹਾਡੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਭੇਜੀ ਜਾ ਰਹੀ ਹੈ।',
    stage_completed: 'ਖਰੀਦ ਮੁਕੰਮਲ',
    stage_completed_desc: 'ਅੰਤਿਮ ਰਸੀਦ ਜਾਰੀ। ਖਰੀਦ ਪ੍ਰਕਿਰਿਆ ਸਫਲਤਾਪੂਰਵਕ ਸਮਾਪਤ।',

    action_booked: 'ਮੰਡੀ ਆਮਦ / ਗੇਟ ਚੈੱਕ-ਇਨ ਦੀ ਉਡੀਕ',
    action_checked_in: 'ਕੰਡੇ (ਲਾਈਨ 2) ਤੇ ਅੱਗੇ ਵਧੋ',
    action_weighed: 'ਗੁਣਵੱਤਾ ਜਾਂਚ ਬੂਥ ਤੇ ਜਾਓ',
    action_quality_approved: 'DBT ਲਈ ਅਕਾਊਂਟਸ ਡੈਸਕ ਤੇ ਜਾਓ',
    action_payment_initiated: 'DBT ਬੈਂਕ ਟਰਾਂਸਫਰ ਪ੍ਰਕਿਰਿਆ ਜਾਰੀ ਹੈ',
    action_completed: 'ਖਰੀਦ ਚੱਕਰ ਸਫਲਤਾਪੂਰਵਕ ਸਮਾਪਤ',
    action_cancelled: 'ਟੋਕਨ ਰੱਦ ਕੀਤਾ ਗਿਆ',

    // Stage field details
    field_quantity: 'ਦਰਜ ਕੀਤਾ ਕੁੱਲ ਵਜ਼ਨ',
    field_grade: 'ਮਨਜ਼ੂਰ ਗ੍ਰੇਡ',
    field_payment: 'ਭੁਗਤਾਨ ਰਕਮ (DBT)',
    field_turnaround: 'ਕੁੱਲ ਲੱਗਿਆ ਸਮਾਂ',

    // Share Modal
    share_modal_title: 'ਟੋਕਨ ਪਾਸ ਸਾਂਝਾ ਕਰੋ',
    share_modal_desc: 'ਡਰਾਈਵਰ ਜਾਂ ਪਰਿਵਾਰ ਦੇ ਮੈਂਬਰ ਨੂੰ ਡਿਜੀਟਲ ਪਾਸ ਭੇਜੋ',
    share_via_apps: 'ਕਿਸੇ ਵੀ ਐਪ ਰਾਹੀਂ ਸਾਂਝਾ ਕਰੋ',
    copy_text: 'ਟੈਕਸਟ ਕਾਪੀ ਕਰੋ',
    copied: 'ਕਾਪੀ ਹੋ ਗਿਆ!',
    or_send_via_sms: 'ਜਾਂ SMS ਰਾਹੀਂ ਭੇਜੋ',
    send_sms_btn: 'SMS ਪਾਸ ਲਿੰਕ ਭੇਜੋ',
    sms_dispatched_title: 'SMS ਭੇਜ ਦਿੱਤਾ ਗਿਆ!',
    sms_dispatched_desc: 'ਪਾਸ ਵੇਰਵੇ ਅਤੇ ਲਿੰਕ ਭੇਜੇ ਗਏ।',
    enter_mobile_placeholder: '10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',

    // Notifications Feed
    notifications_title: 'SMS ਅਲਰਟ ਅਤੇ ਸੁਨੇਹੇ',
    notifications_sub: 'ਤੁਹਾਡੇ ਫ਼ੋਨ ਤੇ ਭੇਜੇ ਗਏ SMS ਅਤੇ ਮੰਡੀ ਅਲਰਟ',
    notifications_empty: 'ਕੋਈ ਨਵਾਂ ਸੁਨੇਹਾ ਨਹੀਂ ਹੈ।',
    logs_badge: 'ਲਾਗ',
    via_gateway: 'SMS ਗੇਟਵੇ ਰਾਹੀਂ',
    view_pass_link: 'ਡਿਜੀਟਲ ਪਾਸ ਦੇਖੋ →',
  },
};

/**
 * Helper to dynamically translate AI reason strings into Kannada, Hindi, Marathi, etc.
 */
export function getLocalizedReason(reasonText: string | undefined, lang: SupportedLang): string {
  if (!reasonText) return '';
  const r = reasonText.toLowerCase();

  if (r.includes('high msp premium') || r.includes('optimal queue') || r.includes('high price trend')) {
    switch (lang) {
      case 'kn': return '🌟 ಗರಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಲಾಭ, ಅತ್ಯುತ್ತಮ ಮಂಡಿ ಪ್ರವೇಶ ಸಾಮರ್ಥ್ಯ';
      case 'hi': return '🌟 उच्च MSP लाभ, इष्टतम मंडी प्रवेश क्षमता';
      case 'mr': return '🌟 उत्तम हमीभाव नफा, योग्य बाजार समिती प्रवेश क्षमता';
      case 'te': return '🌟 మంచి మద్దతు ధర లాభం, సరైన మార్కెట్ ప్రవేశ సామర్థ్యం';
      case 'pa': return '🌟 ਵਧੀਆ ਸਮਰਥਨ ਮੁੱਲ ਲਾਭ, ਅਨੁਕੂਲ ਮੰਡੀ ਦਾਖਲਾ ਸਮਰੱਥਾ';
      default: return '🌟 High MSP premium, optimal queue intake capacity';
    }
  }

  if (r.includes('rush') || r.includes('bottleneck') || r.includes('heavy rush') || r.includes('delay')) {
    switch (lang) {
      case 'kn': return '⚠️ ಮಂಡಿಯಲ್ಲಿ ಹೆಚ್ಚಿನ ದಟ್ಟಣೆ ನಿರೀಕ್ಷೆ, ಸರತಿ ಸಾಲಿನ ವಿಳಂಬ ಸಾಧ್ಯತೆ';
      case 'hi': return '⚠️ मंडी में भारी भीड़ की आशंका, कतार में देरी संभावित';
      case 'mr': return '⚠️ बाजार समितीत प्रचंड गर्दीची शक्यता, रांगेत वेळ लागण्याची शक्यता';
      case 'te': return '⚠️ మార్కెట్లో భారీ రద్దీ అంచనా, క్యూలో ఆలస్యం కావచ్చు';
      case 'pa': return '⚠️ ਮੰਡੀ ਵਿੱਚ ਭਾਰੀ ਭੀੜ ਦੀ ਸੰਭਾਵਨਾ, ਕਤਾਰ ਵਿੱਚ ਦੇਰੀ ਹੋ ਸਕਦੀ ਹੈ';
      default: return '⚠️ High mandi arrival rush anticipated, expected queue delay';
    }
  }

  if (r.includes('bullish') || r.includes('institutional') || r.includes('spot rates')) {
    switch (lang) {
      case 'kn': return '📈 ಬೃಹತ್ ಸಾಂಸ್ಥಿಕ ಖರೀದಿದಾರರಿಂದ ಹೆಚ್ಚಿನ ದರ ನಿರೀಕ್ಷೆ';
      case 'hi': return '📈 बड़े संस्थागत खरीदारों से ऊंचे भाव की उम्मीद';
      case 'mr': return '📈 मोठ्या खरेदीदारांकडून तेजीचे दर अपेक्षित';
      case 'te': return '📈 పెద్ద కొనుగోలుదారుల నుండి మంచి ధరల అంచనా';
      case 'pa': return '📈 ਵੱਡੇ ਖਰੀਦਦਾਰਾਂ ਵੱਲੋਂ ਤੇਜ਼ੀ ਦੇ ਭਾਅ ਦੀ ਉਮੀਦ';
      default: return '📈 Bullish spot rates expected from bulk institutional buyers';
    }
  }

  if (r.includes('standard') || r.includes('normal wait') || r.includes('stable rates')) {
    switch (lang) {
      case 'kn': return 'ಸಾಧಾರಣ ಕಾಯುವ ಸಮಯದೊಂದಿಗೆ ಸಾಮಾನ್ಯ ಮಾರುಕಟ್ಟೆ ಸ್ಲಾಟ್';
      case 'hi': return 'सामान्य प्रतीक्षा समय के साथ मानक मंडी स्लॉट';
      case 'mr': return 'साधारण प्रतीक्षा वेळेसह नियमित स्लॉट';
      case 'te': return 'సాధారణ వేచి ఉండే సమయంతో సాధారణ మార్కెట్ స్లాట్';
      case 'pa': return 'ਆਮ ਉਡੀਕ ਸਮੇਂ ਦੇ ਨਾਲ ਸਾਧਾਰਨ ਮੰਡੀ ਸਲਾਟ';
      default: return 'Standard market slot with normal wait time';
    }
  }

  return reasonText;
}

/**
 * Helper to get localized status badge text
 */
export function getLocalizedStatus(status: string | undefined, lang: SupportedLang): string {
  if (!status) return '';
  const s = status.toUpperCase();
  const dict = translations[lang] || translations.en;

  switch (s) {
    case 'BOOKED': return dict.status_slot_confirmed || 'Slot Confirmed';
    case 'CHECKED_IN': return dict.status_checked_in || 'Checked-in at Gate';
    case 'WEIGHED': return dict.status_weighed || 'Weight Logged';
    case 'QUALITY_APPROVED': return dict.status_quality_approved || 'Quality Approved';
    case 'PAYMENT_INITIATED': return dict.status_payment_initiated || 'DBT Initiated';
    case 'COMPLETED': return dict.status_procurement_done || 'Procurement Done';
    case 'CANCELLED': return dict.status_cancelled || 'Cancelled';
    default: return status;
  }
}

/**
 * Mandi Center Name localization map
 */
export const MANDI_TRANSLATIONS: Record<string, Record<SupportedLang, string>> = {
  'Bengaluru APMC (Yeshwanthpur Main Yard)': {
    kn: 'ಬೆಂಗಳೂರು APMC (ಯಶವಂತಪುರ ಮುಖ್ಯ ಮಾರುಕಟ್ಟೆ)',
    hi: 'बेंगलुरु APMC (यशवंतपुर मुख्य यार्ड)',
    mr: 'बंगळुरू APMC (यशवंतपूर मुख्य यार्ड)',
    en: 'Bengaluru APMC (Yeshwanthpur Main Yard)',
    te: 'బెంగళూరు APMC (యశ్వంత్‌పూర్ ప్రధాన మార్కెట్)',
    pa: 'ਬੈਂਗਲੁਰੂ APMC (ਯਸ਼ਵੰਤਪੁਰ ਮੁੱਖ ਮੰਡੀ)',
  },
  'Hubballi APMC (Amaragol Market Yard)': {
    kn: 'ಹುಬ್ಬಳ್ಳಿ APMC (ಅಮರಗೋಳ ಮಾರುಕಟ್ಟೆ ಆವರಣ)',
    hi: 'हुबली APMC (अमरगोल मार्केट यार्ड)',
    mr: 'हुबळी APMC (अमरगोळ मार्केट यार्ड)',
    en: 'Hubballi APMC (Amaragol Market Yard)',
    te: 'హుబ్లీ APMC (అమరగోల్ మార్కెట్ యార్డ్)',
    pa: 'ਹੁਬਲੀ APMC (ਅਮਰਗੋਲ ਮਾਰਕੀਟ ਯਾਰਡ)',
  },
  'Mysuru APMC (Bandipalya Yard)': {
    kn: 'ಮೈಸೂರು APMC (ಬಂಡೀಪಾಳ್ಯ ಮಾರುಕಟ್ಟೆ)',
    hi: 'मैसूर APMC (बांदीपाल्या यार्ड)',
    mr: 'म्हैसूर APMC (बांदीपाळ्य यार्ड)',
    en: 'Mysuru APMC (Bandipalya Yard)',
    te: 'మైసూర్ APMC (బండిపాళ్య యార్డ్)',
    pa: 'ਮੈਸੂਰ APMC (ਬਾਂਦੀਪਾਲਿਆ ਯਾਰਡ)',
  },
  'Kalaburagi APMC (Nehru Gunj Hub)': {
    kn: 'ಕಲಬುರಗಿ APMC (ನೆಹರೂ ಗಂಜ್ ಮಾರುಕಟ್ಟೆ)',
    hi: 'कलबुर्गी APMC (नेहरू गंज केंद्र)',
    mr: 'कलबुर्गी APMC (नेहरू गंज केंद्र)',
    en: 'Kalaburagi APMC (Nehru Gunj Hub)',
    te: 'కలబురగి APMC (నెహ్రూ గంజ్ హబ్)',
    pa: 'ਕਲਬੁਰਗੀ APMC (ਨੇਹਰੂ ਗੰਜ ਹੱਬ)',
  },
  'Belagavi APMC Central Yard': {
    kn: 'ಬೆಳಗಾವಿ APMC ಕೇಂದ್ರ ಮಾರುಕಟ್ಟೆ',
    hi: 'बेलगावी APMC केंद्रीय यार्ड',
    mr: 'बेळगाव APMC केंद्रीय यार्ड',
    en: 'Belagavi APMC Central Yard',
    te: 'బెళగావి APMC సెంట్రల్ యార్డ్',
    pa: 'ਬੇਲਗਾਵੀ APMC ਸੈਂਟਰਲ ਯਾਰਡ',
  },
  'Raichur Cotton & Paddy APMC': {
    kn: 'ರಾಯಚೂರು ಹತ್ತಿ ಮತ್ತು ಭತ್ತ APMC',
    hi: 'रायचूर कपास एवं धान APMC',
    mr: 'रायचूर कापूस व भात APMC',
    en: 'Raichur Cotton & Paddy APMC',
    te: 'రాయచూర్ పత్తి & వరి APMC',
    pa: 'ਰਾਇਚੂਰ ਕਪਾਹ ਅਤੇ ਝੋਨਾ APMC',
  },
  'Nashik APMC Main Yard': {
    kn: 'ನಾಸಿಕ್ APMC ಮುಖ್ಯ ಮಾರುಕಟ್ಟೆ',
    hi: 'नासिक APMC मुख्य यार्ड',
    mr: 'नाशिक APMC मुख्य यार्ड',
    en: 'Nashik APMC Main Yard',
    te: 'నాసిక్ APMC ప్రధాన యార్డ్',
    pa: 'ਨਾਸਿਕ APMC ਮੁੱਖ ਮੰਡੀ',
  },
  'Lasalgaon Onion & Grain Market Yard': {
    kn: 'ಲಾಸಲ್‌ಗಾಂವ್ ಈರುಳ್ಳಿ ಮತ್ತು ಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ',
    hi: 'लासलगांव प्याज एवं अनाज मंडी',
    mr: 'लासलगाव कांदा व धान्य मार्केट यार्ड',
    en: 'Lasalgaon Onion & Grain Market Yard',
    te: 'లాసల్‌గావ్ ఉల్లిపాయ & ధాన్యపు మార్కెట్',
    pa: 'ਲਾਸਲਗਾਓਂ ਪਿਆਜ਼ ਅਤੇ ਅਨਾਜ ਮੰਡੀ',
  },
  'Pune APMC (Gultekdi Market Yard)': {
    kn: 'ಪುಣೆ APMC (ಗುಲ್ತೇಕ್ಡಿ ಮಾರುಕಟ್ಟೆ)',
    hi: 'पुणे APMC (गुलटेकड़ी मार्केट यार्ड)',
    mr: 'पुणे APMC (गुलटेकडी मार्केट यार्ड)',
    en: 'Pune APMC (Gultekdi Market Yard)',
    te: 'పుణె APMC (గుల్తేక్డి మార్కెట్ యార్డ్)',
    pa: 'ਪੁਣੇ APMC (ਗੁਲਟੇਕੜੀ ਮਾਰਕੀਟ ਯਾਰਡ)',
  },
  'Nagpur APMC Cotton & Grain Yard': {
    kn: 'ನಾಗ್ಪುರ APMC ಹತ್ತಿ ಮತ್ತು ಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ',
    hi: 'नागपुर APMC कपास एवं अनाज यार्ड',
    mr: 'नागपूर APMC कापूस व धान्य यार्ड',
    en: 'Nagpur APMC Cotton & Grain Yard',
    te: 'నాగ్‌పూర్ APMC పత్తి & ధాన్యపు యార్డ్',
    pa: 'ਨਾਗਪੁਰ APMC ਕਪਾਹ ਅਤੇ ਅਨਾਜ ਯਾਰਡ',
  },
  'Ahmednagar APMC Market Yard': {
    kn: 'ಅಹ್ಮದ್‌ನಗರ APMC ಮಾರುಕಟ್ಟೆ',
    hi: 'अहमदनगर APMC मार्केट यार्ड',
    mr: 'अहमदनगर APMC मार्केट यार्ड',
    en: 'Ahmednagar APMC Market Yard',
    te: 'అహ్మద్‌నగర్ APMC మార్కెట్ యార్డ్',
    pa: 'ਅਹਿਮਦਨਗਰ APMC ਮਾਰਕੀਟ ਯਾਰਡ',
  },
};

/**
 * Location translations map
 */
export const LOCATION_TRANSLATIONS: Record<string, Record<SupportedLang, string>> = {
  'APMC Market Yard, Yeshwanthpur': {
    kn: 'APMC ಮಾರುಕಟ್ಟೆ ಆವರಣ, ಯಶವಂತಪುರ',
    hi: 'APMC मार्केट यार्ड, यशवंतपुर',
    mr: 'APMC मार्केट यार्ड, यशवंतपूर',
    en: 'APMC Market Yard, Yeshwanthpur',
    te: 'APMC మార్కెట్ యార్డ్, యశ్వంత్‌పూర్',
    pa: 'APMC ਮਾਰਕੀਟ ਯਾਰਡ, ਯਸ਼ਵੰਤਪੁਰ',
  },
  'Amaragol, PB Road': {
    kn: 'ಅಮರಗೋಳ, ಪಿಬಿ ರಸ್ತೆ',
    hi: 'अमरगोल, पीबी रोड',
    mr: 'अमरगोळ, पीबी रोड',
    en: 'Amaragol, PB Road',
    te: 'అమరగోల్, PB రోడ్',
    pa: 'ਅਮਰਗੋਲ, PB ਰੋਡ',
  },
  'Bandipalya, Nanjangud Road': {
    kn: 'ಬಂಡೀಪಾಳ್ಯ, ನಂಜನಗೂಡು ರಸ್ತೆ',
    hi: 'बांदीपाल्या, नंजनगुड़ रोड',
    mr: 'बांदीपाळ्य, नंजनगुड रोड',
    en: 'Bandipalya, Nanjangud Road',
    te: 'బండిపాళ్య, నంజన్‌గూడు రోడ్',
    pa: 'ਬਾਂਦੀਪਾਲਿਆ, ਨੰਜਨਗੁੜ ਰੋਡ',
  },
  'Nehru Gunj Market': {
    kn: 'ನೆಹರೂ ಗಂಜ್ ಮಾರುಕಟ್ಟೆ',
    hi: 'नेहरू गंज मार्केट',
    mr: 'नेहरू गंज मार्केट',
    en: 'Nehru Gunj Market',
    te: 'నెహ్రూ గంజ్ మార్కెట్',
    pa: 'ਨੇਹਰੂ ਗੰਜ ਮਾਰਕੀਟ',
  },
  'RMC Yard, Shivaji Nagar': {
    kn: 'RMC ಆವರಣ, ಶಿವಾಜಿ ನಗರ',
    hi: 'RMC यार्ड, शिवाजी नगर',
    mr: 'RMC यार्ड, शिवाजी नगर',
    en: 'RMC Yard, Shivaji Nagar',
    te: 'RMC యార్డ్, శివాజీ నగర్',
    pa: 'RMC ਯਾਰਡ, ਸ਼ਿਵਾਜੀ ਨਗਰ',
  },
  'Gunj Area, Raichur': {
    kn: 'ಗಂಜ್ ಪ್ರದೇಶ, ರಾಯಚೂರು',
    hi: 'गंज क्षेत्र, रायचूर',
    mr: 'गंज परिसर, रायचूर',
    en: 'Gunj Area, Raichur',
    te: 'గంజ్ ఏరియా, రాయచూర్',
    pa: 'ਗੰਜ ਇਲਾਕਾ, ਰਾਇਚੂਰ',
  },
  'Dindori Road, Panchavati': {
    kn: 'ದಿಂಡೋರಿ ರಸ್ತೆ, ಪಂಚವಟಿ',
    hi: 'डिंडोरी रोड, पंचवटी',
    mr: 'दिंडोरी रोड, पंचवटी',
    en: 'Dindori Road, Panchavati',
    te: 'దిండోరి రోడ్, పంచవటి',
    pa: 'ਡਿੰਡੋਰੀ ਰੋਡ, ਪੰਚਵਟੀ',
  },
  'Station Road, Lasalgaon': {
    kn: 'ಸ್ಟೇಷನ್ ರಸ್ತೆ, ಲಾಸಲ್‌ಗಾಂವ್',
    hi: 'स्टेशन रोड, लासलगांव',
    mr: 'स्टेशन रोड, लासलगाव',
    en: 'Station Road, Lasalgaon',
    te: 'స్టేషన్ రోడ్, లాసల్‌గావ్',
    pa: 'ਸਟੇਸ਼ਨ ਰੋਡ, ਲਾਸਲਗਾਓਂ',
  },
  'Gultekdi, Market Yard Road': {
    kn: 'ಗುಲ್ತೇಕ್ಡಿ, ಮಾರ್ಕೆಟ್ ಯಾರ್ಡ್ ರಸ್ತೆ',
    hi: 'गुलटेकड़ी, मार्केट यार्ड रोड',
    mr: 'गुलटेकडी, मार्केट यार्ड रोड',
    en: 'Gultekdi, Market Yard Road',
    te: 'గుల్తేక్డి, మార్కెట్ యార్డ్ రోడ్',
    pa: 'ਗੁਲਟੇਕੜੀ, ਮਾਰਕੀਟ ਯਾਰਡ ਰੋਡ',
  },
  'Kalamna Market, Kamptee Road': {
    kn: 'ಕಲಮ್ನಾ ಮಾರುಕಟ್ಟೆ, ಕಾಮ್ಟಿ ರಸ್ತೆ',
    hi: 'कलमना मार्केट, कामठी रोड',
    mr: 'कळमना मार्केट, कामठी रोड',
    en: 'Kalamna Market, Kamptee Road',
    te: 'కలంనా మార్కెట్, కాంప్టీ రోడ్',
    pa: 'ਕਲਮਨਾ ਮਾਰਕੀਟ, ਕਾਮਟੀ ਰੋਡ',
  },
  'Station Road, Market Yard': {
    kn: 'ಸ್ಟೇಷನ್ ರಸ್ತೆ, ಮಾರ್ಕೆಟ್ ಯಾರ್ಡ್',
    hi: 'स्टेशन रोड, मार्केट यार्ड',
    mr: 'स्टेशन रोड, मार्केट यार्ड',
    en: 'Station Road, Market Yard',
    te: 'స్టేషన్ రోడ్, మార్కెట్ యార్డ్',
    pa: 'ਸਟੇਸ਼ਨ ਰੋਡ, ਮਾਰਕੀਟ ਯਾਰਡ',
  },
};

/**
 * District translations map
 */
export const DISTRICT_TRANSLATIONS: Record<string, Record<SupportedLang, string>> = {
  'Bengaluru Urban': { kn: 'ಬೆಂಗಳೂರು ನಗರ', hi: 'बेंगलुरु शहरी', mr: 'बंगळुरू शहर', en: 'Bengaluru Urban', te: 'బెంగళూరు అర్బన్', pa: 'ਬੈਂਗਲੁਰੂ ਅਰਬਨ' },
  'Bengaluru Rural': { kn: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', hi: 'बेंगलुरु ग्रामीण', mr: 'बंगळुरू ग्रामीण', en: 'Bengaluru Rural', te: 'బెంగళూరు రూరల్', pa: 'ਬੈਂਗਲੁਰੂ ਦਿਹਾਤੀ' },
  'Dharwad': { kn: 'ಧಾರವಾಡ', hi: 'धारवाड़', mr: 'धारवाड', en: 'Dharwad', te: 'ధార్వాడ్', pa: 'ਧਾਰਵਾੜ' },
  'Mysuru': { kn: 'ಮೈಸೂರು', hi: 'मैसूर', mr: 'म्हैसूर', en: 'Mysuru', te: 'మైసూర్', pa: 'ਮੈਸੂਰ' },
  'Kalaburagi': { kn: 'ಕಲಬುರಗಿ', hi: 'कलबुर्गी', mr: 'कलबुर्गी', en: 'Kalaburagi', te: 'కలబురగి', pa: 'ਕਲਬੁਰਗੀ' },
  'Belagavi': { kn: 'ಬೆಳಗಾವಿ', hi: 'बेलगावी', mr: 'बेळगाव', en: 'Belagavi', te: 'బెళగావి', pa: 'ਬੇਲਗਾਵੀ' },
  'Raichur': { kn: 'ರಾಯಚೂರು', hi: 'रायचूर', mr: 'रायचूर', en: 'Raichur', te: 'రాయచూర్', pa: 'ਰਾਇਚੂਰ' },
  'Nashik': { kn: 'ನಾಸಿಕ್', hi: 'नासिक', mr: 'नाशिक', en: 'Nashik', te: 'నాసిక్', pa: 'ਨਾਸਿਕ' },
  'Pune': { kn: 'ಪುಣೆ', hi: 'पुणे', mr: 'पुणे', en: 'Pune', te: 'పుణె', pa: 'ਪੁਣੇ' },
  'Nagpur': { kn: 'ನಾಗ್ಪುರ', hi: 'नागपुर', mr: 'नागपूर', en: 'Nagpur', te: 'నాగ్‌పూర్', pa: 'ਨਾਗਪੁਰ' },
  'Ahmednagar': { kn: 'ಅಹ್ಮದ್‌ನಗರ', hi: 'अहमदनगर', mr: 'अहमदनगर', en: 'Ahmednagar', te: 'అహ్మద్‌నగర్', pa: 'ਅਹਿਮਦਨਗਰ' },
};

/**
 * State translations map
 */
export const STATE_TRANSLATIONS: Record<string, Record<SupportedLang, string>> = {
  'Karnataka': { kn: 'ಕರ್ನಾಟಕ', hi: 'कर्नाटक', mr: 'कर्नाटक', en: 'Karnataka', te: 'కర్ణాటక', pa: 'ਕਰਨਾਟਕ' },
  'Maharashtra': { kn: 'ಮಹಾರಾಷ್ಟ್ರ', hi: 'महाराष्ट्र', mr: 'महाराष्ट्र', en: 'Maharashtra', te: 'మహారాష్ట్ర', pa: 'ਮਹਾਰਾਸ਼ਟਰ' },
};

/**
 * Helper to get localized Mandi center name
 */
export function getLocalizedMandiName(centerName: string | undefined, lang: SupportedLang): string {
  if (!centerName) return lang === 'kn' ? 'APMC ಮಂಡಿ' : lang === 'hi' ? 'APMC मंडी' : lang === 'mr' ? 'APMC बाजार समिती' : 'APMC Center';
  
  // Exact lookup
  if (MANDI_TRANSLATIONS[centerName] && MANDI_TRANSLATIONS[centerName][lang]) {
    return MANDI_TRANSLATIONS[centerName][lang];
  }

  // Keyword-based lookup
  const lower = centerName.toLowerCase();
  for (const [key, map] of Object.entries(MANDI_TRANSLATIONS)) {
    const keyLower = key.toLowerCase();
    if (lower.includes('bengaluru') || lower.includes('yeshwanthpur')) return map[lang] || key;
    if (lower.includes('hubballi') || lower.includes('amaragol')) return map[lang] || key;
    if (lower.includes('mysuru') || lower.includes('bandipalya')) return map[lang] || key;
    if (lower.includes('kalaburagi') || lower.includes('nehru gunj')) return map[lang] || key;
    if (lower.includes('belagavi') || lower.includes('shivaji')) return map[lang] || key;
    if (lower.includes('raichur')) return map[lang] || key;
    if (lower.includes('lasalgaon')) return map[lang] || key;
    if (lower.includes('nashik')) return map[lang] || key;
    if (lower.includes('pune') || lower.includes('gultekdi')) return map[lang] || key;
    if (lower.includes('nagpur') || lower.includes('kalamna')) return map[lang] || key;
    if (lower.includes('ahmednagar')) return map[lang] || key;
  }

  return centerName;
}

/**
 * Helper to get localized Mandi location
 */
export function getLocalizedLocation(location: string | undefined, lang: SupportedLang): string {
  if (!location) return '';
  if (LOCATION_TRANSLATIONS[location] && LOCATION_TRANSLATIONS[location][lang]) {
    return LOCATION_TRANSLATIONS[location][lang];
  }
  return location;
}

/**
 * Helper to get localized District name
 */
export function getLocalizedDistrict(district: string | undefined, lang: SupportedLang): string {
  if (!district) return '';
  if (DISTRICT_TRANSLATIONS[district] && DISTRICT_TRANSLATIONS[district][lang]) {
    return DISTRICT_TRANSLATIONS[district][lang];
  }
  return district;
}

/**
 * Helper to get localized State name
 */
export function getLocalizedState(state: string | undefined, lang: SupportedLang): string {
  if (!state) return '';
  if (STATE_TRANSLATIONS[state] && STATE_TRANSLATIONS[state][lang]) {
    return STATE_TRANSLATIONS[state][lang];
  }
  return state;
}

/**
 * AgriQ National Mandi Procurement Gateway Engine (v7)
 * Hackathon Trump Card Edition — Zero Hardcoding, Full Telecom Signaling
 * Team: Runtime-Terror | SIH 2026 | PS 26032
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const dialingView = document.getElementById('dialing-view');
  const menuView = document.getElementById('menu-view');
  const loadingView = document.getElementById('loading-view');
  const dialedDisplay = document.getElementById('dialed-number');
  const ussdTitle = document.getElementById('ussd-title');
  const ussdBody = document.getElementById('ussd-body');
  const ussdInputDisplay = document.getElementById('ussd-input-display');
  const loadingText = document.getElementById('loading-text');
  const leftSoftLabel = document.getElementById('left-soft-label');
  const rightSoftLabel = document.getElementById('right-soft-label');
  const lcdScreen = document.getElementById('lcd-screen');
  const sessionTimerBadge = document.getElementById('session-timer-badge');
  const carrierIndicator = document.getElementById('carrier-indicator');

  // Keypad & Audio
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const signalingToggleBtn = document.getElementById('signaling-toggle-btn');
  const btnSoftLeft = document.getElementById('btn-soft-left');
  const btnSoftRight = document.getElementById('btn-soft-right');
  const btnOk = document.getElementById('btn-ok');
  const numKeys = document.querySelectorAll('.num-key');
  const langChips = document.querySelectorAll('.lang-chip');

  // SMS Elements
  const smsMessages = document.getElementById('sms-messages');
  const smsCountBadge = document.getElementById('sms-count');
  const smsEmptyState = document.getElementById('sms-empty-state');
  const clearSmsBtn = document.getElementById('clear-sms-btn');
  const farmerPhoneInput = document.getElementById('farmer-phone-input');
  const updatePhoneBtn = document.getElementById('update-phone-btn');

  // Connection Status
  const connectionStatus = document.getElementById('connection-status');
  const pulseDot = document.getElementById('pulse-dot');

  // Action Buttons
  const btnQuickRates = document.getElementById('btn-quick-rates');
  const btnViewReceipt = document.getElementById('btn-view-receipt');
  const btnViewSignaling = document.getElementById('btn-view-signaling');
  const btnQuickReset = document.getElementById('btn-quick-reset');

  // Modals
  const receiptModal = document.getElementById('receipt-modal');
  const closeReceiptBtn = document.getElementById('close-receipt-btn');
  const printReceiptBtn = document.getElementById('print-receipt-btn');
  const receiptTokenVal = document.getElementById('receipt-token-val');
  const receiptPhone = document.getElementById('receipt-phone');
  const receiptCenter = document.getElementById('receipt-center');
  const receiptCrop = document.getElementById('receipt-crop');
  const receiptSlot = document.getElementById('receipt-slot');
  const receiptQty = document.getElementById('receipt-qty');
  const receiptQueue = document.getElementById('receipt-queue');
  const receiptQrSvg = document.getElementById('receipt-qr-svg');
  const receiptBarcodeText = document.getElementById('receipt-barcode-text');
  const receiptPayloadPreview = document.getElementById('receipt-payload-preview');
  const receiptShaHash = document.getElementById('receipt-sha-hash');

  const ratesModal = document.getElementById('rates-modal');
  const closeRatesBtn = document.getElementById('close-rates-btn');

  const signalingModal = document.getElementById('signaling-modal');
  const signalingLog = document.getElementById('signaling-log');
  const clearTraceBtn = document.getElementById('clear-trace-btn');
  const closeSignalingBtn = document.getElementById('close-signaling-btn');

  // Config Drawer
  const configDrawer = document.getElementById('config-drawer');
  const toggleConfigBtn = document.getElementById('toggle-config-btn');
  const closeConfigBtn = document.getElementById('close-config-btn');
  const saveConfigBtn = document.getElementById('save-config-btn');
  const resetConfigBtn = document.getElementById('reset-config-btn');
  const supabaseUrlInput = document.getElementById('supabase-url');
  const supabaseKeyInput = document.getElementById('supabase-key');

  // --- Audio Engine (True Telecom DTMF Frequencies) ---
  let soundEnabled = true;
  let audioCtx = null;

  const DTMF_FREQS = {
    '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
    '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
    '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
    '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
  };

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playDtmfTone(key) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const freqs = DTMF_FREQS[key] || [700, 1200];
      const now = audioCtx.currentTime;
      const dur = 0.08;

      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + dur);
      osc2.stop(now + dur);
    } catch (e) {}
  }

  function playTelecomConnect() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  function playScannerBeep() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(1850, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  function playErrorBuzz() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  function playSmsChime() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.08);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // --- Real Government MSP Rates (per Quintal / 100 kg) ---
  const MSP_RATES = {
    'Ragi': 4290,
    'Tur': 7550,
    'Paddy': 2300,
    'Onion': 1850,
    'Cotton': 7120,
    'Maize': 2225,
    'Wheat': 2425
  };

  // --- State ---
  const state = {
    mode: 'DIALING', // DIALING | MENU | LOADING
    dialBuffer: '*99#',
    inputBuffer: '',
    currentMenu: 'ROOT',
    menuHistory: ['ROOT'],
    lang: 'en',
    sessionTimer: 60,
    timerInterval: null,
    sessionId: 'sess_' + Math.random().toString(36).substr(2, 8),
    tempData: {
      phone: '9845012345',
      crop: 'Ragi',
      centerId: null,
      centerName: '',
      slotId: null,
      slotTime: '',
      quantityKg: 0,
      stage: 'IDLE',
      bookingId: null,
      grade: 'GRADE-A'
    },
    dynamicCenters: [
      // Real ids from mandi_centers, ordered by name to match the farmer app.
      // Replaced before the live fetch lands, but a booking made in that window
      // still has to name a centre that exists.
      { center_id: 'f4d7624e-0bbd-4a66-87d8-f1a29831ba1d', center_name: 'Guntur Cotton Yard' },
      { center_id: 'b6eac27b-642f-4005-a405-b2c2ef8a32fe', center_name: 'Khanna Grain Mandi' },
      { center_id: 'ee50c942-3cd6-4c8c-8db2-ed1aeea527f3', center_name: 'Kota Mandi Samiti' },
      { center_id: 'fe047ee9-9522-4c16-814f-f5f388dfc7f5', center_name: 'Nashik Tomato Market' },
      { center_id: 'affc5449-8ea1-4da3-b1f4-0246eee93595', center_name: 'Test Mandi' }
    ],
    dynamicSlots: [
      { slot_id: 's0000000-0000-0000-0000-000000000001', slot_date: new Date().toISOString().split('T')[0], slot_start_time: '08:00 AM', slot_end_time: '10:00 AM', remaining: 12 },
      { slot_id: 's0000000-0000-0000-0000-000000000002', slot_date: new Date().toISOString().split('T')[0], slot_start_time: '10:00 AM', slot_end_time: '12:00 PM', remaining: 8 },
      { slot_id: 's0000000-0000-0000-0000-000000000003', slot_date: new Date().toISOString().split('T')[0], slot_start_time: '02:00 PM', slot_end_time: '04:00 PM', remaining: 15 }
    ],
    activeToken: null,
    activeBooking: null,
    smsCount: 0,
    statusLookupResult: null,
    rateLookupResult: null
  };

  // --- GSM SS7 / MAP Telecom Protocol Logger ---
  function logSignaling(protocol, dir, payload, isResp = false) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const row = document.createElement('div');
    row.className = 'trace-row';
    row.innerHTML = `
      <span class="trace-time">${timeStr}</span>
      <span class="trace-protocol">${protocol}</span>
      <span class="trace-dir">${dir}</span>
      <span class="trace-payload ${isResp ? 'resp' : ''}">${payload}</span>
    `;

    signalingLog.appendChild(row);
    signalingLog.scrollTop = signalingLog.scrollHeight;
  }

  function initSignalingTraces() {
    signalingLog.innerHTML = '';
    logSignaling('GSM 04.08', 'MS ➔ BTS', 'Radio Resource Established (ARFCN: 68, RSSI: -65 dBm, Carrier: BSNL Karnataka 2G, Circle: KA-LSA-10)');
    logSignaling('GSM MAP', 'VLR ➔ HLR', 'MAP_SEND_AUTHENTICATION_INFO (IMSI: 404-66-8912049102)');
    logSignaling('GSM MAP', 'HLR ➔ MSC', 'MAP_FORWARD_CHECK_SS_INDICATION (NUUP Service *99# Enabled)', true);
    logSignaling('HTTP/2', 'GW ➔ Supabase', 'PostgREST Schema v2 Engine Synced (Health 200 OK)', true);
  }

  // --- Multilingual Dictionaries ---
  const I18N = {
    en: {
      rootTitle: 'AgriQ Karnataka Mandi (*99#)',
      rootBody: '1. Book Mandi Slot\n2. Check Token Status\n3. Mandi Rates & Forecast\n4. Change Language / ಭಾಷೆ',
      selectCropTitle: 'Select Commodity / ಬೆಳೆ:',
      selectCrop: '1. Ragi (ರಾಗಿ / Finger Millet)\n2. Tur / Red Gram (ತೊಗರಿ)\n3. Paddy (ಭತ್ತ / Rice)\n4. Onion (ಈರುಳ್ಳಿ)\n0. Back',
      selectCenterTitle: 'Select Karnataka APMC Yard:',
      selectSlotTitle: 'Available Slots:',
      enterQtyTitle: 'Approx Quantity (kg):',
      enterQty: 'Enter declared weight in kg\n(e.g. type 1450 for 14.5 Q)\n\n0. Back',
      confirmTitle: 'Confirm Mandi Slot:',
      confirmPrompt: '1. Confirm Booking\n2. Cancel',
      successTitle: '✅ Token Confirmed!',
      statusPromptTitle: 'Check Token Status:',
      statusPromptBody: 'Enter Token # or Mobile:\n(e.g. BLR-0198 or 9845012345)\n\n0. Back',
      ratesMenuTitle: 'Select Crop for Forecast:',
      ratesMenu: '1. Ragi (ರಾಗಿ)\n2. Tur / Red Gram (ತೊಗರಿ)\n3. Paddy (ಭತ್ತ)\n4. Onion (ಈರುಳ್ಳಿ)\n0. Back',
      langTitle: 'Select Language / ಭಾಷೆ:',
      langBody: '1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिंदी (Hindi)\n4. मराठी (Marathi)\n0. Back',
      labelToday: 'Today',
      labelTomorrow: 'Tomorrow',
      labelLeft: 'left',
      labelBack: 'Back',
      labelMandi: 'Mandi',
      labelSlot: 'Slot',
      labelToken: 'Token',
      labelSmsSent: 'SMS sent to',
      labelMainMenu: 'Main Menu'
    },
    kn: {
      rootTitle: 'ಅಗ್ರಿ-ಕ್ಯೂ ಕರ್ನಾಟಕ ಮಂಡಿ ಸೇವೆ (*99#)',
      rootBody: '1. ಮಂಡಿ ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ\n2. ಟೋಕನ್ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ\n3. ಮಂಡಿ ದರಗಳು ಮತ್ತು ಮುನ್ಸೂಚನೆ\n4. ಭಾಷೆ ಬದಲಾಯಿಸಿ (Language)',
      selectCropTitle: 'ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
      selectCrop: '1. ರಾಗಿ (Ragi / Finger Millet)\n2. ತೊಗರಿ (Tur / Red Gram)\n3. ಭತ್ತ (Paddy / Rice)\n4. ಈರುಳ್ಳಿ (Onion)\n0. ಹಿಂದೆ',
      selectCenterTitle: 'ಕರ್ನಾಟಕ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ಆರಿಸಿ:',
      selectSlotTitle: 'ಲಭ್ಯವಿರುವ ಸಮಯ:',
      enterQtyTitle: 'ಅಂದಾಜು ಪ್ರಮಾಣ (ಕಿಲೋಗ್ರಾಂ):',
      enterQty: 'ತೂಕ ನಮೂದಿಸಿ (ಉದಾ. 1450)\n\n0. ಹಿಂದೆ',
      confirmTitle: 'ಸ್ಲಾಟ್ ದೃಢೀಕರಣ:',
      confirmPrompt: '1. ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಿ\n2. ರದ್ದುಮಾಡಿ',
      successTitle: '✅ ಟೋಕನ್ ಬುಕ್ ಆಗಿದೆ!',
      statusPromptTitle: 'ಟೋಕನ್ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ:',
      statusPromptBody: 'ಟೋಕನ್ ಸಂಖ್ಯೆ ಅಥವಾ ಮೊಬೈಲ್ ನಮೂದಿಸಿ:\n(ಉದಾ. BLR-0198)\n\n0. ಹಿಂದೆ',
      ratesMenuTitle: 'ದರ ಪರಿಶೀಲನೆಗಾಗಿ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ:',
      ratesMenu: '1. ರಾಗಿ (Ragi)\n2. ತೊಗರಿ (Tur / Red Gram)\n3. ಭತ್ತ (Paddy)\n4. ಈರುಳ್ಳಿ (Onion)\n0. ಹಿಂದೆ',
      langTitle: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ / Select Language:',
      langBody: '1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिंदी (Hindi)\n4. मराठी (Marathi)\n0. ಹಿಂದೆ',
      labelToday: 'ಇಂದು (Today)',
      labelTomorrow: 'ನಾಳೆ (Tomorrow)',
      labelLeft: 'ಉಳಿದಿದೆ',
      labelBack: 'ಹಿಂದೆ',
      labelMandi: 'ಮಂಡಿ',
      labelSlot: 'ಸಮಯ',
      labelToken: 'ಟೋಕನ್',
      labelSmsSent: 'ಗೆ SMS ಕಳುಹಿಸಲಾಗಿದೆ',
      labelMainMenu: 'ಮುಖ್ಯ ಮೆನು'
    },
    hi: {
      rootTitle: 'एग्री-क्यू कर्नाटक मंडी सेवा (*99#)',
      rootBody: '1. स्लॉट/टोकन बुक करें\n2. टोकन स्थिति जांचें\n3. सरकारी MSP भाव व सलाह\n4. भाषा बदलें (Language)',
      selectCropTitle: 'फसल चुनें:',
      selectCrop: '1. रागी / मड़ुआ (Ragi)\n2. तुअर / अरहर (Tur)\n3. धान (Paddy)\n4. प्याज (Onion)\n0. वापस',
      selectCenterTitle: 'कर्नाटक मंडी केंद्र चुनें:',
      selectSlotTitle: 'उपलब्ध समय:',
      enterQtyTitle: 'अनुमानित वजन (किलो):',
      enterQty: 'वजन दर्ज करें (उदा. 1450)\n\n0. वापस',
      confirmTitle: 'स्लॉट पुष्टि:',
      confirmPrompt: '1. स्लॉट पक्का करें\n2. रद्द करें',
      successTitle: '✅ टोकन बुक हो गया!',
      statusPromptTitle: 'टोकन स्थिति जांचें:',
      statusPromptBody: 'टोकन नंबर या मोबाइल दर्ज करें:\n(उदा. BLR-0198)\n\n0. वापस',
      ratesMenuTitle: 'भाव व सलाह हेतु फसल चुनें:',
      ratesMenu: '1. रागी (Ragi)\n2. तुअर (Tur)\n3. धान (Paddy)\n4. प्याज (Onion)\n0. वापस',
      langTitle: 'भाषा चुनें / Select Language:',
      langBody: '1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिंदी (Hindi)\n4. मराठी (Marathi)\n0. वापस',
      labelToday: 'आज (Today)',
      labelTomorrow: 'कल (Tomorrow)',
      labelLeft: 'शेष',
      labelBack: 'वापस',
      labelMandi: 'मंडी केंद्र',
      labelSlot: 'समय',
      labelToken: 'टोकन',
      labelSmsSent: 'SMS भेजा गया',
      labelMainMenu: 'मुख्य मेनू'
    },
    mr: {
      rootTitle: 'अ‍ॅग्री-क्यू कर्नाटक कृषी बाजार (*99#)',
      rootBody: '1. स्लॉट बुक करा\n2. टोकन स्थिती तपासा\n3. हमीभाव (MSP) व अंदाज\n4. भाषा बदला',
      selectCropTitle: 'पीक निवडा:',
      selectCrop: '1. नाचणी / रागी (Ragi)\n2. तूर (Tur)\n3. भात (Paddy)\n4. कांदा (Onion)\n0. मागे',
      selectCenterTitle: 'कर्नाटक बाजार समिती निवडा:',
      selectSlotTitle: 'उपलब्ध वेळ:',
      enterQtyTitle: 'अंदाजे वजन (किलो):',
      enterQty: 'वजन टाका (उदा. 1450)\n\n0. मागे',
      confirmTitle: 'बुकिंग खात्री:',
      confirmPrompt: '1. स्लॉट निश्चित करा\n2. रद्द करा',
      successTitle: '✅ टोकन बुक झाले!',
      statusPromptTitle: 'टोकन स्थिती तपासा:',
      statusPromptBody: 'टोकन क्रमांक किंवा मोबाईल टाका:\n(उदा. BLR-0198)\n\n0. मागे',
      ratesMenuTitle: 'भावासाठी पीक निवडा:',
      ratesMenu: '1. नाचणी / रागी (Ragi)\n2. तूर (Tur)\n3. भात (Paddy)\n4. कांदा (Onion)\n0. मागे',
      langTitle: 'भाषा निवडा / Select Language:',
      langBody: '1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिंदी (Hindi)\n4. मराठी (Marathi)\n0. मागे',
      labelToday: 'आज (Today)',
      labelTomorrow: 'उद्या (Tomorrow)',
      labelLeft: 'शिल्लक',
      labelBack: 'मागे',
      labelMandi: 'बाजार समिती',
      labelSlot: 'वेळ',
      labelToken: 'टोकन',
      labelSmsSent: 'SMS पाठवला',
      labelMainMenu: 'मुख्य मेनू'
    }
  };

  // --- Clock ---
  function updateClock() {
    const clockEl = document.getElementById('screen-clock');
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- Session Timeout (Configurable Telecom Window) ---
  function resetSessionTimer() {
    state.sessionTimer = 60;
    if (sessionTimerBadge) {
      sessionTimerBadge.textContent = `⏱ 60s`;
    }
  }

  function startSessionTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    resetSessionTimer();
    state.timerInterval = setInterval(() => {
      if (state.mode !== 'DIALING') {
        state.sessionTimer--;
        if (sessionTimerBadge) {
          sessionTimerBadge.textContent = `⏱ ${state.sessionTimer}s`;
        }
        if (state.sessionTimer <= 0) {
          handleSessionTimeout();
        }
      }
    }, 1000);
  }

  function handleSessionTimeout() {
    clearInterval(state.timerInterval);
    logSignaling('GSM MAP', 'MSC ➔ HLR', 'MAP_USSD_TIMEOUT_INDICATION (60s inactivity expiry)');
    flashScreenError();
    ussdTitle.textContent = 'Session Timed Out';
    ussdBody.textContent = '60s inactivity limit reached.\nDial *99# to start again.';
    setTimeout(() => {
      exitToDialer();
    }, 2200);
  }

  function flashScreenError() {
    playErrorBuzz();
    lcdScreen.classList.add('shake-error');
    setTimeout(() => {
      lcdScreen.classList.remove('shake-error');
    }, 400);
  }

  // --- Audio Toggle ---
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
    soundToggleBtn.style.color = soundEnabled ? '#10b981' : '#94a3b8';
  });

  // --- Language Selection ---
  function setLanguage(lang) {
    if (!I18N[lang]) return;
    state.lang = lang;
    langChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.lang === lang);
    });
    renderCurrentMenu();
  }

  langChips.forEach(chip => {
    chip.addEventListener('click', () => {
      setLanguage(chip.dataset.lang);
      playDtmfTone('5');
    });
  });

  // --- SVG QR Code Generator (Pure Scalable Vector) ---
  function generateSvgQrCode(dataObj) {
    const jsonStr = typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj);
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      hash = ((hash << 5) - hash) + jsonStr.charCodeAt(i);
      hash |= 0;
    }

    const size = 21; // 21x21 QR Grid
    const moduleSize = 100 / size;
    let svgRects = '';

    function isFinder(r, c) {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= size - 7) return true;
      if (r >= size - 7 && c < 7) return true;
      return false;
    }

    function renderFinderPattern(startR, startC) {
      let out = '';
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBlack = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
          if (isBlack) {
            out += `<rect x="${(startC + c) * moduleSize}" y="${(startR + r) * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#000" />`;
          }
        }
      }
      return out;
    }

    svgRects += renderFinderPattern(0, 0);
    svgRects += renderFinderPattern(0, size - 7);
    svgRects += renderFinderPattern(size - 7, 0);

    let seed = Math.abs(hash);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isFinder(r, c)) {
          if (r === 6 || c === 6) {
            if ((r + c) % 2 === 0) {
              svgRects += `<rect x="${c * moduleSize}" y="${r * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#000" />`;
            }
          } else {
            seed = (seed * 9301 + 49297) % 233280;
            if ((seed / 233280) > 0.52) {
              svgRects += `<rect x="${c * moduleSize}" y="${r * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#000" />`;
            }
          }
        }
      }
    }

    receiptQrSvg.innerHTML = svgRects;
    receiptPayloadPreview.textContent = jsonStr;

    // Cryptographic hash simulation
    const shaHex = Math.abs(hash).toString(16).padStart(8, '0') + Math.abs(hash * 31).toString(16).padStart(8, '0');
    receiptShaHash.textContent = `SHA256: ${shaHex}...apmc`;
  }

  // --- SMS Delivery & Accessibility TTS with Audio Wave Visualizer ---
  function sendFarmerSms(title, messageText, alertType = 'alert-status') {
    if (smsEmptyState) smsEmptyState.style.display = 'none';
    state.smsCount++;
    smsCountBadge.textContent = `${state.smsCount} Message${state.smsCount > 1 ? 's' : ''}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const bubble = document.createElement('div');
    bubble.className = `sms-bubble ${alertType}`;

    bubble.innerHTML = `
      <div class="sms-bubble-top">
        <span class="sms-sender-tag">KA-AGRIQ • ${title}</span>
        <span class="sms-time">${timeStr}</span>
      </div>
      <div class="sms-body-text">${messageText}</div>
      <div class="sms-actions">
        <button class="sms-btn-action btn-speak" title="Listen to SMS (Text to Speech)">🔊 Listen</button>
        <button class="sms-btn-action btn-copy" title="Copy Message">📋 Copy</button>
      </div>
    `;

    const speakBtn = bubble.querySelector('.btn-speak');
    speakBtn.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = messageText.replace(/<[^>]*>?/gm, '');
        const utter = new SpeechSynthesisUtterance(cleanText);
        utter.rate = 0.95;
        const targetLang = state.lang === 'hi' ? 'hi-IN' : (state.lang === 'mr' ? 'mr-IN' : (state.lang === 'kn' ? 'kn-IN' : 'en-IN'));
        utter.lang = targetLang;

        try {
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const matchingVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang.slice(0, 2)));
            if (matchingVoice) utter.voice = matchingVoice;
          }
        } catch (e) {}

        // Animated soundwave
        speakBtn.innerHTML = `🔊 Playing <span class="speaking-wave"><span class="wave-bar"></span><span class="wave-bar"></span><span class="wave-bar"></span><span class="wave-bar"></span></span>`;

        utter.onend = () => {
          speakBtn.innerHTML = '🔊 Listen';
        };
        utter.onerror = () => {
          speakBtn.innerHTML = '🔊 Listen';
        };

        window.speechSynthesis.speak(utter);
      }
    });

    const copyBtn = bubble.querySelector('.btn-copy');
    copyBtn.addEventListener('click', () => {
      const cleanText = messageText.replace(/<[^>]*>?/gm, '');
      navigator.clipboard.writeText(cleanText).then(() => {
        copyBtn.textContent = '✔ Copied';
        setTimeout(() => copyBtn.textContent = '📋 Copy', 1500);
      });
    });

    smsMessages.prepend(bubble);
    playSmsChime();
    logSignaling('SMPP 3.4', 'AgriQ ➔ TRAI-SMSC', `SUBMIT_SM (Dest: +91-${state.tempData.phone}, Sender: KA-AGRIQ, Status: DELIVRD)`, true);
  }

  clearSmsBtn.addEventListener('click', () => {
    smsMessages.innerHTML = `
      <div class="empty-state" id="sms-empty-state">
        <span class="empty-icon">📭</span>
        <p>Inbox is currently empty.</p>
        <small>Dial <b>*99#</b> on the phone to book a mandi procurement slot and receive official SMS alerts.</small>
      </div>
    `;
    state.smsCount = 0;
    smsCountBadge.textContent = '0 Messages';
  });

  // --- USSD State Machine Navigation ---
  function showLoading(text, durationMs = 400) {
    dialingView.classList.add('hidden');
    menuView.classList.add('hidden');
    loadingView.classList.remove('hidden');
    loadingText.textContent = text;
    state.mode = 'LOADING';

    return new Promise(resolve => {
      setTimeout(() => {
        loadingView.classList.add('hidden');
        menuView.classList.remove('hidden');
        state.mode = 'MENU';
        resolve();
      }, durationMs);
    });
  }

  function enterMenu(menuKey) {
    state.menuHistory.push(menuKey);
    state.currentMenu = menuKey;
    state.inputBuffer = '';
    ussdInputDisplay.textContent = '';
    resetSessionTimer();
    renderCurrentMenu();
  }

  function goBackMenu() {
    playDtmfTone('0');
    logSignaling('GSM MAP', 'MS ➔ VLR', 'MAP_USSD_REQUEST (Back Navigation: "0")');
    if (state.menuHistory.length > 1) {
      state.menuHistory.pop();
      state.currentMenu = state.menuHistory[state.menuHistory.length - 1];
      state.inputBuffer = '';
      ussdInputDisplay.textContent = '';
      resetSessionTimer();
      renderCurrentMenu();
    } else {
      exitToDialer();
    }
  }

  function exitToDialer() {
    logSignaling('GSM 04.08', 'MS ➔ BTS', 'Channel Release (DISCONNECT / END Pressed)');
    state.mode = 'DIALING';
    state.currentMenu = 'ROOT';
    state.menuHistory = ['ROOT'];
    state.inputBuffer = '';
    menuView.classList.add('hidden');
    loadingView.classList.add('hidden');
    dialingView.classList.remove('hidden');
    leftSoftLabel.textContent = 'Dial';
    rightSoftLabel.textContent = 'Clear';
    if (state.timerInterval) clearInterval(state.timerInterval);
    if (sessionTimerBadge) sessionTimerBadge.textContent = '⏱ 60s';
  }

  function getLocalizedCenterName(name, lang) {
    if (!name) return name;
    const map = {
      kn: {
        'Bengaluru APMC (Yeshwanthpur Main Yard)': 'ಬೆಂಗಳೂರು ಯಶವಂತಪುರ ಎಪಿಎಂಸಿ (Bengaluru APMC)',
        'Hubballi APMC (Amaragol Market Yard)': 'ಹುಬ್ಬಳ್ಳಿ ಅಮರಗೋಳ ಎಪಿಎಂಸಿ (Hubballi APMC)',
        'Mysuru APMC (Bandipalya Yard)': 'ಮೈಸೂರು ಬಂಡಿಪಾಳ್ಯ ಎಪಿಎಂಸಿ (Mysuru APMC)',
        'Kalaburagi APMC (Nehru Gunj Yard)': 'ಕಲಬುರಗಿ ನೆಹರು ಗಂಜ್ ಎಪಿಎಂಸಿ (Kalaburagi APMC)'
      },
      hi: {
        'Bengaluru APMC (Yeshwanthpur Main Yard)': 'बेंगलुरु यशवंतपुर एपीएमसी (Bengaluru APMC)',
        'Hubballi APMC (Amaragol Market Yard)': 'हुबली अमरागोळ एपीएमसी (Hubballi APMC)',
        'Mysuru APMC (Bandipalya Yard)': 'मैसूरु बांदीपाळ्य एपीएमसी (Mysuru APMC)',
        'Kalaburagi APMC (Nehru Gunj Yard)': 'कलबुर्गी नेहरू गंज एपीएमसी (Kalaburagi APMC)'
      },
      mr: {
        'Bengaluru APMC (Yeshwanthpur Main Yard)': 'बंगळुरू यशवंतपूर एपीएमसी (Bengaluru APMC)',
        'Hubballi APMC (Amaragol Market Yard)': 'हुबळी अमरगोळ एपीएमसी (Hubballi APMC)',
        'Mysuru APMC (Bandipalya Yard)': 'म्हैसूर बांदीपाळ्या एपीएमसी (Mysuru APMC)',
        'Kalaburagi APMC (Nehru Gunj Yard)': 'कलबुर्गी नेहरू गंज एपीएमसी (Kalaburagi APMC)'
      }
    };
    return (map[lang] && map[lang][name]) || name;
  }

  function getLocalizedCropName(crop, lang) {
    if (!crop) return crop;
    const map = {
      kn: {
        'Ragi': 'ರಾಗಿ (Ragi / Finger Millet)',
        'Tur': 'ತೊಗರಿ (Tur / Red Gram)',
        'Paddy': 'ಭತ್ತ (Paddy / Rice)',
        'Onion': 'ಈರುಳ್ಳಿ (Onion)',
        'Cotton': 'ಹತ್ತಿ (Cotton)',
        'Maize': 'ಮೆಕ್ಕೆಜೋಳ (Maize)',
        'Wheat': 'ಗೋಧಿ (Wheat)'
      },
      hi: {
        'Ragi': 'रागी / मड़ुआ (Ragi)',
        'Tur': 'तुअर / अरहर (Tur)',
        'Paddy': 'धान (Paddy)',
        'Onion': 'प्याज (Onion)',
        'Cotton': 'कपास (Cotton)',
        'Maize': 'मक्का (Maize)',
        'Wheat': 'गेहूं (Wheat)'
      },
      mr: {
        'Ragi': 'नाचणी / रागी (Ragi)',
        'Tur': 'तूर (Tur)',
        'Paddy': 'भात (Paddy)',
        'Onion': 'कांदा (Onion)',
        'Cotton': 'ಕಾಪೂಸ (Cotton)',
        'Maize': 'ಮಕಾ (Maize)',
        'Wheat': 'ಗಹೂ (Wheat)'
      }
    };
    return (map[lang] && map[lang][crop]) || crop;
  }

  function renderCurrentMenu() {
    const dict = I18N[state.lang] || I18N.en;
    leftSoftLabel.textContent = 'Send';
    rightSoftLabel.textContent = 'Back';

    switch (state.currentMenu) {
      case 'ROOT':
        ussdTitle.textContent = dict.rootTitle;
        ussdBody.textContent = dict.rootBody;
        break;

      case 'BOOK_CROP':
        ussdTitle.textContent = dict.selectCropTitle;
        ussdBody.textContent = dict.selectCrop;
        break;

      case 'BOOK_CENTER':
        ussdTitle.textContent = dict.selectCenterTitle;
        let centerListText = '';
        state.dynamicCenters.forEach((c, idx) => {
          const locName = getLocalizedCenterName(c.center_name, state.lang);
          centerListText += `${idx + 1}. ${locName}\n`;
        });
        centerListText += `0. ${dict.labelBack || 'Back'}`;
        ussdBody.textContent = centerListText;
        break;

      case 'BOOK_SLOT':
        ussdTitle.textContent = dict.selectSlotTitle;
        let slotListText = '';
        const todayStr = dict.labelToday || 'Today';
        const tomorrowStr = dict.labelTomorrow || 'Tomorrow';
        const leftStr = dict.labelLeft || 'left';
        const backStr = dict.labelBack || 'Back';
        state.dynamicSlots.forEach((s, idx) => {
          const dateLabel = s.slot_date === new Date().toISOString().split('T')[0] ? todayStr : tomorrowStr;
          slotListText += `${idx + 1}. ${dateLabel} ${s.slot_start_time} (${s.remaining} ${leftStr})\n`;
        });
        slotListText += `0. ${backStr}`;
        ussdBody.textContent = slotListText;
        break;

      case 'BOOK_QTY':
        ussdTitle.textContent = dict.enterQtyTitle;
        ussdBody.textContent = dict.enterQty;
        break;

      case 'BOOK_CONFIRM':
        ussdTitle.textContent = dict.confirmTitle;
        const locCrop = getLocalizedCropName(state.tempData.crop, state.lang);
        ussdBody.textContent = `${locCrop} (${state.tempData.quantityKg} kg)\n` +
          `${dict.labelMandi || 'Mandi'}: ${state.tempData.centerName}\n` +
          `${dict.labelSlot || 'Slot'}: ${state.tempData.slotTime}\n\n` +
          dict.confirmPrompt;
        break;

      case 'BOOK_SUCCESS':
        ussdTitle.textContent = dict.successTitle;
        ussdBody.textContent = `${dict.labelToken || 'Token'}: ${state.activeToken}\n` +
          `${dict.labelMandi || 'Center'}: ${state.tempData.centerName}\n` +
          `${dict.labelSlot || 'Slot'}: ${state.tempData.slotTime}\n\n` +
          `${state.tempData.phone} ${dict.labelSmsSent || 'SMS sent to'}.\n\n0. ${dict.labelMainMenu || 'Main Menu'}`;
        break;

      case 'STATUS_PROMPT':
        ussdTitle.textContent = dict.statusPromptTitle;
        ussdBody.textContent = dict.statusPromptBody;
        break;

      case 'STATUS_RESULT':
        ussdTitle.textContent = 'Token Status Live:';
        ussdBody.textContent = state.statusLookupResult || 'No record found.\n\n0. Back';
        break;

      case 'RATES_MENU':
        ussdTitle.textContent = dict.ratesMenuTitle;
        ussdBody.textContent = dict.ratesMenu;
        break;

      case 'RATES_DETAIL':
        ussdTitle.textContent = 'APMC Price & AI Forecast:';
        ussdBody.textContent = state.rateLookupResult || 'Rates unavailable.\n\n0. Back';
        break;

      case 'LANG_MENU':
        ussdTitle.textContent = dict.langTitle;
        ussdBody.textContent = dict.langBody;
        break;

      default:
        exitToDialer();
    }
  }

  // --- USSD Input Submission Engine ---
  async function handleUssdSubmit() {
    const input = state.inputBuffer.trim();
    state.inputBuffer = '';
    ussdInputDisplay.textContent = '';
    resetSessionTimer();

    logSignaling('GSM MAP', 'MS ➔ VLR', `MAP_USSD_REQUEST (Input: "${input}", Menu: ${state.currentMenu})`);

    // Universal Back check
    if (input === '0') {
      if (state.currentMenu === 'BOOK_SUCCESS') {
        state.menuHistory = ['ROOT'];
        state.currentMenu = 'ROOT';
        state.inputBuffer = '';
        ussdInputDisplay.textContent = '';
        resetSessionTimer();
        renderCurrentMenu();
        return;
      }
      goBackMenu();
      return;
    }

    switch (state.currentMenu) {
      case 'ROOT':
        if (input === '1') {
          await showLoading('Loading Mandi Centers...');
          enterMenu('BOOK_CROP');
        } else if (input === '2') {
          enterMenu('STATUS_PROMPT');
        } else if (input === '3') {
          enterMenu('RATES_MENU');
        } else if (input === '4') {
          enterMenu('LANG_MENU');
        } else {
          flashScreenError();
        }
        break;

      case 'BOOK_CROP':
        const crops = { '1': 'Ragi', '2': 'Tur', '3': 'Paddy', '4': 'Onion' };
        if (crops[input]) {
          state.tempData.crop = crops[input];
          await showLoading('Fetching APMC Centers...');
          if (window.agriqBackend) {
            const fetched = await window.agriqBackend.getMandiCenters();
            if (fetched && fetched.length > 0) state.dynamicCenters = fetched;
          }
          logSignaling('PostgREST', 'AgriQ ➔ DB', 'SELECT center_id, center_name FROM mandi_centers', true);
          enterMenu('BOOK_CENTER');
        } else {
          flashScreenError();
        }
        break;

      case 'BOOK_CENTER':
        const centerIdx = parseInt(input, 10) - 1;
        if (state.dynamicCenters && state.dynamicCenters[centerIdx]) {
          const selected = state.dynamicCenters[centerIdx];
          state.tempData.centerId = selected.center_id;
          state.tempData.centerName = selected.center_name;
          await showLoading('Checking Slot Capacity...');
          if (window.agriqBackend) {
            const fetchedSlots = await window.agriqBackend.getAvailableSlots(selected.center_id);
            if (fetchedSlots && fetchedSlots.length > 0) state.dynamicSlots = fetchedSlots;
          }
          logSignaling('PostgREST', 'AgriQ ➔ DB', `SELECT * FROM slots_available WHERE center_id = '${selected.center_id}'`, true);
          enterMenu('BOOK_SLOT');
        } else {
          flashScreenError();
        }
        break;

      case 'BOOK_SLOT':
        const slotIdx = parseInt(input, 10) - 1;
        if (state.dynamicSlots && state.dynamicSlots[slotIdx]) {
          const slot = state.dynamicSlots[slotIdx];
          state.tempData.slotId = slot.slot_id;
          state.tempData.slotTime = `${slot.slot_date} ${slot.slot_start_time}`;
          enterMenu('BOOK_QTY');
        } else {
          flashScreenError();
        }
        break;

      case 'BOOK_QTY':
        const qty = parseInt(input, 10);
        if (!isNaN(qty) && qty > 0) {
          state.tempData.quantityKg = qty;
          enterMenu('BOOK_CONFIRM');
        } else {
          flashScreenError();
        }
        break;

      case 'BOOK_CONFIRM':
        if (input === '1') {
          await showLoading('Allocating Token & Registering Slot...');
          await finalizeBookingToken();
        } else if (input === '2') {
          goBackMenu();
        } else {
          flashScreenError();
        }
        break;

      case 'STATUS_PROMPT':
        if (input.length > 0) {
          await showLoading('Querying Mandi Gate DB...');
          let statusData = null;
          if (window.agriqBackend) {
            statusData = await window.agriqBackend.getBookingStatus(input);
          }

          if (statusData) {
            const cropName = statusData.crop_type || state.tempData.crop || 'Ragi';
            const netKg = statusData.crop_quantity_kg || 1400;
            const qtl = (netKg / 100).toFixed(2);
            // center_name and live_position come from the RPC, so the caller
            // hears their real centre and their real place in the queue.
            // live_position is recomputed on each lookup; queue_position is
            // stamped once at booking time and never decrements, so it is not
            // the number to read out to someone who is waiting.
            const posLine = statusData.live_position
              ? `Queue Position: #${statusData.live_position}\n` : '';
            state.statusLookupResult = `Token: ${statusData.token_number || input}\n` +
              `Status: ${statusData.status || 'BOOKED'}\n` +
              `Commodity: ${cropName} (${qtl} Q)\n` +
              posLine +
              `Center: ${statusData.center_name || state.tempData.centerName || 'APMC'}\n\n0. Back`;
          } else if (state.activeToken && (state.activeToken.toLowerCase().includes(input.toLowerCase()) || input.includes(state.tempData.phone))) {
            const qtl = (state.tempData.quantityKg / 100).toFixed(2);
            state.statusLookupResult = `Token: ${state.activeToken}\n` +
              `Status: BOOKED / ACTIVE\n` +
              `Commodity: ${state.tempData.crop} (${qtl} Q)\n` +
              `Slot: ${state.tempData.slotTime}\n` +
              `Center: ${state.tempData.centerName}\n\n0. Back`;
          } else {
            state.statusLookupResult = `No active record found for "${input}".\nPlease verify token or mobile.\n\n0. Back`;
          }
          enterMenu('STATUS_RESULT');
        } else {
          flashScreenError();
        }
        break;

      case 'RATES_MENU':
        const cropMap = { '1': 'ragi', '2': 'tur', '3': 'paddy', '4': 'onion' };
        if (cropMap[input]) {
          await showLoading('Fetching CACP & AI Forecast...');
          const cropKey = cropMap[input];
          let rateData = null;
          if (window.agriqBackend) {
            rateData = await window.agriqBackend.getMandiRates(cropKey);
          }

          if (rateData) {
            const cName = cropKey.toUpperCase();
            state.rateLookupResult = `Crop: ${cName}\n` +
              `MSP / Spot: ${rateData.rate}\n` +
              `AI 7-Day Trend: ${rateData.forecast}\n` +
              `Best Intake: ${rateData.bestDay}\n` +
              `Note: ${rateData.reason}\n\n0. Back`;
          } else {
            state.rateLookupResult = `Rates updated today.\nGovt MSP active for all Karnataka APMCs.\n\n0. Back`;
          }
          enterMenu('RATES_DETAIL');
        } else {
          flashScreenError();
        }
        break;

      case 'LANG_MENU':
        const langMap = { '1': 'en', '2': 'kn', '3': 'hi', '4': 'mr' };
        if (langMap[input]) {
          setLanguage(langMap[input]);
          enterMenu('ROOT');
        } else {
          flashScreenError();
        }
        break;

      default:
        exitToDialer();
    }
  }

  // --- Finalize Token Creation (Dynamic Database Backend) ---
  async function finalizeBookingToken(customToken = null) {
    const callerPhone = farmerPhoneInput.value.trim() || '9845012345';
    state.tempData.phone = callerPhone;

    logSignaling('PostgREST', 'AgriQ ➔ RPC', `CALL create_ussd_booking (Phone: ${callerPhone}, Center: ${state.tempData.centerId || 'c0000000-0000-0000-0000-000000000001'}, Qty: ${state.tempData.quantityKg}kg)`);

    let backendResult = null;
    if (window.agriqBackend) {
      backendResult = await window.agriqBackend.createBooking({
        phone: callerPhone,
        centerId: state.tempData.centerId,
        slotId: state.tempData.slotId,
        cropQuantityKg: state.tempData.quantityKg
      });
    }

    // On a live project a refused booking used to fall through and still print
    // "Token Confirmed" with a locally generated number - a token the farmer
    // would read out at the gate that exists in no database. Say so instead,
    // and say WHY: the database gives a specific reason and a generic message
    // throws it away, leaving the caller with nothing to act on.
    if (window.agriqBackend && window.agriqBackend.isLive && !backendResult) {
      const reason = window.agriqBackend.lastBookingError || 'That slot may be full or no longer available.';
      state.statusLookupResult =
        'Booking not completed.' + '\n\n' +
        reason + '\n\n' +
        'Try another slot, or a different\nmobile number.' + '\n\n0. Back';
      enterMenu('STATUS_RESULT');
      return;
    }

    const prefix = state.tempData.centerId ? state.tempData.centerId.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'BLR' : 'BLR';
    const tokenNumber = customToken || (backendResult ? backendResult.token_number : `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
    const bookingId = backendResult ? backendResult.booking_id : ('b' + Math.floor(1000000 + Math.random() * 9000000) + '-0000-0000-0000-000000000001');

    state.activeToken = tokenNumber;
    state.tempData.bookingId = bookingId;

    if (!window.agriqBackend && state.dynamicSlots && state.tempData.slotId) {
      const targetSlot = state.dynamicSlots.find(s => s.slot_id === state.tempData.slotId);
      if (targetSlot && targetSlot.remaining > 0) {
        targetSlot.remaining--;
      }
    }
    state.tempData.stage = 'BOOKED';

    logSignaling('GSM MAP', 'Gateway ➔ HLR', `MAP_UNSTRUCTURED_SS_RESPONSE (Allocated Token: ${tokenNumber})`, true);

    btnViewReceipt.disabled = false;

    receiptTokenVal.textContent = tokenNumber;
    receiptPhone.textContent = `+91-${callerPhone}`;
    receiptCenter.textContent = state.tempData.centerName || 'Bengaluru APMC (Yeshwanthpur Main Yard)';
    receiptCrop.textContent = `${state.tempData.crop} (Grade-A)`;
    receiptSlot.textContent = state.tempData.slotTime;
    const qtl = (state.tempData.quantityKg / 100).toFixed(2);
    receiptQty.textContent = `${state.tempData.quantityKg.toLocaleString()} kg (${qtl} Q)`;
    receiptBarcodeText.textContent = `*${tokenNumber}-2026*`;

    const qrPayload = {
      type: 'AGRIQ_TOKEN',
      booking_id: bookingId,
      token_number: tokenNumber,
      token: tokenNumber,
      phone_number: callerPhone,
      center_id: state.tempData.centerId || 'c0000000-0000-0000-0000-000000000001',
      slot_date: new Date().toISOString().split('T')[0]
    };
    generateSvgQrCode(qrPayload);

    if (state.lang === 'kn') {
      sendFarmerSms(
        'ಟೋಕನ್ ದೃಢೀಕರಣ',
        `ಕರ್ನಾಟಕ ಸರ್ಕಾರ / KSAMB APMC: ಟೋಕನ್ <strong>${tokenNumber}</strong> ದೃಢಪಟ್ಟಿದೆ.\nಬೆಳೆ: ${state.tempData.crop} (${qtl} ಕ್ವಿಂಟಾಲ್)\nಕೇಂದ್ರ: ${state.tempData.centerName || 'ಬೆಂಗಳೂರು ಯಶವಂತಪುರ ಎಪಿಎಂಸಿ'}\nಸಮಯ: ${state.tempData.slotTime}\nಗೇಟ್ ಪಾಸ್: agriq.karnataka.gov.in/t/${tokenNumber}\nಸಮಯಕ್ಕಿಂತ 15 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ಬನ್ನಿ. ಜೈ ಕಿಸಾನ್!`,
        'alert-confirm'
      );
    } else if (state.lang === 'hi') {
      sendFarmerSms(
        'टोकन पुष्टि',
        `कर्नाटक सरकार / KSAMB APMC: टोकन <strong>${tokenNumber}</strong> पक्का हुआ।\nफसल: ${state.tempData.crop} (${qtl} क्विंटल)\nकेंद्र: ${state.tempData.centerName || 'बेंगलुरु यशवंतपुर एपीएमसी'}\nसमय: ${state.tempData.slotTime}\nगेट पास: agriq.karnataka.gov.in/t/${tokenNumber}\nसमय से 15 मिनट पहले पहुंचें। जय किसान!`,
        'alert-confirm'
      );
    } else if (state.lang === 'mr') {
      sendFarmerSms(
        'टोकन खात्री',
        `ಕರ್ನಾಟಕ ಸರ್ಕಾರ / KSAMB APMC: टोकन <strong>${tokenNumber}</strong> निश्चित झाले.\nपीक: ${state.tempData.crop} (${qtl} क्विंटल)\nबाजार: ${state.tempData.centerName || 'बंगळुरू यशवंतपूर एपीएमसी'}\nवेळ: ${state.tempData.slotTime}\nगेट पास: agriq.karnataka.gov.in/t/${tokenNumber}\nजय किसान!`,
        'alert-confirm'
      );
    } else {
      sendFarmerSms(
        'Token Confirmed',
        `Govt of Karnataka / KSAMB APMC: Token <strong>${tokenNumber}</strong> confirmed.\nCrop: ${state.tempData.crop} (${qtl} Q)\nCenter: ${state.tempData.centerName || 'Bengaluru APMC (Yeshwanthpur)'}\nSlot: ${state.tempData.slotTime}\nGate Pass: agriq.karnataka.gov.in/t/${tokenNumber}\nArrive 15 mins prior. Jai Kisan! (ಜೈ ರೈತ)`,
        'alert-confirm'
      );
    }

    enterMenu('BOOK_SUCCESS');
  }

  // --- Keypad Event Listeners ---
  numKeys.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      handleKeyPress(key);
    });
  });

  btnSoftLeft.addEventListener('click', () => {
    handleCallOrSend();
  });

  btnOk.addEventListener('click', () => {
    handleCallOrSend();
  });

  btnSoftRight.addEventListener('click', () => {
    handleEndOrBack();
  });

  function handleKeyPress(key) {
    playDtmfTone(key);
    resetSessionTimer();

    if (state.mode === 'DIALING') {
      if (state.dialBuffer.length < 15) {
        state.dialBuffer += key;
        dialedDisplay.textContent = state.dialBuffer;
      }
    } else if (state.mode === 'MENU') {
      if (state.inputBuffer.length < 10) {
        state.inputBuffer += key;
        ussdInputDisplay.textContent = state.inputBuffer;
      }
    }
  }

  async function handleCallOrSend() {
    playTelecomConnect();
    if (state.mode === 'DIALING') {
      const dialed = state.dialBuffer.trim();
      if (dialed === '*99#' || dialed === '*123#' || dialed.startsWith('*')) {
        startSessionTimer();
        logSignaling('GSM 04.08', 'MS ➔ MSC', `CM_SERVICE_REQUEST (Shortcode: ${dialed}, Service: USSD)`);
        await showLoading('Dialing Mandi Gateway (*99#)...', 500);
        state.currentMenu = 'ROOT';
        state.menuHistory = ['ROOT'];
        renderCurrentMenu();
      } else {
        flashScreenError();
      }
    } else if (state.mode === 'MENU') {
      if (state.inputBuffer.length > 0) {
        handleUssdSubmit();
      } else {
        flashScreenError();
      }
    }
  }

  function handleEndOrBack() {
    if (state.mode === 'DIALING') {
      if (state.dialBuffer.length > 0) {
        state.dialBuffer = state.dialBuffer.slice(0, -1);
        dialedDisplay.textContent = state.dialBuffer || '_';
        playDtmfTone('0');
      }
    } else if (state.mode === 'MENU') {
      if (state.inputBuffer.length > 0) {
        state.inputBuffer = state.inputBuffer.slice(0, -1);
        ussdInputDisplay.textContent = state.inputBuffer;
        playDtmfTone('0');
      } else {
        if (state.currentMenu === 'BOOK_SUCCESS') {
          state.menuHistory = ['ROOT'];
          state.currentMenu = 'ROOT';
          state.inputBuffer = '';
          ussdInputDisplay.textContent = '';
          resetSessionTimer();
          renderCurrentMenu();
          return;
        }
        goBackMenu();
      }
    }
  }

  // --- Physical Keyboard Binding ---
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    const key = e.key;

    const highlightKey = (selector) => {
      const el = document.querySelector(selector);
      if (el) {
        el.classList.add('active-press');
        setTimeout(() => el.classList.remove('active-press'), 120);
      }
    };

    if (/^[0-9]$/.test(key) || key === '*' || key === '#') {
      e.preventDefault();
      highlightKey(`.num-key[data-key="${key}"]`);
      handleKeyPress(key);
    } else if (key === 'Enter' || key === 'c' || key === 'C') {
      e.preventDefault();
      highlightKey('#btn-soft-left');
      handleCallOrSend();
    } else if (key === 'Backspace') {
      e.preventDefault();
      handleEndOrBack();
    } else if (key === 'Escape' || key === 'e' || key === 'E') {
      e.preventDefault();
      highlightKey('#btn-soft-right');
      exitToDialer();
    }
  });

  // --- Farmer Mobile Update ---
  updatePhoneBtn.addEventListener('click', () => {
    const val = farmerPhoneInput.value.trim();
    if (/^\d{10}$/.test(val)) {
      state.tempData.phone = val;
      playTelecomConnect();
      logSignaling('HLR', 'VLR ➔ HLR', `MAP_UPDATE_LOCATION (MSISDN: +91-${val}, Auth: Aadhaar OK)`, true);
      sendFarmerSms(
        'System Update',
        `Aadhaar Profile linked successfully with mobile +91-${val}. All procurement tokens and PFMS DBT updates will be routed to this number.`,
        'alert-status'
      );
    } else {
      alert('Please enter a valid 10-digit mobile number.');
    }
  });

  // --- Toolbar & Modal Handlers ---
  btnQuickRates.addEventListener('click', () => {
    ratesModal.classList.remove('hidden');
  });

  closeRatesBtn.addEventListener('click', () => {
    ratesModal.classList.add('hidden');
  });

  signalingToggleBtn.addEventListener('click', () => {
    signalingModal.classList.remove('hidden');
  });

  btnViewSignaling.addEventListener('click', () => {
    signalingModal.classList.remove('hidden');
  });

  closeSignalingBtn.addEventListener('click', () => {
    signalingModal.classList.add('hidden');
  });

  clearTraceBtn.addEventListener('click', () => {
    initSignalingTraces();
  });

  btnViewReceipt.addEventListener('click', () => {
    if (state.activeToken) {
      receiptModal.classList.remove('hidden');
    }
  });

  closeReceiptBtn.addEventListener('click', () => {
    receiptModal.classList.add('hidden');
  });

  printReceiptBtn.addEventListener('click', () => {
    window.print();
  });

  btnQuickReset.addEventListener('click', () => {
    exitToDialer();
    state.activeToken = null;
    state.tempData.stage = 'IDLE';
    btnViewReceipt.disabled = true;
    initSignalingTraces();
  });

  // --- Database Drawer Configuration ---
  toggleConfigBtn.addEventListener('click', () => {
    configDrawer.classList.toggle('hidden');
  });

  closeConfigBtn.addEventListener('click', () => {
    configDrawer.classList.add('hidden');
  });

  saveConfigBtn.addEventListener('click', () => {
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();
    if (window.agriqBackend && url && key) {
      const ok = window.agriqBackend.setCredentials(url, key);
      if (ok) {
        connectionStatus.textContent = 'Supabase PostgreSQL (Connected)';
        pulseDot.style.backgroundColor = '#10b981';
        configDrawer.classList.add('hidden');
        logSignaling('PostgreSQL', 'AgriQ ➔ Supabase', `CONNECTED to ${url} (Realtime Subscriptions Active)`, true);
      }
    }
  });

  resetConfigBtn.addEventListener('click', () => {
    if (window.agriqBackend) {
      window.agriqBackend.clearCredentials();
      connectionStatus.textContent = 'Local Isolated Mode (Mock Sync)';
      pulseDot.style.backgroundColor = '#38bdf8';
      configDrawer.classList.add('hidden');
    }
  });

  // --- Initialization ---
  async function init() {
    if (window.agriqBackend) {
      const centers = await window.agriqBackend.getMandiCenters();
      if (centers && centers.length > 0) state.dynamicCenters = centers;
    }
    initSignalingTraces();
    console.log('[AgriQ] USSD Gateway Trump Card Engine (v7) initialized.');
  }

  init();
})();

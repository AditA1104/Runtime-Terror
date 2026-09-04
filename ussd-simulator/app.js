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

  // Officer Operations Elements
  const demoTokenDisplay = document.getElementById('demo-token-display');
  const demoCropDisplay = document.getElementById('demo-crop-display');
  const demoStatusDisplay = document.getElementById('demo-status-display');
  const connectionStatus = document.getElementById('connection-status');
  const pulseDot = document.getElementById('pulse-dot');
  const mandiQueueTbody = document.getElementById('mandi-queue-tbody');
  const queueSearchInput = document.getElementById('queue-search-input');
  const mandiYardLocation = document.getElementById('mandi-yard-location');

  // KPI Elements
  const kpiQueueCount = document.getElementById('kpi-queue-count');
  const kpiProduceWeight = document.getElementById('kpi-produce-weight');
  const kpiDbtTotal = document.getElementById('kpi-dbt-total');

  // Checkpoint Form Fields
  const inputGateNo = document.getElementById('input-gate-no');
  const btnSimCheckin = document.getElementById('btn-sim-checkin');
  const btnScanQr = document.getElementById('btn-scan-qr');
  const scannerView = document.getElementById('scanner-view');
  const scannerStatusText = document.getElementById('scanner-status-text');

  const inputGrossWeight = document.getElementById('input-gross-weight');
  const inputTareWeight = document.getElementById('input-tare-weight');
  const calcNetWeight = document.getElementById('calc-net-weight');
  const btnSimWeigh = document.getElementById('btn-sim-weigh');

  const selectQualityGrade = document.getElementById('select-quality-grade');
  const inputMoisture = document.getElementById('input-moisture');
  const moistureStatus = document.getElementById('moisture-status');
  const btnSimQuality = document.getElementById('btn-sim-quality');

  const dbtRateVal = document.getElementById('dbt-rate-val');
  const dbtAmountVal = document.getElementById('dbt-amount-val');
  const dbtBankText = document.getElementById('dbt-bank-text');
  const btnSimPayment = document.getElementById('btn-sim-payment');

  const btnSimComplete = document.getElementById('btn-sim-complete');

  // Stepper Elements
  const stepNodes = {
    booked: document.getElementById('step-node-booked'),
    checkin: document.getElementById('step-node-checkin'),
    weigh: document.getElementById('step-node-weigh'),
    quality: document.getElementById('step-node-quality'),
    payment: document.getElementById('step-node-payment'),
    complete: document.getElementById('step-node-complete')
  };
  const stepLines = [
    document.getElementById('step-line-1'),
    document.getElementById('step-line-2'),
    document.getElementById('step-line-3'),
    document.getElementById('step-line-4'),
    document.getElementById('step-line-5')
  ];

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
    'Wheat': 2425,
    'Paddy': 2300,
    'Onion': 1850,
    'Cotton': 7120,
    'Mustard': 5650,
    'Soybean': 4892
  };

  const GRADE_MULTIPLIERS = {
    'GRADE-A': 1.0,
    'GRADE-B': 0.95,
    'GRADE-C': 0.85
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
      phone: '9876543210',
      crop: 'Wheat',
      centerId: null,
      centerName: '',
      slotId: null,
      slotTime: '',
      quantityKg: 0,
      stage: 'IDLE',
      bookingId: null,
      grade: 'GRADE-A'
    },
    dynamicCenters: [],
    dynamicSlots: [],
    activeToken: null,
    activeBooking: null,
    smsCount: 0,
    queueList: [
      { token: 'NSK-0198', phone: '9822019283', crop: 'Wheat', slot: '08:00 AM', netWeight: 1850, status: 'WEIGHED', grade: 'GRADE-A', bookingId: 'bk_0198' },
      { token: 'NSK-0215', phone: '9765432190', crop: 'Onion', slot: '08:30 AM', netWeight: 2200, status: 'CHECKED_IN', grade: 'GRADE-B', bookingId: 'bk_0215' },
      { token: 'NSK-0220', phone: '9921873461', crop: 'Wheat', slot: '09:00 AM', netWeight: 1400, status: 'BOOKED', grade: null, bookingId: 'bk_0220' }
    ]
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
    logSignaling('GSM 04.08', 'MS ➔ BTS', 'Radio Resource Established (ARFCN: 68, RSSI: -68 dBm, Carrier: BSNL 2G)');
    logSignaling('GSM MAP', 'VLR ➔ HLR', 'MAP_SEND_AUTHENTICATION_INFO (IMSI: 404-66-8912049102)');
    logSignaling('GSM MAP', 'HLR ➔ MSC', 'MAP_FORWARD_CHECK_SS_INDICATION (NUUP Service *99# Enabled)', true);
    logSignaling('HTTP/2', 'GW ➔ Supabase', 'PostgREST Schema v2 Engine Synced (Health 200 OK)', true);
  }

  // --- Dynamic Mandi KPIs Calculator ---
  function updateMandiKpis() {
    // Queue Count
    const totalQueued = state.queueList.length;
    kpiQueueCount.textContent = `${totalQueued} Token${totalQueued !== 1 ? 's' : ''}`;

    // Produce Weight (sum of net weights)
    let totalKg = state.queueList.reduce((acc, cur) => acc + (cur.netWeight || 0), 0);
    const totalQ = (totalKg / 100).toFixed(2);
    kpiProduceWeight.textContent = `${totalQ} Q`;

    // DBT Total Disbursed (based on weighed / paid tokens)
    let totalDbt = 0;
    state.queueList.forEach(item => {
      const rate = MSP_RATES[item.crop] || 2425;
      const mult = GRADE_MULTIPLIERS[item.grade || 'GRADE-A'] || 1.0;
      totalDbt += (item.netWeight / 100) * (rate * mult);
    });

    kpiDbtTotal.textContent = `₹${Math.round(totalDbt).toLocaleString('en-IN')}`;
  }

  // --- Multilingual Dictionaries ---
  const I18N = {
    en: {
      rootTitle: 'AgriQ Mandi Seva (*99#)',
      rootBody: '1. Book Mandi Slot\n2. Check Token Status\n3. Mandi Rates & Forecast\n4. Change Language',
      selectCropTitle: 'Select Commodity:',
      selectCrop: '1. Wheat (गेहूं)\n2. Onion (प्याज)\n3. Paddy (धान)\n4. Cotton (कपास)\n0. Back',
      selectCenterTitle: 'Select Mandi Center:',
      selectSlotTitle: 'Available Slots:',
      enterQtyTitle: 'Approx Quantity (kg):',
      enterQty: 'Enter declared weight in kg\n(e.g. type 1450 for 14.5 Q)\n\n0. Back',
      confirmTitle: 'Confirm Mandi Slot:',
      confirmPrompt: '1. Confirm Booking\n2. Cancel',
      successTitle: '✅ Token Confirmed!',
      statusPromptTitle: 'Check Token Status:',
      statusPromptBody: 'Enter Token # or Mobile:\n(e.g. NSK-0198 or 9822019283)\n\n0. Back',
      ratesMenuTitle: 'Select Crop for Forecast:',
      ratesMenu: '1. Wheat (गेहूं)\n2. Onion (प्याज)\n3. Paddy (धान)\n4. Cotton (कपास)\n0. Back',
      langTitle: 'Select Language / भाषा:',
      langBody: '1. English\n2. हिंदी (Hindi)\n3. मराठी (Marathi)\n0. Back'
    },
    hi: {
      rootTitle: 'एग्री-क्यू मंडी सेवा (*99#)',
      rootBody: '1. स्लॉट/टोकन बुक करें\n2. टोकन स्थिति जांचें\n3. सरकारी MSP भाव व सलाह\n4. भाषा बदलें (Language)',
      selectCropTitle: 'फसल चुनें:',
      selectCrop: '1. गेहूं (Wheat)\n2. प्याज (Onion)\n3. धान (Paddy)\n4. कपास (Cotton)\n0. वापस',
      selectCenterTitle: 'मंडी केंद्र चुनें:',
      selectSlotTitle: 'उपलब्ध समय:',
      enterQtyTitle: 'अनुमानित वजन (किलो):',
      enterQty: 'वजन दर्ज करें (उदा. 1450)\n\n0. वापस',
      confirmTitle: 'स्लॉट पुष्टि:',
      confirmPrompt: '1. स्लॉट पक्का करें\n2. रद्द करें',
      successTitle: '✅ टोकन बुक हो गया!',
      statusPromptTitle: 'टोकन स्थिति जांचें:',
      statusPromptBody: 'टोकन नंबर या मोबाइल दर्ज करें:\n(उदा. NSK-0198)\n\n0. वापस',
      ratesMenuTitle: 'भाव व सलाह हेतु फसल चुनें:',
      ratesMenu: '1. गेहूं (Wheat)\n2. प्याज (Onion)\n3. धान (Paddy)\n4. कपास (Cotton)\n0. वापस',
      langTitle: 'भाषा चुनें / Select Language:',
      langBody: '1. English\n2. हिंदी (Hindi)\n3. मराठी (Marathi)\n0. वापस'
    },
    mr: {
      rootTitle: 'अ‍ॅग्री-क्यू कृषी बाजार (*99#)',
      rootBody: '1. स्लॉट बुक करा\n2. टोकन स्थिती तपासा\n3. हमीभाव (MSP) व अंदाज\n4. भाषा बदला',
      selectCropTitle: 'पीक निवडा:',
      selectCrop: '1. गहू (Wheat)\n2. कांदा (Onion)\n3. भात (Paddy)\n4. कापूस (Cotton)\n0. मागे',
      selectCenterTitle: 'बाजार समिती निवडा:',
      selectSlotTitle: 'उपलब्ध वेळ:',
      enterQtyTitle: 'अंदाजे वजन (किलो):',
      enterQty: 'वजन टाका (उदा. 1450)\n\n0. मागे',
      confirmTitle: 'बुकिंग खात्री:',
      confirmPrompt: '1. स्लॉट निश्चित करा\n2. रद्द करा',
      successTitle: '✅ टोकन बुक झाले!',
      statusPromptTitle: 'टोकन स्थिती तपासा:',
      statusPromptBody: 'टोकन क्रमांक किंवा मोबाईल टाका:\n(उदा. NSK-0198)\n\n0. मागे',
      ratesMenuTitle: 'भावासाठी पीक निवडा:',
      ratesMenu: '1. गहू (Wheat)\n2. कांदा (Onion)\n3. भात (Paddy)\n4. कापूस (Cotton)\n0. मागे',
      langTitle: 'भाषा निवडा / Select Language:',
      langBody: '1. English\n2. हिंदी (Hindi)\n3. मराठी (Marathi)\n0. मागे'
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
    logSignaling('GSM MAP', 'MSC ➔ HLR', 'MAP_USSD_TIMEOUT_INDICATION (30s inactivity expiry)');
    flashScreenError();
    ussdTitle.textContent = 'Session Timed Out';
    ussdBody.textContent = '30s inactivity limit reached.\nDial *99# to start again.';
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

  // --- Dynamic Live Calculations for Officer Operations Desk ---
  function updateCalculatedWeights() {
    const grossRaw = inputGrossWeight.value;
    const tareRaw = inputTareWeight.value;

    if (!grossRaw && !tareRaw) {
      calcNetWeight.textContent = '-- kg (-- Q)';
      dbtRateVal.textContent = '-- / Quintal';
      dbtAmountVal.textContent = '--';
      return { net: 0, quintals: '0', totalAmt: '0', effectiveRate: 0 };
    }

    const gross = parseFloat(grossRaw) || 0;
    const tare = parseFloat(tareRaw) || 0;
    let net = Math.max(0, gross - tare);

    // Dynamic Agmarknet moisture deduction logic
    const moistureVal = parseFloat(inputMoisture.value) || 0;
    let moistureDeductionKg = 0;
    if (moistureVal > 12.0 && moistureVal <= 14.0) {
      const excessPercent = moistureVal - 12.0;
      moistureDeductionKg = Math.round(net * (excessPercent / 100));
      net = Math.max(0, net - moistureDeductionKg);
    }

    const quintals = (net / 100).toFixed(2);
    calcNetWeight.textContent = `${net.toLocaleString()} kg (${quintals} Q)${moistureDeductionKg > 0 ? ` [Moisture -${moistureDeductionKg}kg]` : ''}`;

    // Quality Grade Multiplier
    const grade = selectQualityGrade.value;
    const mult = GRADE_MULTIPLIERS[grade] || 1.0;

    // Recalculate DBT Amount using selected token's crop
    const activeCrop = state.tempData.crop || 'Wheat';
    const baseRate = MSP_RATES[activeCrop] || 2425;
    const effectiveRate = Math.round(baseRate * mult);
    dbtRateVal.textContent = `₹${effectiveRate.toLocaleString()} / Quintal (${grade})`;

    const totalAmt = ((net / 100) * effectiveRate).toFixed(2);
    dbtAmountVal.textContent = `₹${parseFloat(totalAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    return { net, quintals, totalAmt, effectiveRate };
  }

  inputGrossWeight.addEventListener('input', updateCalculatedWeights);
  inputTareWeight.addEventListener('input', updateCalculatedWeights);

  // Moisture Validation
  function validateMoisture() {
    const valStr = inputMoisture.value.trim();
    if (!valStr) {
      moistureStatus.textContent = 'Enter moisture % to test compliance';
      moistureStatus.className = 'status-neutral';
      btnSimQuality.disabled = true;
      return;
    }

    const val = parseFloat(valStr) || 0;
    if (val <= 12.0) {
      moistureStatus.textContent = `✔ Within Agmarknet Limit (${val}% ≤ 12.0%)`;
      moistureStatus.className = 'status-ok';
      btnSimQuality.disabled = (state.tempData.stage !== 'WEIGHED');
    } else if (val <= 14.0) {
      const diff = (val - 12.0).toFixed(1);
      moistureStatus.textContent = `⚠ Marginal Moisture (${val}%): ${diff}% weight deduction applied`;
      moistureStatus.className = 'status-warn';
      btnSimQuality.disabled = (state.tempData.stage !== 'WEIGHED');
    } else {
      moistureStatus.textContent = `✖ Moisture Exceeds Mandi Acceptance Limit (${val}% > 14.0% Rejected)`;
      moistureStatus.className = 'status-err';
      btnSimQuality.disabled = true;
    }
    updateCalculatedWeights();
  }

  inputMoisture.addEventListener('input', validateMoisture);
  selectQualityGrade.addEventListener('change', () => {
    updateCalculatedWeights();
  });

  // --- Stepper Lifecycle UI Management ---
  function updateLifecycleStepper(stage) {
    state.tempData.stage = stage;
    demoStatusDisplay.textContent = stage;
    demoStatusDisplay.className = `status-pill status-${stage.toLowerCase().replace('_', '-')}`;

    const stages = ['BOOKED', 'CHECKED_IN', 'WEIGHED', 'QUALITY_CHECKED', 'PAYMENT_PROCESSED', 'COMPLETED'];
    const currentIndex = stages.indexOf(stage);

    const keys = ['booked', 'checkin', 'weigh', 'quality', 'payment', 'complete'];

    keys.forEach((key, idx) => {
      const node = stepNodes[key];
      if (!node) return;
      node.classList.remove('active', 'completed');
      if (idx < currentIndex) {
        node.classList.add('completed');
      } else if (idx === currentIndex) {
        node.classList.add('active');
      }
    });

    stepLines.forEach((line, idx) => {
      if (line) {
        line.classList.toggle('active', idx < currentIndex);
      }
    });

    // Checkpoint Box highlight
    document.querySelectorAll('.checkpoint-box').forEach(box => {
      box.classList.remove('active-checkpoint', 'completed-checkpoint');
    });

    // Button states
    btnSimCheckin.disabled = (stage !== 'BOOKED');
    if (btnScanQr) btnScanQr.disabled = (stage !== 'BOOKED');
    btnSimWeigh.disabled = (stage !== 'CHECKED_IN');
    btnSimQuality.disabled = (stage !== 'WEIGHED' || parseFloat(inputMoisture.value) > 14.0);
    btnSimPayment.disabled = (stage !== 'QUALITY_CHECKED');
    btnSimComplete.disabled = (stage !== 'PAYMENT_PROCESSED');

    if (stage === 'BOOKED') {
      document.getElementById('box-checkin')?.classList.add('active-checkpoint');
    } else if (stage === 'CHECKED_IN') {
      document.getElementById('box-checkin')?.classList.add('completed-checkpoint');
      document.getElementById('box-weigh')?.classList.add('active-checkpoint');
    } else if (stage === 'WEIGHED') {
      document.getElementById('box-checkin')?.classList.add('completed-checkpoint');
      document.getElementById('box-weigh')?.classList.add('completed-checkpoint');
      document.getElementById('box-quality')?.classList.add('active-checkpoint');
    } else if (stage === 'QUALITY_CHECKED') {
      document.getElementById('box-checkin')?.classList.add('completed-checkpoint');
      document.getElementById('box-weigh')?.classList.add('completed-checkpoint');
      document.getElementById('box-quality')?.classList.add('completed-checkpoint');
      document.getElementById('box-payment')?.classList.add('active-checkpoint');
    } else if (stage === 'PAYMENT_PROCESSED') {
      document.getElementById('box-checkin')?.classList.add('completed-checkpoint');
      document.getElementById('box-weigh')?.classList.add('completed-checkpoint');
      document.getElementById('box-quality')?.classList.add('completed-checkpoint');
      document.getElementById('box-payment')?.classList.add('completed-checkpoint');
      document.getElementById('box-complete')?.classList.add('active-checkpoint');
    } else if (stage === 'COMPLETED') {
      document.querySelectorAll('.checkpoint-box').forEach(b => b.classList.add('completed-checkpoint'));
    }
  }

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
        <span class="sms-sender-tag">VK-AGRIQ • ${title}</span>
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
        if (state.lang === 'hi') utter.lang = 'hi-IN';
        else if (state.lang === 'mr') utter.lang = 'mr-IN';
        else utter.lang = 'en-IN';

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
    logSignaling('SMPP 3.4', 'AgriQ ➔ TRAI-SMSC', `SUBMIT_SM (Dest: +91-${state.tempData.phone}, Sender: VK-AGRIQ, Status: DELIVRD)`, true);
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
          centerListText += `${idx + 1}. ${c.center_name}\n`;
        });
        centerListText += '0. Back';
        ussdBody.textContent = centerListText;
        break;

      case 'BOOK_SLOT':
        ussdTitle.textContent = dict.selectSlotTitle;
        let slotListText = '';
        state.dynamicSlots.forEach((s, idx) => {
          const dateLabel = s.slot_date === new Date().toISOString().split('T')[0] ? 'Today' : 'Tomorrow';
          slotListText += `${idx + 1}. ${dateLabel} ${s.slot_start_time} (${s.remaining} left)\n`;
        });
        slotListText += '0. Back';
        ussdBody.textContent = slotListText;
        break;

      case 'BOOK_QTY':
        ussdTitle.textContent = dict.enterQtyTitle;
        ussdBody.textContent = dict.enterQty;
        break;

      case 'BOOK_CONFIRM':
        ussdTitle.textContent = dict.confirmTitle;
        ussdBody.textContent = `${state.tempData.crop} (${state.tempData.quantityKg} kg)\n` +
          `Mandi: ${state.tempData.centerName}\n` +
          `Slot: ${state.tempData.slotTime}\n\n` +
          dict.confirmPrompt;
        break;

      case 'BOOK_SUCCESS':
        ussdTitle.textContent = dict.successTitle;
        ussdBody.textContent = `Token: ${state.activeToken}\n` +
          `Center: ${state.tempData.centerName}\n` +
          `Slot: ${state.tempData.slotTime}\n\n` +
          `SMS sent to ${state.tempData.phone}.\n\n0. Main Menu`;
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
        const crops = { '1': 'Wheat', '2': 'Onion', '3': 'Paddy', '4': 'Cotton' };
        if (crops[input]) {
          state.tempData.crop = crops[input];
          await showLoading('Fetching APMC Centers...');
          if (window.agriqBackend) {
            state.dynamicCenters = await window.agriqBackend.getMandiCenters();
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
            state.dynamicSlots = await window.agriqBackend.getAvailableSlots(selected.center_id);
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
          const dateLabel = slot.slot_date === new Date().toISOString().split('T')[0] ? 'Today' : 'Tomorrow';
          state.tempData.slotTime = `${dateLabel} ${slot.slot_start_time} - ${slot.slot_end_time}`;
          enterMenu('BOOK_QTY');
        } else {
          flashScreenError();
        }
        break;

      case 'BOOK_QTY':
        const qty = parseInt(input, 10);
        if (qty && qty >= 50 && qty <= 50000) {
          state.tempData.quantityKg = qty;
          enterMenu('BOOK_CONFIRM');
        } else {
          flashScreenError();
        }
        break;

      case 'BOOK_CONFIRM':
        if (input === '1') {
          await showLoading('Issuing Official APMC Token...', 700);
          await finalizeBookingToken();
        } else if (input === '2') {
          exitToDialer();
        } else {
          flashScreenError();
        }
        break;

      case 'BOOK_SUCCESS':
        exitToDialer();
        break;

      case 'STATUS_PROMPT':
        if (input.length >= 3) {
          await showLoading('Querying Central Mandi Database...');
          logSignaling('PostgREST', 'AgriQ ➔ DB', `SELECT * FROM bookings WHERE token_number = '${input}'`, true);

          let match = state.queueList.find(q => q.token.toLowerCase() === input.toLowerCase() || q.phone.includes(input));
          if (!match && window.agriqBackend) {
            const backendMatch = await window.agriqBackend.getBookingStatus(input);
            if (backendMatch) {
              match = {
                token: backendMatch.token_number || input,
                status: backendMatch.status || 'BOOKED',
                crop: backendMatch.crop || 'Wheat',
                slot: backendMatch.slot_time || '08:00 AM',
                netWeight: backendMatch.crop_quantity_kg || 1400
              };
            }
          }

          if (match) {
            state.statusLookupResult = `Token: ${match.token}\n` +
              `Status: ${match.status}\n` +
              `Commodity: ${match.crop}\n` +
              `Weight: ${match.netWeight.toLocaleString()} kg\n` +
              `Slot: ${match.slot}\n\n0. Back`;
          } else {
            state.statusLookupResult = `No record found for "${input}".\nCheck number & retry.\n\n0. Back`;
          }
          enterMenu('STATUS_RESULT');
        } else {
          flashScreenError();
        }
        break;

      case 'STATUS_RESULT':
        goBackMenu();
        break;

      case 'RATES_MENU':
        const rateCrops = { '1': 'Wheat', '2': 'Onion', '3': 'Paddy', '4': 'Cotton' };
        if (rateCrops[input]) {
          const cropName = rateCrops[input];
          await showLoading(`Fetching ${cropName} Rates & AI Forecast...`);
          logSignaling('ML Engine', 'P5 ➔ AgriQ', `FETCH_PREDICTIVE_FORECAST (Crop: ${cropName}, Model: scikit-learn RF)`, true);
          let info = null;
          if (window.agriqBackend) {
            info = await window.agriqBackend.getMandiRates(cropName);
          }
          if (info) {
            state.rateLookupResult = `${cropName.toUpperCase()}:\n` +
              `MSP: ${info.rate}\n` +
              `AI Forecast: ${info.forecast}\n` +
              `Optimal Sell Day: ${info.bestDay}\n` +
              `Analysis: ${info.reason}\n\n0. Back`;
          } else {
            state.rateLookupResult = `Current MSP for ${cropName}: ₹${MSP_RATES[cropName] || 2425}/Q\n\n0. Back`;
          }
          enterMenu('RATES_DETAIL');
        } else {
          flashScreenError();
        }
        break;

      case 'RATES_DETAIL':
        goBackMenu();
        break;

      case 'LANG_MENU':
        if (input === '1') setLanguage('en');
        else if (input === '2') setLanguage('hi');
        else if (input === '3') setLanguage('mr');
        else {
          flashScreenError();
          return;
        }
        await showLoading('Applying Language...');
        enterMenu('ROOT');
        break;

      default:
        exitToDialer();
    }
  }

  // --- Finalize Token Creation (Dynamic Database Backend) ---
  async function finalizeBookingToken(customToken = null) {
    const callerPhone = farmerPhoneInput.value.trim() || '9876543210';
    state.tempData.phone = callerPhone;

    logSignaling('PostgREST', 'AgriQ ➔ Edge Function', `INVOKE create-booking (Phone: ${callerPhone}, Center: ${state.tempData.centerId || 'c1-nsk'}, Qty: ${state.tempData.quantityKg}kg)`);

    let backendResult = null;
    if (window.agriqBackend) {
      backendResult = await window.agriqBackend.createBooking({
        phone: callerPhone,
        centerId: state.tempData.centerId,
        slotId: state.tempData.slotId,
        cropQuantityKg: state.tempData.quantityKg
      });
    }

    const tokenNumber = customToken || (backendResult ? backendResult.token_number : `NSK-${Math.floor(1000 + Math.random() * 9000)}`);
    const bookingId = backendResult ? backendResult.booking_id : ('bk_' + Math.random().toString(36).substr(2, 9));

    state.activeToken = tokenNumber;
    state.tempData.bookingId = bookingId;
    state.tempData.stage = 'BOOKED';

    logSignaling('GSM MAP', 'Gateway ➔ HLR', `MAP_UNSTRUCTURED_SS_RESPONSE (Allocated Token: ${tokenNumber})`, true);

    demoTokenDisplay.textContent = tokenNumber;
    demoCropDisplay.textContent = `${state.tempData.crop} (${state.tempData.quantityKg} kg)`;
    mandiYardLocation.textContent = state.tempData.centerName || 'Nashik APMC Main Yard';
    updateLifecycleStepper('BOOKED');
    btnViewReceipt.disabled = false;

    // Load dynamic values for officer weighbridge
    inputGrossWeight.value = state.tempData.quantityKg + 200;
    inputTareWeight.value = 200;
    inputMoisture.value = '11.4';
    validateMoisture();
    updateCalculatedWeights();

    dbtBankText.innerHTML = `Beneficiary A/C: <strong>State Bank of India (***${callerPhone.slice(-4)})</strong> • Aadhaar Authenticated`;

    // Add to Mandi Queue table
    state.queueList.unshift({
      token: tokenNumber,
      phone: callerPhone,
      crop: state.tempData.crop,
      slot: state.tempData.slotTime.replace('Tomorrow ', '').replace('Today ', ''),
      netWeight: state.tempData.quantityKg,
      status: 'BOOKED',
      grade: 'GRADE-A',
      bookingId: bookingId
    });
    renderQueueTable();
    updateMandiKpis();

    // Prepare Gate Pass details
    receiptTokenVal.textContent = tokenNumber;
    receiptPhone.textContent = `+91-${callerPhone}`;
    receiptCenter.textContent = state.tempData.centerName || 'Nashik APMC Main Yard';
    receiptCrop.textContent = `${state.tempData.crop} (Grade-A)`;
    receiptSlot.textContent = state.tempData.slotTime;
    const qtl = (state.tempData.quantityKg / 100).toFixed(2);
    receiptQty.textContent = `${state.tempData.quantityKg.toLocaleString()} kg (${qtl} Q)`;
    receiptBarcodeText.textContent = `*${tokenNumber}-2026*`;

    // Generate P3 Contract Payload
    const qrPayload = {
      type: 'AGRIQ_TOKEN',
      booking_id: bookingId,
      token_number: tokenNumber,
      phone_number: callerPhone,
      center_id: state.tempData.centerId || 'c1-nsk',
      slot_date: new Date().toISOString().split('T')[0]
    };
    generateSvgQrCode(qrPayload);

    // Send Confirmation SMS in chosen language
    if (state.lang === 'hi') {
      sendFarmerSms(
        'टोकन पुष्टि',
        `भारत सरकार / APMC: टोकन <strong>${tokenNumber}</strong> पक्का हुआ।\nफसल: ${state.tempData.crop} (${qtl} क्विंटल)\nकेंद्र: ${state.tempData.centerName || 'नासिक एपीएमसी'}\nसमय: ${state.tempData.slotTime}\nगेट पास: agriq.gov.in/t/${tokenNumber}\nसमय से 15 मिनट पहले पहुंचें।`,
        'alert-confirm'
      );
    } else if (state.lang === 'mr') {
      sendFarmerSms(
        'टोकन खात्री',
        `APMC बाजार: टोकन <strong>${tokenNumber}</strong> निश्चित झाले.\nपीक: ${state.tempData.crop} (${qtl} क्विंटल)\nबाजार: ${state.tempData.centerName || 'नाशिक एपीएमसी'}\nवेळ: ${state.tempData.slotTime}\nगेट पास: agriq.gov.in/t/${tokenNumber}`,
        'alert-confirm'
      );
    } else {
      sendFarmerSms(
        'Token Confirmed',
        `Govt of India / APMC: Token <strong>${tokenNumber}</strong> confirmed.\nCrop: ${state.tempData.crop} (${qtl} Q)\nCenter: ${state.tempData.centerName || 'Nashik APMC'}\nSlot: ${state.tempData.slotTime}\nGate Pass: agriq.gov.in/t/${tokenNumber}\nArrive 15 mins prior.`,
        'alert-confirm'
      );
    }

    enterMenu('BOOK_SUCCESS');
  }

  // --- Officer Checkpoint Transitions ---

  // Checkpoint 1: Gate Security QR Scanner Simulation (Optional)
  if (btnScanQr) {
    btnScanQr.addEventListener('click', () => {
      if (!state.activeToken) return;
      if (scannerView) scannerView.classList.remove('hidden');
      playScannerBeep();
      if (scannerStatusText) scannerStatusText.textContent = `Scanning Token QR: ${state.activeToken}...`;

      setTimeout(() => {
        if (scannerStatusText) scannerStatusText.textContent = `✔ Gate Pass Verified: ${state.activeToken} (Valid)`;
        setTimeout(() => {
          if (scannerView) scannerView.classList.add('hidden');
          btnSimCheckin.click();
        }, 500);
      }, 700);
    });
  }

  // Checkpoint 1: Gate Security Check-In Action
  btnSimCheckin.addEventListener('click', async () => {
    if (!state.activeToken) return;
    if (window.agriqBackend) {
      await window.agriqBackend.transitionStatus(state.tempData.bookingId, 'CHECKED_IN');
    }
    updateLifecycleStepper('CHECKED_IN');
    updateQueueItemStatus(state.activeToken, 'CHECKED_IN');

    const gate = inputGateNo.value;
    sendFarmerSms(
      'Gate Security Check-In',
      `APMC Gate Security: Token <strong>${state.activeToken}</strong> verified at <strong>${gate}</strong>.\nSecurity clearance granted. Proceed immediately to Weighbridge Bay #2.`,
      'alert-status'
    );
  });

  // Checkpoint 2: Weighbridge Scale
  btnSimWeigh.addEventListener('click', async () => {
    if (!state.activeToken) return;
    const { net, quintals } = updateCalculatedWeights();
    state.tempData.quantityKg = net;

    if (window.agriqBackend) {
      await window.agriqBackend.transitionStatus(state.tempData.bookingId, 'WEIGHED');
    }
    updateLifecycleStepper('WEIGHED');
    updateQueueItemStatus(state.activeToken, 'WEIGHED', net);
    updateMandiKpis();

    sendFarmerSms(
      'Weighbridge Scale Certified',
      `APMC Digital Scale #3: Weight logged for <strong>${state.activeToken}</strong>.\nGross: ${inputGrossWeight.value} kg | Tare: ${inputTareWeight.value} kg\n<strong>Certified Net Produce: ${net.toLocaleString()} kg (${quintals} Q)</strong>.\nProceed to Quality Assayer Desk.`,
      'alert-weighed'
    );
  });

  // Checkpoint 3: Quality Assayer
  btnSimQuality.addEventListener('click', async () => {
    if (!state.activeToken) return;
    const grade = selectQualityGrade.value;
    const moisture = inputMoisture.value;
    state.tempData.grade = grade;

    if (window.agriqBackend) {
      await window.agriqBackend.transitionStatus(state.tempData.bookingId, 'QUALITY_CHECKED');
    }
    updateLifecycleStepper('QUALITY_CHECKED');
    updateQueueItemStatus(state.activeToken, 'QUALITY_CHECKED', null, grade);
    updateMandiKpis();

    sendFarmerSms(
      'Agmarknet Quality Assayed',
      `Government Lab Desk: Sample for <strong>${state.activeToken}</strong> certified as <strong>${grade}</strong>.\nMoisture content: ${moisture}%. Certified compliant with Central Pool Procurement standards. Direct Benefit Transfer unlocked.`,
      'alert-quality'
    );
  });

  // Checkpoint 4: PFMS Direct Benefit Transfer
  btnSimPayment.addEventListener('click', async () => {
    if (!state.activeToken) return;
    const { totalAmt, quintals } = updateCalculatedWeights();

    if (window.agriqBackend) {
      await window.agriqBackend.transitionStatus(state.tempData.bookingId, 'PAYMENT_PROCESSED');
    }
    updateLifecycleStepper('PAYMENT_PROCESSED');
    updateQueueItemStatus(state.activeToken, 'PAYMENT_PROCESSED');
    updateMandiKpis();

    const refId = 'PFMS' + Math.floor(10000000 + Math.random() * 90000000);
    const phone = state.tempData.phone || '9876543210';

    sendFarmerSms(
      'PFMS DBT Credit Alert',
      `PFMS Direct Benefit Transfer Alert:\n<strong>₹${parseFloat(totalAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> credited to Aadhaar-linked Bank A/C ending in <strong>${phone.slice(-4)}</strong> for ${quintals} Q ${state.tempData.crop}.\nRef No: <strong>${refId}</strong> under PM-AASHA / MSP.`,
      'alert-payment'
    );
  });

  // Checkpoint 5: Procurement Closeout & Exit Pass
  btnSimComplete.addEventListener('click', async () => {
    if (!state.activeToken) return;

    if (window.agriqBackend) {
      await window.agriqBackend.transitionStatus(state.tempData.bookingId, 'COMPLETED');
    }
    updateLifecycleStepper('COMPLETED');
    updateQueueItemStatus(state.activeToken, 'COMPLETED');
    updateMandiKpis();

    sendFarmerSms(
      'Mandi Exit Pass Issued',
      `APMC Exit Clearance: Procurement cycle closed for <strong>${state.activeToken}</strong>.\nTurnaround time: <strong>38 mins</strong>.\nDownload digital voucher: agriq.gov.in/v/${state.activeToken}.\nGate Exit Barrier Cleared. Jai Kisan!`,
      'alert-complete'
    );
  });

  // --- Queue Table Management ---
  function renderQueueTable() {
    const filter = (queueSearchInput.value || '').toLowerCase().trim();
    mandiQueueTbody.innerHTML = '';

    const filtered = state.queueList.filter(item => {
      if (!filter) return true;
      return item.token.toLowerCase().includes(filter) ||
        item.phone.includes(filter) ||
        item.crop.toLowerCase().includes(filter) ||
        item.status.toLowerCase().includes(filter);
    });

    if (filtered.length === 0) {
      mandiQueueTbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;padding:0.75rem;">No matching tokens found</td></tr>`;
      return;
    }

    filtered.forEach(item => {
      const tr = document.createElement('tr');
      if (item.token === state.activeToken) tr.className = 'selected-row';

      const qtl = (item.netWeight / 100).toFixed(2);
      tr.innerHTML = `
        <td><strong>${item.token}</strong></td>
        <td>${item.phone}</td>
        <td>${item.crop}</td>
        <td>${item.slot}</td>
        <td>${item.netWeight.toLocaleString()} kg (${qtl} Q)</td>
        <td><span class="status-pill status-${item.status.toLowerCase().replace('_', '-')}">${item.status}</span></td>
        <td><button class="btn-sm btn-select-token" data-token="${item.token}">Inspect</button></td>
      `;

      tr.addEventListener('click', () => {
        selectTokenForOperations(item);
      });

      const btnInspect = tr.querySelector('.btn-select-token');
      btnInspect.addEventListener('click', (e) => {
        e.stopPropagation();
        selectTokenForOperations(item);
      });

      mandiQueueTbody.appendChild(tr);
    });
  }

  function selectTokenForOperations(item) {
    state.activeToken = item.token;
    state.tempData.bookingId = item.bookingId || ('bk_' + item.token);
    state.tempData.phone = item.phone;
    state.tempData.crop = item.crop;
    state.tempData.quantityKg = item.netWeight;
    state.tempData.stage = item.status;

    demoTokenDisplay.textContent = item.token;
    demoCropDisplay.textContent = `${item.crop} (${item.netWeight} kg)`;
    farmerPhoneInput.value = item.phone;

    inputGrossWeight.value = item.netWeight + 200;
    inputTareWeight.value = 200;
    inputMoisture.value = '11.4';
    if (item.grade) selectQualityGrade.value = item.grade;

    validateMoisture();
    updateCalculatedWeights();
    updateLifecycleStepper(item.status);
    renderQueueTable();
    btnViewReceipt.disabled = false;

    dbtBankText.innerHTML = `Beneficiary A/C: <strong>State Bank of India (***${item.phone.slice(-4)})</strong> • Aadhaar Authenticated`;

    // Update Gate pass
    receiptTokenVal.textContent = item.token;
    receiptPhone.textContent = `+91-${item.phone}`;
    receiptCrop.textContent = `${item.crop} (${item.grade || 'Standard'})`;
    const qtl = (item.netWeight / 100).toFixed(2);
    receiptQty.textContent = `${item.netWeight.toLocaleString()} kg (${qtl} Q)`;
    receiptBarcodeText.textContent = `*${item.token}-2026*`;

    const qrPayload = {
      type: 'AGRIQ_TOKEN',
      booking_id: state.tempData.bookingId,
      token_number: item.token,
      phone_number: item.phone,
      center_id: 'c1-nsk',
      slot_date: new Date().toISOString().split('T')[0]
    };
    generateSvgQrCode(qrPayload);
  }

  function updateQueueItemStatus(token, status, netWeight = null, grade = null) {
    const item = state.queueList.find(q => q.token === token);
    if (item) {
      item.status = status;
      if (netWeight) item.netWeight = netWeight;
      if (grade) item.grade = grade;
      renderQueueTable();
      updateMandiKpis();
    }
  }

  queueSearchInput.addEventListener('input', renderQueueTable);

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
      state.dialBuffer += key;
      dialedDisplay.textContent = state.dialBuffer;
    } else if (state.mode === 'MENU') {
      state.inputBuffer += key;
      ussdInputDisplay.textContent = state.inputBuffer;
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
        goBackMenu();
      }
    }
  }

  // --- Physical Keyboard Binding ---
  window.addEventListener('keydown', (e) => {
    // Hidden shortcut for 30s emergency jury demo: Ctrl + Shift + S
    if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      runEmergencyDemoCycle();
      return;
    }

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

  async function runEmergencyDemoCycle() {
    state.tempData.crop = 'Wheat';
    state.tempData.quantityKg = 1450;
    await finalizeBookingToken();
    await new Promise(r => setTimeout(r, 1200));

    btnSimCheckin.click();
    await new Promise(r => setTimeout(r, 1200));

    btnSimWeigh.click();
    await new Promise(r => setTimeout(r, 1200));

    btnSimQuality.click();
    await new Promise(r => setTimeout(r, 1200));

    btnSimPayment.click();
    await new Promise(r => setTimeout(r, 1200));

    btnSimComplete.click();
    await new Promise(r => setTimeout(r, 800));

    receiptModal.classList.remove('hidden');
  }

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
    demoTokenDisplay.textContent = 'None Selected';
    demoCropDisplay.textContent = '--';
    demoStatusDisplay.textContent = 'IDLE';
    demoStatusDisplay.className = 'status-pill status-idle';
    btnViewReceipt.disabled = true;

    inputGrossWeight.value = '';
    inputTareWeight.value = '';
    inputMoisture.value = '';
    calcNetWeight.textContent = '-- kg (-- Q)';
    dbtRateVal.textContent = '-- / Quintal';
    dbtAmountVal.textContent = '--';
    moistureStatus.textContent = 'Enter moisture % to test compliance';
    moistureStatus.className = 'status-neutral';
    dbtBankText.textContent = 'Select a token to verify Aadhaar linked account';

    // Reset Stepper
    Object.values(stepNodes).forEach(node => {
      node.classList.remove('active', 'completed');
    });
    stepLines.forEach(line => line.classList.remove('active'));

    document.querySelectorAll('.checkpoint-box').forEach(b => {
      b.classList.remove('active-checkpoint', 'completed-checkpoint');
    });

    btnSimCheckin.disabled = true;
    btnScanQr.disabled = true;
    btnSimWeigh.disabled = true;
    btnSimQuality.disabled = true;
    btnSimPayment.disabled = true;
    btnSimComplete.disabled = true;

    updateMandiKpis();
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
      state.dynamicCenters = await window.agriqBackend.getMandiCenters();
    }
    renderQueueTable();
    updateMandiKpis();
    initSignalingTraces();
    console.log('[AgriQ] USSD Gateway Trump Card Engine (v7) initialized.');
  }

  init();
})();

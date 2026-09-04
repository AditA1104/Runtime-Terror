/**
 * AgriQ National Mandi Procurement Gateway Engine (v5)
 * Truly Dynamic, User-Input Driven Architecture
 * Team: Runtime-Terror | SIH 2026 | PS 26032
 */

(function () {
  // DOM Elements - Navigation & Screen
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
  const smsMessages = document.getElementById('sms-messages');
  const smsCountBadge = document.getElementById('sms-count');
  const farmerPhoneInput = document.getElementById('farmer-phone-input');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const currentLangTag = document.getElementById('current-lang-tag');
  
  // DOM Elements - Officer Operations
  const demoTokenDisplay = document.getElementById('demo-token-display');
  const demoStatusDisplay = document.getElementById('demo-status-display');
  const connectionStatus = document.getElementById('connection-status');
  const pulseDot = document.getElementById('pulse-dot');
  const mandiQueueTbody = document.getElementById('mandi-queue-tbody');
  const queueSearchInput = document.getElementById('queue-search-input');

  // Checkpoint Inputs & Buttons
  const inputGateNo = document.getElementById('input-gate-no');
  const btnSimCheckin = document.getElementById('btn-sim-checkin');

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
  const btnSimPayment = document.getElementById('btn-sim-payment');

  const btnSimComplete = document.getElementById('btn-sim-complete');

  // Quick Action Buttons
  const btnQuickBook = document.getElementById('btn-quick-book');
  const btnQuickCycle = document.getElementById('btn-quick-cycle');
  const btnQuickRates = document.getElementById('btn-quick-rates');
  const btnQuickReset = document.getElementById('btn-quick-reset');
  const btnViewReceipt = document.getElementById('btn-view-receipt');

  // Receipt Modal Elements
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

  // Audio Context
  let soundEnabled = true;
  let audioCtx = null;

  // Real Government MSP Rates (per Quintal / 100 kg)
  const MSP_RATES = {
    'Wheat': 2425,
    'Paddy': 2300,
    'Onion': 1850,
    'Cotton': 7120,
    'Mustard': 5650,
    'Soybean': 4892
  };

  // State
  const state = {
    mode: 'DIALING',
    dialBuffer: '*99#',
    inputBuffer: '',
    currentMenu: 'ROOT',
    menuHistory: ['ROOT'],
    sessionId: 'sess_' + Math.random().toString(36).substr(2, 8),
    tempData: {
      phone: '9876543210',
      crop: 'Wheat',
      centerId: 'c1-nsk',
      centerName: 'Nashik APMC Main',
      slotId: 's1',
      slotTime: 'Tomorrow 08:00 AM',
      quantityKg: 1450,
      language: 'en'
    },
    activeToken: null,
    activeBooking: null,
    smsList: [],
    queueList: [
      { token: 'NSK-0198', phone: '9822019283', crop: 'Wheat', slot: '08:00 AM', netWeight: 1850, status: 'WEIGHED', grade: 'GRADE-A' },
      { token: 'NSK-0215', phone: '9765432190', crop: 'Onion', slot: '08:30 AM', netWeight: 2200, status: 'CHECKED_IN', grade: 'GRADE-B' },
      { token: 'NSK-0220', phone: '9921873461', crop: 'Wheat', slot: '09:00 AM', netWeight: 1400, status: 'BOOKED', grade: null }
    ]
  };

  // Multilingual Dictionaries
  const I18N = {
    en: {
      langName: 'EN',
      rootTitle: 'AgriQ Mandi Seva (*99#)',
      rootBody: '1. Book Mandi Slot\n2. Check Token Status\n3. Mandi Rates & Forecast\n4. Change Language',
      selectCropTitle: 'Select Commodity:',
      selectCrop: '1. Wheat (à¤—à¥‡à¤¹à¥‚à¤‚)\n2. Onion (à¤ªà¥à¤¯à¤¾à¤œ)\n3. Paddy (à¤§à¤¾à¤¨)\n4. Cotton (à¤•à¤ªà¤¾à¤¸)\n0. Back',
      selectCenterTitle: 'Select Mandi Center:',
      selectCenter: '1. Nashik APMC Main\n2. Pune Central Mandi\n3. Nagpur Cotton Yard\n0. Back',
      selectSlotTitle: 'Available Slots: ',
      selectSlot: '1. Tomorrow 08:00 AM (15 left)\n2. Tomorrow 11:00 AM (12 left)\n3. Tomorrow 02:00 PM (8 left)\n0. Back',
      enterQtyTitle: 'Approx Quantity (kg):',
      enterQty: 'Enter declared weight in kg\n(e.g. type 1450 for 14.5 Q)\n\n0. Back',
      confirmTitle: 'Confirm Mandi Slot:',
      confirmPrompt: '1. Confirm Booking\n2. Cancel',
      successTitle: 'âœ… Token Confirmed!',
      statusPromptTitle: 'Check Token Status:',
      statusPromptBody: 'Enter Token # or Mobile:\n(e.g. NSK-4821 or 9876543210)\n\n1. Check active token\n0. Back',
      ratesMenuTitle: 'APMC MSP Rates & Forecast:',
      ratesMenu: '1. Wheat (â‚¹2,425/Q)\n2. Onion (â‚¹1,850/Q)\n3. Paddy (â‚¹2,300/Q)\n4. Cotton (â‚¹7,120/Q)\n0. Back'
    },
    hi: {
      langName: 'HI (à¤¹à¤¿à¤‚à¤¦à¥€)',
      rootTitle: 'à¤à¤—à¥à¤°à¥€-à¤•à¥à¤¯à¥‚ à¤®à¤‚à¤¡à¥€ à¤¸à¥‡à¤µà¤¾ (*99#)',
      rootBody: '1. à¤¸à¥à¤²à¥‰à¤Ÿ/à¤Ÿà¥‹à¤•à¤¨ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚\n2. à¤Ÿà¥‹à¤•à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¤¿ à¤œà¤¾à¤‚à¤šà¥‡à¤‚\n3. à¤¸à¤°à¤•à¤¾à¤°à¥€ MSP à¤­à¤¾à¤µ à¤µ à¤¸à¤²à¤¾à¤¹\n4. à¤­à¤¾à¤·à¤¾ à¤¬à¤¦à¤²à¥‡à¤‚',
      selectCropTitle: 'à¤«à¤¸à¤² à¤šà¥à¤¨à¥‡à¤‚:',
      selectCrop: '1. à¤—à¥‡à¤¹à¥‚à¤‚ (Wheat)\n2. à¤ªà¥à¤¯à¤¾à¤œ (Onion)\n3. à¤§à¤¾à¤¨ (Paddy)\n4. à¤•à¤ªà¤¾à¤¸ (Cotton)\n0. à¤µà¤¾à¤ªà¤¸',
      selectCenterTitle: 'à¤®à¤‚à¤¡à¥€ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤šà¥à¤¨à¥‡à¤‚:',
      selectCenter: '1. à¤¨à¤¾à¤¸à¤¿à¤• à¤à¤ªà¥€à¤à¤®à¤¸à¥€ à¤®à¥à¤–à¥à¤¯\n2. à¤ªà¥à¤£à¥‡ à¤¸à¥‡à¤‚à¤Ÿà¥à¤°à¤² à¤®à¤‚à¤¡à¥€\n3. à¤¨à¤¾à¤—à¤ªà¥à¤° à¤¯à¤¾à¤°à¥à¤¡\n0. à¤µà¤¾à¤ªà¤¸',
      selectSlotTitle: 'à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¸à¤®à¤¯: ',
      selectSlot: '1. à¤•à¤² à¤¸à¥à¤¬à¤¹ 08:00 (15 à¤¶à¥‡à¤·)\n2. à¤•à¤² à¤¸à¥à¤¬à¤¹ 11:00 (12 à¤¶à¥‡à¤·)\n3. à¤•à¤² à¤¦à¥‹à¤ªà¤¹à¤° 02:00 (8 à¤¶à¥‡à¤·)\n0. à¤µà¤¾à¤ªà¤¸',
      enterQtyTitle: 'à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤µà¤œà¤¨ (à¤•à¤¿à¤²à¥‹):',
      enterQty: 'à¤µà¤œà¤¨ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚ (à¤‰à¤¦à¤¾. 1450)\n\n0. à¤µà¤¾à¤ªà¤¸',
      confirmTitle: 'à¤¸à¥à¤²à¥‰à¤Ÿ à¤ªà¥à¤·à¥à¤Ÿà¤¿:',
      confirmPrompt: '1. à¤¸à¥à¤²à¥‰à¤Ÿ à¤ªà¤•à¥à¤•à¤¾ à¤•à¤°à¥‡à¤‚\n2. à¤°à¤¦à¥à¤¦ à¤•à¤°à¥‡à¤‚',
      successTitle: 'âœ… à¤Ÿà¥‹à¤•à¤¨ à¤¬à¥à¤• à¤¹à¥‹ à¤—à¤¯à¤¾!',
      statusPromptTitle: 'à¤Ÿà¥‹à¤•à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¤¿ à¤œà¤¾à¤‚à¤šà¥‡à¤‚:',
      statusPromptBody: 'à¤Ÿà¥‹à¤•à¤¨ à¤¨à¤‚à¤¬à¤° à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚:\n(à¤‰à¤¦à¤¾. NSK-4821)\n\n1. à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤Ÿà¥‹à¤•à¤¨ à¤œà¤¾à¤‚à¤šà¥‡à¤‚\n0. à¤µà¤¾à¤ªà¤¸',
      ratesMenuTitle: 'à¤¸à¤°à¤•à¤¾à¤°à¥€ MSP à¤­à¤¾à¤µ à¤µ à¤ªà¥‚à¤°à¥à¤µà¤¾à¤¨à¥à¤®à¤¾à¤¨:',
      ratesMenu: '1. à¤—à¥‡à¤¹à¥‚à¤‚ (â‚¹2,425/à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\n2. à¤ªà¥à¤¯à¤¾à¤œ (â‚¹1,850/à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\n3. à¤§à¤¾à¤¨ (â‚¹2,300/à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\n4. à¤•à¤ªà¤¾à¤¸ (â‚¹7,120/à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\n0. à¤µà¤¾à¤ªà¤¸'
    },
    mr: {
      langName: 'MR (à¤®à¤°à¤¾à¤ à¥€)',
      rootTitle: 'à¤…â€à¥…à¤—à¥à¤°à¥€-à¤•à¥à¤¯à¥‚ à¤•à¥ƒà¤·à¥€ à¤¬à¤¾à¤œà¤¾à¤° (*99#)',
      rootBody: '1. à¤¸à¥à¤²à¥‰à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¤¾\n2. à¤Ÿà¥‹à¤•à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¥€ à¤¤à¤ªà¤¾à¤¸à¤¾\n3. à¤¹à¤®à¥€à¤­à¤¾à¤µ (MSP) à¤µ à¤…à¤‚à¤¦à¤¾à¤œ\n4. à¤­à¤¾à¤·à¤¾ à¤¬à¤¦à¤²à¤¾',
      selectCropTitle: 'à¤ªà¥€à¤• à¤¨à¤¿à¤µà¤¡à¤¾:',
      selectCrop: '1. à¤—à¤¹à¥‚ (Wheat)\n2. à¤•à¤¾à¤‚à¤¦à¤¾ (Onion)\n3. à¤­à¤¾à¤¤ (Paddy)\n4. à¤•à¤¾à¤ªà¥‚à¤¸ (Cotton)\n0. à¤®à¤¾à¤—à¥‡',
      selectCenterTitle: 'à¤¬à¤¾à¤œà¤¾à¤° à¤¸à¤®à¤¿à¤¤à¥€ à¤¨à¤¿à¤µà¤¡à¤¾:',
      selectCenter: '1. à¤¨à¤¾à¤¶à¤¿à¤• à¤à¤ªà¥€à¤à¤®à¤¸à¥€ à¤®à¥à¤–à¥à¤¯\n2. à¤ªà¥à¤£à¥‡ à¤®à¥à¤–à¥à¤¯ à¤¬à¤¾à¤œà¤¾à¤°\n3. à¤¨à¤¾à¤—à¤ªà¥‚à¤° à¤¯à¤¾à¤°à¥à¤¡\n0. à¤®à¤¾à¤—à¥‡',
      selectSlotTitle: 'à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤µà¥‡à¤³: ',
      selectSlot: '1. à¤‰à¤¦à¥à¤¯à¤¾ à¤¸à¤•à¤¾à¤³à¥€ 08:00 (15 à¤¶à¤¿à¤²à¥à¤²à¤•)\n2. à¤‰à¤¦à¥à¤¯à¤¾ à¤¸à¤•à¤¾à¤³à¥€ 11:00 (12 à¤¶à¤¿à¤²à¥à¤²à¤•)\n3. à¤‰à¤¦à¥à¤¯à¤¾ à¤¦à¥à¤ªà¤¾à¤°à¥€ 02:00 (8 à¤¶à¤¿à¤²à¥à¤²à¤•)\n0. à¤®à¤¾à¤—à¥‡',
      enterQtyTitle: 'à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤µà¤œà¤¨ (à¤•à¤¿à¤²à¥‹):',
      enterQty: 'à¤µà¤œà¤¨ à¤Ÿà¤¾à¤•à¤¾ (à¤‰à¤¦à¤¾. 1450)\n\n0. à¤®à¤¾à¤—à¥‡',
      confirmTitle: 'à¤¬à¥à¤•à¤¿à¤‚à¤— à¤–à¤¾à¤¤à¥à¤°à¥€:',
      confirmPrompt: '1. à¤¸à¥à¤²à¥‰à¤Ÿ à¤¨à¤¿à¤¶à¥à¤šà¤¿à¤¤ à¤•à¤°à¤¾\n2. à¤°à¤¦à¥à¤¦ à¤•à¤°à¤¾',
      successTitle: 'âœ… à¤Ÿà¥‹à¤•à¤¨ à¤¬à¥à¤• à¤à¤¾à¤²à¥‡!',
      statusPromptTitle: 'à¤Ÿà¥‹à¤•à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¥€ à¤¤à¤ªà¤¾à¤¸à¤¾:',
      statusPromptBody: 'à¤Ÿà¥‹à¤•à¤¨ à¤•à¥à¤°à¤®à¤¾à¤‚à¤• à¤Ÿà¤¾à¤•à¤¾:\n(à¤‰à¤¦à¤¾. NSK-4821)\n\n1. à¤šà¤¾à¤²à¥‚ à¤Ÿà¥‹à¤•à¤¨ à¤¤à¤ªà¤¾à¤¸à¤¾\n0. à¤®à¤¾à¤—à¥‡',
      ratesMenuTitle: 'à¤¬à¤¾à¤œà¤¾à¤° à¤¹à¤®à¥€à¤­à¤¾à¤µ à¤µ à¤¶à¤¿à¤«à¤¾à¤°à¤¸:',
      ratesMenu: '1. à¤—à¤¹à¥‚ (â‚¹à¥¨,à¥ªà¥¨à¥«/à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\n2. à¤•à¤¾à¤‚à¤¦à¤¾ (â‚¹à¥§,à¥®à¥«à¥¦/à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\n3. à¤­à¤¾à¤¤ (â‚¹à¥¨,à¥©à¥¦à¥¦/à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\n4. à¤•à¤¾à¤ªà¥‚à¤¸ (â‚¹à¥­,à¥§à¥¨à¥¦/à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\n0. à¤®à¤¾à¤—à¥‡'
    }
  };

  // Clock in LCD screen
  function updateClock() {
    const clockEl = document.getElementById('screen-clock');
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Audio Engine
  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playTone(freq = 600, type = 'sine', duration = 0.04) {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playErrorTone() {
    if (!soundEnabled) return;
    playTone(280, 'sawtooth', 0.08);
    setTimeout(() => playTone(220, 'sawtooth', 0.1), 90);
  }

  function playSmsChime() {
    if (!soundEnabled) return;
    playTone(880, 'triangle', 0.1);
    setTimeout(() => playTone(1320, 'triangle', 0.15), 120);
  }

  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? 'ðŸ”Š Audio: ON' : 'ðŸ”‡ Audio: OFF';
    soundToggleBtn.style.color = soundEnabled ? '#10b981' : '#94a3b8';
  });

  // Dynamic Live Calculations for Officer Desk
  function updateCalculatedWeights() {
    const gross = parseFloat(inputGrossWeight.value) || 0;
    const tare = parseFloat(inputTareWeight.value) || 0;
    const net = Math.max(0, gross - tare);
    const quintals = (net / 100).toFixed(2);
    calcNetWeight.textContent = `${net.toLocaleString()} kg (${quintals} Q)`;

    // Recalculate DBT Amount
    const activeCrop = state.tempData.crop || 'Wheat';
    const rate = MSP_RATES[activeCrop] || 2425;
    dbtRateVal.textContent = `â‚¹${rate.toLocaleString()} / Quintal`;

    const totalAmt = ((net / 100) * rate).toFixed(2);
    dbtAmountVal.textContent = `â‚¹${parseFloat(totalAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    return { net, quintals, totalAmt, rate };
  }

  inputGrossWeight.addEventListener('input', updateCalculatedWeights);
  inputTareWeight.addEventListener('input', updateCalculatedWeights);

  // Moisture Validation
  inputMoisture.addEventListener('input', () => {
    const moisture = parseFloat(inputMoisture.value) || 0;
    if (moisture <= 12.0) {
      moistureStatus.textContent = `âœ” Permissible Limit (â‰¤ 12.0% Fair Average Quality)`;
      moistureStatus.className = 'status-ok';
      btnSimQuality.disabled = (demoStatusDisplay.textContent !== 'WEIGHED');
    } else {
      moistureStatus.textContent = `âš ï¸ Excess Moisture (${moisture}% > 12%) â€” Requires Re-drying`;
      moistureStatus.className = 'status-ok text-danger';
    }
  });

  // Render Queue Table with Live Search Filter
  function renderQueueTable(searchTerm = '') {
    const term = searchTerm.trim().toLowerCase();
    const filtered = state.queueList.filter(item => 
      !term || item.token.toLowerCase().includes(term) || item.phone.includes(term) || item.crop.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
      mandiQueueTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; padding:1rem;">No matching tokens found in active queue</td></tr>`;
      return;
    }

    mandiQueueTbody.innerHTML = filtered.map(item => {
      const isCurrent = state.activeToken === item.token;
      return `
        <tr class="${isCurrent ? 'highlight-row' : ''}">
          <td><strong>${item.token}</strong></td>
          <td>+91-${item.phone}</td>
          <td>${item.crop}</td>
          <td>${item.slot}</td>
          <td>${item.netWeight ? item.netWeight + ' kg' : 'Pending'}</td>
          <td><span class="table-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
          <td><button class="btn-select-row" data-token="${item.token}">Select</button></td>
        </tr>
      `;
    }).join('');

    // Wire selection buttons
    document.querySelectorAll('.btn-select-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const tok = btn.getAttribute('data-token');
        selectTokenForOperations(tok);
      });
    });
  }

  queueSearchInput.addEventListener('input', (e) => {
    renderQueueTable(e.target.value);
  });

  // Select a token to operate on in the officer desk
  function selectTokenForOperations(token) {
    const found = state.queueList.find(q => q.token === token);
    if (!found) return;

    state.activeToken = found.token;
    state.tempData.crop = found.crop;
    state.tempData.phone = found.phone;
    state.tempData.slotTime = found.slot;
    if (found.netWeight) {
      inputGrossWeight.value = found.netWeight + 200;
      inputTareWeight.value = 200;
    }
    updateCalculatedWeights();
    setActiveTokenDisplay(found.token, found.status);
    btnViewReceipt.disabled = false;
  }

  // View Switching
  function showView(viewName) {
    state.mode = viewName;
    dialingView.classList.add('hidden');
    menuView.classList.add('hidden');
    loadingView.classList.add('hidden');

    if (viewName === 'DIALING') {
      dialingView.classList.remove('hidden');
      leftSoftLabel.textContent = 'Dial';
      rightSoftLabel.textContent = 'Clear';
      updateDialDisplay();
    } else if (viewName === 'MENU') {
      menuView.classList.remove('hidden');
      leftSoftLabel.textContent = 'Send';
      rightSoftLabel.textContent = 'Back';
      updateInputDisplay();
    } else if (viewName === 'LOADING') {
      loadingView.classList.remove('hidden');
      leftSoftLabel.textContent = '';
      rightSoftLabel.textContent = 'Cancel';
    }
    updateInspector();
  }

  function updateDialDisplay() {
    dialedDisplay.textContent = state.dialBuffer || '_';
  }

  function updateInputDisplay() {
    ussdInputDisplay.textContent = state.inputBuffer || '_';
  }

  function updateInspector() {
    currentLangTag.textContent = I18N[state.tempData.language]?.langName || 'EN';
  }

  // Render USSD Menus
  async function renderMenu(menuKey, pushHistory = true) {
    if (pushHistory && state.currentMenu !== menuKey) {
      state.menuHistory.push(state.currentMenu);
    }
    state.currentMenu = menuKey;
    state.inputBuffer = '';
    updateInputDisplay();
    updateInspector();

    const lang = state.tempData.language || 'en';
    const dict = I18N[lang] || I18N.en;

    switch (menuKey) {
      case 'ROOT':
        state.menuHistory = ['ROOT'];
        ussdTitle.textContent = dict.rootTitle;
        ussdBody.innerText = dict.rootBody;
        break;

      case 'BOOK_CROP':
        ussdTitle.textContent = dict.selectCropTitle;
        ussdBody.innerText = dict.selectCrop;
        break;

      case 'BOOK_CENTER':
        ussdTitle.textContent = dict.selectCenterTitle;
        ussdBody.innerText = dict.selectCenter;
        break;

      case 'BOOK_SLOT':
        ussdTitle.textContent = dict.selectSlotTitle + (state.tempData.centerName || 'Nashik');
        ussdBody.innerText = dict.selectSlot;
        break;

      case 'BOOK_QTY':
        ussdTitle.textContent = dict.enterQtyTitle;
        ussdBody.innerText = dict.enterQty;
        break;

      case 'BOOK_CONFIRM':
        ussdTitle.textContent = dict.confirmTitle;
        ussdBody.innerText = `Crop: ${state.tempData.crop}\nCenter: ${state.tempData.centerName}\nSlot: ${state.tempData.slotTime}\nDeclared: ${state.tempData.quantityKg} kg\n\n${dict.confirmPrompt}`;
        break;

      case 'BOOK_SUCCESS':
        const tok = state.activeBooking ? state.activeBooking.token_number : 'NSK-0231';
        ussdTitle.textContent = dict.successTitle;
        ussdBody.innerText = `Token: ${tok}\nCrop: ${state.tempData.crop}\nSlot: ${state.tempData.slotTime}\nQueue Pos: 1st in Window\nSMS sent to ${state.tempData.phone}\n\n0. Main Menu`;
        break;

      case 'STATUS_PROMPT':
        ussdTitle.textContent = dict.statusPromptTitle;
        ussdBody.innerText = dict.statusPromptBody;
        break;

      case 'STATUS_RESULT':
        showLoading('Querying Mandi Database...');
        const queryVal = (state.lookupQuery || state.activeToken || state.tempData.phone).trim();
        // Dynamic search in existing queue list
        const found = state.queueList.find(q => q.token.toLowerCase() === queryVal.toLowerCase() || q.phone.includes(queryVal));
        const statusRes = found || await window.agriqBackend.getBookingStatus(queryVal);
        showView('MENU');
        ussdTitle.textContent = `Status: ${statusRes.token || statusRes.token_number}`;
        ussdBody.innerText = `Token: ${statusRes.token || statusRes.token_number}\nCrop: ${statusRes.crop || 'Wheat'}\nStage: ${statusRes.status}\nQueue: 1st in Window\nTurnaround: ~15 mins\n\n0. Main Menu`;
        break;

      case 'RATES_MENU':
        ussdTitle.textContent = dict.ratesMenuTitle;
        ussdBody.innerText = dict.ratesMenu;
        break;

      case 'RATES_RESULT':
        showLoading('Reading APMC Cache...');
        const crop = state.tempData.crop || 'Wheat';
        const rate = MSP_RATES[crop] || 2425;
        const rateInfo = await window.agriqBackend.getMandiRates(crop);
        showView('MENU');
        ussdTitle.textContent = `${crop.toUpperCase()} MSP RATES`;
        ussdBody.innerText = `Govt MSP: â‚¹${rate}/Q\nForecast: ${rateInfo.forecast || 'Stable (+2%)'}\nOptimal Day: ${rateInfo.bestDay || 'Thursday'}\nDispatch: High price window\n\n0. Main Menu`;
        break;

      case 'LANG_MENU':
        ussdTitle.textContent = 'Change Language / à¤­à¤¾à¤·à¤¾:';
        ussdBody.innerText = `1. English\n2. à¤¹à¤¿à¤‚à¤¦à¥€ (Hindi)\n3. à¤®à¤°à¤¾à¤ à¥€ (Marathi)\n0. Back`;
        break;
    }
  }

  // Handle USSD Input with Real Dynamic Values
  async function handleMenuInput(input) {
    playTone(720, 'sine', 0.04);
    const val = input.trim();
    if (!val) return;

    const cur = state.currentMenu;

    // 0 = Go Back
    if (val === '0') {
      if (state.menuHistory.length > 0) {
        const prev = state.menuHistory.pop();
        renderMenu(prev || 'ROOT', false);
      } else {
        renderMenu('ROOT', false);
      }
      return;
    }

    // ROOT
    if (cur === 'ROOT') {
      if (val === '1') renderMenu('BOOK_CROP');
      else if (val === '2') renderMenu('STATUS_PROMPT');
      else if (val === '3') renderMenu('RATES_MENU');
      else if (val === '4') renderMenu('LANG_MENU');
      else flashError();
      return;
    }

    // CROP SELECTION
    if (cur === 'BOOK_CROP') {
      const crops = { '1': 'Wheat', '2': 'Onion', '3': 'Paddy', '4': 'Cotton' };
      if (crops[val]) {
        state.tempData.crop = crops[val];
        updateCalculatedWeights();
        renderMenu('BOOK_CENTER');
      } else {
        flashError();
      }
      return;
    }

    // CENTER SELECTION
    if (cur === 'BOOK_CENTER') {
      const centers = {
        '1': { id: 'c1-nsk', name: 'Nashik APMC Main' },
        '2': { id: 'c2-pun', name: 'Pune Central Mandi' },
        '3': { id: 'c3-nag', name: 'Nagpur Cotton Yard' }
      };
      if (centers[val]) {
        state.tempData.centerId = centers[val].id;
        state.tempData.centerName = centers[val].name;
        renderMenu('BOOK_SLOT');
      } else {
        flashError();
      }
      return;
    }

    // SLOT SELECTION
    if (cur === 'BOOK_SLOT') {
      const slots = {
        '1': { id: 's1', time: 'Tomorrow 08:00 AM' },
        '2': { id: 's2', time: 'Tomorrow 11:00 AM' },
        '3': { id: 's3', time: 'Tomorrow 02:00 PM' }
      };
      if (slots[val]) {
        state.tempData.slotId = slots[val].id;
        state.tempData.slotTime = slots[val].time;
        renderMenu('BOOK_QTY');
      } else {
        flashError();
      }
      return;
    }

    // REAL USER DECLARED QUANTITY
    if (cur === 'BOOK_QTY') {
      const qty = parseInt(val, 10);
      if (!isNaN(qty) && qty >= 50) {
        state.tempData.quantityKg = qty;
        inputGrossWeight.value = qty + 200;
        inputTareWeight.value = 200;
        updateCalculatedWeights();
        renderMenu('BOOK_CONFIRM');
      } else {
        flashError();
      }
      return;
    }

    // CONFIRM BOOKING
    if (cur === 'BOOK_CONFIRM') {
      if (val === '1') {
        showLoading('Allocating Token & Registering Slot...');
        const booking = await window.agriqBackend.createBooking({
          phone: state.tempData.phone,
          centerId: state.tempData.centerId,
          slotId: state.tempData.slotId,
          cropQuantityKg: state.tempData.quantityKg
        });

        state.activeBooking = booking;
        state.activeToken = booking.token_number;
        setActiveTokenDisplay(booking.token_number, booking.status);

        // Add to live queue table with EXACT user inputs
        state.queueList.unshift({
          token: booking.token_number,
          phone: state.tempData.phone,
          crop: state.tempData.crop,
          slot: state.tempData.slotTime,
          netWeight: state.tempData.quantityKg,
          status: 'BOOKED',
          grade: null
        });
        renderQueueTable();
        btnViewReceipt.disabled = false;

        // Dispatch Official SMS
        sendSimulatedSms({
          title: 'Official Mandi Slot Confirmed',
          message: `AgriQ: Token ${booking.token_number} allotted for ${state.tempData.crop} at ${state.tempData.centerName}. Scheduled Arrival: ${state.tempData.slotTime}. Declared Qty: ${state.tempData.quantityKg} kg.`,
          type: 'confirm'
        });

        showView('MENU');
        renderMenu('BOOK_SUCCESS');
      } else {
        renderMenu('ROOT');
      }
      return;
    }

    // STATUS LOOKUP (DYNAMIC QUERY)
    if (cur === 'STATUS_PROMPT') {
      state.lookupQuery = val;
      renderMenu('STATUS_RESULT');
      return;
    }

    // RATES SELECTION
    if (cur === 'RATES_MENU') {
      const crops = { '1': 'Wheat', '2': 'Onion', '3': 'Paddy', '4': 'Cotton' };
      if (crops[val]) {
        state.tempData.crop = crops[val];
        renderMenu('RATES_RESULT');
      } else {
        flashError();
      }
      return;
    }

    // LANGUAGE SWITCHER
    if (cur === 'LANG_MENU') {
      if (val === '1') state.tempData.language = 'en';
      else if (val === '2') state.tempData.language = 'hi';
      else if (val === '3') state.tempData.language = 'mr';
      else { flashError(); return; }

      const langNames = { en: 'English', hi: 'à¤¹à¤¿à¤‚à¤¦à¥€ (Hindi)', mr: 'à¤®à¤°à¤¾à¤ à¥€ (Marathi)' };
      sendSimulatedSms({
        title: 'Vernacular Preferences Updated',
        message: `AgriQ: Communication channel set to ${langNames[state.tempData.language]}. Official SMS alerts will be generated accordingly.`,
        type: 'status'
      });
      renderMenu('ROOT');
      return;
    }

    renderMenu('ROOT');
  }

  function flashError() {
    playErrorTone();
    const oldTitle = ussdTitle.textContent;
    ussdTitle.textContent = 'âš ï¸ Invalid Option / à¤…à¤®à¤¾à¤¨à¥à¤¯ à¤ªà¤°à¥à¤¯à¤¾à¤¯';
    setTimeout(() => { ussdTitle.textContent = oldTitle; }, 900);
  }

  function showLoading(msg = 'Processing...') {
    loadingText.textContent = msg;
    showView('LOADING');
  }

  // Keypad Handlers
  function handleKeyPress(key) {
    playTone(520 + Math.random() * 180, 'sine', 0.04);

    const btn = document.querySelector(`button[data-key="${key}"]`);
    if (btn) {
      btn.classList.add('active-key');
      setTimeout(() => btn.classList.remove('active-key'), 100);
    }

    if (state.mode === 'DIALING') {
      if (key === 'CLEAR' || key === 'END') {
        state.dialBuffer = state.dialBuffer.slice(0, -1);
        updateDialDisplay();
      } else if (key === 'CALL') {
        initiateUssdCall();
      } else {
        if (state.dialBuffer.length < 8) {
          state.dialBuffer += key;
          updateDialDisplay();
        }
      }
    } else if (state.mode === 'MENU') {
      if (key === 'CLEAR') {
        if (state.inputBuffer.length > 0) {
          state.inputBuffer = state.inputBuffer.slice(0, -1);
          updateInputDisplay();
        } else {
          handleMenuInput('0');
        }
      } else if (key === 'END') {
        showView('DIALING');
      } else if (key === 'CALL' || key === 'OK') {
        handleMenuInput(state.inputBuffer);
      } else {
        if (state.inputBuffer.length < 15) {
          state.inputBuffer += key;
          updateInputDisplay();
        }
      }
    }
  }

  function initiateUssdCall() {
    const dialed = state.dialBuffer.trim();
    if (dialed === '*99#' || dialed === '*123#' || dialed === '*99*1#') {
      showLoading('Dialing ' + dialed + '...');
      setTimeout(() => {
        showView('MENU');
        renderMenu('ROOT');
      }, 500);
    } else {
      playErrorTone();
      showLoading('Invalid MMI Shortcode');
      setTimeout(() => showView('DIALING'), 900);
    }
  }

  // Physical Keypad Click Listeners
  document.querySelectorAll('.num-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      handleKeyPress(key);
    });
  });

  document.getElementById('btn-soft-left').addEventListener('click', () => {
    if (state.mode === 'DIALING') handleKeyPress('CALL');
    else if (state.mode === 'MENU') handleKeyPress('CALL');
  });

  document.getElementById('btn-soft-right').addEventListener('click', () => {
    if (state.mode === 'DIALING') handleKeyPress('CLEAR');
    else if (state.mode === 'MENU') handleKeyPress('CLEAR');
  });

  document.getElementById('btn-ok').addEventListener('click', () => {
    if (state.mode === 'DIALING') handleKeyPress('CALL');
    else if (state.mode === 'MENU') handleKeyPress('CALL');
  });

  // Physical Computer Keyboard Listener
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    let k = e.key;
    if (k.startsWith('Numpad')) k = k.replace('Numpad', '');

    if (['0','1','2','3','4','5','6','7','8','9','*','#'].includes(k)) {
      handleKeyPress(k);
    } else if (e.key === 'Enter') {
      handleKeyPress('CALL');
    } else if (e.key === 'Backspace') {
      handleKeyPress('CLEAR');
    } else if (e.key === 'Escape') {
      handleKeyPress('END');
    }
  });

  // SMS Dispatcher
  function sendSimulatedSms({ title, message, type = 'status' }) {
    playSmsChime();
    const sms = {
      id: 'sms_' + Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    state.smsList.unshift(sms);
    renderSmsFeed();
  }

  function renderSmsFeed() {
    smsCountBadge.textContent = `${state.smsList.length} Messages`;
    if (state.smsList.length === 0) {
      smsMessages.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">ðŸ“­</span>
          <p>Inbox is currently empty.</p>
          <small>Dial <b>*99#</b> or book a slot to receive official procurement alerts.</small>
        </div>`;
      return;
    }

    smsMessages.innerHTML = state.smsList.map(item => `
      <div class="sms-bubble alert-${item.type}">
        <div style="font-weight:600; color:#38bdf8; margin-bottom:0.25rem;">${item.title}</div>
        <div>${item.message}</div>
        <div class="sms-meta">
          <span>Sender: AG-AGRIQ</span>
          <span>${item.time}</span>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('clear-sms-btn').addEventListener('click', () => {
    state.smsList = [];
    renderSmsFeed();
  });

  // Farmer phone updater
  document.getElementById('update-phone-btn').addEventListener('click', () => {
    const val = farmerPhoneInput.value.trim();
    if (val.length === 10) {
      state.tempData.phone = val;
      updateInspector();
      sendSimulatedSms({
        title: 'Device Registered with APMC',
        message: `AgriQ: Mobile number +91-${val} verified with Mandi Procurement Central Portal.`,
        type: 'confirm'
      });
    }
  });

  // Active Token Status Display
  function setActiveTokenDisplay(token, status) {
    state.activeToken = token;
    demoTokenDisplay.textContent = token;
    demoStatusDisplay.textContent = status;
    demoStatusDisplay.className = `status-pill status-${status.toLowerCase()}`;

    // Update queue table
    const item = state.queueList.find(q => q.token === token);
    if (item) {
      item.status = status;
      renderQueueTable(queueSearchInput.value);
    }

    // Enable/disable checkpoint progression buttons
    btnSimCheckin.disabled = (status !== 'BOOKED');
    btnSimWeigh.disabled = (status !== 'CHECKED_IN');
    btnSimQuality.disabled = (status !== 'WEIGHED');
    btnSimPayment.disabled = (status !== 'QUALITY_APPROVED');
    btnSimComplete.disabled = (status !== 'PAYMENT_INITIATED');
  }

  // 1. Check-In Action
  async function performCheckin() {
    if (!state.activeToken) return;
    const gate = inputGateNo.value.trim() || 'Gate #1';
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'CHECKED_IN');
    setActiveTokenDisplay(state.activeToken, 'CHECKED_IN');
    sendSimulatedSms({
      title: 'Gate Entry Passed',
      message: `AgriQ Alert: Token ${state.activeToken} verified at ${gate}. Physical gate entry permitted. Proceed to Weighbridge Platform.`,
      type: 'status'
    });
  }

  // 2. Weighbridge Action (Using REAL User Inputs)
  async function performWeigh() {
    if (!state.activeToken) return;
    const { net, quintals } = updateCalculatedWeights();
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'WEIGHED');
    
    // Save net weight to queue item
    const item = state.queueList.find(q => q.token === state.activeToken);
    if (item) item.netWeight = net;

    setActiveTokenDisplay(state.activeToken, 'WEIGHED');
    sendSimulatedSms({
      title: 'Weighbridge Recorded',
      message: `AgriQ Scale Certificate: Token ${state.activeToken}. Gross: ${inputGrossWeight.value} kg, Tare: ${inputTareWeight.value} kg. Certified Net Produce: ${net} kg (${quintals} Quintals). Proceed to Quality Assayer.`,
      type: 'status'
    });
  }

  // 3. Quality Assayer Action (Using REAL User Inputs)
  async function performQuality() {
    if (!state.activeToken) return;
    const grade = selectQualityGrade.value;
    const moisture = inputMoisture.value;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'QUALITY_APPROVED');
    
    const item = state.queueList.find(q => q.token === state.activeToken);
    if (item) item.grade = grade;

    setActiveTokenDisplay(state.activeToken, 'QUALITY_APPROVED');
    sendSimulatedSms({
      title: 'Quality Assessment Certified',
      message: `AgriQ Quality Lab: Token ${state.activeToken} certified as ${grade} (Moisture: ${moisture}%). Approved for Government MSP Procurement.`,
      type: 'status'
    });
  }

  // 4. DBT Payment Action (Using REAL User Calculations)
  async function performPayment() {
    if (!state.activeToken) return;
    const { net, totalAmt, rate } = updateCalculatedWeights();
    const ref = 'DBT' + Math.floor(1000000 + Math.random() * 9000000);
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'PAYMENT_INITIATED');
    setActiveTokenDisplay(state.activeToken, 'PAYMENT_INITIATED');
    sendSimulatedSms({
      title: 'Direct Benefit Transfer (DBT) Disbursed',
      message: `PFMS Government DBT: â‚¹${parseFloat(totalAmt).toLocaleString('en-IN')} initiated for ${net} kg @ â‚¹${rate}/Q (Token ${state.activeToken}) to linked bank account. Reference: ${ref}.`,
      type: 'payment'
    });
  }

  // 5. Complete Action
  async function performComplete() {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'COMPLETED');
    setActiveTokenDisplay(state.activeToken, 'COMPLETED');
    sendSimulatedSms({
      title: 'Procurement Transaction Completed',
      message: `AgriQ: Procurement for Token ${state.activeToken} is COMPLETED. Turnaround time: 38 mins. Gate exit pass authorized.`,
      type: 'confirm'
    });
  }

  btnSimCheckin.addEventListener('click', performCheckin);
  btnSimWeigh.addEventListener('click', performWeigh);
  btnSimQuality.addEventListener('click', performQuality);
  btnSimPayment.addEventListener('click', performPayment);
  btnSimComplete.addEventListener('click', performComplete);

  // Modal: Gate Pass Receipt
  btnViewReceipt.addEventListener('click', () => {
    if (!state.activeToken) return;
    const item = state.queueList.find(q => q.token === state.activeToken);
    receiptTokenVal.textContent = state.activeToken;
    receiptPhone.textContent = '+91-' + (item?.phone || state.tempData.phone);
    receiptCenter.textContent = state.tempData.centerName || 'Nashik APMC Main Yard';
    receiptCrop.textContent = (item?.crop || state.tempData.crop || 'Wheat') + ' (Grade-A)';
    receiptSlot.textContent = (item?.slot || state.tempData.slotTime || 'Tomorrow 08:00 AM') + ' - 10:00 AM';
    
    const w = item?.netWeight || state.tempData.quantityKg || 1450;
    receiptQty.textContent = `${w.toLocaleString()} kg (${(w / 100).toFixed(1)} Quintals)`;
    receiptModal.classList.remove('hidden');
  });

  closeReceiptBtn.addEventListener('click', () => receiptModal.classList.add('hidden'));
  printReceiptBtn.addEventListener('click', () => window.print());

  // Quick Action Buttons
  async function performQuickBooking() {
    showLoading('Allocating Quick Demo Token...');
    const booking = await window.agriqBackend.createBooking({
      phone: state.tempData.phone,
      centerId: 'c1-nsk',
      slotId: 's1',
      cropQuantityKg: 1450
    });
    state.tempData.crop = 'Wheat';
    state.tempData.centerName = 'Nashik APMC Main';
    state.tempData.slotTime = 'Tomorrow 08:00 AM';
    state.activeBooking = booking;
    state.activeToken = booking.token_number;
    inputGrossWeight.value = 1650;
    inputTareWeight.value = 200;
    updateCalculatedWeights();
    setActiveTokenDisplay(booking.token_number, booking.status);

    state.queueList.unshift({
      token: booking.token_number,
      phone: state.tempData.phone,
      crop: 'Wheat',
      slot: 'Tomorrow 08:00 AM',
      netWeight: 1450,
      status: 'BOOKED',
      grade: null
    });
    renderQueueTable();
    btnViewReceipt.disabled = false;

    sendSimulatedSms({
      title: 'Official Mandi Slot Confirmed',
      message: `AgriQ: Token ${booking.token_number} allotted for Wheat at Nashik APMC. Scheduled Arrival: Tomorrow 08:00 AM. Declared Qty: 1,450 kg.`,
      type: 'confirm'
    });

    showView('MENU');
    renderMenu('BOOK_SUCCESS');
  }

  btnQuickBook.addEventListener('click', performQuickBooking);

  // Robust Auto Run Cycle
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  btnQuickCycle.addEventListener('click', async () => {
    btnQuickCycle.disabled = true;
    btnQuickCycle.textContent = 'â³ Simulating...';
    try {
      if (!state.activeToken) await performQuickBooking();
      await sleep(600);
      await performCheckin();
      await sleep(1300);
      await performWeigh();
      await sleep(1300);
      await performQuality();
      await sleep(1300);
      await performPayment();
      await sleep(1300);
      await performComplete();
    } finally {
      btnQuickCycle.disabled = false;
      btnQuickCycle.textContent = 'â–¶ Auto-Simulate Full Cycle';
    }
  });

  btnQuickRates.addEventListener('click', () => {
    state.dialBuffer = '*99#';
    showView('MENU');
    state.tempData.crop = 'Wheat';
    renderMenu('RATES_RESULT');
  });

  btnQuickReset.addEventListener('click', () => {
    state.activeToken = null;
    state.activeBooking = null;
    state.smsList = [];
    state.dialBuffer = '*99#';
    state.inputBuffer = '';
    demoTokenDisplay.textContent = 'None Selected';
    demoStatusDisplay.textContent = 'IDLE';
    demoStatusDisplay.className = 'status-pill status-booked';
    btnSimCheckin.disabled = true;
    btnSimWeigh.disabled = true;
    btnSimQuality.disabled = true;
    btnSimPayment.disabled = true;
    btnSimComplete.disabled = true;
    btnViewReceipt.disabled = true;
    state.queueList = [
      { token: 'NSK-0198', phone: '9822019283', crop: 'Wheat', slot: '08:00 AM', netWeight: 1850, status: 'WEIGHED', grade: 'GRADE-A' },
      { token: 'NSK-0215', phone: '9765432190', crop: 'Onion', slot: '08:30 AM', netWeight: 2200, status: 'CHECKED_IN', grade: 'GRADE-B' },
      { token: 'NSK-0220', phone: '9921873461', crop: 'Wheat', slot: '09:00 AM', netWeight: 1400, status: 'BOOKED', grade: null }
    ];
    renderQueueTable();
    renderSmsFeed();
    showView('DIALING');
    renderMenu('ROOT');
  });

  // Supabase Config
  const toggleConfigBtn = document.getElementById('toggle-config-btn');
  const closeConfigBtn = document.getElementById('close-config-btn');
  const configDrawer = document.getElementById('config-drawer');
  const saveConfigBtn = document.getElementById('save-config-btn');
  const resetConfigBtn = document.getElementById('reset-config-btn');
  const supabaseUrlInput = document.getElementById('supabase-url');
  const supabaseKeyInput = document.getElementById('supabase-key');

  toggleConfigBtn.addEventListener('click', () => configDrawer.classList.toggle('hidden'));
  closeConfigBtn.addEventListener('click', () => configDrawer.classList.add('hidden'));

  saveConfigBtn.addEventListener('click', () => {
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();
    if (window.agriqBackend.setCredentials(url, key)) {
      connectionStatus.textContent = 'Channel: Central PostgreSQL Live ðŸŸ¢';
      pulseDot.style.backgroundColor = '#10b981';
      configDrawer.classList.add('hidden');
      alert('Connected to Supabase Central Database successfully!');
      
      window.agriqBackend.subscribeToBookings((updatedRecord) => {
        if (state.activeToken && updatedRecord.token_number === state.activeToken) {
          setActiveTokenDisplay(updatedRecord.token_number, updatedRecord.status);
          sendSimulatedSms({
            title: `Mandi Status Update: ${updatedRecord.status}`,
            message: `AgriQ Alert: Token ${updatedRecord.token_number} transitioned to ${updatedRecord.status} by Officer Desk.`,
            type: 'status'
          });
        }
      });
    }
  });

  resetConfigBtn.addEventListener('click', () => {
    window.agriqBackend.clearCredentials();
    connectionStatus.textContent = 'Channel: BSNL / MTNL 2G Signaling (Active)';
    configDrawer.classList.add('hidden');
  });

  // Initial Boot
  showView('DIALING');
  renderQueueTable();
  updateCalculatedWeights();

  // Pre-select first token
  if (state.queueList.length > 0) {
    selectTokenForOperations(state.queueList[0].token);
  }

})();

/**
 * AgriQ USSD Application & SMS Simulator Engine (P4 - Bulletproof v4)
 * Team: Runtime-Terror | SIH 2026 | PS 26032
 */

(function () {
  // DOM Elements
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
  const guideToggleBtn = document.getElementById('guide-toggle-btn');
  const demoGuidePanel = document.getElementById('demo-guide-panel');
  const currentLangTag = document.getElementById('current-lang-tag');
  
  // Inspector & Demo DOM
  const inspectSessionId = document.getElementById('inspect-session-id');
  const inspectMenuLevel = document.getElementById('inspect-menu-level');
  const inspectTempData = document.getElementById('inspect-temp-data');
  const demoTokenDisplay = document.getElementById('demo-token-display');
  const demoStatusDisplay = document.getElementById('demo-status-display');
  const connectionStatus = document.getElementById('connection-status');
  const pulseDot = document.getElementById('pulse-dot');
  const mandiQueueTbody = document.getElementById('mandi-queue-tbody');
  
  // Officer Demo Buttons
  const btnSimCheckin = document.getElementById('btn-sim-checkin');
  const btnSimWeigh = document.getElementById('btn-sim-weigh');
  const btnSimQuality = document.getElementById('btn-sim-quality');
  const btnSimPayment = document.getElementById('btn-sim-payment');
  const btnSimComplete = document.getElementById('btn-sim-complete');

  // Quick Preset Buttons
  const btnQuickBook = document.getElementById('btn-quick-book');
  const btnQuickCycle = document.getElementById('btn-quick-cycle');
  const btnQuickRates = document.getElementById('btn-quick-rates');
  const btnQuickReset = document.getElementById('btn-quick-reset');
  const btnViewReceipt = document.getElementById('btn-view-receipt');

  // Receipt Modal DOM
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

  // Application State
  const state = {
    mode: 'DIALING', // 'DIALING' | 'MENU' | 'LOADING'
    dialBuffer: '*99#',
    inputBuffer: '',
    currentMenu: 'ROOT',
    menuHistory: ['ROOT'],
    sessionId: 'sess_' + Math.random().toString(36).substr(2, 8),
    tempData: {
      phone: '9876543210',
      crop: null,
      centerId: null,
      centerName: null,
      slotId: null,
      slotTime: null,
      quantityKg: 1450,
      language: 'en'
    },
    activeToken: null,
    activeBooking: null,
    smsList: [],
    queueList: [
      { token: 'NSK-0198', phone: '9822019283', crop: 'Wheat', slot: '08:00 AM', status: 'WEIGHED' },
      { token: 'NSK-0215', phone: '9765432190', crop: 'Onion', slot: '08:30 AM', status: 'CHECKED_IN' },
      { token: 'NSK-0220', phone: '9921873461', crop: 'Wheat', slot: '09:00 AM', status: 'BOOKED' }
    ]
  };

  // Multilingual Text Dictionary
  const I18N = {
    en: {
      langName: 'Language: English',
      rootTitle: 'AgriQ Mandi Seva (*99#)',
      rootBody: '1. Book Mandi Slot<br>2. Check Token Status<br>3. Mandi Rates & Forecast<br>4. Change Language',
      selectCropTitle: 'Select Commodity:',
      selectCrop: '1. Wheat (à¤—à¥‡à¤¹à¥‚à¤‚)<br>2. Onion (à¤ªà¥à¤¯à¤¾à¤œ)<br>3. Paddy (à¤§à¤¾à¤¨)<br>4. Cotton (à¤•à¤ªà¤¾à¤¸)<br>0. Back',
      selectCenterTitle: 'Select Mandi Center:',
      selectCenter: '1. Nashik APMC Main<br>2. Pune Central Mandi<br>3. Nagpur Cotton Yard<br>0. Back',
      selectSlotTitle: 'Available Slots: ',
      selectSlot: '1. Tomorrow 08:00 AM (15 left)<br>2. Tomorrow 11:00 AM (12 left)<br>3. Tomorrow 02:00 PM (8 left)<br>0. Back',
      enterQtyTitle: 'Approx Quantity (kg):',
      enterQty: 'Enter weight in kg<br>(e.g. type 1450 for 14.5 Q)<br><br>0. Back',
      confirmTitle: 'Confirm Mandi Slot:',
      confirmPrompt: '1. Confirm Booking<br>2. Cancel',
      successTitle: 'âœ… Token Booked!',
      statusPromptTitle: 'Check Token Status:',
      statusPromptBody: 'Enter Token # or Phone:<br>(e.g. NSK-4821)<br><br>1. Check latest token<br>0. Back',
      ratesMenuTitle: 'Mandi Rates & Forecast:',
      ratesMenu: '1. Wheat<br>2. Onion<br>3. Paddy<br>4. Cotton<br>0. Back'
    },
    hi: {
      langName: 'à¤­à¤¾à¤·à¤¾: à¤¹à¤¿à¤‚à¤¦à¥€',
      rootTitle: 'à¤à¤—à¥à¤°à¥€-à¤•à¥à¤¯à¥‚ à¤®à¤‚à¤¡à¥€ à¤¸à¥‡à¤µà¤¾ (*99#)',
      rootBody: '1. à¤Ÿà¥‹à¤•à¤¨/à¤¸à¥à¤²à¥‰à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚<br>2. à¤Ÿà¥‹à¤•à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¤¿ à¤œà¤¾à¤‚à¤šà¥‡à¤‚<br>3. à¤®à¤‚à¤¡à¥€ à¤­à¤¾à¤µ à¤”à¤° à¤ªà¥‚à¤°à¥à¤µà¤¾à¤¨à¥à¤®à¤¾à¤¨<br>4. à¤­à¤¾à¤·à¤¾ à¤¬à¤¦à¤²à¥‡à¤‚',
      selectCropTitle: 'à¤«à¤¸à¤² à¤šà¥à¤¨à¥‡à¤‚:',
      selectCrop: '1. à¤—à¥‡à¤¹à¥‚à¤‚ (Wheat)<br>2. à¤ªà¥à¤¯à¤¾à¤œ (Onion)<br>3. à¤§à¤¾à¤¨ (Paddy)<br>4. à¤•à¤ªà¤¾à¤¸ (Cotton)<br>0. à¤µà¤¾à¤ªà¤¸',
      selectCenterTitle: 'à¤®à¤‚à¤¡à¥€ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤šà¥à¤¨à¥‡à¤‚:',
      selectCenter: '1. à¤¨à¤¾à¤¸à¤¿à¤• à¤à¤ªà¥€à¤à¤®à¤¸à¥€ à¤®à¥à¤–à¥à¤¯<br>2. à¤ªà¥à¤£à¥‡ à¤¸à¥‡à¤‚à¤Ÿà¥à¤°à¤² à¤®à¤‚à¤¡à¥€<br>3. à¤¨à¤¾à¤—à¤ªà¥à¤° à¤¯à¤¾à¤°à¥à¤¡<br>0. à¤µà¤¾à¤ªà¤¸',
      selectSlotTitle: 'à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¸à¥à¤²à¥‰à¤Ÿ: ',
      selectSlot: '1. à¤•à¤² à¤¸à¥à¤¬à¤¹ 08:00 (15 à¤¶à¥‡à¤·)<br>2. à¤•à¤² à¤¸à¥à¤¬à¤¹ 11:00 (12 à¤¶à¥‡à¤·)<br>3. à¤•à¤² à¤¦à¥‹à¤ªà¤¹à¤° 02:00 (8 à¤¶à¥‡à¤·)<br>0. à¤µà¤¾à¤ªà¤¸',
      enterQtyTitle: 'à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤µà¤œà¤¨ (à¤•à¤¿à¤²à¥‹):',
      enterQty: 'à¤µà¤œà¤¨ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚ (à¤‰à¤¦à¤¾. 1450)<br><br>0. à¤µà¤¾à¤ªà¤¸',
      confirmTitle: 'à¤¸à¥à¤²à¥‰à¤Ÿ à¤ªà¥à¤·à¥à¤Ÿà¤¿:',
      confirmPrompt: '1. à¤¸à¥à¤²à¥‰à¤Ÿ à¤ªà¤•à¥à¤•à¤¾ à¤•à¤°à¥‡à¤‚<br>2. à¤°à¤¦à¥à¤¦ à¤•à¤°à¥‡à¤‚',
      successTitle: 'âœ… à¤Ÿà¥‹à¤•à¤¨ à¤¬à¥à¤• à¤¹à¥‹ à¤—à¤¯à¤¾!',
      statusPromptTitle: 'à¤Ÿà¥‹à¤•à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¤¿ à¤œà¤¾à¤‚à¤šà¥‡à¤‚:',
      statusPromptBody: 'à¤Ÿà¥‹à¤•à¤¨ à¤¨à¤‚à¤¬à¤° à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚:<br>(à¤‰à¤¦à¤¾. NSK-4821)<br><br>1. à¤¹à¤¾à¤²à¤¿à¤¯à¤¾ à¤Ÿà¥‹à¤•à¤¨ à¤œà¤¾à¤‚à¤šà¥‡à¤‚<br>0. à¤µà¤¾à¤ªà¤¸',
      ratesMenuTitle: 'à¤®à¤‚à¤¡à¥€ à¤­à¤¾à¤µ à¤µ à¤¸à¤²à¤¾à¤¹:',
      ratesMenu: '1. à¤—à¥‡à¤¹à¥‚à¤‚ (Wheat)<br>2. à¤ªà¥à¤¯à¤¾à¤œ (Onion)<br>3. à¤§à¤¾à¤¨ (Paddy)<br>4. à¤•à¤ªà¤¾à¤¸ (Cotton)<br>0. à¤µà¤¾à¤ªà¤¸'
    },
    mr: {
      langName: 'à¤­à¤¾à¤·à¤¾: à¤®à¤°à¤¾à¤ à¥€',
      rootTitle: 'à¤…â€à¥…à¤—à¥à¤°à¥€-à¤•à¥à¤¯à¥‚ à¤•à¥ƒà¤·à¥€ à¤¬à¤¾à¤œà¤¾à¤° (*99#)',
      rootBody: '1. à¤¸à¥à¤²à¥‰à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¤¾<br>2. à¤Ÿà¥‹à¤•à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¥€ à¤¤à¤ªà¤¾à¤¸à¤¾<br>3. à¤¬à¤¾à¤œà¤¾à¤° à¤­à¤¾à¤µ à¤µ à¤…à¤‚à¤¦à¤¾à¤œ<br>4. à¤­à¤¾à¤·à¤¾ à¤¬à¤¦à¤²à¤¾',
      selectCropTitle: 'à¤ªà¥€à¤• à¤¨à¤¿à¤µà¤¡à¤¾:',
      selectCrop: '1. à¤—à¤¹à¥‚ (Wheat)<br>2. à¤•à¤¾à¤‚à¤¦à¤¾ (Onion)<br>3. à¤­à¤¾à¤¤ (Paddy)<br>4. à¤•à¤¾à¤ªà¥‚à¤¸ (Cotton)<br>0. à¤®à¤¾à¤—à¥‡',
      selectCenterTitle: 'à¤¬à¤¾à¤œà¤¾à¤° à¤¸à¤®à¤¿à¤¤à¥€ à¤¨à¤¿à¤µà¤¡à¤¾:',
      selectCenter: '1. à¤¨à¤¾à¤¶à¤¿à¤• à¤à¤ªà¥€à¤à¤®à¤¸à¥€ à¤®à¥à¤–à¥à¤¯<br>2. à¤ªà¥à¤£à¥‡ à¤®à¥à¤–à¥à¤¯ à¤¬à¤¾à¤œà¤¾à¤°<br>3. à¤¨à¤¾à¤—à¤ªà¥‚à¤° à¤¯à¤¾à¤°à¥à¤¡<br>0. à¤®à¤¾à¤—à¥‡',
      selectSlotTitle: 'à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤µà¥‡à¤³: ',
      selectSlot: '1. à¤‰à¤¦à¥à¤¯à¤¾ à¤¸à¤•à¤¾à¤³à¥€ 08:00 (15 à¤¶à¤¿à¤²à¥à¤²à¤•)<br>2. à¤‰à¤¦à¥à¤¯à¤¾ à¤¸à¤•à¤¾à¤³à¥€ 11:00 (12 à¤¶à¤¿à¤²à¥à¤²à¤•)<br>3. à¤‰à¤¦à¥à¤¯à¤¾ à¤¦à¥à¤ªà¤¾à¤°à¥€ 02:00 (8 à¤¶à¤¿à¤²à¥à¤²à¤•)<br>0. à¤®à¤¾à¤—à¥‡',
      enterQtyTitle: 'à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤µà¤œà¤¨ (à¤•à¤¿à¤²à¥‹):',
      enterQty: 'à¤µà¤œà¤¨ à¤Ÿà¤¾à¤•à¤¾ (à¤‰à¤¦à¤¾. 1450)<br><br>0. à¤®à¤¾à¤—à¥‡',
      confirmTitle: 'à¤¬à¥à¤•à¤¿à¤‚à¤— à¤–à¤¾à¤¤à¥à¤°à¥€:',
      confirmPrompt: '1. à¤¸à¥à¤²à¥‰à¤Ÿ à¤¨à¤¿à¤¶à¥à¤šà¤¿à¤¤ à¤•à¤°à¤¾<br>2. à¤°à¤¦à¥à¤¦ à¤•à¤°à¤¾',
      successTitle: 'âœ… à¤Ÿà¥‹à¤•à¤¨ à¤¬à¥à¤• à¤à¤¾à¤²à¥‡!',
      statusPromptTitle: 'à¤Ÿà¥‹à¤•à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¥€ à¤¤à¤ªà¤¾à¤¸à¤¾:',
      statusPromptBody: 'à¤Ÿà¥‹à¤•à¤¨ à¤•à¥à¤°à¤®à¤¾à¤‚à¤• à¤Ÿà¤¾à¤•à¤¾:<br>(à¤‰à¤¦à¤¾. NSK-4821)<br><br>1. à¤šà¤¾à¤²à¥‚ à¤Ÿà¥‹à¤•à¤¨ à¤¤à¤ªà¤¾à¤¸à¤¾<br>0. à¤®à¤¾à¤—à¥‡',
      ratesMenuTitle: 'à¤¬à¤¾à¤œà¤¾à¤° à¤­à¤¾à¤µ à¤µ à¤¶à¤¿à¤«à¤¾à¤°à¤¸:',
      ratesMenu: '1. à¤—à¤¹à¥‚ (Wheat)<br>2. à¤•à¤¾à¤‚à¤¦à¤¾ (Onion)<br>3. à¤­à¤¾à¤¤ (Paddy)<br>4. à¤•à¤¾à¤ªà¥‚à¤¸ (Cotton)<br>0. à¤®à¤¾à¤—à¥‡'
    }
  };

  // Clock
  function updateClock() {
    const clockEl = document.getElementById('screen-clock');
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Audio Engine
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 600, type = 'sine', duration = 0.04) {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
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
    soundToggleBtn.textContent = soundEnabled ? 'ðŸ”Š Sound: ON' : 'ðŸ”‡ Sound: OFF';
    soundToggleBtn.style.color = soundEnabled ? '#10b981' : '#94a3b8';
  });

  guideToggleBtn.addEventListener('click', () => {
    demoGuidePanel.classList.toggle('hidden');
    guideToggleBtn.classList.toggle('active');
  });

  // Render Mandi Queue Desk Table
  function renderQueueTable() {
    mandiQueueTbody.innerHTML = state.queueList.map(item => {
      const isCurrent = state.activeToken === item.token;
      return `
        <tr class="${isCurrent ? 'highlight-row' : ''}">
          <td><strong>${item.token}</strong></td>
          <td>+91-${item.phone.slice(-4)}</td>
          <td>${item.crop}</td>
          <td>${item.slot}</td>
          <td><span class="table-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
        </tr>
      `;
    }).join('');
  }
  renderQueueTable();

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
    inspectSessionId.textContent = state.sessionId;
    inspectMenuLevel.textContent = state.currentMenu;
    inspectTempData.textContent = JSON.stringify(state.tempData, null, 2);
    currentLangTag.textContent = I18N[state.tempData.language]?.langName || 'Language: English';
  }

  // USSD Menu State Machine
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
        ussdBody.innerHTML = dict.rootBody;
        break;

      case 'BOOK_CROP':
        ussdTitle.textContent = dict.selectCropTitle;
        ussdBody.innerHTML = dict.selectCrop;
        break;

      case 'BOOK_CENTER':
        ussdTitle.textContent = dict.selectCenterTitle;
        ussdBody.innerHTML = dict.selectCenter;
        break;

      case 'BOOK_SLOT':
        ussdTitle.textContent = dict.selectSlotTitle + (state.tempData.centerName || 'Nashik');
        ussdBody.innerHTML = dict.selectSlot;
        break;

      case 'BOOK_QTY':
        ussdTitle.textContent = dict.enterQtyTitle;
        ussdBody.innerHTML = dict.enterQty;
        break;

      case 'BOOK_CONFIRM':
        ussdTitle.textContent = dict.confirmTitle;
        ussdBody.innerHTML = `Crop: <b>${state.tempData.crop || 'Wheat'}</b><br>Center: ${state.tempData.centerName || 'Nashik APMC'}<br>Slot: ${state.tempData.slotTime || '08:00 AM'}<br>Qty: ${state.tempData.quantityKg} kg<br><br>${dict.confirmPrompt}`;
        break;

      case 'BOOK_SUCCESS':
        const tok = state.activeBooking ? state.activeBooking.token_number : 'NSK-0231';
        ussdTitle.textContent = dict.successTitle;
        ussdBody.innerHTML = `Token: <b>${tok}</b><br>Slot: ${state.tempData.slotTime || 'Tomorrow 08:00 AM'}<br>Queue Pos: 1st in Window<br>Est Wait: ~15 mins<br>SMS sent to ${state.tempData.phone}<br><br>0. Main Menu`;
        break;

      case 'STATUS_PROMPT':
        ussdTitle.textContent = dict.statusPromptTitle;
        ussdBody.innerHTML = dict.statusPromptBody;
        break;

      case 'STATUS_RESULT':
        showLoading('Querying Mandi Database...');
        const queryVal = state.activeToken || state.tempData.phone;
        const statusRes = await window.agriqBackend.getBookingStatus(queryVal);
        showView('MENU');
        ussdTitle.textContent = `Status: ${statusRes.token_number}`;
        ussdBody.innerHTML = `Token: <b>${statusRes.token_number}</b><br>Stage: <span style="color:#004400"><b>${statusRes.status}</b></span><br>Queue Position: ${statusRes.queue_position || 1}<br>Est Wait: ${statusRes.predicted_wait_mins || 15} mins<br><br>0. Main Menu`;
        break;

      case 'RATES_MENU':
        ussdTitle.textContent = dict.ratesMenuTitle;
        ussdBody.innerHTML = dict.ratesMenu;
        break;

      case 'RATES_RESULT':
        showLoading('Reading Forecast Cache (P5)...');
        const rateInfo = await window.agriqBackend.getMandiRates(state.tempData.crop);
        showView('MENU');
        ussdTitle.textContent = `Rates: ${state.tempData.crop.toUpperCase()}`;
        ussdBody.innerHTML = `Current: <b>${rateInfo.rate}</b><br>Trend: ${rateInfo.forecast}<br>Best Day: <b>${rateInfo.bestDay}</b><br>Score: ${rateInfo.reason}<br><br>0. Main Menu`;
        break;

      case 'LANG_MENU':
        ussdTitle.textContent = 'Change Language / à¤­à¤¾à¤·à¤¾:';
        ussdBody.innerHTML = `1. English<br>2. à¤¹à¤¿à¤‚à¤¦à¥€ (Hindi)<br>3. à¤®à¤°à¤¾à¤ à¥€ (Marathi)<br>0. Back`;
        break;
    }
  }

  // Handle USSD Input
  async function handleMenuInput(input) {
    playTone(720, 'sine', 0.04);
    const val = input.trim();
    if (!val) return;

    const cur = state.currentMenu;

    // 0 = Go Back (Hierarchical Navigation)
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
      else {
        flashError();
      }
      return;
    }

    // BOOK CROP
    if (cur === 'BOOK_CROP') {
      const crops = { '1': 'Wheat', '2': 'Onion', '3': 'Paddy', '4': 'Cotton' };
      if (crops[val]) {
        state.tempData.crop = crops[val];
        renderMenu('BOOK_CENTER');
      } else {
        flashError();
      }
      return;
    }

    // BOOK CENTER
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

    // BOOK SLOT
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

    // BOOK QTY
    if (cur === 'BOOK_QTY') {
      const qty = parseInt(val, 10);
      if (!isNaN(qty) && qty > 0) {
        state.tempData.quantityKg = qty;
        renderMenu('BOOK_CONFIRM');
      } else {
        flashError();
      }
      return;
    }

    // BOOK CONFIRM
    if (cur === 'BOOK_CONFIRM') {
      if (val === '1') {
        showLoading('Allocating Token & Queue Position...');
        const booking = await window.agriqBackend.createBooking({
          phone: state.tempData.phone,
          centerId: state.tempData.centerId || 'c1-nsk',
          slotId: state.tempData.slotId || 's1',
          cropQuantityKg: state.tempData.quantityKg
        });

        state.activeBooking = booking;
        state.activeToken = booking.token_number;
        setActiveTokenDisplay(booking.token_number, booking.status);

        // Add to live queue table at top
        state.queueList.unshift({
          token: booking.token_number,
          phone: state.tempData.phone,
          crop: state.tempData.crop || 'Wheat',
          slot: state.tempData.slotTime || 'Tomorrow 08:00 AM',
          status: 'BOOKED'
        });
        renderQueueTable();
        btnViewReceipt.disabled = false;

        // Fire SMS
        sendSimulatedSms({
          title: 'Booking Confirmed',
          message: `AgriQ: Token ${booking.token_number} confirmed for ${state.tempData.crop || 'Wheat'} at ${state.tempData.centerName || 'Nashik APMC'}. Slot: ${state.tempData.slotTime || 'Tomorrow 08:00 AM'}. Arrive 15 min early.`,
          type: 'confirm'
        });

        showView('MENU');
        renderMenu('BOOK_SUCCESS');
      } else {
        renderMenu('ROOT');
      }
      return;
    }

    // STATUS LOOKUP
    if (cur === 'STATUS_PROMPT') {
      if (val === '1' || val.length >= 3) {
        renderMenu('STATUS_RESULT');
      } else {
        flashError();
      }
      return;
    }

    // RATES MENU
    if (cur === 'RATES_MENU') {
      const crops = { '1': 'wheat', '2': 'onion', '3': 'paddy', '4': 'cotton' };
      if (crops[val]) {
        state.tempData.crop = crops[val];
        renderMenu('RATES_RESULT');
      } else {
        flashError();
      }
      return;
    }

    // LANG MENU
    if (cur === 'LANG_MENU') {
      if (val === '1') state.tempData.language = 'en';
      else if (val === '2') state.tempData.language = 'hi';
      else if (val === '3') state.tempData.language = 'mr';
      else {
        flashError();
        return;
      }
      
      const langNames = { en: 'English', hi: 'à¤¹à¤¿à¤‚à¤¦à¥€ (Hindi)', mr: 'à¤®à¤°à¤¾à¤ à¥€ (Marathi)' };
      sendSimulatedSms({
        title: 'Language Updated',
        message: `AgriQ: Preferred language set to ${langNames[state.tempData.language]}. All future mandi alerts will be delivered in this language.`,
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
    ussdTitle.textContent = 'âš ï¸ Invalid Key / à¤…à¤®à¤¾à¤¨à¥à¤¯ à¤ªà¤°à¥à¤¯à¤¾à¤¯';
    setTimeout(() => {
      ussdTitle.textContent = oldTitle;
    }, 900);
  }

  function showLoading(msg = 'Requesting USSD...') {
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

  // Click Listeners
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

  // Physical Keyboard Listener
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
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
          <p>No SMS alerts yet.</p>
          <small>Dial <b>*99#</b> or click <b>"Quick Book Token"</b> to trigger real-time notifications.</small>
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
        title: 'Device Registered',
        message: `Welcome to AgriQ SMS Gateway. Mobile number +91-${val} linked to Mandi services.`,
        type: 'confirm'
      });
    }
  });

  // Officer Checkpoint Progression
  function setActiveTokenDisplay(token, status) {
    state.activeToken = token;
    demoTokenDisplay.textContent = token;
    demoStatusDisplay.textContent = status;
    demoStatusDisplay.className = `status-pill status-${status.toLowerCase()}`;

    // Update table
    const item = state.queueList.find(q => q.token === token);
    if (item) {
      item.status = status;
      renderQueueTable();
    }

    // Enable / disable
    btnSimCheckin.disabled = (status !== 'BOOKED');
    btnSimWeigh.disabled = (status !== 'CHECKED_IN');
    btnSimQuality.disabled = (status !== 'WEIGHED');
    btnSimPayment.disabled = (status !== 'QUALITY_APPROVED');
    btnSimComplete.disabled = (status !== 'PAYMENT_INITIATED');
  }

  // Individual Checkpoint Actions
  async function performCheckin() {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'CHECKED_IN');
    setActiveTokenDisplay(state.activeToken, 'CHECKED_IN');
    sendSimulatedSms({
      title: 'Gate Check-In Approved',
      message: `AgriQ Alert: Token ${state.activeToken} scanned at Mandi Gate. Gate pass verified. Proceed to Weighbridge Counter #2.`,
      type: 'status'
    });
  }

  async function performWeigh() {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'WEIGHED');
    setActiveTokenDisplay(state.activeToken, 'WEIGHED');
    sendSimulatedSms({
      title: 'Weighbridge Recorded',
      message: `AgriQ Alert: Token ${state.activeToken} Gross Weight: 1,450 kg. Tare: 150 kg. Net Crop: 1,300 kg. Proceed to Quality Assayer.`,
      type: 'status'
    });
  }

  async function performQuality() {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'QUALITY_APPROVED');
    setActiveTokenDisplay(state.activeToken, 'QUALITY_APPROVED');
    sendSimulatedSms({
      title: 'Quality Grade Approved',
      message: `AgriQ Alert: Token ${state.activeToken} Quality Grade: GRADE-A (Moisture 11.2%). Rate approved at â‚¹2,425/Q MSP.`,
      type: 'status'
    });
  }

  async function performPayment() {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'PAYMENT_INITIATED');
    setActiveTokenDisplay(state.activeToken, 'PAYMENT_INITIATED');
    sendSimulatedSms({
      title: 'Direct Benefit Transfer (DBT)',
      message: `AgriQ Alert: DBT Payment of â‚¹31,525 initiated for Token ${state.activeToken} to Aadhaar-linked Bank A/c ending with 4821. Ref: DBT9948210.`,
      type: 'payment'
    });
  }

  async function performComplete() {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'COMPLETED');
    setActiveTokenDisplay(state.activeToken, 'COMPLETED');
    sendSimulatedSms({
      title: 'Procurement Complete',
      message: `AgriQ: Mandi procurement for Token ${state.activeToken} is COMPLETED. Total turnaround time: 24 mins. Thank you!`,
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
    receiptTokenVal.textContent = state.activeToken;
    receiptPhone.textContent = '+91-' + state.tempData.phone;
    receiptCenter.textContent = state.tempData.centerName || 'Nashik APMC Main';
    receiptCrop.textContent = (state.tempData.crop || 'Wheat') + ' (Grade-A)';
    receiptSlot.textContent = state.tempData.slotTime || 'Tomorrow 08:00 AM';
    receiptQty.textContent = (state.tempData.quantityKg || 1450) + ' kg (' + ((state.tempData.quantityKg || 1450)/100).toFixed(1) + ' Q)';
    receiptModal.classList.remove('hidden');
  });

  closeReceiptBtn.addEventListener('click', () => receiptModal.classList.add('hidden'));
  printReceiptBtn.addEventListener('click', () => window.print());

  // Quick Presets
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
    setActiveTokenDisplay(booking.token_number, booking.status);

    state.queueList.unshift({
      token: booking.token_number,
      phone: state.tempData.phone,
      crop: 'Wheat',
      slot: 'Tomorrow 08:00 AM',
      status: 'BOOKED'
    });
    renderQueueTable();
    btnViewReceipt.disabled = false;

    sendSimulatedSms({
      title: 'Demo Token Booked',
      message: `AgriQ: Token ${booking.token_number} allocated for Wheat at Nashik APMC. Slot: Tomorrow 08:00 AM. Queue Position: 1st in Window.`,
      type: 'confirm'
    });

    showView('MENU');
    renderMenu('BOOK_SUCCESS');
  }

  btnQuickBook.addEventListener('click', performQuickBooking);

  // Race-Condition-Free Auto Cycle
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  btnQuickCycle.addEventListener('click', async () => {
    btnQuickCycle.disabled = true;
    btnQuickCycle.textContent = 'â³ Running Cycle...';
    try {
      if (!state.activeToken) {
        await performQuickBooking();
      }
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
      btnQuickCycle.textContent = '2. Auto-Run Full Mandi Cycle (Check-in âž” Pay)';
    }
  });

  btnQuickRates.addEventListener('click', () => {
    state.dialBuffer = '*99#';
    showView('MENU');
    state.tempData.crop = 'Onion';
    renderMenu('RATES_RESULT');
  });

  btnQuickReset.addEventListener('click', () => {
    state.activeToken = null;
    state.activeBooking = null;
    state.smsList = [];
    state.dialBuffer = '*99#';
    state.inputBuffer = '';
    demoTokenDisplay.textContent = 'None Booked Yet';
    demoStatusDisplay.textContent = 'IDLE';
    demoStatusDisplay.className = 'status-pill status-booked';
    btnSimCheckin.disabled = true;
    btnSimWeigh.disabled = true;
    btnSimQuality.disabled = true;
    btnSimPayment.disabled = true;
    btnSimComplete.disabled = true;
    btnViewReceipt.disabled = true;
    state.queueList = [
      { token: 'NSK-0198', phone: '9822019283', crop: 'Wheat', slot: '08:00 AM', status: 'WEIGHED' },
      { token: 'NSK-0215', phone: '9765432190', crop: 'Onion', slot: '08:30 AM', status: 'CHECKED_IN' },
      { token: 'NSK-0220', phone: '9921873461', crop: 'Wheat', slot: '09:00 AM', status: 'BOOKED' }
    ];
    renderQueueTable();
    renderSmsFeed();
    showView('DIALING');
    renderMenu('ROOT');
  });

  // Supabase Config Drawer
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
      connectionStatus.textContent = 'Mode: Supabase Live ðŸŸ¢';
      pulseDot.style.backgroundColor = '#10b981';
      configDrawer.classList.add('hidden');
      alert('Connected to Supabase project successfully!');
      
      window.agriqBackend.subscribeToBookings((updatedRecord) => {
        if (state.activeToken && updatedRecord.token_number === state.activeToken) {
          setActiveTokenDisplay(updatedRecord.token_number, updatedRecord.status);
          sendSimulatedSms({
            title: `Realtime Mandi Update: ${updatedRecord.status}`,
            message: `AgriQ Alert: Token ${updatedRecord.token_number} status changed to ${updatedRecord.status} by Officer.`,
            type: 'status'
          });
        }
      });
    }
  });

  resetConfigBtn.addEventListener('click', () => {
    window.agriqBackend.clearCredentials();
    connectionStatus.textContent = 'Mode: Standalone / Demo Safe';
    configDrawer.classList.add('hidden');
  });

  // Init
  showView('DIALING');
  updateInspector();

})();

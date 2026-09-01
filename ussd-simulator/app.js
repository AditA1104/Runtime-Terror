/**
 * AgriQ USSD Application & SMS Simulator Engine (P4 - Optimized v2)
 * Team: Runtime-Terror | SIH 2026
 */

(function () {
  // DOM Elements
  const lcdScreen = document.getElementById('lcd-screen');
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
  
  // Inspector & Demo DOM
  const inspectSessionId = document.getElementById('inspect-session-id');
  const inspectMenuLevel = document.getElementById('inspect-menu-level');
  const inspectTempData = document.getElementById('inspect-temp-data');
  const demoTokenDisplay = document.getElementById('demo-token-display');
  const demoStatusDisplay = document.getElementById('demo-status-display');
  const connectionStatus = document.getElementById('connection-status');
  const pulseDot = document.getElementById('pulse-dot');
  
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

  // Application State Machine
  let soundEnabled = true;
  let audioCtx = null;

  const state = {
    mode: 'DIALING', // 'DIALING' | 'MENU' | 'LOADING'
    dialBuffer: '*99#',
    inputBuffer: '',
    currentMenu: 'ROOT',
    sessionId: 'sess_' + Math.random().toString(36).substr(2, 8),
    tempData: {
      phone: '9876543210',
      crop: null,
      centerId: null,
      centerName: null,
      slotId: null,
      slotTime: null,
      quantityKg: 1500,
      language: 'en' // 'en' | 'hi' | 'mr'
    },
    activeToken: null,
    activeBooking: null,
    smsList: []
  };

  // Multilingual Text Dictionary for USSD menus
  const I18N = {
    en: {
      langName: 'Language: English',
      rootTitle: 'AgriQ Mandi Seva (*99#)',
      rootBody: '1. Book Slot<br>2. Check Token Status<br>3. Mandi Rates & Forecast<br>4. Change Language',
      selectCrop: 'Select Commodity:<br>1. Wheat (गेहूं)<br>2. Onion (प्याज)<br>3. Paddy (धान)<br>4. Cotton (कपास)<br>0. Back',
      selectCenter: 'Select Mandi Center:<br>1. Nashik APMC Main<br>2. Pune Central Mandi<br>3. Nagpur Cotton Yard<br>0. Back',
      enterQty: 'Approx Quantity (kg):<br>Enter weight in kg<br>(e.g. type 1500 for 15 quintals)<br><br>0. Back',
      confirmPrompt: '1. Confirm Booking<br>2. Cancel',
      ratesMenu: 'Mandi Rates & Forecast:<br>1. Wheat<br>2. Onion<br>3. Paddy<br>4. Cotton<br>0. Back'
    },
    hi: {
      langName: 'भाषा: हिंदी',
      rootTitle: 'एग्री-क्यू मंडी सेवा (*99#)',
      rootBody: '1. टोकन/स्लॉट बुक करें<br>2. टोकन स्थिति जांचें<br>3. मंडी भाव और पूर्वानुमान<br>4. भाषा बदलें',
      selectCrop: 'फसल चुनें:<br>1. गेहूं (Wheat)<br>2. प्याज (Onion)<br>3. धान (Paddy)<br>4. कपास (Cotton)<br>0. वापस',
      selectCenter: 'मंडी केंद्र चुनें:<br>1. नासिक एपीएमसी<br>2. पुणे सेंट्रल मंडी<br>3. नागपुर यार्ड<br>0. वापस',
      enterQty: 'अनुमानित वजन (किलो):<br>वजन दर्ज करें (उदा. 1500)<br><br>0. वापस',
      confirmPrompt: '1. स्लॉट पक्का करें<br>2. रद्द करें',
      ratesMenu: 'मंडी भाव व सलाह:<br>1. गेहूं<br>2. प्याज<br>3. धान<br>4. कपास<br>0. वापस'
    },
    mr: {
      langName: 'भाषा: मराठी',
      rootTitle: 'अ‍ॅग्री-क्यू कृषी बाजार (*99#)',
      rootBody: '1. स्लॉट बुक करा<br>2. टोकन स्थिती तपासा<br>3. बाजार भाव व अंदाज<br>4. भाषा बदला',
      selectCrop: 'पीक निवडा:<br>1. गहू (Wheat)<br>2. कांदा (Onion)<br>3. भात (Paddy)<br>4. कापूस (Cotton)<br>0. मागे',
      selectCenter: 'बाजार समिती निवडा:<br>1. नाशिक एपीएमसी<br>2. पुणे मुख्य बाजार<br>3. नागपूर यार्ड<br>0. मागे',
      enterQty: 'अंदाजे वजन (किलो):<br>वजन टाका (उदा. 1500)<br><br>0. मागे',
      confirmPrompt: '1. स्लॉट निश्चित करा<br>2. रद्द करा',
      ratesMenu: 'बाजार भाव व शिफारस:<br>1. गहू<br>2. कांदा<br>3. भात<br>4. कापूस<br>0. मागे'
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

  // Safe Web Audio API Handler (No external files needed)
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
    } catch (e) {
      // Audio context policy
    }
  }

  function playSmsChime() {
    if (!soundEnabled) return;
    playTone(880, 'triangle', 0.1);
    setTimeout(() => playTone(1320, 'triangle', 0.15), 120);
  }

  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    soundToggleBtn.style.color = soundEnabled ? '#10b981' : '#94a3b8';
  });

  // -------------------------------------------------------------
  // VIEW SWITCHING
  // -------------------------------------------------------------
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
      rightSoftLabel.textContent = 'End';
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

  // -------------------------------------------------------------
  // USSD MENU STATE MACHINE
  // -------------------------------------------------------------
  async function renderMenu(menuKey) {
    state.currentMenu = menuKey;
    state.inputBuffer = '';
    updateInputDisplay();
    updateInspector();

    const lang = state.tempData.language || 'en';
    const dict = I18N[lang] || I18N.en;

    switch (menuKey) {
      case 'ROOT':
        ussdTitle.textContent = dict.rootTitle;
        ussdBody.innerHTML = dict.rootBody;
        break;

      case 'BOOK_CROP':
        ussdTitle.textContent = lang === 'hi' ? 'फसल चुनें:' : (lang === 'mr' ? 'पीक निवडा:' : 'Select Commodity:');
        ussdBody.innerHTML = dict.selectCrop;
        break;

      case 'BOOK_CENTER':
        ussdTitle.textContent = lang === 'hi' ? 'मंडी केंद्र चुनें:' : (lang === 'mr' ? 'बाजार समिती:' : 'Select Mandi Center:');
        ussdBody.innerHTML = dict.selectCenter;
        break;

      case 'BOOK_SLOT':
        ussdTitle.textContent = `Slots: ${state.tempData.centerName || 'Nashik'}`;
        ussdBody.innerHTML = `1. Tomorrow 08:00 AM (15 left)<br>2. Tomorrow 11:00 AM (12 left)<br>3. Tomorrow 02:00 PM (8 left)<br>0. Back`;
        break;

      case 'BOOK_QTY':
        ussdTitle.textContent = lang === 'hi' ? 'वजन (किलो):' : (lang === 'mr' ? 'वजन (किलो):' : 'Approx Quantity (kg):');
        ussdBody.innerHTML = dict.enterQty;
        break;

      case 'BOOK_CONFIRM':
        ussdTitle.textContent = lang === 'hi' ? 'स्लॉट पुष्टि:' : (lang === 'mr' ? 'बुकिंग खात्री:' : 'Confirm Mandi Slot:');
        ussdBody.innerHTML = `Crop: <b>${state.tempData.crop || 'Wheat'}</b><br>Center: ${state.tempData.centerName || 'Nashik APMC'}<br>Slot: ${state.tempData.slotTime || '08:00 AM'}<br>Qty: ${state.tempData.quantityKg} kg<br><br>${dict.confirmPrompt}`;
        break;

      case 'BOOK_SUCCESS':
        const tok = state.activeBooking ? state.activeBooking.token_number : 'NSK-0231';
        ussdTitle.textContent = `✅ Token Booked!`;
        ussdBody.innerHTML = `Token: <b>${tok}</b><br>Slot: ${state.tempData.slotTime || '08:00 AM'}<br>Queue Pos: 2nd<br>Est Wait: ~20 mins<br>SMS sent to ${state.tempData.phone}<br><br>0. Main Menu`;
        break;

      case 'STATUS_PROMPT':
        ussdTitle.textContent = lang === 'hi' ? 'टोकन स्थिति:' : (lang === 'mr' ? 'टोकन स्थिती:' : 'Check Token Status:');
        ussdBody.innerHTML = `Enter Token # or Phone:<br>(e.g. NSK-0231)<br><br>1. Check my recent token<br>0. Back`;
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
        ussdTitle.textContent = dict.ratesMenu.split('<br>')[0];
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
        ussdTitle.textContent = 'Change Language / भाषा:';
        ussdBody.innerHTML = `1. English<br>2. हिंदी (Hindi)<br>3. मराठी (Marathi)<br>0. Back`;
        break;
    }
  }

  // Handle USSD Input submission
  async function handleMenuInput(input) {
    playTone(720, 'sine', 0.04);
    const val = input.trim();
    if (!val) return;

    const cur = state.currentMenu;

    // Global back to Root
    if (val === '0') {
      renderMenu('ROOT');
      return;
    }

    // ROOT NAVIGATION
    if (cur === 'ROOT') {
      if (val === '1') renderMenu('BOOK_CROP');
      else if (val === '2') renderMenu('STATUS_PROMPT');
      else if (val === '3') renderMenu('RATES_MENU');
      else if (val === '4') renderMenu('LANG_MENU');
      else renderMenu('ROOT');
      return;
    }

    // BOOK CROP
    if (cur === 'BOOK_CROP') {
      const crops = { '1': 'Wheat', '2': 'Onion', '3': 'Paddy', '4': 'Cotton' };
      if (crops[val]) {
        state.tempData.crop = crops[val];
        renderMenu('BOOK_CENTER');
      }
      return;
    }

    // BOOK CENTER
    if (cur === 'BOOK_CENTER') {
      const centers = {
        '1': { id: 'c1-nsk', name: 'Nashik APMC' },
        '2': { id: 'c2-pun', name: 'Pune Central' },
        '3': { id: 'c3-nag', name: 'Nagpur Yard' }
      };
      if (centers[val]) {
        state.tempData.centerId = centers[val].id;
        state.tempData.centerName = centers[val].name;
        renderMenu('BOOK_SLOT');
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
      }
      return;
    }

    // BOOK QTY
    if (cur === 'BOOK_QTY') {
      const qty = parseInt(val, 10);
      if (!isNaN(qty) && qty > 0) {
        state.tempData.quantityKg = qty;
        renderMenu('BOOK_CONFIRM');
      }
      return;
    }

    // BOOK CONFIRM
    if (cur === 'BOOK_CONFIRM') {
      if (val === '1') {
        showLoading('Allocating Token & Queue...');
        const booking = await window.agriqBackend.createBooking({
          phone: state.tempData.phone,
          centerId: state.tempData.centerId,
          slotId: state.tempData.slotId,
          cropQuantityKg: state.tempData.quantityKg
        });

        state.activeBooking = booking;
        state.activeToken = booking.token_number;
        setActiveTokenDisplay(booking.token_number, booking.status);

        // Fire SMS
        sendSimulatedSms({
          title: 'Booking Confirmed',
          message: `AgriQ: Token ${booking.token_number} confirmed for ${state.tempData.crop} at ${state.tempData.centerName}. Slot: ${state.tempData.slotTime}. Arrive 15 min early.`,
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
      }
      return;
    }

    // RATES MENU
    if (cur === 'RATES_MENU') {
      const crops = { '1': 'wheat', '2': 'onion', '3': 'paddy', '4': 'cotton' };
      if (crops[val]) {
        state.tempData.crop = crops[val];
        renderMenu('RATES_RESULT');
      }
      return;
    }

    // LANG MENU
    if (cur === 'LANG_MENU') {
      if (val === '1') state.tempData.language = 'en';
      if (val === '2') state.tempData.language = 'hi';
      if (val === '3') state.tempData.language = 'mr';
      
      const langNames = { en: 'English', hi: 'हिंदी (Hindi)', mr: 'मराठी (Marathi)' };
      sendSimulatedSms({
        title: 'Language Updated',
        message: `AgriQ: Preferred language set to ${langNames[state.tempData.language]}. All mandi alerts will be delivered in this language.`,
        type: 'status'
      });
      renderMenu('ROOT');
      return;
    }

    // Return to ROOT on default
    renderMenu('ROOT');
  }

  function showLoading(msg = 'Requesting USSD...') {
    loadingText.textContent = msg;
    showView('LOADING');
  }

  // -------------------------------------------------------------
  // KEYPAD INTERACTION & KEYBOARD SUPPORT
  // -------------------------------------------------------------
  function handleKeyPress(key) {
    playTone(500 + Math.random() * 200, 'sine', 0.04);

    // Visual button press animation on screen
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
      if (key === 'CLEAR' || key === 'END') {
        if (state.inputBuffer.length > 0) {
          state.inputBuffer = state.inputBuffer.slice(0, -1);
          updateInputDisplay();
        } else {
          // Exit USSD session
          showView('DIALING');
        }
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
      }, 600);
    } else {
      showLoading('Invalid MMI Code');
      setTimeout(() => {
        showView('DIALING');
      }, 1000);
    }
  }

  // Listen to physical keypad on screen
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
    handleKeyPress('END');
  });

  document.getElementById('btn-ok').addEventListener('click', () => {
    if (state.mode === 'DIALING') handleKeyPress('CALL');
    else if (state.mode === 'MENU') handleKeyPress('CALL');
  });

  // Physical computer keyboard listener
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return; // Ignore input fields
    
    // Support standard numbers & numpad
    if (['0','1','2','3','4','5','6','7','8','9','*','#'].includes(e.key)) {
      handleKeyPress(e.key);
    } else if (e.key === 'Enter') {
      handleKeyPress('CALL');
    } else if (e.key === 'Backspace') {
      handleKeyPress('CLEAR');
    } else if (e.key === 'Escape') {
      handleKeyPress('END');
    }
  });

  // -------------------------------------------------------------
  // SIMULATED SMS NOTIFICATION FEED
  // -------------------------------------------------------------
  function sendSimulatedSms({ title, message, type = 'status' }) {
    playSmsChime();
    const sms = {
      id: 'sms_' + Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.smsList.unshift(sms);
    renderSmsFeed();
  }

  function renderSmsFeed() {
    smsCountBadge.textContent = `${state.smsList.length} Messages`;
    if (state.smsList.length === 0) {
      smsMessages.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📭</span>
          <p>No SMS alerts yet.</p>
          <small>Dial <b>*99#</b> or click <b>"Quick Book Token"</b> above to test alerts.</small>
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

  // Update farmer phone
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

  // -------------------------------------------------------------
  // OFFICER CHECKPOINT SIMULATOR (DEMO CONTROLS)
  // -------------------------------------------------------------
  function setActiveTokenDisplay(token, status) {
    state.activeToken = token;
    demoTokenDisplay.textContent = token;
    demoStatusDisplay.textContent = status;
    demoStatusDisplay.className = `status-pill status-${status.toLowerCase()}`;

    // Enable / disable checkpoint progression buttons in strict state machine order
    btnSimCheckin.disabled = (status !== 'BOOKED');
    btnSimWeigh.disabled = (status !== 'CHECKED_IN');
    btnSimQuality.disabled = (status !== 'WEIGHED');
    btnSimPayment.disabled = (status !== 'QUALITY_APPROVED');
    btnSimComplete.disabled = (status !== 'PAYMENT_INITIATED');
  }

  btnSimCheckin.addEventListener('click', async () => {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'CHECKED_IN');
    setActiveTokenDisplay(state.activeToken, 'CHECKED_IN');
    sendSimulatedSms({
      title: 'Gate Check-In Approved',
      message: `AgriQ Alert: Token ${state.activeToken} scanned at Mandi Gate. Gate pass issued. Proceed to Weighbridge Counter #2.`,
      type: 'status'
    });
  });

  btnSimWeigh.addEventListener('click', async () => {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'WEIGHED');
    setActiveTokenDisplay(state.activeToken, 'WEIGHED');
    sendSimulatedSms({
      title: 'Weighbridge Recorded',
      message: `AgriQ Alert: Token ${state.activeToken} Gross Weight: 1,450 kg. Tare: 150 kg. Net Crop: 1,300 kg. Proceed to Quality Assayer.`,
      type: 'status'
    });
  });

  btnSimQuality.addEventListener('click', async () => {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'QUALITY_APPROVED');
    setActiveTokenDisplay(state.activeToken, 'QUALITY_APPROVED');
    sendSimulatedSms({
      title: 'Quality Grade Approved',
      message: `AgriQ Alert: Token ${state.activeToken} Quality Grade: GRADE-A (Moisture 11.2%). Rate approved at ₹2,425/Q MSP.`,
      type: 'status'
    });
  });

  btnSimPayment.addEventListener('click', async () => {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'PAYMENT_INITIATED');
    setActiveTokenDisplay(state.activeToken, 'PAYMENT_INITIATED');
    sendSimulatedSms({
      title: 'Direct Benefit Transfer (DBT)',
      message: `AgriQ Alert: DBT Payment of ₹31,525 initiated for Token ${state.activeToken} to Aadhaar-linked Bank A/c ending with 4821. Ref: DBT9948210.`,
      type: 'payment'
    });
  });

  btnSimComplete.addEventListener('click', async () => {
    if (!state.activeToken) return;
    await window.agriqBackend.transitionStatus(state.activeBooking?.booking_id, 'COMPLETED');
    setActiveTokenDisplay(state.activeToken, 'COMPLETED');
    sendSimulatedSms({
      title: 'Procurement Complete',
      message: `AgriQ: Mandi procurement for Token ${state.activeToken} is COMPLETED. Total turnaround time: 24 mins. Thank you!`,
      type: 'confirm'
    });
  });

  // -------------------------------------------------------------
  // 1-CLICK QUICK DEMO PRESETS
  // -------------------------------------------------------------
  btnQuickBook.addEventListener('click', async () => {
    showLoading('Allocating Quick Demo Token...');
    const booking = await window.agriqBackend.createBooking({
      phone: state.tempData.phone,
      centerId: 'c1-nsk',
      slotId: 's2',
      cropQuantityKg: 1450
    });
    state.tempData.crop = 'Wheat';
    state.tempData.centerName = 'Nashik APMC Main';
    state.tempData.slotTime = 'Tomorrow 08:00 AM';
    state.activeBooking = booking;
    state.activeToken = booking.token_number;
    setActiveTokenDisplay(booking.token_number, booking.status);

    sendSimulatedSms({
      title: 'Demo Token Booked',
      message: `AgriQ: Token ${booking.token_number} allocated for Wheat at Nashik APMC. Slot: Tomorrow 08:00 AM. Queue Position: 2nd.`,
      type: 'confirm'
    });

    showView('MENU');
    renderMenu('BOOK_SUCCESS');
  });

  btnQuickCycle.addEventListener('click', async () => {
    if (!state.activeToken) {
      await btnQuickBook.click();
    }
    // Automatically walk through all 5 stages with 1.2s delay for presentation
    setTimeout(() => btnSimCheckin.click(), 500);
    setTimeout(() => btnSimWeigh.click(), 1800);
    setTimeout(() => btnSimQuality.click(), 3100);
    setTimeout(() => btnSimPayment.click(), 4400);
    setTimeout(() => btnSimComplete.click(), 5700);
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
    renderSmsFeed();
    showView('DIALING');
    renderMenu('ROOT');
  });

  // -------------------------------------------------------------
  // SUPABASE CONFIG DRAWER
  // -------------------------------------------------------------
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
      connectionStatus.textContent = 'Mode: Supabase Live 🟢';
      pulseDot.style.backgroundColor = '#10b981';
      configDrawer.classList.add('hidden');
      alert('Connected to Supabase project successfully!');
      
      // Subscribe to Realtime
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

  // Initialize view
  showView('DIALING');
  updateInspector();

})();

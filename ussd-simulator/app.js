/**
 * AgriQ USSD Application & SMS Simulator Engine (P4)
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
  
  // Inspector & Demo DOM
  const inspectSessionId = document.getElementById('inspect-session-id');
  const inspectMenuLevel = document.getElementById('inspect-menu-level');
  const inspectTempData = document.getElementById('inspect-temp-data');
  const demoTokenDisplay = document.getElementById('demo-token-display');
  const demoStatusDisplay = document.getElementById('demo-status-display');
  const connectionStatus = document.getElementById('connection-status');
  
  // Officer Demo Buttons
  const btnSimCheckin = document.getElementById('btn-sim-checkin');
  const btnSimWeigh = document.getElementById('btn-sim-weigh');
  const btnSimQuality = document.getElementById('btn-sim-quality');
  const btnSimPayment = document.getElementById('btn-sim-payment');
  const btnSimComplete = document.getElementById('btn-sim-complete');

  // Application State Machine
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
      language: 'en'
    },
    activeToken: null,
    activeBooking: null,
    smsList: []
  };

  // Clock in LCD screen
  function updateClock() {
    const clockEl = document.getElementById('screen-clock');
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Audio Bleep generator using Web Audio API (zero audio file dependencies)
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playTone(freq = 600, type = 'sine', duration = 0.05) {
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }

  function playSmsChime() {
    playTone(880, 'triangle', 0.1);
    setTimeout(() => playTone(1320, 'triangle', 0.15), 120);
  }

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
  }

  // -------------------------------------------------------------
  // USSD MENU STATE MACHINE
  // -------------------------------------------------------------
  async function renderMenu(menuKey) {
    state.currentMenu = menuKey;
    state.inputBuffer = '';
    updateInputDisplay();
    updateInspector();

    switch (menuKey) {
      case 'ROOT':
        ussdTitle.textContent = 'AgriQ Mandi Seva (*99#)';
        ussdBody.innerHTML = `1. Book Slot<br>2. Check Token Status<br>3. Mandi Rates & Forecast<br>4. Change Language`;
        break;

      case 'BOOK_CROP':
        ussdTitle.textContent = 'Select Commodity:';
        ussdBody.innerHTML = `1. Wheat (गेहूं)<br>2. Onion (प्याज)<br>3. Paddy / Rice (धान)<br>4. Cotton (कपास)<br>0. Back`;
        break;

      case 'BOOK_CENTER':
        ussdTitle.textContent = 'Select Mandi Center:';
        ussdBody.innerHTML = `1. Nashik APMC Main<br>2. Pune Central Mandi<br>3. Nagpur Cotton Yard<br>0. Back`;
        break;

      case 'BOOK_SLOT':
        ussdTitle.textContent = `Slots: ${state.tempData.centerName || 'Nashik'}`;
        ussdBody.innerHTML = `1. Tomorrow 08:00 AM (15 left)<br>2. Tomorrow 11:00 AM (12 left)<br>3. Tomorrow 02:00 PM (8 left)<br>0. Back`;
        break;

      case 'BOOK_QTY':
        ussdTitle.textContent = 'Approx Quantity (kg):';
        ussdBody.innerHTML = `Enter weight in kg<br>(e.g. type 1500 for 15 quintals)<br><br>0. Back`;
        break;

      case 'BOOK_CONFIRM':
        ussdTitle.textContent = 'Confirm Mandi Slot:';
        ussdBody.innerHTML = `Crop: ${state.tempData.crop || 'Wheat'}<br>Center: ${state.tempData.centerName || 'Nashik APMC'}<br>Slot: ${state.tempData.slotTime || '08:00 AM'}<br>Qty: ${state.tempData.quantityKg} kg<br><br>1. Confirm Booking<br>2. Cancel`;
        break;

      case 'BOOK_SUCCESS':
        const tok = state.activeBooking ? state.activeBooking.token_number : 'NSK-0231';
        ussdTitle.textContent = `✅ Token Booked!`;
        ussdBody.innerHTML = `Token: <b>${tok}</b><br>Slot: ${state.tempData.slotTime || '08:00 AM'}<br>Queue Pos: 2nd<br>Est Wait: ~20 mins<br>SMS sent to ${state.tempData.phone}<br><br>0. Main Menu`;
        break;

      case 'STATUS_PROMPT':
        ussdTitle.textContent = 'Check Token Status:';
        ussdBody.innerHTML = `Enter Token # or 10-digit phone:<br>(e.g. NSK-0231)<br><br>1. Check my recent token<br>0. Back`;
        break;

      case 'STATUS_RESULT':
        showLoading('Fetching Live Status...');
        const queryVal = state.activeToken || state.tempData.phone;
        const statusRes = await window.agriqBackend.getBookingStatus(queryVal);
        showView('MENU');
        ussdTitle.textContent = `Status: ${statusRes.token_number}`;
        ussdBody.innerHTML = `Token: <b>${statusRes.token_number}</b><br>Stage: <span style="color:#003300"><b>${statusRes.status}</b></span><br>Queue Position: ${statusRes.queue_position || 1}<br>Est Wait: ${statusRes.predicted_wait_mins || 15} mins<br><br>0. Main Menu`;
        break;

      case 'RATES_MENU':
        ussdTitle.textContent = 'Mandi Rates & Forecast:';
        ussdBody.innerHTML = `1. Wheat<br>2. Onion<br>3. Paddy<br>4. Cotton<br>0. Back`;
        break;

      case 'RATES_RESULT':
        showLoading('Reading Forecast Cache...');
        const rateInfo = await window.agriqBackend.getMandiRates(state.tempData.crop);
        showView('MENU');
        ussdTitle.textContent = `Rates: ${state.tempData.crop.toUpperCase()}`;
        ussdBody.innerHTML = `Current: <b>${rateInfo.rate}</b><br>Trend: ${rateInfo.forecast}<br>Best Day: <b>${rateInfo.bestDay}</b><br>Score: ${rateInfo.reason}<br><br>0. Main Menu`;
        break;

      case 'LANG_MENU':
        ussdTitle.textContent = 'Change Language:';
        ussdBody.innerHTML = `1. English (Active)<br>2. हिंदी (Hindi)<br>3. मराठी (Marathi)<br>0. Back`;
        break;
    }
  }

  // Handle USSD Input submission
  async function handleMenuInput(input) {
    playTone(700, 'sine', 0.04);
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
      sendSimulatedSms({
        title: 'Language Updated',
        message: `AgriQ: Preferred language updated. All future Mandi alerts will be delivered accordingly.`,
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
      }, 700);
    } else {
      showLoading('Invalid MMI Code');
      setTimeout(() => {
        showView('DIALING');
      }, 1200);
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

  // Physical computer keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return; // Don't hijack input forms
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
          <small>Dial <b>*99#</b> to book a slot or test officer actions below.</small>
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
        message: `Welcome to AgriQ SMS Gateway. Your mobile number +91-${val} is now linked to Mandi services.`,
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

    // Enable / disable checkpoint progression buttons
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
  // SUPABASE CONFIG DRAWER
  // -------------------------------------------------------------
  const toggleConfigBtn = document.getElementById('toggle-config-btn');
  const configDrawer = document.getElementById('config-drawer');
  const saveConfigBtn = document.getElementById('save-config-btn');
  const resetConfigBtn = document.getElementById('reset-config-btn');
  const supabaseUrlInput = document.getElementById('supabase-url');
  const supabaseKeyInput = document.getElementById('supabase-key');

  toggleConfigBtn.addEventListener('click', () => {
    configDrawer.classList.toggle('hidden');
  });

  saveConfigBtn.addEventListener('click', () => {
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();
    if (window.agriqBackend.setCredentials(url, key)) {
      connectionStatus.textContent = 'Mode: Supabase Live Connected 🟢';
      configDrawer.classList.add('hidden');
      alert('Connected to Supabase project successfully!');
    }
  });

  resetConfigBtn.addEventListener('click', () => {
    window.agriqBackend.clearCredentials();
    connectionStatus.textContent = 'Mode: Standalone / Mock (Ready for Supabase)';
    configDrawer.classList.add('hidden');
  });

  // Initialize view
  showView('DIALING');
  updateInspector();

})();

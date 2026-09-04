/**
 * AgriQ — Supabase Client Wrapper for P4 (USSD Gateway)
 * Adheres to Locked Schema v2 (Team Runtime-Terror)
 */

class AgriQBackend {
  constructor() {
    this.client = null;
    this.isLive = false;
    this.activeBooking = null;
    this.mockBookings = [];
    this.mockSlots = {};
    this.initFromStorage();
  }

  initFromStorage() {
    const url = localStorage.getItem('agriq_supabase_url');
    const key = localStorage.getItem('agriq_supabase_key');
    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isLive = true;
        console.log('[AgriQ] Connected to Supabase Live Instance:', url);
      } catch (err) {
        console.warn('[AgriQ] Failed to init Supabase client, using mock:', err);
        this.isLive = false;
      }
    }
  }

  setCredentials(url, key) {
    if (!url || !key) return false;
    try {
      localStorage.setItem('agriq_supabase_url', url);
      localStorage.setItem('agriq_supabase_key', key);
      if (window.supabase) {
        this.client = window.supabase.createClient(url, key);
        this.isLive = true;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  clearCredentials() {
    localStorage.removeItem('agriq_supabase_url');
    localStorage.removeItem('agriq_supabase_key');
    this.client = null;
    this.isLive = false;
  }

  async getMandiCenters() {
    if (this.isLive && this.client) {
      const { data, error } = await this.client
        .from('mandi_centers')
        .select('center_id, center_name, location, crop_type');
      if (!error && data && data.length) return data;
    }
    return [
      { center_id: 'c1-nsk', center_name: 'Nashik APMC Main', crop_type: 'Onion', location: 'Nashik' },
      { center_id: 'c2-pun', center_name: 'Pune Central Mandi', crop_type: 'Wheat', location: 'Pune' },
      { center_id: 'c3-nag', center_name: 'Nagpur Cotton Yard', crop_type: 'Cotton', location: 'Nagpur' }
    ];
  }

  async getAvailableSlots(centerId) {
    if (this.isLive && this.client) {
      const { data, error } = await this.client
        .from('slots_available')
        .select('*')
        .eq('center_id', centerId);
      if (!error && data && data.length) return data;
    }
    const key = centerId || 'c1-nsk';
    if (!this.mockSlots[key]) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      this.mockSlots[key] = [
        { slot_id: 's1', slot_date: today, slot_start_time: '10:00', slot_end_time: '12:00', remaining: 8 },
        { slot_id: 's2', slot_date: tomorrow, slot_start_time: '08:00', slot_end_time: '10:00', remaining: 15 },
        { slot_id: 's3', slot_date: tomorrow, slot_start_time: '11:00', slot_end_time: '13:00', remaining: 12 }
      ];
    }
    return this.mockSlots[key];
  }

  async createBooking({ phone, centerId, slotId, cropQuantityKg }) {
    const tokenPrefix = centerId ? centerId.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'NSK' : 'NSK';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tokenNumber = `${tokenPrefix}-${randomNum}`;

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.functions.invoke('create-booking', {
          body: {
            phone_number: phone,
            center_id: centerId,
            slot_id: slotId,
            crop_quantity_kg: cropQuantityKg,
            created_via: 'ussd'
          }
        });
        if (!error && data) {
          this.activeBooking = data;
          return data;
        }
      } catch (err) {
        console.warn('Edge function invoke failed, fallback to mock', err);
      }
    }

    const mockRecord = {
      booking_id: 'bk_' + Math.random().toString(36).substr(2, 9),
      token_number: tokenNumber,
      phone_number: phone,
      center_id: centerId || 'c1-nsk',
      slot_id: slotId || 's2',
      crop_quantity_kg: cropQuantityKg || 1400,
      status: 'BOOKED',
      queue_position: Math.floor(Math.random() * 4) + 1,
      predicted_wait_mins: 25,
      created_via: 'ussd',
      created_at: new Date().toISOString()
    };

    // Decrement slot remaining count dynamically
    const cKey = centerId || 'c1-nsk';
    if (this.mockSlots && this.mockSlots[cKey]) {
      const target = this.mockSlots[cKey].find(s => s.slot_id === slotId);
      if (target && target.remaining > 0) {
        target.remaining--;
      }
    }

    this.activeBooking = mockRecord;
    this.mockBookings.push(mockRecord);
    return mockRecord;
  }

  async getBookingStatus(tokenOrPhone) {
    if (this.isLive && this.client) {
      const { data, error } = await this.client
        .from('bookings')
        .select('*, mandi_centers(center_name)')
        .or(`token_number.eq.${tokenOrPhone},phone_number.eq.${tokenOrPhone}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) return data;
    }

    if (this.activeBooking) {
      const q = (tokenOrPhone || '').toLowerCase().trim();
      const tok = (this.activeBooking.token_number || '').toLowerCase();
      const ph = (this.activeBooking.phone_number || '').toLowerCase();
      if (tok.includes(q) || ph.includes(q) || q.includes(tok) || q.includes(ph)) {
        return this.activeBooking;
      }
    }

    if (this.mockBookings && this.mockBookings.length > 0) {
      const q = (tokenOrPhone || '').toLowerCase().trim();
      const found = this.mockBookings.find(b => 
        (b.token_number && b.token_number.toLowerCase().includes(q)) ||
        (b.phone_number && b.phone_number.toLowerCase().includes(q))
      );
      if (found) return found;
    }

    return null;
  }

  async getMandiRates(cropName) {
    if (this.isLive && this.client) {
      const { data, error } = await this.client
        .from('daily_rates_cache')
        .select('*')
        .ilike('crop_type', `%${cropName}%`)
        .limit(1)
        .single();
      if (!error && data) return data;
    }

    const rates = {
      wheat: { rate: '₹2,425/Q (MSP)', forecast: 'Rising (+3%)', bestDay: 'Thursday', reason: 'High demand, low expected crowd' },
      onion: { rate: '₹1,850/Q', forecast: 'Stable', bestDay: 'Wednesday', reason: 'Favorable dispatch score' },
      paddy: { rate: '₹2,300/Q (MSP)', forecast: 'High Demand', bestDay: 'Friday', reason: 'Optimal intake' },
      cotton: { rate: '₹7,120/Q', forecast: 'Rising (+5%)', bestDay: 'Tomorrow', reason: 'Top mill buyers active' }
    };

    const key = (cropName || 'wheat').toLowerCase();
    return rates[key] || rates.wheat;
  }

  async transitionStatus(bookingId, newStatus, changedBy = 'officer_desk') {
    if (this.isLive && this.client && bookingId) {
      const { data, error } = await this.client.rpc('transition_booking_status', {
        p_booking_id: bookingId,
        p_new_status: newStatus,
        p_changed_by: changedBy
      });
      if (error) throw error;
      return true;
    }

    if (this.activeBooking) {
      this.activeBooking.status = newStatus;
      return true;
    }
    return true;
  }
}

window.agriqBackend = new AgriQBackend();

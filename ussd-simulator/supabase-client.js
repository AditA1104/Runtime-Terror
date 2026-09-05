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
      // Ordered by name, because the farmer app orders the same way. Without
      // this the two lists hold the same centres in a different order, so "1"
      // on the handset and the first entry in the app are different mandis —
      // and a farmer who books one while an officer watches the other sees
      // nothing arrive.
      const { data, error } = await this.client
        .from('mandi_centers')
        .select('center_id, center_name, location, crop_type')
        .order('center_name', { ascending: true });
      if (!error && data && data.length) return data;
    }
    // The real centres, ids included, copied from mandi_centers. These used to
    // be four invented mandis (Bengaluru, Hubballi, Mysuru, Kalaburagi) that
    // exist in no database, so an offline booking named a centre no officer
    // staffs and could never arrive anywhere. Ordered by name, matching both
    // the live query above and the farmer app, so option 2 is the same mandi
    // on the handset and in the app.
    return [
      { center_id: 'f4d7624e-0bbd-4a66-87d8-f1a29831ba1d', center_name: 'Guntur Cotton Yard', crop_type: 'cotton', location: 'Guntur' },
      { center_id: 'b6eac27b-642f-4005-a405-b2c2ef8a32fe', center_name: 'Khanna Grain Mandi', crop_type: 'wheat', location: 'Khanna' },
      { center_id: 'ee50c942-3cd6-4c8c-8db2-ed1aeea527f3', center_name: 'Kota Mandi Samiti', crop_type: 'mustard', location: 'Kota' },
      { center_id: 'fe047ee9-9522-4c16-814f-f5f388dfc7f5', center_name: 'Nashik Tomato Market', crop_type: 'tomato', location: 'Nashik' },
      { center_id: 'affc5449-8ea1-4da3-b1f4-0246eee93595', center_name: 'Test Mandi', crop_type: 'onion', location: 'Test Location' }
    ];
  }

  async getAvailableSlots(centerId) {
    if (this.isLive && this.client) {
      // Only slots from today onward, soonest first. Without the date filter
      // this returned every slot the centre has ever had, so the menu offered
      // yesterday's times — labelled "Tomorrow", because the label only asks
      // whether the date differs from today — and create_ussd_booking then
      // rejected them with "That slot is in the past".
      //
      // The date is the LOCAL one. toISOString() is UTC, which in IST is a day
      // behind for five and a half hours every night.
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const { data, error } = await this.client
        .from('slots_available')
        .select('*')
        .eq('center_id', centerId)
        .gte('slot_date', today)
        .order('slot_date', { ascending: true })
        .order('slot_start_time', { ascending: true });
      if (!error && data && data.length) return data;
    }
    const key = centerId || 'c0000000-0000-0000-0000-000000000001';
    if (!this.mockSlots[key]) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      this.mockSlots[key] = [
        { slot_id: 's0000000-0000-0000-0000-000000000001', slot_date: today, slot_start_time: '10:00:00', slot_end_time: '12:00:00', remaining: 8 },
        { slot_id: 's0000000-0000-0000-0000-000000000002', slot_date: tomorrow, slot_start_time: '08:00:00', slot_end_time: '10:00:00', remaining: 15 },
        { slot_id: 's0000000-0000-0000-0000-000000000003', slot_date: tomorrow, slot_start_time: '11:00:00', slot_end_time: '13:00:00', remaining: 12 }
      ];
    }
    return this.mockSlots[key];
  }

  async createBooking({ phone, centerId, slotId, cropQuantityKg }) {
    this.lastBookingError = null;
    const tokenPrefix = centerId ? centerId.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'BLR' : 'BLR';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tokenNumber = `${tokenPrefix}-${randomNum}`;

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.rpc('create_ussd_booking', {
          p_phone_number: phone,
          p_center_id: centerId,
          p_slot_id: slotId,
          p_crop_quantity_kg: cropQuantityKg,
          p_created_via: 'ussd'
        });
        if (!error && data) {
          this.activeBooking = data;
          return data;
        }
        // Keep the database's own words. It says exactly why — the number
        // already holds a token for that slot, the slot is full, the slot is
        // in the past — and a generic "something went wrong" throws that away,
        // leaving the caller and whoever is demonstrating equally stuck.
        this.lastBookingError = error?.message || null;
        console.error('USSD Booking was not saved to database:', error?.message);
      } catch (err) {
        this.lastBookingError = err && err.message ? err.message : String(err);
        console.error('USSD Booking RPC threw:', err);
      }
      // Live and the write failed. Returning the mock record below would hand
      // the caller a token that exists in no database and print "Token
      // Confirmed" over it — the failure this whole path was fixed to remove.
      // null lets app.js say the booking did not happen.
      return null;
    }

    const mockRecord = {
      booking_id: 'b0000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000),
      token_number: tokenNumber,
      phone_number: phone,
      center_id: centerId || 'c0000000-0000-0000-0000-000000000001',
      slot_id: slotId || 's0000000-0000-0000-0000-000000000001',
      crop_quantity_kg: cropQuantityKg || 1400,
      status: 'BOOKED',
      queue_position: Math.floor(Math.random() * 4) + 1,
      predicted_wait_mins: 25,
      created_via: 'ussd',
      created_at: new Date().toISOString()
    };

    // Decrement slot remaining count dynamically
    const cKey = centerId || 'c0000000-0000-0000-0000-000000000001';
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
      try {
        // A USSD caller is anon, and RLS does not admit anon to `bookings`, so
        // no query against that table can work here however it is written. The
        // RPC does the join server-side and returns only this caller's booking.
        //
        // The previous .or() was invalid besides: PostgREST cannot filter on an
        // embedded table's column, and answered "failed to parse logic tree"
        // for every input, tokens and phone numbers alike.
        const { data, error } = await this.client
          .rpc('get_ussd_booking_status', { p_token_or_phone: tokenOrPhone });
        if (!error && data) return data;
        if (error) console.error('Booking status lookup failed:', error.message);
      } catch (e) {
        console.error('Booking status RPC threw:', e);
      }
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
      ragi: { rate: '₹4,290/Q (Karnataka MSP)', forecast: 'Rising (+3.8%)', bestDay: 'Thursday', reason: 'High demand in Bengaluru/Mysuru Mandis' },
      tur: { rate: '₹7,550/Q (GI Tagged MSP)', forecast: 'Rising (+4.5%)', bestDay: 'Wednesday', reason: 'Kalaburagi GI Tur Dal mill processing spike' },
      paddy: { rate: '₹2,300/Q (MSP)', forecast: 'Stable (+0.5%)', bestDay: 'Friday', reason: 'Gangavathi/Sindhanur steady intake' },
      onion: { rate: '₹1,850/Q', forecast: 'Correction (-3.2%)', bestDay: 'Tomorrow', reason: 'Hubballi/Gadag high arrival volume' },
      cotton: { rate: '₹7,120/Q', forecast: 'Rising (+5.1%)', bestDay: 'Monday', reason: 'Raichur & Haveri textile mill demand' },
      maize: { rate: '₹2,225/Q', forecast: 'Steady (+1.0%)', bestDay: 'Tuesday', reason: 'Davanagere poultry feed demand' },
      wheat: { rate: '₹2,425/Q (MSP)', forecast: 'Rising (+2.4%)', bestDay: 'Thursday', reason: 'North Karnataka steady intake' }
    };

    const key = (cropName || 'ragi').toLowerCase();
    return rates[key] || rates.ragi;
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

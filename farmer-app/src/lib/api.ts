import { supabase, isSupabaseLive } from './supabase';
import { 
  MandiCenter, 
  SlotAvailable, 
  DailyRatesCache, 
  Booking, 
  Farmer, 
  NotificationItem,
  BookingStatus 
} from '../types/schema';
import { 
  MOCK_MANDI_CENTERS, 
  generateAvailableSlots, 
  generateDailyRatesCache, 
  DEFAULT_FARMER, 
  INITIAL_DEMO_BOOKING,
  INITIAL_NOTIFICATIONS 
} from './mockData';

// Helper for UUID generation in mock/offline mode
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Local in-memory state for offline/demo operation
let localFarmer: Farmer = { ...DEFAULT_FARMER };
let localBookings: Booking[] = [{ ...INITIAL_DEMO_BOOKING }];
let localNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
const localSlotsStore: Record<string, SlotAvailable[]> = {};

// Event emitter to notify components of simulated realtime updates
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToLocalState(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitChange() {
  listeners.forEach(l => l());
}

// 1. Mandi Centers
export async function getMandiCenters(): Promise<MandiCenter[]> {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase
        .from('mandi_centers')
        .select('*')
        .order('center_name');
      if (!error && data && data.length > 0) {
        return data as MandiCenter[];
      }
    } catch (e) {
      console.warn('Supabase fetch centers fallback:', e);
    }
  }
  return MOCK_MANDI_CENTERS;
}

// 2. Slots Available (reads from VIEW slots_available as requested by P1 schema rule)
export async function getSlotsAvailable(centerId: string): Promise<SlotAvailable[]> {
  const todayStr = new Date().toISOString().split('T')[0];
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase
        .from('slots_available')
        .select('*')
        .eq('center_id', centerId)
        .gte('slot_date', todayStr) // never show slots that have already passed
        .order('slot_date', { ascending: true })
        .order('slot_start_time', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as SlotAvailable[];
      }
    } catch (e) {
      console.warn('Supabase fetch slots fallback:', e);
    }
  }
  if (!localSlotsStore[centerId]) {
    localSlotsStore[centerId] = generateAvailableSlots(centerId, 7);
  }
  return localSlotsStore[centerId];
}

// 3. Daily Rates Cache & Predictive Engine (Calls P5 RPC get_best_selling_days with fallback)
export async function getDailyRatesCache(cropType: string, centerId: string): Promise<DailyRatesCache[]> {
  if (isSupabaseLive && supabase) {
    // Priority 1: Call P5 official smart dispatch RPC function
    try {
      const { data, error } = await supabase.rpc('get_best_selling_days', {
        p_crop_type: cropType,
        p_center_id: centerId || null,
        p_days_ahead: 7,
      });
      if (!error && data && data.length > 0) {
        return data.map((d: any, idx: number) => ({
          cache_id: d.cache_id || `rpc-${idx}-${d.forecast_date}`,
          crop_type: d.crop_type || cropType,
          center_id: d.center_id || centerId,
          forecast_date: d.forecast_date,
          predicted_price: Number(d.predicted_price) || 0,
          price_trend_score: Number(d.price_trend_score) || 0,
          best_day_score: Number(d.best_day_score) || 0,
          reason_text: d.reason_text || 'Optimal dispatch slot',
          traffic_light: d.traffic_light,
          is_best_day: d.is_best_day,
          load_ratio: d.load_ratio,
        })) as DailyRatesCache[];
      }
    } catch (e) {
      console.warn('Supabase RPC get_best_selling_days fallback:', e);
    }

    // Priority 2: Direct query on daily_rates_cache table
    try {
      const { data, error } = await supabase
        .from('daily_rates_cache')
        .select('*')
        .eq('crop_type', cropType)
        .eq('center_id', centerId)
        .order('forecast_date', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as DailyRatesCache[];
      }
    } catch (e) {
      console.warn('Supabase fetch daily rates fallback:', e);
    }
  }
  return generateDailyRatesCache(cropType, centerId, 7).map(r => ({ ...r, is_mock: true }));
}

// 4. Farmer Profile
export async function getFarmerProfile(phone: string): Promise<Farmer> {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('phone_number', phone)
        .single();
      if (!error && data) {
        localFarmer = data as Farmer;
        return localFarmer;
      }
    } catch (e) {
      console.warn('Supabase fetch farmer fallback:', e);
    }
  }
  localFarmer.phone_number = phone;
  return localFarmer;
}

export async function updateFarmerProfile(profile: Partial<Farmer>): Promise<Farmer> {
  localFarmer = { ...localFarmer, ...profile };
  if (isSupabaseLive && supabase && localFarmer.farmer_id) {
    try {
      await supabase
        .from('farmers')
        .upsert({
          ...localFarmer,
          updated_at: new Date().toISOString()
        });
    } catch (e) {
      console.warn('Supabase update farmer fallback:', e);
    }
  }
  emitChange();
  return localFarmer;
}

// 5. Farmer Bookings
export async function getFarmerBookings(farmerId: string): Promise<Booking[]> {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          mandi_centers (*),
          slots (*)
        `)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Booking[];
      }
    } catch (e) {
      console.warn('Supabase fetch bookings fallback:', e);
    }
  }
  return localBookings.filter(b => b.farmer_id === farmerId || !farmerId);
}

// 6. Create Booking (Uses Edge Function or RPC / table generator)
export async function createBooking(params: {
  farmerId: string;
  centerId: string;
  slotId: string;
  cropQuantityKg: number;
  phoneNumber?: string;
  fullName?: string;
  selectedSlot?: SlotAvailable;
  mandiCenter?: MandiCenter;
}): Promise<Booking> {
  const center = params.mandiCenter || MOCK_MANDI_CENTERS.find(c => c.center_id === params.centerId) || MOCK_MANDI_CENTERS[0];
  const centerPrefix = center.center_name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'MND';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const tokenNumber = `${centerPrefix}-${randomNum}`;

  // Calculate queue position specifically for this Mandi center
  const activeAtThisCenter = localBookings.filter(
    b => b.center_id === params.centerId && b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  );
  const queuePos = activeAtThisCenter.length + 1;
  const avgWaitPerFarmer = center.avg_processing_min || 12;
  const waitMins = queuePos * avgWaitPerFarmer;

  // Update in-memory slot store to decrement remaining slots
  let updatedSlot = params.selectedSlot;
  if (localSlotsStore[params.centerId]) {
    const targetSlot = localSlotsStore[params.centerId].find(s => s.slot_id === params.slotId);
    if (targetSlot) {
      targetSlot.booked_count += 1;
      targetSlot.remaining = Math.max(0, targetSlot.max_farmers - targetSlot.booked_count);
      updatedSlot = { ...targetSlot };
    }
  }

  if (isSupabaseLive && supabase) {
    try {
      // create_ussd_booking is a SECURITY DEFINER function anon can call. It
      // validates the centre, the slot, its capacity and duplicates, finds or
      // creates the farmer by phone, and returns the booking.
      //
      // This previously called an Edge Function named create-booking. That
      // function is not deployed on this project — POST /functions/v1/create-booking
      // answers 404 NOT_FOUND — so every booking was caught below and quietly
      // downgraded to browser-only state: a token and a QR pass the farmer can
      // see, and no row anywhere. The officer's queue stayed empty with nothing
      // reported. If that Edge Function is ever deployed, moving back is fine;
      // until then this is the path that reaches the database.
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_ussd_booking', {
        p_phone_number: localFarmer?.phone_number || '',
        p_center_id: params.centerId,
        p_slot_id: params.slotId,
        p_crop_quantity_kg: params.cropQuantityKg,
        p_full_name: localFarmer?.full_name || null,
        p_created_via: 'web',
      });

      if (rpcError) {
        console.error('create_ussd_booking failed:', rpcError.message);
      } else if (rpcData?.booking_id) {
        // Re-fetch with joined relations so the returned shape matches the
        // Booking type the rest of the app expects.
        const { data: fullBooking, error: fetchError } = await supabase
          .from('bookings')
          .select(`*, mandi_centers (*), slots (*), farmers (*)`)
          .eq('booking_id', rpcData.booking_id)
          .single();

        if (!fetchError && fullBooking) {
          return fullBooking as Booking;
        }
      }
    } catch (e) {
      console.error('create_ussd_booking threw:', e);
    }
    // If we reach here on a live Supabase project, the booking was NOT saved.
  }

  // Local state generation
  const newBooking: Booking = {
    booking_id: generateUUID(),
    farmer_id: params.farmerId,
    center_id: params.centerId,
    slot_id: params.slotId,
    token_number: tokenNumber,
    crop_quantity_kg: params.cropQuantityKg,
    status: 'BOOKED',
    queue_position: queuePos,
    predicted_wait_mins: waitMins,
    created_via: 'web',
    created_at: new Date().toISOString(),
    mandi_centers: center,
    farmers: localFarmer,
    slots: updatedSlot,
    is_mock: true, // this booking only exists in the browser, NOT in Supabase
  };

  localBookings.unshift(newBooking);

  // Auto-generate SMS confirmation
  const newNotif: NotificationItem = {
    notification_id: generateUUID(),
    farmer_id: params.farmerId,
    booking_id: newBooking.booking_id,
    channel: 'sms',
    message: `AgriQ: Slot confirmed! Token ${newBooking.token_number} generated for ${center.crop_type} at ${center.center_name}. Queue Pos: #${queuePos} at this mandi. Keep QR pass ready.`,
    sent_at: new Date().toISOString(),
    templateType: 'BOOKED',
    meta: {
      token: newBooking.token_number,
      crop: center.crop_type,
      center: center.center_name,
      queuePos: queuePos,
    },
  };
  localNotifications.unshift(newNotif);

  emitChange();
  return newBooking;
}

// 7. Transition Booking Status (MUST call transition_booking_status RPC as per locked rule)
export async function transitionBookingStatus(bookingId: string, newStatus: BookingStatus, changedBy: string = 'officer-demo'): Promise<boolean> {
  if (isSupabaseLive && supabase) {
    try {
      const { error } = await supabase.rpc('transition_booking_status', {
        p_booking_id: bookingId,
        p_new_status: newStatus,
        p_changed_by: changedBy,
      });
      if (!error) return true;
    } catch (e) {
      console.warn('RPC status transition fallback:', e);
    }
  }

  // Local state simulation
  const booking = localBookings.find(b => b.booking_id === bookingId);
  if (booking) {
    booking.status = newStatus;
    if (newStatus === 'CHECKED_IN') {
      booking.checked_in_at = new Date().toISOString();
      booking.queue_position = 1;
      booking.predicted_wait_mins = 10;
    } else if (newStatus === 'WEIGHED') {
      booking.crop_quantity_kg = booking.crop_quantity_kg || 2500;
      booking.predicted_wait_mins = 5;
    } else if (newStatus === 'QUALITY_APPROVED') {
      booking.quality_grade = 'Grade A (FAQ)';
      booking.predicted_wait_mins = 2;
    } else if (newStatus === 'PAYMENT_INITIATED') {
      const msp = 4892;
      const quintals = (booking.crop_quantity_kg || 2500) / 100;
      booking.payment_amount = Math.round(quintals * msp);
      booking.predicted_wait_mins = 0;
    } else if (newStatus === 'COMPLETED') {
      booking.completed_at = new Date().toISOString();
      booking.actual_wait_mins = 35;
      booking.queue_position = 0;
      booking.predicted_wait_mins = 0;

      // Advance other waiting bookings at the SAME mandi center
      localBookings
        .filter(b => b.center_id === booking.center_id && b.booking_id !== booking.booking_id && b.status !== 'COMPLETED' && b.status !== 'CANCELLED')
        .forEach(b => {
          if (b.queue_position && b.queue_position > 1) {
            b.queue_position -= 1;
            b.predicted_wait_mins = b.queue_position * (booking.mandi_centers?.avg_processing_min || 12);
          }
        });
    }

    // Add status change notification with template metadata
    let statusMsg = `AgriQ Update: Token ${booking.token_number} status is now ${newStatus.replace('_', ' ')}.`;
    if (newStatus === 'CHECKED_IN') statusMsg = `AgriQ: Checked in at ${booking.mandi_centers?.center_name || 'Mandi Yard'}. Proceed to Weighbridge Lane 2.`;
    if (newStatus === 'WEIGHED') statusMsg = `AgriQ: Weighbridge completed. Gross weight recorded: ${booking.crop_quantity_kg} kg. Proceed to Assayer Booth.`;
    if (newStatus === 'QUALITY_APPROVED') statusMsg = `AgriQ: Quality Assayer passed! Grade A assigned. Proceed to Accounts Counter.`;
    if (newStatus === 'PAYMENT_INITIATED') statusMsg = `AgriQ: Payment of ₹${booking.payment_amount?.toLocaleString('en-IN')} initiated via DBT to your Aadhaar-linked Bank A/C.`;
    if (newStatus === 'COMPLETED') statusMsg = `AgriQ: Procurement COMPLETED! Receipt #RCP-${booking.token_number} generated. Thank you!`;

    localNotifications.unshift({
      notification_id: `notif-${Date.now()}`,
      farmer_id: booking.farmer_id,
      booking_id: booking.booking_id,
      channel: 'sms',
      message: statusMsg,
      sent_at: new Date().toISOString(),
      templateType: newStatus as any,
      meta: {
        token: booking.token_number,
        center: booking.mandi_centers?.center_name,
        weightKg: booking.crop_quantity_kg,
        amount: booking.payment_amount,
        stage: newStatus,
      },
    });

    emitChange();
    return true;
  }
  return false;
}

// 8. Dispatch Share Notification
export function dispatchShareNotification(params: {
  farmerId: string;
  bookingId: string;
  recipientPhone: string;
  message: string;
  token?: string;
  center?: string;
}) {
  const notif: NotificationItem = {
    notification_id: `notif-share-${Date.now()}`,
    farmer_id: params.farmerId,
    booking_id: params.bookingId,
    channel: 'sms',
    message: `AgriQ SMS Dispatched to +91-${params.recipientPhone}: ${params.message}`,
    sent_at: new Date().toISOString(),
    templateType: 'SHARE_SENT',
    meta: {
      recipientPhone: params.recipientPhone,
      token: params.token,
      center: params.center,
    },
  };
  localNotifications.unshift(notif);
  emitChange();
}

// 9. Notifications
export async function getFarmerNotifications(farmerId: string): Promise<NotificationItem[]> {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('sent_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as NotificationItem[];
      }
    } catch (e) {
      console.warn('Supabase fetch notifications fallback:', e);
    }
  }
  return localNotifications;
}

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

// Local in-memory state for offline/demo operation
let localFarmer: Farmer = { ...DEFAULT_FARMER };
let localBookings: Booking[] = [{ ...INITIAL_DEMO_BOOKING }];
let localNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

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
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase
        .from('slots_available')
        .select('*')
        .eq('center_id', centerId)
        .order('slot_date', { ascending: true })
        .order('slot_start_time', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as SlotAvailable[];
      }
    } catch (e) {
      console.warn('Supabase fetch slots fallback:', e);
    }
  }
  return generateAvailableSlots(centerId, 7);
}

// 3. Daily Rates Cache (reads from daily_rates_cache for fast predictions)
export async function getDailyRatesCache(cropType: string, centerId: string): Promise<DailyRatesCache[]> {
  if (isSupabaseLive && supabase) {
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
  return generateDailyRatesCache(cropType, centerId, 7);
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
  selectedSlot?: SlotAvailable;
  mandiCenter?: MandiCenter;
}): Promise<Booking> {
  const center = params.mandiCenter || MOCK_MANDI_CENTERS.find(c => c.center_id === params.centerId) || MOCK_MANDI_CENTERS[0];
  const centerPrefix = center.center_name.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const tokenNumber = `${centerPrefix}-${randomNum}`;
  const queuePos = Math.floor(Math.random() * 5) + 1;
  const waitMins = queuePos * (center.avg_processing_min || 15);

  if (isSupabaseLive && supabase) {
    try {
      // Try calling Edge Function create-booking if deployed
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          farmer_id: params.farmerId,
          center_id: params.centerId,
          slot_id: params.slotId,
          crop_quantity_kg: params.cropQuantityKg,
          created_via: 'web',
        }
      });
      if (!error && data?.booking) {
        return data.booking as Booking;
      }
    } catch (e) {
      console.warn('Edge function fallback to direct booking:', e);
    }

    try {
      const newBookingRow = {
        farmer_id: params.farmerId,
        center_id: params.centerId,
        slot_id: params.slotId,
        token_number: tokenNumber,
        crop_quantity_kg: params.cropQuantityKg,
        status: 'BOOKED' as BookingStatus,
        queue_position: queuePos,
        predicted_wait_mins: waitMins,
        created_via: 'web' as const,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(newBookingRow)
        .select(`*, mandi_centers (*), slots (*)`)
        .single();
      
      if (!error && data) {
        return data as Booking;
      }
    } catch (e) {
      console.warn('Direct insert fallback:', e);
    }
  }

  // Local state generation
  const newBooking: Booking = {
    booking_id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
    slots: params.selectedSlot,
  };

  localBookings.unshift(newBooking);

  // Auto-generate SMS confirmation
  const newNotif: NotificationItem = {
    notification_id: `notif-${Date.now()}`,
    farmer_id: params.farmerId,
    booking_id: newBooking.booking_id,
    channel: 'sms',
    message: `AgriQ: Slot confirmed! Token ${newBooking.token_number} generated for ${center.crop_type} at ${center.center_name}. Queue Pos: #${queuePos}. Keep QR pass ready.`,
    sent_at: new Date().toISOString(),
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
    }

    // Add status change notification
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
    });

    emitChange();
    return true;
  }
  return false;
}

// 8. Notifications
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

import { MandiCenter, SlotAvailable, DailyRatesCache, Booking, Farmer, NotificationItem, CropInfo } from '../types/schema';

export const CROPS_DATA: CropInfo[] = [
  { id: 'Ragi', nameKey: 'crop_ragi', icon: '🌾', mspPrice: 4290, unit: 'Quintal', category: 'Millets' },
  { id: 'Tur', nameKey: 'crop_tur', icon: '🥣', mspPrice: 7550, unit: 'Quintal', category: 'Pulses' },
  { id: 'Paddy', nameKey: 'crop_paddy', icon: '🍚', mspPrice: 2300, unit: 'Quintal', category: 'Cereals' },
  { id: 'Onion', nameKey: 'crop_onion', icon: '🧅', mspPrice: 1850, unit: 'Quintal', category: 'Vegetables' },
  { id: 'Cotton', nameKey: 'crop_cotton', icon: '☁️', mspPrice: 7120, unit: 'Quintal', category: 'Fiber' },
  { id: 'Maize', nameKey: 'crop_maize', icon: '🌽', mspPrice: 2225, unit: 'Quintal', category: 'Cereals' },
  { id: 'Soybean', nameKey: 'crop_soybean', icon: '🌱', mspPrice: 4892, unit: 'Quintal', category: 'Oilseeds' },
  { id: 'Wheat', nameKey: 'crop_wheat', icon: '🌾', mspPrice: 2425, unit: 'Quintal', category: 'Cereals' },
  { id: 'Mustard', nameKey: 'crop_mustard', icon: '🌼', mspPrice: 5650, unit: 'Quintal', category: 'Oilseeds' },
  { id: 'Gram', nameKey: 'crop_chana', icon: '🧆', mspPrice: 5440, unit: 'Quintal', category: 'Pulses' },
];

export const MOCK_MANDI_CENTERS: MandiCenter[] = [
  // --- Karnataka APMC Centers ---
  {
    center_id: 'c0000000-0000-0000-0000-000000000001',
    center_name: 'Bengaluru APMC (Yeshwanthpur Main Yard)',
    location: 'APMC Market Yard, Yeshwanthpur',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    crop_type: 'Ragi',
    daily_capacity_kg: 60000,
    hourly_intake_limit: 45,
    avg_processing_min: 12,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c0000000-0000-0000-0000-000000000002',
    center_name: 'Hubballi APMC (Amaragol Market Yard)',
    location: 'Amaragol, PB Road',
    district: 'Dharwad',
    state: 'Karnataka',
    crop_type: 'Onion',
    daily_capacity_kg: 75000,
    hourly_intake_limit: 50,
    avg_processing_min: 14,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c0000000-0000-0000-0000-000000000003',
    center_name: 'Mysuru APMC (Bandipalya Yard)',
    location: 'Bandipalya, Nanjangud Road',
    district: 'Mysuru',
    state: 'Karnataka',
    crop_type: 'Paddy',
    daily_capacity_kg: 55000,
    hourly_intake_limit: 40,
    avg_processing_min: 15,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c0000000-0000-0000-0000-000000000004',
    center_name: 'Kalaburagi APMC (Nehru Gunj Hub)',
    location: 'Nehru Gunj Market',
    district: 'Kalaburagi',
    state: 'Karnataka',
    crop_type: 'Tur',
    daily_capacity_kg: 80000,
    hourly_intake_limit: 60,
    avg_processing_min: 16,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c0000000-0000-0000-0000-000000000005',
    center_name: 'Belagavi APMC Central Yard',
    location: 'RMC Yard, Shivaji Nagar',
    district: 'Belagavi',
    state: 'Karnataka',
    crop_type: 'Maize',
    daily_capacity_kg: 50000,
    hourly_intake_limit: 35,
    avg_processing_min: 15,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c0000000-0000-0000-0000-000000000006',
    center_name: 'Raichur Cotton & Paddy APMC',
    location: 'Gunj Area, Raichur',
    district: 'Raichur',
    state: 'Karnataka',
    crop_type: 'Cotton',
    daily_capacity_kg: 70000,
    hourly_intake_limit: 50,
    avg_processing_min: 18,
    operating_start: '08:00',
    operating_end: '18:00',
  },

  // --- Maharashtra APMC Centers ---
  {
    center_id: 'c1111111-1111-1111-1111-111111111111',
    center_name: 'Nashik APMC Main Yard',
    location: 'Dindori Road, Panchavati',
    district: 'Nashik',
    state: 'Maharashtra',
    crop_type: 'Soybean',
    daily_capacity_kg: 50000,
    hourly_intake_limit: 40,
    avg_processing_min: 12,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c2222222-2222-2222-2222-222222222222',
    center_name: 'Lasalgaon Onion & Grain Market Yard',
    location: 'Station Road, Lasalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    crop_type: 'Onion',
    daily_capacity_kg: 85000,
    hourly_intake_limit: 65,
    avg_processing_min: 14,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c3333333-3333-3333-3333-333333333333',
    center_name: 'Pune APMC (Gultekdi Market Yard)',
    location: 'Gultekdi, Market Yard Road',
    district: 'Pune',
    state: 'Maharashtra',
    crop_type: 'Wheat',
    daily_capacity_kg: 75000,
    hourly_intake_limit: 50,
    avg_processing_min: 15,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c4444444-4444-4444-4444-444444444444',
    center_name: 'Nagpur APMC Cotton & Grain Yard',
    location: 'Kalamna Market, Kamptee Road',
    district: 'Nagpur',
    state: 'Maharashtra',
    crop_type: 'Cotton',
    daily_capacity_kg: 65000,
    hourly_intake_limit: 45,
    avg_processing_min: 16,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c5555555-5555-5555-5555-555555555555',
    center_name: 'Ahmednagar APMC Market Yard',
    location: 'Station Road, Market Yard',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    crop_type: 'Soybean',
    daily_capacity_kg: 50000,
    hourly_intake_limit: 40,
    avg_processing_min: 15,
    operating_start: '08:00',
    operating_end: '18:00',
  }
];

export function generateAvailableSlots(centerId: string, daysAhead: number = 7): SlotAvailable[] {
  const slots: SlotAvailable[] = [];
  const times = [
    { start: '08:00:00', end: '10:00:00', max: 35, booked: 18 },
    { start: '10:00:00', end: '12:00:00', max: 40, booked: 36 },
    { start: '12:00:00', end: '14:00:00', max: 40, booked: 20 },
    { start: '14:00:00', end: '16:00:00', max: 35, booked: 12 },
    { start: '16:00:00', end: '18:00:00', max: 25, booked: 7 },
  ];

  const today = new Date();
  for (let d = 0; d < daysAhead; d++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + d);
    const dateStr = slotDate.toISOString().split('T')[0];

    times.forEach((t, idx) => {
      const dayFactor = (d + idx) % 3;
      const bookedCount = Math.min(t.max, t.booked + dayFactor * 4);
      slots.push({
        slot_id: `slot-${centerId.slice(0, 4)}-${dateStr}-${idx}`,
        center_id: centerId,
        slot_date: dateStr,
        slot_start_time: t.start,
        slot_end_time: t.end,
        max_farmers: t.max,
        booked_count: bookedCount,
        remaining: Math.max(0, t.max - bookedCount),
      });
    });
  }
  return slots;
}

export function generateDailyRatesCache(cropType: string, centerId: string, daysAhead: number = 7): DailyRatesCache[] {
  const baseRate = CROPS_DATA.find(c => c.id.toLowerCase() === cropType.toLowerCase())?.mspPrice || 4290;
  const rates: DailyRatesCache[] = [];
  const today = new Date();

  for (let d = 0; d < daysAhead; d++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + d);
    const dateStr = forecastDate.toISOString().split('T')[0];

    // Simulated market fluctuation curve
    const priceVariance = Math.round(Math.sin(d * 0.9) * 140 + Math.cos(d * 0.5) * 60);
    const predictedPrice = Math.max(baseRate - 100, baseRate + priceVariance);

    // Queue congestion penalty (0 to 25 pts)
    const simulatedLoad = ((d * 37) % 100) / 100;
    const congestionPenalty = Math.round(simulatedLoad * 25);

    // Smart dispatch score (0-100)
    const baseScore = Math.min(95, Math.max(50, Math.round(65 + (priceVariance / 15))));
    const bestDayScore = Math.max(10, baseScore - congestionPenalty);

    let reason = 'Standard market slot with normal wait time';
    if (bestDayScore >= 82) {
      reason = '🌟 High MSP premium, optimal queue intake capacity';
    } else if (congestionPenalty > 18) {
      reason = '⚠️ High mandi arrival rush anticipated, expected queue delay';
    } else if (priceVariance > 50) {
      reason = '📈 Bullish spot rates expected from bulk institutional buyers';
    }

    rates.push({
      cache_id: `cache-${cropType}-${centerId.slice(0, 4)}-${dateStr}`,
      crop_type: cropType,
      center_id: centerId,
      forecast_date: dateStr,
      predicted_price: predictedPrice,
      price_trend_score: baseScore, // 0-100 scale, matches real RPC shape
      best_day_score: bestDayScore,
      reason_text: reason,
      updated_at: new Date().toISOString(),
    });
  }
  return rates;
}

export const DEFAULT_FARMER: Farmer = {
  farmer_id: 'f1111111-1111-1111-1111-111111111111',
  full_name: 'Ramesh Gowda',
  phone_number: '9845012345',
  village: 'Nelamangala',
  district: 'Bengaluru Rural',
  state: 'Karnataka',
  preferred_lang: 'kn',
  created_at: '2026-09-01T10:00:00Z',
};

export const DEFAULT_SAVED_ACCOUNTS: Farmer[] = [
  {
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    full_name: 'Ramesh Gowda',
    phone_number: '9845012345',
    village: 'Nelamangala',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    preferred_lang: 'kn',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    farmer_id: 'f2222222-2222-2222-2222-222222222222',
    full_name: 'Suresh Patil',
    phone_number: '9822098765',
    village: 'Pimpalgaon Baswant',
    district: 'Nashik',
    state: 'Maharashtra',
    preferred_lang: 'mr',
    created_at: '2026-09-01T11:00:00Z',
  },
  {
    farmer_id: 'f3333333-3333-3333-3333-333333333333',
    full_name: 'Rajendra Verma',
    phone_number: '9811054321',
    village: 'Kalamna Gunj',
    district: 'Nagpur',
    state: 'Maharashtra',
    preferred_lang: 'hi',
    created_at: '2026-09-01T12:00:00Z',
  },
];

export const INITIAL_DEMO_BOOKING: Booking = {
  booking_id: 'b1111111-1111-1111-1111-111111111101',
  farmer_id: 'f1111111-1111-1111-1111-111111111111',
  center_id: 'c0000000-0000-0000-0000-000000000001',
  slot_id: 's0000000-0000-0000-0000-000000000001',
  token_number: 'BLR-0231',
  crop_quantity_kg: 1850,
  status: 'BOOKED',
  queue_position: 1,
  predicted_wait_mins: 12,
  created_via: 'web',
  created_at: new Date().toISOString(),
  mandi_centers: MOCK_MANDI_CENTERS[0],
  farmers: DEFAULT_SAVED_ACCOUNTS[0],
  slots: {
    slot_id: 's0000000-0000-0000-0000-000000000001',
    center_id: 'c0000000-0000-0000-0000-000000000001',
    slot_date: new Date().toISOString().split('T')[0],
    slot_start_time: '10:00:00',
    slot_end_time: '12:00:00',
    max_farmers: 40,
    booked_count: 24,
    remaining: 16,
  },
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    notification_id: 'notif-1',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    booking_id: 'b-demo-initial-001',
    channel: 'sms',
    message: 'AgriQ: Slot confirmed! Token BLR-0231 generated for Ragi at Bengaluru APMC (Yeshwanthpur Main Yard). Queue Pos: #1. Keep QR pass ready.',
    sent_at: new Date().toISOString(),
    templateType: 'BOOKED',
    meta: {
      token: 'BLR-0231',
      crop: 'Ragi',
      center: 'Bengaluru APMC (Yeshwanthpur Main Yard)',
      queuePos: 1,
    },
  },
  {
    notification_id: 'notif-2',
    farmer_id: 'f2222222-2222-2222-2222-222222222222',
    booking_id: 'b-demo-initial-002',
    channel: 'sms',
    message: 'AgriQ: Slot confirmed! Token NSK-1082 generated for Soybean at Nashik APMC Main Yard. Queue Pos: #1. Keep QR pass ready.',
    sent_at: new Date(Date.now() - 3600000).toISOString(),
    templateType: 'BOOKED',
    meta: {
      token: 'NSK-1082',
      crop: 'Soybean',
      center: 'Nashik APMC Main Yard',
      queuePos: 1,
    },
  },
  {
    notification_id: 'notif-3',
    farmer_id: 'f3333333-3333-3333-3333-333333333333',
    booking_id: 'b-demo-initial-003',
    channel: 'sms',
    message: 'AgriQ: Slot confirmed! Token NAG-4512 generated for Cotton at Nagpur APMC Cotton & Grain Yard. Queue Pos: #1. Keep QR pass ready.',
    sent_at: new Date(Date.now() - 7200000).toISOString(),
    templateType: 'BOOKED',
    meta: {
      token: 'NAG-4512',
      crop: 'Cotton',
      center: 'Nagpur APMC Cotton & Grain Yard',
      queuePos: 1,
    },
  },
];
import { MandiCenter, SlotAvailable, DailyRatesCache, Booking, Farmer, NotificationItem, CropInfo } from '../types/schema';

export const CROPS_DATA: CropInfo[] = [
  { id: 'Soybean', nameKey: 'crop_soybean', icon: '🌱', mspPrice: 4892, unit: 'Quintal', category: 'Oilseeds' },
  { id: 'Wheat', nameKey: 'crop_wheat', icon: '🌾', mspPrice: 2275, unit: 'Quintal', category: 'Cereals' },
  { id: 'Cotton', nameKey: 'crop_cotton', icon: '☁️', mspPrice: 7121, unit: 'Quintal', category: 'Fiber' },
  { id: 'Paddy', nameKey: 'crop_paddy', icon: '🍚', mspPrice: 2300, unit: 'Quintal', category: 'Cereals' },
  { id: 'Mustard', nameKey: 'crop_mustard', icon: '🌼', mspPrice: 5650, unit: 'Quintal', category: 'Oilseeds' },
  { id: 'Gram', nameKey: 'crop_chana', icon: '🧆', mspPrice: 5440, unit: 'Quintal', category: 'Pulses' },
  { id: 'Onion', nameKey: 'crop_onion', icon: '🧅', mspPrice: 2600, unit: 'Quintal', category: 'Vegetables' },
  { id: 'Maize', nameKey: 'crop_maize', icon: '🌽', mspPrice: 2090, unit: 'Quintal', category: 'Cereals' },
];

export const MOCK_MANDI_CENTERS: MandiCenter[] = [
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
    center_name: 'Khanna Grain Market Yard A',
    location: 'GT Road, Mandi Gobindgarh Side',
    district: 'Ludhiana',
    state: 'Punjab',
    crop_type: 'Wheat',
    daily_capacity_kg: 80000,
    hourly_intake_limit: 60,
    avg_processing_min: 15,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c3333333-3333-3333-3333-333333333333',
    center_name: 'Abohar Cotton Market Yard',
    location: 'Hanumangarh Road',
    district: 'Fazilka',
    state: 'Punjab',
    crop_type: 'Cotton',
    daily_capacity_kg: 40000,
    hourly_intake_limit: 30,
    avg_processing_min: 18,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c4444444-4444-4444-4444-444444444444',
    center_name: 'Nizamabad APMC Procurement Hub',
    location: 'Bodhan Road',
    district: 'Nizamabad',
    state: 'Telangana',
    crop_type: 'Paddy',
    daily_capacity_kg: 60000,
    hourly_intake_limit: 45,
    avg_processing_min: 14,
    operating_start: '08:00',
    operating_end: '18:00',
  },
  {
    center_id: 'c5555555-5555-5555-5555-555555555555',
    center_name: 'Bharatpur Krishi Upaj Mandi',
    location: 'Agra-Jaipur Highway Gate 2',
    district: 'Bharatpur',
    state: 'Rajasthan',
    crop_type: 'Mustard',
    daily_capacity_kg: 45000,
    hourly_intake_limit: 35,
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
      // Add slight variability based on day
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
  const baseRate = CROPS_DATA.find(c => c.id === cropType)?.mspPrice || 4800;
  const rates: DailyRatesCache[] = [];
  const today = new Date();

  // Pattern of price predictions
  const trends = [
    { diff: 45, score: 92, rushPenalty: 8, reason: 'High market demand + Low expected mandi rush' },
    { diff: -20, score: 72, rushPenalty: 18, reason: 'Moderate rate, heavy mandi intake expected' },
    { diff: 90, score: 96, rushPenalty: 6, reason: 'Peak price forecast (₹' + (baseRate + 90) + '/q) + Fast processing' },
    { diff: 15, score: 81, rushPenalty: 12, reason: 'Steady prices, normal queue wait' },
    { diff: -50, score: 65, rushPenalty: 22, reason: 'Price dip expected, high load' },
    { diff: 70, score: 89, rushPenalty: 9, reason: 'Favorable buying demand from government mills' },
    { diff: 30, score: 84, rushPenalty: 10, reason: 'Good price stability' },
  ];

  for (let d = 0; d < daysAhead; d++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + d);
    const dateStr = forecastDate.toISOString().split('T')[0];
    const trend = trends[d % trends.length];

    const priceTrendScore = baseRate + trend.diff;
    const adjustedBestDayScore = Math.max(10, trend.score - trend.rushPenalty);

    rates.push({
      cache_id: `rate-${cropType}-${dateStr}`,
      crop_type: cropType,
      center_id: centerId,
      forecast_date: dateStr,
      price_trend_score: priceTrendScore,
      best_day_score: adjustedBestDayScore,
      reason_text: trend.reason,
      updated_at: new Date().toISOString(),
    });
  }
  return rates;
}

export const DEFAULT_FARMER: Farmer = {
  farmer_id: 'f8888888-8888-8888-8888-888888888888',
  full_name: 'Ramesh Patil',
  phone_number: '9876543210',
  village: 'Pimpalgaon Baswant',
  district: 'Nashik',
  state: 'Maharashtra',
  preferred_lang: 'mr',
  created_at: new Date().toISOString(),
};

export const INITIAL_DEMO_BOOKING: Booking = {
  booking_id: 'b9999999-9999-9999-9999-999999999999',
  farmer_id: 'f8888888-8888-8888-8888-888888888888',
  slot_id: 'slot-c111-today-0',
  center_id: 'c1111111-1111-1111-1111-111111111111',
  token_number: 'NSK-0231',
  crop_quantity_kg: 2500, // 25 Quintals
  quality_grade: undefined,
  payment_amount: undefined,
  status: 'BOOKED',
  queue_position: 4,
  predicted_wait_mins: 28,
  actual_wait_mins: undefined,
  created_via: 'web',
  checked_in_at: undefined,
  completed_at: undefined,
  created_at: new Date().toISOString(),
  mandi_centers: MOCK_MANDI_CENTERS[0],
  farmers: DEFAULT_FARMER,
  slots: {
    slot_id: 'slot-c111-today-0',
    center_id: 'c1111111-1111-1111-1111-111111111111',
    slot_date: new Date().toISOString().split('T')[0],
    slot_start_time: '08:00:00',
    slot_end_time: '10:00:00',
    max_farmers: 35,
    booked_count: 18,
    remaining: 17,
  }
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    notification_id: 'notif-1',
    farmer_id: 'f8888888-8888-8888-8888-888888888888',
    booking_id: 'b9999999-9999-9999-9999-999999999999',
    channel: 'sms',
    message: 'AgriQ: Your Mandi Token NSK-0231 for Soybean at Nashik APMC is CONFIRMED for 08:00 AM - 10:00 AM slot. Keep QR code ready.',
    sent_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    notification_id: 'notif-0',
    farmer_id: 'f8888888-8888-8888-8888-888888888888',
    channel: 'sms',
    message: 'AgriQ Smart Advisory: Soybean prices at Nashik APMC are forecast to rise +₹90/q on Thursday. Optimal selling window open.',
    sent_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

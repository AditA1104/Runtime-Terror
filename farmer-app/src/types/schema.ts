// =========================================================
// AgriQ (Runtime-Terror) — SIH 2026 — PS 26032
// TypeScript Schema Definitions matching PostgreSQL Schema v2
// =========================================================

export type BookingStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'WEIGHED'
  | 'QUALITY_APPROVED'
  | 'PAYMENT_INITIATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type QualityGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Grade FAQ (Fair Average Quality)';

export interface Farmer {
  farmer_id: string;
  full_name: string;
  phone_number: string;
  village?: string;
  district?: string;
  state?: string;
  preferred_lang: string; // 'en' | 'hi' | 'mr' | 'kn' | 'te' | 'pa'
  created_at?: string;
}

export interface MandiCenter {
  center_id: string;
  center_name: string;
  location: string;
  district: string;
  state: string;
  crop_type: string;
  daily_capacity_kg: number;
  hourly_intake_limit: number;
  avg_processing_min: number;
  operating_start: string; // '08:00'
  operating_end: string;   // '18:00'
  created_at?: string;
}

export interface SlotAvailable {
  slot_id: string;
  center_id: string;
  slot_date: string; // YYYY-MM-DD
  slot_start_time: string; // HH:MM:SS
  slot_end_time: string;   // HH:MM:SS
  max_farmers: number;
  booked_count: number;
  remaining: number;
}

export interface Booking {
  booking_id: string;
  farmer_id: string;
  slot_id: string;
  center_id: string;
  token_number: string;      // e.g. 'NSK-0231'
  crop_quantity_kg?: number;
  quality_grade?: string;    // filled at Quality Assayer checkpoint
  payment_amount?: number;   // filled at Accounts checkpoint
  status: BookingStatus;
  queue_position?: number;
  predicted_wait_mins?: number;
  actual_wait_mins?: number;
  created_via: 'web' | 'ussd';
  checked_in_at?: string;
  completed_at?: string;
  created_at: string;
  
  // Joined fields for display convenience
  mandi_centers?: Partial<MandiCenter>;
  farmers?: Partial<Farmer>;
  slots?: Partial<SlotAvailable>;
}

export interface StatusLog {
  log_id: string;
  booking_id: string;
  from_status?: string;
  to_status: BookingStatus;
  changed_by: string;
  created_at: string;
}

export interface DailyRatesCache {
  cache_id: string;
  crop_type: string;
  center_id: string;
  forecast_date: string;     // YYYY-MM-DD
  price_trend_score: number; // e.g. 88 (out of 100) or predicted price ₹/quintal
  best_day_score: number;    // combined adjusted score
  reason_text: string;       // e.g. "High price, low crowd"
  updated_at?: string;
}

export interface NotificationItem {
  notification_id: string;
  farmer_id: string;
  booking_id?: string;
  channel: 'sms' | 'whatsapp' | 'push';
  message: string;
  sent_at: string;
  templateType?: 'BOOKED' | 'CHECKED_IN' | 'WEIGHED' | 'QUALITY_APPROVED' | 'PAYMENT_INITIATED' | 'COMPLETED' | 'SHARE_SENT';
  meta?: {
    token?: string;
    crop?: string;
    center?: string;
    queuePos?: number;
    weightKg?: number;
    amount?: number;
    recipientPhone?: string;
    stage?: string;
  };
}

export interface CropInfo {
  id: string;
  nameKey: string;
  icon: string;
  mspPrice: number; // ₹ per quintal (100 kg)
  unit: string;
  category: string;
}

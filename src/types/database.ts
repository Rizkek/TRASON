export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar_url?: string;
  email_verified: boolean;
  phone?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  email_digest_enabled: boolean;
  digest_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: 'income' | 'expense';
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/** Minimal shape returned when Supabase joins categories via a foreign key */
export interface CategoryJoin {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  time?: string;
  payment_method?: string;
  receipt_image_url?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  /** Populated by Supabase join when selecting categories:category_id(...) — Supabase returns an array even for single-row joins */
  categories?: CategoryJoin[] | null;
}

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  mood?: string;
  rating?: number;
  location?: string;
  participants?: string[];
  tags?: string[];
  image_urls?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface SportLog {
  id: string;
  user_id: string;
  activity_id: string;
  type: string;
  duration_seconds?: number;
  reps?: number;
  sets?: number;
  weight_kg?: number;
  distance_meters?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  due_datetime?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_custom_rule?: string;
  recurrence_end_date?: string;
  recurrence_occurrences?: number;
  notify_days_before?: number;
  notify_hours_before?: number;
  notify_times?: number[];
  tags?: string[];
  linked_template_activity_id?: string;
  is_recurring_weekly?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/** Weekly Template - Setup sekali untuk semua minggu */
export interface WeeklyTemplate {
  id: string;
  user_id: string;
  
  // Template info
  name: string;
  description?: string;
  
  // Status
  is_active: boolean;
  is_default: boolean;
  
  // Validity
  start_date?: string;
  end_date?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/** Activity dalam weekly template */
export interface TemplateActivity {
  id: string;
  weekly_template_id: string;
  
  // Day info (0=Sunday, 1=Monday, ..., 6=Saturday)
  day_of_week: number;
  
  // Timing
  start_time: string;
  duration_minutes: number;
  
  // Activity info
  title: string;
  description?: string;
  category?: string;
  mood?: string;
  location?: string;
  rating?: number;
  
  // Options
  allow_override?: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/** Override untuk minggu tertentu */
export interface TemplateOverride {
  id: string;
  user_id: string;
  weekly_template_id: string;
  
  // Week info
  week_start_date: string;
  
  // Changes
  removed_activity_ids?: string[];
  added_activities?: TemplateActivity[];
  modified_activities?: Record<string, Partial<TemplateActivity>>;
  
  // Info
  reason?: string;
  notes?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

/** Unified schedule block (Template Activity or Reminder) */
export interface ScheduleBlock {
  id: string;
  user_id: string;
  
  // Basic info
  type: 'template_activity' | 'reminder';
  title: string;
  description?: string;
  
  // Timing
  day_of_week?: number;
  start_time: string;
  duration_minutes?: number;
  
  // Categorization
  category?: string;
  tags?: string[];
  
  // Template activity specific
  mood?: string;
  rating?: number;
  location?: string;
  from_template?: boolean;
  is_override?: boolean;
  
  // Reminder specific
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'cancelled';
  linked_template_activity_id?: string;
  
  // Metadata
  source_id: string;
  color?: string;
  icon?: string;
  
  created_at: string;
  updated_at: string;
}

/** Schedule conflict detected */
export interface ScheduleConflict {
  id?: string;
  conflict_type: 'overlap' | 'no_buffer' | 'back_to_back';
  block1: ScheduleBlock;
  block2: ScheduleBlock;
  conflict_time: string;
  duration_minutes: number;
  severity: 'warning' | 'error';
  suggestion?: string;
  created_at?: string;
}

/** Weekly schedule snapshot */
export interface WeeklyScheduleSnapshot {
  week_start_date: string;
  template_id: string;
  has_overrides: boolean;
  blocks: ScheduleBlock[];
  conflicts: ScheduleConflict[];
  stats: {
    total_activities: number;
    total_reminders: number;
    adherence_percentage: number;
  };
}

export interface InvestmentPosition {
  id: string;
  user_id: string;
  asset_type: 'stock' | 'crypto' | 'gold';
  symbol: string;
  display_name?: string | null;
  amount: number;
  buy_price: number;
  buy_date: string;
  quote_currency: string;
  price_source: string;
  external_id?: string | null;
  manual_current_price?: number | null;
  last_price?: number | null;
  last_price_change_pct?: number | null;
  last_valued_at?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface InvestmentPriceSnapshot {
  id: string;
  user_id: string;
  position_id: string;
  snapshot_date: string;
  price: number;
  change_percent?: number | null;
  source: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  date: string;
  type: string;
  category?: string;
  insight_text: string;
  data?: Record<string, unknown>;
  confidence_score?: number;
  is_actionable: boolean;
  created_at: string;
  updated_at: string;
}

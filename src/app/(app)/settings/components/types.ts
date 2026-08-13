import { BellRinging, Camera, Clock, TrendUp as TrendingUp, Wallet, type Icon } from '@phosphor-icons/react';

export interface ProfileData {
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  avatar_url?: string;
}

export interface PreferenceData {
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  email_digest_enabled: boolean;
  digest_frequency: string;
  module_features?: Record<string, boolean>;
  onboarding_done?: boolean;
}

export interface UserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  user_preferences?: PreferenceData[];
}

export type Tab = 'profile' | 'preferences' | 'security' | 'notifications' | 'modules';

export const MODULE_ICONS: Record<string, Icon> = {
  Wallet,
  TrendingUp,
  Clock,
  Bell: BellRinging,
  Lightbulb: Camera,
};

export const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'IDR', 'JPY', 'SGD', 'AUD', 'CAD'];
export const TIMEZONE_OPTIONS = [
  'UTC',
  'Asia/Jakarta',
  'Asia/Singapore',
  'Asia/Tokyo',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
];
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
];

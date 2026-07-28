import React from 'react';
import { 
  // Finance & Business
  Wallet, CreditCard, Money, Bank, PiggyBank, Coins, TrendUp, TrendDown, ChartBar, ChartLineUp, Receipt, Vault, Briefcase, Calculator, CurrencyDollar, CurrencyEur, CurrencyGbp, CurrencyInr, CurrencyJpy,
  // Shopping
  ShoppingCart, Bag, Tote, Storefront, Basket, Gift, Tag, Barcode,
  // Food & Drink
  Coffee, ForkKnife, Hamburger, Pizza, Martini, BeerBottle, Wine, BowlFood, Cake, Carrot,
  // Transport & Travel
  Car, Bus, Train, Airplane, Bicycle, Boat, Taxi, Moped, Scooter, MapPin, MapTrifold, Compass, Globe, Suitcase,
  // Home & Utilities
  House, Drop, Flame, Lightning, Lightbulb, Plug, Key, Lock, Umbrella, Toilet, Shower, Bathtub, Bed,
  // Health & Wellness
  Heartbeat, Heart, FirstAidKit, Pill, Barbell, Brain, Person,
  // Tech & Electronics
  Monitor, DeviceMobile, Laptop, Desktop, Television, Headphones, SpeakerHigh, GameController, Mouse, Keyboard, Camera, VideoCamera,
  // Lifestyle & Entertainment
  MusicNotes, FilmStrip, Book, GraduationCap, Popcorn, Basketball, Football, TennisBall, Volleyball, PianoKeys, Guitar, Palette,
  // Miscellaneous
  Package, DotsThree, Question, Star, Gear, Bell, Calendar, Clock, CheckCircle, Warning, Info, Target, Trophy, Crown, Medal
} from '@phosphor-icons/react/dist/ssr';

export const ICON_CATEGORIES = [
  {
    name: 'Finance & Business',
    icons: ['Wallet', 'CreditCard', 'Money', 'Bank', 'PiggyBank', 'Coins', 'TrendUp', 'TrendDown', 'ChartBar', 'ChartLineUp', 'Receipt', 'Vault', 'Briefcase', 'Calculator', 'CurrencyDollar', 'CurrencyEur', 'CurrencyGbp', 'CurrencyInr', 'CurrencyJpy']
  },
  {
    name: 'Shopping',
    icons: ['ShoppingCart', 'Bag', 'Tote', 'Storefront', 'Basket', 'Gift', 'Tag', 'Barcode']
  },
  {
    name: 'Food & Drink',
    icons: ['Coffee', 'ForkKnife', 'Hamburger', 'Pizza', 'Martini', 'BeerBottle', 'Wine', 'BowlFood', 'Cake', 'Carrot']
  },
  {
    name: 'Transport & Travel',
    icons: ['Car', 'Bus', 'Train', 'Airplane', 'Bicycle', 'Boat', 'Taxi', 'Moped', 'Scooter', 'MapPin', 'MapTrifold', 'Compass', 'Globe', 'Suitcase']
  },
  {
    name: 'Home & Utilities',
    icons: ['Home', 'Drop', 'Flame', 'Zap', 'Lightbulb', 'Plug', 'Key', 'Lock', 'Umbrella', 'Toilet', 'Shower', 'Bathtub', 'Bed']
  },
  {
    name: 'Health & Wellness',
    icons: ['Activity', 'Heart', 'FirstAidKit', 'Pill', 'Barbell', 'Brain', 'Person']
  },
  {
    name: 'Tech & Electronics',
    icons: ['Monitor', 'Smartphone', 'Laptop', 'Desktop', 'Television', 'Headphones', 'SpeakerHigh', 'GameController', 'Mouse', 'Keyboard', 'Camera', 'VideoCamera']
  },
  {
    name: 'Lifestyle & Entertainment',
    icons: ['MusicNotes', 'FilmStrip', 'Book', 'GraduationCap', 'Popcorn', 'Basketball', 'Football', 'TennisBall', 'Volleyball', 'PianoKeys', 'Guitar', 'Palette']
  },
  {
    name: 'Miscellaneous',
    icons: ['Package', 'MoreHorizontal', 'HelpCircle', 'Star', 'Gear', 'Bell', 'Calendar', 'Clock', 'CheckCircle', 'Warning', 'Info', 'Target', 'Trophy', 'Crown', 'Medal']
  }
];

// For backward compatibility and easy flat mapping
export const CATEGORY_ICONS = ICON_CATEGORIES.flatMap(cat => cat.icons);

const iconMap: Record<string, React.ElementType> = {
  // Finance & Business
  Wallet, CreditCard, Money, Bank, PiggyBank, Coins, TrendUp, TrendDown, ChartBar, ChartLineUp, Receipt, Vault, Briefcase, Calculator, CurrencyDollar, CurrencyEur, CurrencyGbp, CurrencyInr, CurrencyJpy,
  // Shopping
  ShoppingCart, Bag, Tote, Storefront, Basket, Gift, Tag, Barcode,
  // Food & Drink
  Coffee, ForkKnife, Hamburger, Pizza, Martini, BeerBottle, Wine, BowlFood, Cake, Carrot,
  // Transport & Travel
  Car, Bus, Train, Airplane, Bicycle, Boat, Taxi, Moped, Scooter, MapPin, MapTrifold, Compass, Globe, Suitcase,
  // Home & Utilities
  Home: House, Drop, Flame, Zap: Lightning, Lightbulb, Plug, Key, Lock, Umbrella, Toilet, Shower, Bathtub, Bed,
  // Health & Wellness
  Activity: Heartbeat, Heart, FirstAidKit, Pill, Barbell, Brain, Person,
  // Tech & Electronics
  Monitor, Smartphone: DeviceMobile, Laptop, Desktop, Television, Headphones, SpeakerHigh, GameController, Mouse, Keyboard, Camera, VideoCamera,
  // Lifestyle & Entertainment
  MusicNotes, FilmStrip, Book, GraduationCap, Popcorn, Basketball, Football, TennisBall, Volleyball, PianoKeys, Guitar, Palette,
  // Miscellaneous
  Package, MoreHorizontal: DotsThree, HelpCircle: Question, Star, Gear, Bell, Calendar, Clock, CheckCircle, Warning, Info, Target, Trophy, Crown, Medal
};

interface CategoryIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ name, size = 18, className = '' }: CategoryIconProps) {
  // If the name is in our icon map, render as Phosphor icon. Otherwise fallback to text/emoji.
  const Icon = iconMap[name];
  
  if (Icon) {
    return <Icon size={size} className={className} />;
  }

  // Fallback for emojis or legacy data
  return <span className={className} style={{ fontSize: size }}>{name || '📦'}</span>;
}

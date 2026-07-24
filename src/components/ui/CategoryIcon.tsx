import React from 'react';
import { ShoppingCart, Coffee, Car, House as Home, Heart, Lightning as Zap, Briefcase, GraduationCap, Gift, Airplane, MusicNotes, FilmStrip, Book, Monitor, DeviceMobile as Smartphone, ForkKnife, Bus, Train, Heartbeat as Activity, WifiHigh as Wifi, Drop, Flame, DotsThree as MoreHorizontal, Wallet, CreditCard, Money, Question as HelpCircle, Package } from '@phosphor-icons/react/dist/ssr';

export const CATEGORY_ICONS = [
  'ShoppingCart', 'Coffee', 'Car', 'Home', 'Heart', 'Zap', 
  'Briefcase', 'GraduationCap', 'Gift', 'Airplane', 'MusicNotes', 
  'FilmStrip', 'Book', 'Monitor', 'Smartphone', 'ForkKnife',
  'Bus', 'Train', 'Activity', 'Wifi', 'Drop', 'Flame',
  'Wallet', 'CreditCard', 'Money', 'Package', 'MoreHorizontal'
];

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart, Coffee, Car, Home, Heart, Zap, 
  Briefcase, GraduationCap, Gift, Airplane, MusicNotes, 
  FilmStrip, Book, Monitor, Smartphone, ForkKnife,
  Bus, Train, Activity, Wifi, Drop, Flame,
  Wallet, CreditCard, Money, Package, MoreHorizontal
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

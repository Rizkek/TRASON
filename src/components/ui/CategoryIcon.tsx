import React from 'react';
import { 
  ShoppingCart, Coffee, Car, Home, Heart, Zap, 
  Briefcase, GraduationCap, Gift, Plane, Music, 
  Film, Book, Monitor, Smartphone, Utensils,
  Bus, Train, Activity, Wifi, Droplet, Flame,
  MoreHorizontal, Wallet, CreditCard, Banknote,
  HelpCircle,
  Package
} from 'lucide-react';

export const CATEGORY_ICONS = [
  'ShoppingCart', 'Coffee', 'Car', 'Home', 'Heart', 'Zap', 
  'Briefcase', 'GraduationCap', 'Gift', 'Plane', 'Music', 
  'Film', 'Book', 'Monitor', 'Smartphone', 'Utensils',
  'Bus', 'Train', 'Activity', 'Wifi', 'Droplet', 'Flame',
  'Wallet', 'CreditCard', 'Banknote', 'Package', 'MoreHorizontal'
];

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart, Coffee, Car, Home, Heart, Zap, 
  Briefcase, GraduationCap, Gift, Plane, Music, 
  Film, Book, Monitor, Smartphone, Utensils,
  Bus, Train, Activity, Wifi, Droplet, Flame,
  Wallet, CreditCard, Banknote, Package, MoreHorizontal
};

interface CategoryIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ name, size = 18, className = '' }: CategoryIconProps) {
  // If the name is a single emoji or non-mapped string, we render it as text
  // but if it's in our map, we render the Lucide icon.
  const Icon = iconMap[name];
  
  if (Icon) {
    return <Icon size={size} className={className} />;
  }

  // Fallback for emojis or legacy data
  return <span className={className} style={{ fontSize: size }}>{name || '📦'}</span>;
}

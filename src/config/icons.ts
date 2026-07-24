import {
  Wallet,
  Briefcase,
  Target,
  ArrowsClockwise,
  GitCommit,
  Receipt,
  Faders,
  User,
  ChartPieSlice,
  Bell,
  MagnifyingGlass,
  Plus,
  SignOut,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  CreditCard,
  Bank,
  CurrencyCircleDollar,
  Barbell,
  ChartPolar,
  SquaresFour,
  WifiX,
  BellSlash,
  List,
} from '@phosphor-icons/react';

// Central dictionary for all TRASON icons to ensure consistency
export const SYS_ICONS = {
  // Navigation & Core Modules
  dashboard: SquaresFour, // Replaced House (too generic)
  finance: {
    main: Wallet,
    transaction: Receipt,
    card: CreditCard,
    bank: Bank,
    currency: CurrencyCircleDollar,
  },
  career: Briefcase,
  goals: Target,
  habit: ArrowsClockwise, // Replaced Flame
  timeline: GitCommit, // Replaced Clock
  sport: Barbell,
  insights: ChartPolar, // Replaced Lightbulb
  
  // App & System
  settings: Faders, // Replaced Gear
  profile: User,
  analytics: ChartPieSlice,
  notifications: Bell,
  notificationsOff: BellSlash,
  search: MagnifyingGlass,
  menu: List, // Replaced SquaresFour (now used for Dashboard)
  offline: WifiX,
  
  // Actions & UI
  add: Plus,
  logout: SignOut,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  close: X,
  success: Check,
} as const;

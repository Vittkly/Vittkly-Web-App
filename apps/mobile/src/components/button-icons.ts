import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Grid3x3,
  List,
  Mail,
  MapPin,
  Plus,
  User,
  Users,
  X,
} from 'lucide-react-native';
import type React from 'react';

export type ButtonIconName =
  | 'plus'
  | 'check'
  | 'calendar'
  | 'pin'
  | 'user'
  | 'list'
  | 'x'
  | 'grid'
  | 'forward'
  | 'back'
  | 'mail'
  | 'users';

export const BUTTON_ICON_MAP: Record<
  ButtonIconName,
  React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  plus: Plus,
  check: Check,
  calendar: Calendar,
  pin: MapPin,
  user: User,
  list: List,
  x: X,
  grid: Grid3x3,
  forward: ArrowRight,
  back: ArrowLeft,
  mail: Mail,
  users: Users,
};

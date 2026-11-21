import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Nombres canónicos de íconos vectoriales extraídos del prototipo oficial `vittkly-campo-app.html`,
 * más alias estándar compatibles con el UI Kit móvil (`list`, `mail`, `backspace`).
 */
export type VittklyIconName =
  | 'check'
  | 'users'
  | 'face'
  | 'back'
  | 'forward'
  | 'x'
  | 'alert'
  | 'info'
  | 'wifioff'
  | 'sync'
  | 'circle'
  | 'grid'
  | 'home'
  | 'clock'
  | 'briefcase'
  | 'user'
  | 'pin'
  | 'route'
  | 'building'
  | 'camera'
  | 'pen'
  | 'star'
  | 'plus'
  | 'trash'
  | 'backspace'
  | 'bell'
  | 'moon'
  | 'mapwide'
  | 'logout'
  | 'dots'
  | 'truck'
  | 'chevron'
  | 'doc'
  | 'megaphone'
  | 'search'
  | 'phone'
  | 'nav'
  | 'message'
  | 'checksquare'
  | 'pause'
  | 'play'
  | 'calendar'
  | 'repeat'
  | 'card'
  | 'heart'
  | 'barchart'
  | 'settings'
  | 'list'
  | 'mail';

export interface BaseIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export interface VittklyIconProps extends BaseIconProps {
  name: VittklyIconName;
}

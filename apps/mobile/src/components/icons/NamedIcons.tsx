import React from 'react';

import type { BaseIconProps, VittklyIconName } from './types';
import { VittklyIcon } from './VittklyIcon';

function createIcon(name: VittklyIconName, displayName: string): React.FC<BaseIconProps> {
  const Component: React.FC<BaseIconProps> = (props) => <VittklyIcon name={name} {...props} />;
  Component.displayName = displayName;
  return Component;
}

export const CheckIcon = createIcon('check', 'CheckIcon');
export const UsersIcon = createIcon('users', 'UsersIcon');
export const FaceIdIcon = createIcon('face', 'FaceIdIcon');
export const BackIcon = createIcon('back', 'BackIcon');
export const ForwardIcon = createIcon('forward', 'ForwardIcon');
export const CloseIcon = createIcon('x', 'CloseIcon');
export const AlertIcon = createIcon('alert', 'AlertIcon');
export const InfoIcon = createIcon('info', 'InfoIcon');
export const WifiOffIcon = createIcon('wifioff', 'WifiOffIcon');
export const SyncIcon = createIcon('sync', 'SyncIcon');
export const CircleIcon = createIcon('circle', 'CircleIcon');
export const GridIcon = createIcon('grid', 'GridIcon');
export const ListIcon = createIcon('list', 'ListIcon');
export const HomeIcon = createIcon('home', 'HomeIcon');
export const ClockIcon = createIcon('clock', 'ClockIcon');
export const BriefcaseIcon = createIcon('briefcase', 'BriefcaseIcon');
export const UserIcon = createIcon('user', 'UserIcon');
export const PinIcon = createIcon('pin', 'PinIcon');
export const RouteIcon = createIcon('route', 'RouteIcon');
export const BuildingIcon = createIcon('building', 'BuildingIcon');
export const CameraIcon = createIcon('camera', 'CameraIcon');
export const PenIcon = createIcon('pen', 'PenIcon');
export const StarIcon = createIcon('star', 'StarIcon');
export const PlusIcon = createIcon('plus', 'PlusIcon');
export const TrashIcon = createIcon('trash', 'TrashIcon');
export const BackspaceIcon = createIcon('backspace', 'BackspaceIcon');
export const BellIcon = createIcon('bell', 'BellIcon');
export const MoonIcon = createIcon('moon', 'MoonIcon');
export const MapWideIcon = createIcon('mapwide', 'MapWideIcon');
export const LogoutIcon = createIcon('logout', 'LogoutIcon');
export const DotsIcon = createIcon('dots', 'DotsIcon');
export const TruckIcon = createIcon('truck', 'TruckIcon');
export const ChevronIcon = createIcon('chevron', 'ChevronIcon');
export const DocIcon = createIcon('doc', 'DocIcon');
export const MegaphoneIcon = createIcon('megaphone', 'MegaphoneIcon');
export const SearchIcon = createIcon('search', 'SearchIcon');
export const PhoneIcon = createIcon('phone', 'PhoneIcon');
export const NavIcon = createIcon('nav', 'NavIcon');
export const MessageIcon = createIcon('message', 'MessageIcon');
export const CheckSquareIcon = createIcon('checksquare', 'CheckSquareIcon');
export const PauseIcon = createIcon('pause', 'PauseIcon');
export const PlayIcon = createIcon('play', 'PlayIcon');
export const CalendarIcon = createIcon('calendar', 'CalendarIcon');
export const RepeatIcon = createIcon('repeat', 'RepeatIcon');
export const CardIcon = createIcon('card', 'CardIcon');
export const HeartIcon = createIcon('heart', 'HeartIcon');
export const BarChartIcon = createIcon('barchart', 'BarChartIcon');
export const SettingsIcon = createIcon('settings', 'SettingsIcon');
export const MailIcon = createIcon('mail', 'MailIcon');

/**
 * Mapa completo de nombre de ícono hacia su componente SVG tipado.
 */
export const VITTKLY_ICON_COMPONENTS: Record<VittklyIconName, React.FC<BaseIconProps>> = {
  check: CheckIcon,
  users: UsersIcon,
  face: FaceIdIcon,
  back: BackIcon,
  forward: ForwardIcon,
  x: CloseIcon,
  alert: AlertIcon,
  info: InfoIcon,
  wifioff: WifiOffIcon,
  sync: SyncIcon,
  circle: CircleIcon,
  grid: GridIcon,
  list: ListIcon,
  home: HomeIcon,
  clock: ClockIcon,
  briefcase: BriefcaseIcon,
  user: UserIcon,
  pin: PinIcon,
  route: RouteIcon,
  building: BuildingIcon,
  camera: CameraIcon,
  pen: PenIcon,
  star: StarIcon,
  plus: PlusIcon,
  trash: TrashIcon,
  backspace: BackspaceIcon,
  bell: BellIcon,
  moon: MoonIcon,
  mapwide: MapWideIcon,
  logout: LogoutIcon,
  dots: DotsIcon,
  truck: TruckIcon,
  chevron: ChevronIcon,
  doc: DocIcon,
  megaphone: MegaphoneIcon,
  search: SearchIcon,
  phone: PhoneIcon,
  nav: NavIcon,
  message: MessageIcon,
  checksquare: CheckSquareIcon,
  pause: PauseIcon,
  play: PlayIcon,
  calendar: CalendarIcon,
  repeat: RepeatIcon,
  card: CardIcon,
  heart: HeartIcon,
  barchart: BarChartIcon,
  settings: SettingsIcon,
  mail: MailIcon,
};

import React from "react";
import {
  Banknote,
  BarChart2,
  Box,
  Briefcase,
  Calendar,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  FilePlus2,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  IdCard,
  Landmark,
  LayoutGrid,
  Megaphone,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { ModuleIconKey, ProcessIconKey } from "@vittkly/shared";

export type LucideIconComponent = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

export const DASHBOARD_ICON_MAP: Record<
  ModuleIconKey | ProcessIconKey,
  LucideIconComponent
> = {
  LayoutGrid,
  Calendar,
  BarChart2,
  Users,
  FilePlus2,
  Briefcase,
  Box,
  ClipboardCheck,
  Clock,
  Heart,
  Wallet,
  CircleDollarSign,
  Receipt,
  FileText,
  Landmark,
  TrendingUp,
  IdCard,
  Banknote,
  GraduationCap,
  Megaphone,
  Globe,
};

export function DashboardModuleIcon({
  iconKey,
  className,
  strokeWidth = 1.75,
}: {
  iconKey: ModuleIconKey | ProcessIconKey;
  className?: string;
  strokeWidth?: number;
}) {
  const IconComp = DASHBOARD_ICON_MAP[iconKey] ?? LayoutGrid;
  return React.createElement(IconComp, { className, strokeWidth });
}

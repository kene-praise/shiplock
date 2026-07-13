import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  AlertCircleIcon,
  Archive02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Book02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  ChartUpIcon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Clock01Icon,
  DashboardSquare01Icon,
  File02Icon,
  FileValidationIcon,
  GitBranchIcon,
  Layers01Icon,
  Message01Icon,
  MinusSignCircleIcon,
  Moon02Icon,
  PauseIcon,
  PlayIcon,
  PlusSignIcon,
  RecordIcon,
  Search01Icon,
  SentIcon,
  Settings02Icon,
  Shield01Icon,
  SquareLock02Icon,
  Sun03Icon,
  Task01Icon,
  Upload04Icon,
  UserGroupIcon,
  Video01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";

/**
 * HugeIcons wrapped behind the Lucide names the app already uses,
 * so screens import from "@/components/icons" instead of "lucide-react"
 * with no other changes. All icons are 1.5px stroke line icons.
 */

export interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export type Icon = React.ComponentType<IconProps>;
// dashboard-ui previously typed icons as LucideIcon
export type LucideIcon = Icon;

function make(icon: typeof Alert02Icon): Icon {
  function WrappedIcon({ className, size = 16, strokeWidth = 1.8, style }: IconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        className={className}
        size={size}
        strokeWidth={strokeWidth}
        style={style}
      />
    );
  }
  return WrappedIcon;
}

export const AlertTriangle = make(Alert02Icon);
export const Archive = make(Archive02Icon);
export const ArrowLeft = make(ArrowLeft01Icon);
export const ArrowRight = make(ArrowRight01Icon);
export const BookOpen = make(Book02Icon);
export const CheckCircle2 = make(CheckmarkCircle02Icon);
export const CheckSquare = make(Task01Icon);
export const ChevronDown = make(ArrowDown01Icon);
export const Circle = make(CircleIcon);
export const CircleCheck = make(CheckmarkCircle02Icon);
export const CircleDot = make(RecordIcon);
export const CircleMinus = make(MinusSignCircleIcon);
export const ClipboardCheck = make(CheckListIcon);
export const Clock = make(Clock01Icon);
export const Eye = make(ViewIcon);
export const EyeOff = make(ViewOffSlashIcon);
export const FileCheck = make(FileValidationIcon);
export const FileText = make(File02Icon);
export const GitBranch = make(GitBranchIcon);
export const Layers = make(Layers01Icon);
export const LayoutDashboard = make(DashboardSquare01Icon);
export const Lock = make(SquareLock02Icon);
export const MessageSquare = make(Message01Icon);
export const Moon = make(Moon02Icon);
export const PauseCircle = make(PauseIcon);
export const Play = make(PlayIcon);
export const Plus = make(PlusSignIcon);
export const Search = make(Search01Icon);
export const Send = make(SentIcon);
export const Settings = make(Settings02Icon);
export const Shield = make(Shield01Icon);
export const ShieldAlert = make(AlertCircleIcon);
export const Sun = make(Sun03Icon);
export const TrendingUp = make(ChartUpIcon);
export const Upload = make(Upload04Icon);
export const Users = make(UserGroupIcon);
export const Video = make(Video01Icon);
export const X = make(Cancel01Icon);
export const XCircle = make(CancelCircleIcon);

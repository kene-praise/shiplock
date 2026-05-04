"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  CheckSquare,
  Video,
  GitBranch,
  Users,
  Shield,
  BookOpen,
  Settings,
  ChevronDown,
  Lock,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "red" | "yellow" | "default";
}

interface AppSidebarProps {
  org: string;
  project: string;
  projectName?: string;
  orgName?: string;
}

export function AppSidebar({ org, project, projectName, orgName }: AppSidebarProps) {
  const pathname = usePathname();
  const base = `/${org}/${project}`;

  const navItems: NavItem[] = [
    { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/requirements`, label: "Requirements", icon: FileCheck },
    { href: `${base}/tasks`, label: "Tasks", icon: CheckSquare },
    { href: `${base}/demos`, label: "Demo Videos", icon: Video },
    { href: `${base}/dod`, label: "Definition of Done", icon: ClipboardCheck },
    { href: `${base}/scope-changes`, label: "Scope Changes", icon: GitBranch },
    { href: `${base}/blockers`, label: "Blockers", icon: AlertTriangle },
    { href: `${base}/standups`, label: "Standups", icon: BookOpen },
    { href: `${base}/audit-log`, label: "Audit Log", icon: Shield },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full w-60 border-r border-sidebar-border bg-sidebar shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
          <Lock className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-semibold text-sm text-foreground tracking-tight">ShipLock</span>
      </div>

      {/* Org + Project selector */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <Link
          href={`/${org}/projects`}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors group"
        >
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              {orgName ?? org}
            </span>
            <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
              {projectName ?? project}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    item.badgeVariant === "red"
                      ? "bg-red-950 text-red-400"
                      : item.badgeVariant === "yellow"
                      ? "bg-yellow-950 text-yellow-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-sidebar-border space-y-0.5">
        <Link
          href={`/${org}/settings`}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
            pathname.startsWith(`/${org}/settings`)
              ? "bg-primary/10 text-primary font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>Team & Org</span>
        </Link>
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <span className="text-xs text-muted-foreground flex-1">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

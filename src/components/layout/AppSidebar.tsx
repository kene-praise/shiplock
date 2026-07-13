"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
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
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  type Icon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  badge?: string | number;
  badgeVariant?: "red" | "yellow" | "default";
}

interface ProjectItem {
  slug: string;
  name: string;
  status: string;
  description?: string | null;
}

interface AppSidebarProps {
  org: string;
  project?: string;
  projectName?: string;
  orgName?: string;
  allProjects?: ProjectItem[];
}

function ShipLockWordmark() {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-0 mb-4">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="20" height="20" rx="5" fill="url(#sl-grad)" />
        <rect width="20" height="20" rx="5" fill="url(#sl-shine)" />
        <rect x="0.5" y="0.5" width="19" height="19" rx="4.5" stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
        <path
          d="M10 4.5C8.343 4.5 7 5.843 7 7.5V8.5H6.5C6.224 8.5 6 8.724 6 9V14C6 14.552 6.448 15 7 15H13C13.552 15 14 14.552 14 14V9C14 8.724 13.776 8.5 13.5 8.5H13V7.5C13 5.843 11.657 4.5 10 4.5ZM10 5.75C10.966 5.75 11.75 6.534 11.75 7.5V8.5H8.25V7.5C8.25 6.534 9.034 5.75 10 5.75ZM10 10.5C10.552 10.5 11 10.948 11 11.5C11 11.894 10.776 12.234 10.448 12.41L10.75 13.5H9.25L9.552 12.41C9.224 12.234 9 11.894 9 11.5C9 10.948 9.448 10.5 10 10.5Z"
          fill="white"
        />
        <defs>
          <linearGradient id="sl-grad" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b7dff" />
            <stop offset="1" stopColor="#2962db" />
          </linearGradient>
          <linearGradient id="sl-shine" x1="10" y1="0" x2="10" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.18" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--fg)]">ShipLock</span>
    </div>
  );
}

// Deterministic gradient identity per project — hashed from the name so every
// project gets a stable, distinct monogram tile.
const TILE_GRADIENTS: [string, string][] = [
  ["#3b7dff", "#2962db"], // blue
  ["#2dd4bf", "#0d9488"], // teal
  ["#fbbf24", "#d97706"], // amber
  ["#fb7185", "#e11d48"], // rose
  ["#a78bfa", "#7c3aed"], // violet
  ["#34d399", "#059669"], // emerald
];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function ProjectTile({ name, size = 26 }: { name: string; size?: number }) {
  const [c1, c2] = TILE_GRADIENTS[hashName(name) % TILE_GRADIENTS.length];
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
  return (
    <span
      className="flex items-center justify-center shrink-0 font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        fontSize: Math.round(size * 0.42),
        letterSpacing: "0.02em",
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0) 55%), linear-gradient(180deg, ${c1}, ${c2})`,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.18)",
        textShadow: "0 1px 1px rgba(0,0,0,0.15)",
      }}
    >
      {initials}
    </span>
  );
}

// macOS/Linear-style select caret — two chevrons stacked.
function CaretUpDown({ className }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M5 6.5L8 3.5L11 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5L8 12.5L11 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProjectSwitcher({
  org,
  project,
  projectName,
  allProjects,
}: {
  org: string;
  project?: string;
  projectName?: string;
  allProjects: ProjectItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
  };

  const label = projectName ?? project ?? "Select project";
  const current = allProjects.find((p) => p.slug === project);

  return (
    <div ref={ref} className="px-3 relative" onBlur={handleBlur}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group w-full flex items-center gap-2.5 p-2 rounded-[10px] border bg-[var(--surface)] text-left transition-all duration-150 active:scale-[0.99]",
          open
            ? "border-[var(--border-strong)]"
            : "border-[var(--border)] hover:border-[var(--border-strong)]"
        )}
        style={{ boxShadow: open ? "0 2px 8px rgba(0,0,0,0.08)" : "0 1px 2px rgba(0,0,0,0.05)" }}
      >
        <ProjectTile name={label} />
        <span className="flex flex-col min-w-0 flex-1 gap-[3px]">
          <span className={cn(
            "text-[12.5px] font-semibold truncate leading-none",
            project ? "text-[var(--fg)]" : "text-[var(--fg-muted)] italic"
          )}>
            {label}
          </span>
          <span className="text-[10.5px] text-[var(--fg-muted)] leading-none truncate">
            {current
              ? (current.description?.trim() || `/${current.slug}`)
              : `${allProjects.length} project${allProjects.length !== 1 ? "s" : ""}`}
          </span>
        </span>
        <CaretUpDown className="text-[var(--fg-disabled)] group-hover:text-[var(--fg-muted)] shrink-0 transition-colors" />
      </button>

      {open && (
        <div
          className="popover-in absolute left-3 right-3 top-[calc(100%+6px)] z-50 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <p className="px-3 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--fg-muted)]">
            Projects
          </p>
          <div className="px-1.5 pb-1.5 flex flex-col gap-px">
            {allProjects.length === 0 ? (
              <p className="px-2 py-2 text-[12px] text-[var(--fg-muted)] italic">No projects yet</p>
            ) : (
              allProjects.map((p) => {
                const isCurrent = p.slug === project;
                return (
                  <Link
                    key={p.slug}
                    href={`/${org}/${p.slug}/dashboard`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-[7px] text-[12.5px] transition-colors",
                      isCurrent
                        ? "bg-[var(--component-fill)] text-[var(--fg)]"
                        : "text-[var(--fg-secondary)] hover:bg-[var(--component-fill)] hover:text-[var(--fg)]"
                    )}
                  >
                    <ProjectTile name={p.name} size={22} />
                    <span className="flex flex-col min-w-0 flex-1 gap-[3px]">
                      <span className="font-medium truncate leading-none">{p.name}</span>
                      <span className="text-[10px] text-[var(--fg-muted)] leading-none truncate">
                        {p.description?.trim() || `/${p.slug}`}
                      </span>
                    </span>
                    {isCurrent && (
                      <CheckCircle2 size={13} className="text-[var(--accent)] shrink-0" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
          >
            <Link
              href={`/${org}/projects`}
              onClick={() => setOpen(false)}
              className="text-[11.5px] font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors"
            >
              View all
            </Link>
            <Link
              href={`/${org}/projects/new`}
              onClick={() => setOpen(false)}
              className="text-[11.5px] font-medium text-[var(--accent)] hover:underline"
            >
              + New project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppSidebar({ org, project, projectName, orgName, allProjects = [] }: AppSidebarProps) {
  const pathname = usePathname();
  const base = project ? `/${org}/${project}` : null;

  const sections: { label: string | null; items: NavItem[] }[] = base ? [
    {
      label: null,
      items: [
        { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Deliver",
      items: [
        { href: `${base}/requirements`, label: "Requirements", icon: FileCheck },
        { href: `${base}/tasks`, label: "Tasks", icon: CheckSquare },
        { href: `${base}/demos`, label: "Demos", icon: Video },
        { href: `${base}/dod`, label: "Definition of Done", icon: ClipboardCheck },
      ],
    },
    {
      label: "Protect",
      items: [
        { href: `${base}/scope-changes`, label: "Scope Changes", icon: GitBranch },
        { href: `${base}/blockers`, label: "Blockers", icon: AlertTriangle },
        { href: `${base}/standups`, label: "Standups", icon: BookOpen },
        { href: `${base}/audit-log`, label: "Audit Log", icon: Shield },
      ],
    },
  ] : [];

  const itemClasses = (isActive: boolean) =>
    cn(
      "flex items-center gap-2 h-8 px-2.5 rounded-[var(--radius-sm)] text-[13px] leading-none transition-colors duration-100",
      isActive
        ? "bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
        : "text-[var(--fg-secondary)] hover:bg-[var(--component-fill)] hover:text-[var(--fg)]"
    );

  return (
    <div className="flex flex-col h-full w-[230px] shrink-0 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)]">
      <ShipLockWordmark />

      <ProjectSwitcher
        org={org}
        project={project}
        projectName={projectName}
        allProjects={allProjects}
      />

      {/* Nav — only shown when inside a project */}
      {sections.length > 0 && (
        <nav className="flex-1 px-3 pt-8 pb-2 overflow-y-auto">
          {sections.map((section, si) => (
            <div key={section.label ?? si} className={si > 0 ? "mt-4" : undefined}>
              {section.label && (
                <p className="px-2.5 mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--fg-muted)]">
                  {section.label}
                </p>
              )}
              <div className="flex flex-col gap-px">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href} className={itemClasses(isActive)}>
                      <item.icon
                        size={15}
                        className={cn(
                          "shrink-0",
                          isActive ? "text-[var(--accent)]" : "text-[var(--fg-muted)]"
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "text-[10px] font-mono px-1 rounded-[var(--radius-xs)] min-w-[16px] text-center tabular-nums",
                            item.badgeVariant === "red"
                              ? "bg-[var(--danger-muted)] text-[var(--danger)]"
                              : item.badgeVariant === "yellow"
                              ? "bg-[var(--warning-muted)] text-[var(--warning)]"
                              : "bg-[var(--component-fill)] text-[var(--fg-muted)]"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      )}

      {/* Spacer when no nav sections */}
      {sections.length === 0 && <div className="flex-1" />}

      {/* Footer — org identity + theme + settings */}
      <div className="px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 px-2.5 py-1 mb-1">
          <div className="w-4 h-4 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[9px] font-bold text-[var(--accent)] shrink-0">
            {(orgName ?? org).charAt(0).toUpperCase()}
          </div>
          <span className="text-[11.5px] text-[var(--fg-muted)] truncate flex-1">{orgName ?? org}</span>
          <ThemeToggle />
        </div>
        <div className="flex flex-col gap-px">
          {base && (
            <Link
              href={`${base}/settings`}
              className={itemClasses(pathname.startsWith(`${base}/settings`))}
            >
              <Settings size={15} className="shrink-0 text-[var(--fg-muted)]" />
              <span>Project Settings</span>
            </Link>
          )}
          <Link
            href={`/${org}/settings`}
            className={itemClasses(pathname === `/${org}/settings`)}
          >
            <Users size={15} className="shrink-0 text-[var(--fg-muted)]" />
            <span>Team &amp; Org</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

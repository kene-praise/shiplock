"use client";

import { useState, useEffect } from "react";
import { Lock, Plus, Search, ArrowRight, Clock, CheckCircle2, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

// ─── TOC sections ────────────────────────────────
const SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "radius", label: "Radius" },
  { id: "shadows", label: "Shadows" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Status & Badges" },
  { id: "refcodes", label: "Ref Codes" },
  { id: "cards", label: "Cards & KPIs" },
  { id: "forms", label: "Forms" },
  { id: "tables", label: "Tables" },
  { id: "empty", label: "Empty States" },
  { id: "principles", label: "Principles" },
];

// ─── Hooks ───────────────────────────────────────
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);
  return active;
}

// ─── Layout helpers ──────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function Section({
  id,
  title,
  description,
  children,
  stagger = 0,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  stagger?: number;
}) {
  return (
    <section
      id={id}
      className="animate-enter scroll-mt-16"
      style={{ "--stagger": stagger } as React.CSSProperties}
    >
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-card shadow-soft ring-1 ring-black/[0.06] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function PanelFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-3 bg-muted border-t border-border">{children}</div>;
}

// ─── Swatch card ─────────────────────────────────
function Swatch({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="rounded-lg ring-1 ring-black/[0.06] overflow-hidden">
      <div className="h-10" style={{ background: color }} />
      <div className="px-2.5 py-2 bg-card border-t border-border">
        <p className="text-[12px] font-medium text-foreground leading-none mb-0.5">{label}</p>
        <p className="text-[11px] font-mono text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────
export default function DesignPage() {
  const [loading, setLoading] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  const [concentricPad, setConcentricPad] = useState(12);
  const active = useActiveSection(SECTIONS.map((s) => s.id));

  const innerRadius = 8;
  const outerRadius = innerRadius + concentricPad;

  return (
    <div className="min-h-screen bg-muted">
      {/* ── Sticky nav ───────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur px-6 h-11 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">ShipLock</span>
          <span className="text-muted-foreground text-xs select-none">/</span>
          <span className="text-xs font-medium text-foreground">Design System</span>
          <span className="text-muted-foreground text-xs select-none">/</span>
          <span className="text-xs font-mono text-muted-foreground">v0.1</span>
        </div>
        <StatusBadge tone="approved">Live</StatusBadge>
      </header>

      <div className="max-w-[900px] mx-auto px-6 py-12 flex gap-12">
        {/* ── TOC sidebar ──────────────────── */}
        <aside className="hidden lg:block w-36 shrink-0">
          <nav className="sticky top-16 flex flex-col gap-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 px-2">
              Contents
            </p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={[
                  "text-xs px-2 py-1 rounded-md transition-colors duration-100",
                  active === s.id
                    ? "text-foreground font-medium bg-secondary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ── Main content ─────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col gap-14">
          {/* Intro */}
          <div className="animate-enter" style={{ "--stagger": 0 } as React.CSSProperties}>
            <p className="text-[12px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
              ShipLock
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2 text-balance">
              Design System
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The living reference for ShipLock&apos;s visual language — tokens, type, status
              colors, and every component treatment. App screens should compose from what&apos;s
              on this page and nothing else.
            </p>
          </div>

          {/* ── Colors ────────────────────── */}
          <Section
            id="colors"
            title="Colors"
            description="CSS variable tokens from globals.css. Components consume tokens — never hardcoded hex."
            stagger={1}
          >
            <div className="space-y-5">
              <div>
                <SectionLabel>Surfaces & Lines</SectionLabel>
                <div className="grid grid-cols-4 gap-2.5">
                  <Swatch color="var(--background)" label="Background" value="--background" />
                  <Swatch color="var(--muted)" label="Muted" value="--muted" />
                  <Swatch color="var(--secondary)" label="Secondary" value="--secondary" />
                  <Swatch color="var(--border)" label="Border" value="--border" />
                </div>
              </div>
              <div>
                <SectionLabel>Foreground</SectionLabel>
                <div className="grid grid-cols-4 gap-2.5">
                  <Swatch color="var(--foreground)" label="Foreground" value="--foreground" />
                  <Swatch color="var(--muted-foreground)" label="Muted FG" value="--muted-foreground" />
                  <Swatch color="var(--primary)" label="Primary" value="--primary" />
                  <Swatch color="var(--destructive)" label="Destructive" value="--destructive" />
                </div>
              </div>
              <div>
                <SectionLabel>Status</SectionLabel>
                <div className="grid grid-cols-5 gap-2.5">
                  <Swatch color="var(--status-approved)" label="Approved" value="approved" />
                  <Swatch color="var(--status-pending)" label="Pending" value="pending" />
                  <Swatch color="var(--status-blocked)" label="Blocked" value="blocked" />
                  <Swatch color="var(--status-auto)" label="Auto" value="auto" />
                  <Swatch color="var(--status-disputed)" label="Disputed" value="disputed" />
                </div>
              </div>
            </div>
          </Section>

          {/* ── Typography ─────────────────── */}
          <Section
            id="typography"
            title="Typography"
            description="Inter for UI. Mono for ref codes, metrics, and timestamps. Semibold max — no font-bold on data screens."
            stagger={2}
          >
            <Panel>
              {[
                {
                  label: "h1",
                  el: (
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                      Scope locked. Silence impossible.
                    </span>
                  ),
                },
                {
                  label: "h2",
                  el: <span className="text-lg font-semibold text-foreground">Requirements</span>,
                },
                {
                  label: "body",
                  el: (
                    <span className="text-sm text-foreground leading-relaxed">
                      Client review sent — auto-approves in 48 hours unless disputed.
                    </span>
                  ),
                },
                {
                  label: "caption",
                  el: (
                    <span className="text-xs text-muted-foreground">
                      Sent 2 hours ago · praise@digitalencode.com
                    </span>
                  ),
                },
                {
                  label: "kpi",
                  el: (
                    <span className="text-[28px] font-semibold tabular-nums tracking-tight text-foreground">
                      87%
                    </span>
                  ),
                },
                {
                  label: "mono",
                  el: (
                    <span className="text-sm font-mono text-primary tabular-nums">
                      REQ-014 · T-041 · 48h 00m
                    </span>
                  ),
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={[
                    "flex items-center gap-5 px-5 py-3.5",
                    i < arr.length - 1 ? "border-b border-border" : "",
                  ].join(" ")}
                >
                  <span className="text-[12px] font-mono text-muted-foreground w-14 shrink-0">
                    {row.label}
                  </span>
                  {row.el}
                </div>
              ))}
              <PanelFooter>
                <p className="text-xs text-muted-foreground">
                  <code className="font-mono">antialiased</code> globally ·{" "}
                  <code className="font-mono">tabular-nums</code> on all dynamic numbers ·{" "}
                  <code className="font-mono">text-balance</code> on headings
                </p>
              </PanelFooter>
            </Panel>
          </Section>

          {/* ── Spacing ────────────────────── */}
          <Section
            id="spacing"
            title="Spacing"
            description="4pt grid. Compact density — this is a data-heavy tool. One density system per page."
            stagger={3}
          >
            <Panel>
              <div className="px-5 py-4 space-y-2">
                {[
                  { t: "1", px: 4 },
                  { t: "2", px: 8 },
                  { t: "3", px: 12 },
                  { t: "4", px: 16 },
                  { t: "6", px: 24 },
                  { t: "8", px: 32 },
                  { t: "12", px: 48 },
                ].map((s) => (
                  <div key={s.t} className="flex items-center gap-4">
                    <span className="text-[12px] font-mono text-muted-foreground w-5 text-right shrink-0">
                      {s.t}
                    </span>
                    <div
                      className="h-3.5 rounded-sm shrink-0"
                      style={{ width: s.px, backgroundColor: "rgba(43,127,255,0.18)" }}
                    />
                    <span className="text-[12px] text-muted-foreground">{s.px}px</span>
                  </div>
                ))}
              </div>
              <PanelFooter>
                <p className="text-xs text-muted-foreground">
                  Compact pages: <code className="font-mono">gap-4 / p-4 / text-sm</code>. Never mix
                  arbitrary values into the grid.
                </p>
              </PanelFooter>
            </Panel>
          </Section>

          {/* ── Radius ─────────────────────── */}
          <Section
            id="radius"
            title="Border Radius"
            description="Base radius 10px. Concentric rule: outer = inner + padding. Drag the slider."
            stagger={4}
          >
            <div className="space-y-3">
              <Panel>
                <div className="grid grid-cols-5 gap-3 p-5">
                  {[
                    { l: "sm", v: "6px" },
                    { l: "md", v: "8px" },
                    { l: "lg", v: "10px" },
                    { l: "xl", v: "12px" },
                    { l: "full", v: "9999px" },
                  ].map((r) => (
                    <div key={r.l} className="flex flex-col gap-2">
                      <div
                        className="w-full h-12 bg-secondary ring-1 ring-black/[0.06]"
                        style={{ borderRadius: r.v }}
                      />
                      <div>
                        <p className="text-[12px] font-medium text-foreground">{r.l}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{r.v}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <div className="p-5">
                  <p className="text-xs font-medium text-foreground mb-4">Live: concentric radius</p>
                  <div className="flex items-center justify-center py-4">
                    <div
                      className="ring-1 ring-black/[0.06] flex items-center justify-center transition-all duration-200"
                      style={{
                        borderRadius: outerRadius,
                        padding: concentricPad,
                        width: 120 + concentricPad * 2,
                        height: 80 + concentricPad * 2,
                        backgroundColor: "rgba(43,127,255,0.08)",
                      }}
                    >
                      <div
                        className="w-full h-full transition-all duration-200"
                        style={{ borderRadius: innerRadius, backgroundColor: "var(--primary)" }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[12px] text-muted-foreground font-mono w-24 shrink-0 tabular-nums">
                      padding: {concentricPad}px
                    </span>
                    <input
                      type="range"
                      min={4}
                      max={28}
                      value={concentricPad}
                      onChange={(e) => setConcentricPad(Number(e.target.value))}
                      className="flex-1 accent-[#2b7fff]"
                    />
                    <span className="text-[12px] font-mono text-muted-foreground w-24 shrink-0 text-right tabular-nums">
                      outer: {outerRadius}px
                    </span>
                  </div>
                </div>
                <PanelFooter>
                  <p className="text-xs text-muted-foreground">
                    Inner fixed at {innerRadius}px. Outer = {innerRadius} + padding ={" "}
                    <strong className="text-foreground tabular-nums">{outerRadius}px</strong>
                  </p>
                </PanelFooter>
              </Panel>
            </div>
          </Section>

          {/* ── Shadows ────────────────────── */}
          <Section
            id="shadows"
            title="Shadows"
            description="Soft layered shadows + a hairline ring instead of hard borders. Three elevations only."
            stagger={5}
          >
            <div className="space-y-3">
              <Panel>
                <div className="grid grid-cols-3 gap-5 p-5">
                  {[
                    { l: "soft", cls: "shadow-soft" },
                    { l: "pop", cls: "shadow-pop" },
                    { l: "btn", cls: "shadow-btn" },
                  ].map((s) => (
                    <div key={s.l} className="flex flex-col gap-2">
                      <div className={`w-full h-14 rounded-[10px] bg-card ${s.cls}`} />
                      <p className="text-[12px] font-mono text-muted-foreground">.shadow-{s.l}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <div className="p-5">
                  <p className="text-xs font-medium text-foreground mb-4">Ring vs border</p>
                  <div className="flex gap-6 items-center justify-center py-3">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-24 h-16 rounded-[10px] bg-card shadow-soft ring-1 ring-black/[0.06]" />
                      <p className="text-[12px] text-muted-foreground">shadow + ring</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-24 h-16 rounded-[10px] bg-card border transition-colors duration-300 ${
                          showBorder ? "border-gray-400" : "border-border"
                        }`}
                      />
                      <p className="text-[12px] text-muted-foreground">border only</p>
                    </div>
                  </div>
                </div>
                <PanelFooter>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Cards: <code className="font-mono">shadow-soft ring-1 ring-black/[0.06]</code>
                    </p>
                    <button
                      onClick={() => setShowBorder((b) => !b)}
                      className="text-xs text-primary hover:underline"
                    >
                      {showBorder ? "Weaken border" : "Strengthen border"}
                    </button>
                  </div>
                </PanelFooter>
              </Panel>
            </div>
          </Section>

          {/* ── Buttons ────────────────────── */}
          <Section
            id="buttons"
            title="Buttons"
            description="shadcn button. Primary for the one main action per view; everything else is secondary or ghost."
            stagger={6}
          >
            <Panel>
              <div className="p-5 space-y-5">
                <div>
                  <SectionLabel>Variants</SectionLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>
                <div>
                  <SectionLabel>Sizes</SectionLabel>
                  <div className="flex flex-wrap items-end gap-2">
                    <Button size="xs">XSmall</Button>
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                  </div>
                </div>
                <div>
                  <SectionLabel>With icons</SectionLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button>
                      <Plus data-icon="inline-start" />
                      New Requirement
                    </Button>
                    <Button variant="secondary">
                      View all
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                    <Button variant="ghost">
                      <Search data-icon="inline-start" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>
              <PanelFooter>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Loading · disabled</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        setLoading(true);
                        setTimeout(() => setLoading(false), 1500);
                      }}
                    >
                      {loading ? "Working…" : "Try loading"}
                    </Button>
                    <Button size="sm" variant="secondary" disabled>
                      Disabled
                    </Button>
                  </div>
                </div>
              </PanelFooter>
            </Panel>
          </Section>

          {/* ── Status & Badges ───────────── */}
          <Section
            id="badges"
            title="Status & Badges"
            description="One badge treatment: muted tint + colored dot. Tones map 1:1 to ShipLock statuses."
            stagger={7}
          >
            <Panel>
              <div className="p-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="approved">Approved</StatusBadge>
                  <StatusBadge tone="pending">Pending review</StatusBadge>
                  <StatusBadge tone="blocked">Blocked</StatusBadge>
                  <StatusBadge tone="auto">Auto-approved</StatusBadge>
                  <StatusBadge tone="disputed">Disputed</StatusBadge>
                  <StatusBadge tone="neutral">Draft</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="approved" dot={false}>
                    No dot
                  </StatusBadge>
                  <StatusBadge tone="pending" dot={false}>
                    48h left
                  </StatusBadge>
                </div>
              </div>
              <PanelFooter>
                <p className="text-xs text-muted-foreground">
                  <code className="font-mono">&lt;StatusBadge tone=&quot;pending&quot;&gt;</code> —
                  from <code className="font-mono">components/ui/status-badge.tsx</code>
                </p>
              </PanelFooter>
            </Panel>
          </Section>

          {/* ── Ref codes ─────────────────── */}
          <Section
            id="refcodes"
            title="Ref Codes"
            description="Every requirement and task has a permanent mono reference. Always the .ref-code chip, always clickable in context."
            stagger={8}
          >
            <Panel>
              <div className="p-5 flex flex-wrap items-center gap-2">
                <span className="ref-code">REQ-001</span>
                <span className="ref-code">REQ-014</span>
                <span className="ref-code">T-041</span>
                <span className="ref-code">T-102</span>
                <span className="ref-code">SC-007</span>
              </div>
              <PanelFooter>
                <p className="text-xs text-muted-foreground">
                  <code className="font-mono">.ref-code</code> utility — mono, blue tint, rounded.
                </p>
              </PanelFooter>
            </Panel>
          </Section>

          {/* ── Cards & KPIs ──────────────── */}
          <Section
            id="cards"
            title="Cards & KPIs"
            description="White card, soft shadow, hairline ring. KPI values are 28px semibold tabular."
            stagger={9}
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Requirements approved", value: "24/31", icon: CheckCircle2, tone: "approved" as StatusTone },
                { label: "Pending client review", value: "4", icon: Clock, tone: "pending" as StatusTone },
                { label: "Demos delivered", value: "12", icon: Video, tone: "auto" as StatusTone },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl bg-card shadow-soft ring-1 ring-black/[0.06] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {kpi.label}
                    </p>
                    <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-[28px] font-semibold tabular-nums tracking-tight text-foreground leading-none">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Forms ─────────────────────── */}
          <Section
            id="forms"
            title="Forms"
            description="Uppercase micro-labels, hairline inputs, blue focus ring. Submit buttons always disable while pending."
            stagger={10}
          >
            <Panel>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Requirement title
                  </label>
                  <input
                    placeholder="e.g. Role-based access control"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Classification
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors">
                    <option>MVP</option>
                    <option>Post-MVP</option>
                    <option>Out of scope</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What exactly did the client ask for?"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors resize-none"
                  />
                </div>
              </div>
              <PanelFooter>
                <p className="text-xs text-muted-foreground">
                  Labels: <code className="font-mono">text-xs uppercase tracking-wide</code> · focus:{" "}
                  <code className="font-mono">ring-2 ring-ring/40</code>
                </p>
              </PanelFooter>
            </Panel>
          </Section>

          {/* ── Tables ────────────────────── */}
          <Section
            id="tables"
            title="Tables"
            description="Hairline row dividers, mono ref codes, right-aligned status. Rows are links — whole row is the hit area."
            stagger={11}
          >
            <Panel>
              <div className="px-5 py-2.5 border-b border-border bg-muted flex items-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                <span className="w-20">Ref</span>
                <span className="flex-1">Title</span>
                <span className="w-32 text-right">Status</span>
              </div>
              {[
                { ref: "REQ-012", title: "Evidence upload with virus scanning", tone: "approved" as StatusTone, status: "Approved" },
                { ref: "REQ-013", title: "Auditor read-only portal", tone: "pending" as StatusTone, status: "Pending" },
                { ref: "REQ-014", title: "Framework mapping engine", tone: "blocked" as StatusTone, status: "Blocked" },
                { ref: "REQ-015", title: "Control status dashboard", tone: "auto" as StatusTone, status: "Auto" },
              ].map((row, i, arr) => (
                <div
                  key={row.ref}
                  className={[
                    "px-5 py-3 flex items-center hover:bg-muted/60 transition-colors cursor-pointer",
                    i < arr.length - 1 ? "border-b border-border" : "",
                  ].join(" ")}
                >
                  <span className="w-20 shrink-0">
                    <span className="ref-code">{row.ref}</span>
                  </span>
                  <span className="flex-1 text-sm text-foreground truncate pr-4">{row.title}</span>
                  <span className="w-32 shrink-0 flex justify-end">
                    <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                  </span>
                </div>
              ))}
            </Panel>
          </Section>

          {/* ── Empty states ──────────────── */}
          <Section
            id="empty"
            title="Empty States"
            description="Never a bare 'no data'. Icon tile + one-line reason + the action that fixes it."
            stagger={12}
          >
            <Panel>
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No requirements yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Lock scope by capturing what the client asked for.
                </p>
                <Button size="sm">
                  <Plus data-icon="inline-start" />
                  Add requirement
                </Button>
              </div>
            </Panel>
          </Section>

          {/* ── Principles ────────────────── */}
          <Section
            id="principles"
            title="Principles"
            description="Rules every screen follows. From Jakub Krehel's 'details that make interfaces feel better' + shadcn conventions."
            stagger={13}
          >
            <Panel>
              {[
                ["Concentric radius", "Nested rounding: outer = inner + padding. Never equal."],
                ["Tabular numbers", "tabular-nums on every count, timer, and KPI — no layout shift."],
                ["Shadows over borders", "Cards use shadow-soft + hairline ring, not 1px solid walls."],
                ["One accent", "Blue #2b7fff is the only accent. Status colors are semantic, not decorative."],
                ["Stagger enters", "Sections animate in with 60ms stagger; exits stay subtle."],
                ["Specific transitions", "transition-colors / transition-transform — never transition-all."],
                ["40px hit areas", "Small controls extend their tap target; whole table rows are links."],
                ["Designed non-happy paths", "Empty, loading, and error states get real treatment."],
              ].map(([title, body], i, arr) => (
                <div
                  key={title}
                  className={[
                    "px-5 py-3.5 flex gap-4 items-baseline",
                    i < arr.length - 1 ? "border-b border-border" : "",
                  ].join(" ")}
                >
                  <span className="text-[12px] font-mono text-muted-foreground w-5 shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </Panel>
          </Section>

          <footer className="pb-8">
            <p className="text-xs text-muted-foreground">
              Skeleton adapted from portfolio-app&apos;s design-system page · principles via{" "}
              <a href="https://jakub.kr" className="text-primary hover:underline">
                jakub.kr
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Lock, Plus, Search, ArrowRight, Clock, CheckCircle2, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tag } from "@/components/ui/tag";
import { Avatar } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CodeBlock } from "@/components/ui/code-block";
import { IconBadge, CodeIcon, BriefcaseIcon, ServerIcon } from "@/components/ui/icon-badge";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

// ─── TOC sections ────────────────────────────────
const SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "radius", label: "Radius" },
  { id: "shadows", label: "Shadows" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges & Status" },
  { id: "tags", label: "Tags & Icons" },
  { id: "cards", label: "Cards & KPIs" },
  { id: "forms", label: "Forms" },
  { id: "controls", label: "Controls" },
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
    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)] mb-3">
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
        <h2 className="text-sm font-semibold text-[var(--fg)] mb-1">{title}</h2>
        {description && (
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

// ─── Swatch card ─────────────────────────────────
function Swatch({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden">
      <div className="h-10" style={{ background: color }} />
      <div className="px-2.5 py-2 bg-[var(--bg-subtle)] border-t border-[var(--border)]">
        <p className="text-[12px] font-medium text-[var(--fg-secondary)] leading-none mb-0.5">
          {label}
        </p>
        <p className="text-[11px] font-mono text-[var(--fg-muted)]">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────
export default function DesignPage() {
  const [loading, setLoading] = useState(false);
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [concentricPad, setConcentricPad] = useState(12);
  const active = useActiveSection(SECTIONS.map((s) => s.id));

  const innerRadius = 8;
  const outerRadius = innerRadius + concentricPad;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Sticky nav ───────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)] px-6 h-11 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--fg)]">ShipLock</span>
          <span className="text-[var(--fg-muted)] text-xs select-none">/</span>
          <span className="text-xs font-medium text-[var(--fg)]">Design System</span>
          <span className="text-[var(--fg-muted)] text-xs select-none">/</span>
          <span className="text-xs font-mono text-[var(--fg-muted)]">v1.0</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="accent" size="sm" dot>
            Live
          </Badge>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-[900px] mx-auto px-6 py-12 flex gap-12">
        {/* ── TOC sidebar ──────────────────── */}
        <aside className="hidden lg:block w-36 shrink-0">
          <nav className="sticky top-16 flex flex-col gap-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)] mb-2 px-2">
              Contents
            </p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={[
                  "text-xs px-2 py-1 rounded-[var(--radius-sm)] transition-colors duration-100",
                  active === s.id
                    ? "text-[var(--fg)] font-medium bg-[var(--bg-muted)]"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]",
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
            <p className="text-[12px] font-mono text-[var(--fg-muted)] uppercase tracking-widest mb-2">
              ShipLock
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--fg)] mb-2">
              Design System
            </h1>
            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
              ShipLock&apos;s visual language, ported from the portfolio-app design system —
              tokens, type, components, and status semantics. App screens compose from this
              page and nothing else.
            </p>
          </div>

          <Separator />

          {/* ── Colors ────────────────────── */}
          <Section
            id="colors"
            title="Colors"
            description="CSS variable tokens. All components consume these — never hardcoded values."
            stagger={1}
          >
            <div className="space-y-5">
              <div>
                <SectionLabel>Backgrounds & Surfaces</SectionLabel>
                <div className="grid grid-cols-4 gap-2.5">
                  <Swatch color="var(--bg)" label="Background" value="--bg" />
                  <Swatch color="var(--bg-muted)" label="BG Muted" value="--bg-muted" />
                  <Swatch color="var(--surface)" label="Surface" value="--surface" />
                  <Swatch color="var(--card-footer)" label="Card Footer" value="--card-footer" />
                </div>
              </div>
              <div>
                <SectionLabel>Foreground</SectionLabel>
                <div className="grid grid-cols-4 gap-2.5">
                  <Swatch color="var(--fg)" label="Primary" value="--fg" />
                  <Swatch color="var(--fg-secondary)" label="Secondary" value="--fg-secondary" />
                  <Swatch color="var(--fg-muted)" label="Muted" value="--fg-muted" />
                  <Swatch color="var(--fg-disabled)" label="Disabled" value="--fg-disabled" />
                </div>
              </div>
              <div>
                <SectionLabel>Accent</SectionLabel>
                <div className="grid grid-cols-4 gap-2.5">
                  <Swatch color="var(--accent)" label="Blue" value="--accent" />
                  <Swatch color="var(--accent-muted)" label="Blue Muted" value="--accent-muted" />
                  <Swatch color="var(--teal)" label="Teal" value="--teal" />
                  <Swatch color="var(--teal-muted)" label="Teal Muted" value="--teal-muted" />
                </div>
              </div>
              <div>
                <SectionLabel>Status — ShipLock semantics</SectionLabel>
                <div className="grid grid-cols-5 gap-2.5">
                  <Swatch color="var(--success)" label="Approved" value="--success" />
                  <Swatch color="var(--warning)" label="Pending" value="--warning" />
                  <Swatch color="var(--danger)" label="Blocked" value="--danger" />
                  <Swatch color="var(--accent)" label="Auto" value="--accent" />
                  <Swatch color="var(--disputed)" label="Disputed" value="--disputed" />
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── Typography ─────────────────── */}
          <Section
            id="typography"
            title="Typography"
            description="Geist Sans for UI text. Geist Mono for ref codes, metrics, timestamps. Font smoothing globally."
            stagger={2}
          >
            <Card padding="none">
              {[
                {
                  label: "h1",
                  el: (
                    <span className="text-2xl font-semibold tracking-tight text-[var(--fg)]">
                      Scope locked. Silence impossible.
                    </span>
                  ),
                },
                {
                  label: "h2",
                  el: <span className="text-lg font-semibold text-[var(--fg)]">Requirements</span>,
                },
                {
                  label: "body",
                  el: (
                    <span className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                      Client review sent — auto-approves in 48 hours unless disputed.
                    </span>
                  ),
                },
                {
                  label: "caption",
                  el: (
                    <span className="text-xs text-[var(--fg-muted)]">
                      Sent 2 hours ago · praise@digitalencode.com
                    </span>
                  ),
                },
                {
                  label: "kpi",
                  el: (
                    <span className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--fg)]">
                      87%
                    </span>
                  ),
                },
                {
                  label: "mono",
                  el: (
                    <span className="text-sm font-mono text-[var(--accent)] tabular-nums">
                      REQ-014 · T-041 · 48h 00m
                    </span>
                  ),
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={[
                    "flex items-center gap-5 px-5 py-3.5",
                    i < arr.length - 1 ? "border-b border-[var(--border)]" : "",
                  ].join(" ")}
                >
                  <span className="text-[12px] font-mono text-[var(--fg-muted)] w-14 shrink-0">
                    {row.label}
                  </span>
                  {row.el}
                </div>
              ))}
              <CardFooter>
                <p className="text-xs text-[var(--fg-muted)]">
                  <code className="font-mono">antialiased</code> globally ·{" "}
                  <code className="font-mono">tabular-nums</code> on dynamic numbers ·{" "}
                  <code className="font-mono">text-wrap: balance</code> on headings
                </p>
              </CardFooter>
            </Card>
          </Section>

          <Separator />

          {/* ── Spacing ────────────────────── */}
          <Section
            id="spacing"
            title="Spacing"
            description="4pt base grid. Compact density — ShipLock is a data-heavy tool."
            stagger={3}
          >
            <Card padding="none">
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
                    <span className="text-[12px] font-mono text-[var(--fg-muted)] w-5 text-right shrink-0">
                      {s.t}
                    </span>
                    <div
                      className="h-3.5 rounded-sm bg-[var(--accent-muted)] shrink-0"
                      style={{ width: s.px }}
                    />
                    <span className="text-[12px] text-[var(--fg-muted)]">{s.px}px</span>
                  </div>
                ))}
              </div>
              <CardFooter>
                <p className="text-xs text-[var(--fg-muted)]">
                  Tailwind: 1 = 4px · 2 = 8px · 4 = 16px · 6 = 24px · 8 = 32px
                </p>
              </CardFooter>
            </Card>
          </Section>

          <Separator />

          {/* ── Radius ─────────────────────── */}
          <Section
            id="radius"
            title="Border Radius"
            description="Token scale 4–24px. Concentric rule: outer = inner + padding."
            stagger={4}
          >
            <div className="space-y-3">
              <Card padding="none">
                <div className="grid grid-cols-4 gap-3 p-5">
                  {[
                    { l: "xs", px: "4px", v: "var(--radius-xs)" },
                    { l: "sm", px: "6px", v: "var(--radius-sm)" },
                    { l: "md", px: "10px", v: "var(--radius-md)" },
                    { l: "lg", px: "12px", v: "var(--radius-lg)" },
                    { l: "xl", px: "16px", v: "var(--radius-xl)" },
                    { l: "2xl", px: "24px", v: "var(--radius-2xl)" },
                    { l: "full", px: "∞", v: "var(--radius-full)" },
                  ].map((r) => (
                    <div key={r.l} className="flex flex-col gap-2">
                      <div
                        className="w-full h-12 bg-[var(--bg-subtle)] border border-[var(--border)]"
                        style={{ borderRadius: r.v }}
                      />
                      <div>
                        <p className="text-[12px] font-medium text-[var(--fg-secondary)]">{r.l}</p>
                        <p className="text-[11px] font-mono text-[var(--fg-muted)]">{r.px}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <CardFooter>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Formula: <code className="font-mono">outer = inner + padding</code>
                  </p>
                </CardFooter>
              </Card>

              <Card padding="none">
                <div className="p-5">
                  <p className="text-xs font-medium text-[var(--fg)] mb-4">
                    Live: Concentric Radius
                  </p>
                  <div className="flex items-center justify-center py-4">
                    <div
                      className="bg-[var(--accent-muted)] border border-[var(--border)] flex items-center justify-center transition-all duration-200"
                      style={{
                        borderRadius: outerRadius,
                        padding: concentricPad,
                        width: 120 + concentricPad * 2,
                        height: 80 + concentricPad * 2,
                      }}
                    >
                      <div
                        className="bg-[var(--accent)] w-full h-full transition-all duration-200"
                        style={{ borderRadius: innerRadius }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[12px] text-[var(--fg-muted)] font-mono w-24 shrink-0 tabular-nums">
                      padding: {concentricPad}px
                    </span>
                    <input
                      type="range"
                      min={4}
                      max={28}
                      value={concentricPad}
                      onChange={(e) => setConcentricPad(Number(e.target.value))}
                      className="flex-1 accent-[#2962db]"
                    />
                    <span className="text-[12px] font-mono text-[var(--fg-muted)] w-24 shrink-0 text-right tabular-nums">
                      outer: {outerRadius}px
                    </span>
                  </div>
                </div>
                <CardFooter>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Inner fixed at {innerRadius}px. Outer = {innerRadius} + padding ={" "}
                    <strong className="text-[var(--fg)] tabular-nums">{outerRadius}px</strong>
                  </p>
                </CardFooter>
              </Card>
            </div>
          </Section>

          <Separator />

          {/* ── Shadows ────────────────────── */}
          <Section
            id="shadows"
            title="Shadows"
            description="Multi-layer transparent shadows adapt to light and dark. Toggle the theme to compare."
            stagger={5}
          >
            <Card padding="none">
              <div className="grid grid-cols-3 gap-5 p-5">
                {[
                  { l: "sm", v: "var(--shadow-sm)" },
                  { l: "md", v: "var(--shadow-md)" },
                  { l: "lg", v: "var(--shadow-lg)" },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col gap-2">
                    <div
                      className="w-full h-14 rounded-[var(--radius-md)] bg-[var(--surface)]"
                      style={{ boxShadow: s.v }}
                    />
                    <p className="text-[12px] font-mono text-[var(--fg-muted)]">shadow-{s.l}</p>
                  </div>
                ))}
              </div>
              <CardFooter>
                <p className="text-xs text-[var(--fg-muted)]">
                  Transparent layers adapt to dark/light. Solid{" "}
                  <code className="font-mono">border</code> doesn&apos;t.
                </p>
              </CardFooter>
            </Card>
          </Section>

          <Separator />

          {/* ── Buttons ────────────────────── */}
          <Section
            id="buttons"
            title="Buttons"
            description="Framer Motion tap feedback. AnimatePresence loading state. Primary/CTA share the skeuomorphic blue treatment."
            stagger={6}
          >
            <Card padding="none">
              <div className="p-5 space-y-5">
                <div>
                  <SectionLabel>Variants</SectionLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="teal">Teal</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </div>
                <div>
                  <SectionLabel>Sizes</SectionLabel>
                  <div className="flex flex-wrap items-end gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
                <div>
                  <SectionLabel>With Icons</SectionLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button iconLeft={<Plus className="h-3.5 w-3.5" />}>New Requirement</Button>
                    <Button variant="secondary" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>
                      View All
                    </Button>
                    <Button variant="ghost" iconLeft={<Search className="h-3.5 w-3.5" />}>
                      Search
                    </Button>
                  </div>
                </div>
              </div>
              <CardFooter className="flex items-center justify-between">
                <p className="text-xs text-[var(--fg-muted)]">Loading state · disabled</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    loading={loading}
                    loadingText="Sending…"
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => setLoading(false), 2000);
                    }}
                  >
                    Try loading
                  </Button>
                  <Button size="sm" variant="secondary" disabled>
                    Disabled
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </Section>

          <Separator />

          {/* ── Badges & Status ───────────── */}
          <Section
            id="badges"
            title="Badges & Status"
            description="Base Badge variants + StatusBadge mapping ShipLock's review states 1:1."
            stagger={7}
          >
            <Card padding="none">
              <div className="p-5 space-y-4">
                <div>
                  <SectionLabel>Badge variants</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="accent">Accent</Badge>
                    <Badge variant="teal">Teal</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>
                <div>
                  <SectionLabel>StatusBadge — review states</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="approved">Approved</StatusBadge>
                    <StatusBadge tone="pending">Pending review</StatusBadge>
                    <StatusBadge tone="blocked">Blocked</StatusBadge>
                    <StatusBadge tone="auto">Auto-approved</StatusBadge>
                    <StatusBadge tone="disputed">Disputed</StatusBadge>
                    <StatusBadge tone="neutral">Draft</StatusBadge>
                  </div>
                </div>
              </div>
              <CardFooter>
                <p className="text-xs text-[var(--fg-muted)]">
                  <code className="font-mono">&lt;StatusBadge tone=&quot;pending&quot;&gt;</code> wraps{" "}
                  <code className="font-mono">&lt;Badge variant dot size=&quot;sm&quot;&gt;</code>
                </p>
              </CardFooter>
            </Card>
          </Section>

          <Separator />

          {/* ── Tags & Icons ───────────────── */}
          <Section
            id="tags"
            title="Tags & Icons"
            description="Monospace pills for labels and weeks. Rounded-square icon badges for categories."
            stagger={8}
          >
            <Card padding="none">
              <div className="p-5 space-y-4">
                <div>
                  <SectionLabel>Tags</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {["W1", "W2", "MVP", "Post-MVP", "PCI DSS", "client_request", "meeting", "internal"].map(
                      (t) => (
                        <Tag key={t}>{t}</Tag>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <SectionLabel>Icon badges + ref codes</SectionLabel>
                  <div className="flex items-center gap-2 flex-wrap">
                    <IconBadge size="sm">
                      <CodeIcon size={12} />
                    </IconBadge>
                    <IconBadge>
                      <BriefcaseIcon />
                    </IconBadge>
                    <IconBadge size="lg">
                      <ServerIcon size={18} />
                    </IconBadge>
                    <span className="w-3" />
                    <span className="ref-code">REQ-001</span>
                    <span className="ref-code">T-041</span>
                    <span className="ref-code">SC-007</span>
                  </div>
                </div>
              </div>
              <CardFooter>
                <p className="text-xs text-[var(--fg-muted)]">
                  <code className="font-mono">.ref-code</code> — mono chip on{" "}
                  <code className="font-mono">--accent-muted</code>
                </p>
              </CardFooter>
            </Card>
          </Section>

          <Separator />

          {/* ── Cards & KPIs ──────────────── */}
          <Section
            id="cards"
            title="Cards & KPIs"
            description="White surface, hairline border, gray footer band. hoverable adds border+shadow lift."
            stagger={9}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Requirements approved", value: "24/31", icon: CheckCircle2 },
                  { label: "Pending client review", value: "4", icon: Clock },
                  { label: "Demos delivered", value: "12", icon: Video },
                ].map((kpi) => (
                  <Card key={kpi.label} padding="sm" hoverable>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                        {kpi.label}
                      </p>
                      <kpi.icon className="h-3.5 w-3.5 text-[var(--fg-muted)] shrink-0" />
                    </div>
                    <p className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">
                      {kpi.value}
                    </p>
                  </Card>
                ))}
              </div>

              <Card padding="none" hoverable>
                <div className="p-5 flex items-center gap-3">
                  <Avatar initials="PO" size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--fg)]">
                      Praise approved <span className="ref-code">REQ-012</span>
                    </p>
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5">2 hours ago · via review link</p>
                  </div>
                  <StatusBadge tone="approved">Approved</StatusBadge>
                </div>
                <CardFooter>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Card + CardFooter — white body, gray band, one hairline.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </Section>

          <Separator />

          {/* ── Forms ─────────────────────── */}
          <Section
            id="forms"
            title="Forms"
            description="Input / Textarea with built-in label, hint, and error. Blue focus ring."
            stagger={10}
          >
            <Card padding="none">
              <div className="p-5 grid grid-cols-2 gap-4">
                <Input
                  label="Requirement title"
                  placeholder="e.g. Role-based access control"
                  hint="Shown to the client exactly as written."
                />
                <Input
                  label="Client email"
                  placeholder="praise@client.com"
                  error="This email isn't on the project."
                  iconLeft={<Search className="h-3.5 w-3.5" />}
                />
                <div className="col-span-2">
                  <Textarea label="Description" placeholder="What exactly did the client ask for?" />
                </div>
              </div>
              <CardFooter>
                <p className="text-xs text-[var(--fg-muted)]">
                  Submit buttons always disable while pending (SubmitButton / Button loading).
                </p>
              </CardFooter>
            </Card>
          </Section>

          <Separator />

          {/* ── Controls ──────────────────── */}
          <Section
            id="controls"
            title="Controls"
            description="Toggle (spring thumb), Avatar sizes, CodeBlock with copy feedback."
            stagger={11}
          >
            <Card padding="none">
              <div className="p-5 space-y-5">
                <div>
                  <SectionLabel>Toggles</SectionLabel>
                  <div className="flex items-center gap-6">
                    <Toggle checked={toggle1} onChange={setToggle1} label="Auto-approve after 48h" />
                    <Toggle checked={toggle2} onChange={setToggle2} label="Weekly status email" />
                  </div>
                </div>
                <div>
                  <SectionLabel>Avatars</SectionLabel>
                  <div className="flex items-end gap-2">
                    <Avatar initials="K" size="xs" />
                    <Avatar initials="KP" size="sm" />
                    <Avatar initials="PO" size="md" />
                    <Avatar initials="DE" size="lg" />
                  </div>
                </div>
                <div>
                  <SectionLabel>Code block</SectionLabel>
                  <CodeBlock language="bash" code="npx drizzle-kit push && npx tsx src/db/seed.ts" />
                </div>
              </div>
            </Card>
          </Section>

          <Separator />

          {/* ── Tables ────────────────────── */}
          <Section
            id="tables"
            title="Tables"
            description="Hairline dividers, mono ref codes, right-aligned status. Whole row is the hit area."
            stagger={12}
          >
            <Card padding="none">
              <div className="px-5 py-2.5 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">
                <span className="w-24">Ref</span>
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
                    "px-5 py-3 flex items-center hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer",
                    i < arr.length - 1 ? "border-b border-[var(--border)]" : "",
                  ].join(" ")}
                >
                  <span className="w-24 shrink-0">
                    <span className="ref-code">{row.ref}</span>
                  </span>
                  <span className="flex-1 text-sm text-[var(--fg)] truncate pr-4">{row.title}</span>
                  <span className="w-32 shrink-0 flex justify-end">
                    <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                  </span>
                </div>
              ))}
            </Card>
          </Section>

          <Separator />

          {/* ── Empty states ──────────────── */}
          <Section
            id="empty"
            title="Empty States"
            description="Never a bare 'no data'. IconBadge + one-line reason + the action that fixes it."
            stagger={13}
          >
            <Card>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <IconBadge size="lg" className="mb-4">
                  <FileText className="h-[18px] w-[18px]" />
                </IconBadge>
                <p className="text-sm font-medium text-[var(--fg)]">No requirements yet</p>
                <p className="text-sm text-[var(--fg-muted)] mt-1 mb-4">
                  Lock scope by capturing what the client asked for.
                </p>
                <Button size="sm" iconLeft={<Plus className="h-3.5 w-3.5" />}>
                  Add requirement
                </Button>
              </div>
            </Card>
          </Section>

          <Separator />

          {/* ── Principles ────────────────── */}
          <Section
            id="principles"
            title="Principles"
            description="Rules every screen follows — from Jakub Krehel's 'details that make interfaces feel better'."
            stagger={14}
          >
            <Card padding="none">
              {[
                ["Concentric radius", "Nested rounding: outer = inner + padding. Never equal."],
                ["Tabular numbers", "tabular-nums on every count, timer, and KPI — no layout shift."],
                ["Layered shadows", "Multi-layer transparent shadows adapt to both themes; hard borders don't."],
                ["One accent", "Blue --accent is the only decorative color. Status colors are semantic."],
                ["Stagger enters", "Sections animate in with 60ms stagger; exits stay subtle."],
                ["Interruptible motion", "Springs with bounce 0; whileTap scale 0.97; AnimatePresence initial={false}."],
                ["Specific transitions", "transition-colors / transition-transform — never transition-all on hot paths."],
                ["Designed non-happy paths", "Empty, loading, and error states get real treatment."],
              ].map(([title, body], i, arr) => (
                <div
                  key={title}
                  className={[
                    "px-5 py-3.5 flex gap-4 items-baseline",
                    i < arr.length - 1 ? "border-b border-[var(--border)]" : "",
                  ].join(" ")}
                >
                  <span className="text-[12px] font-mono text-[var(--fg-muted)] w-5 shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--fg)]">{title}</p>
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </Card>
          </Section>

          <footer className="pb-8">
            <p className="text-xs text-[var(--fg-muted)]">
              Ported from portfolio-app&apos;s design system · principles via{" "}
              <a href="https://jakub.kr" className="text-[var(--accent)] hover:underline">
                jakub.kr
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

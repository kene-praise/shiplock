"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@/components/icons";

interface AppDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
}

// Scrollable field area — pair with DialogFooter inside a <form>.
export function DialogBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`overflow-y-auto px-5 py-5 ${className}`}>{children}</div>;
}

// Gray action band, matching the card-footer pattern used across the app.
export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-end gap-2.5 px-5 py-3.5 shrink-0"
      style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
    >
      {children}
    </div>
  );
}

export function AppDialog({ open, onClose, title, description, children, width = "md" }: AppDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const widthClass = width === "sm" ? "max-w-sm" : width === "lg" ? "max-w-2xl" : "max-w-lg";

  // Portal to <body>: page containers animate with transforms (animate-enter),
  // which would otherwise trap this fixed overlay in their stacking context.
  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className={`relative w-full ${widthClass} bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col overflow-hidden`}
        style={{ boxShadow: "var(--shadow-lg)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 className="text-[14px] font-semibold text-[var(--fg)] leading-tight">{title}</h2>
            {description && (
              <p className="text-[12px] text-[var(--fg-muted)] mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--component-fill)] transition-colors -mr-1 -mt-0.5 shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}

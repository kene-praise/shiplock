"use client";

import { motion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative w-9 h-5 rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          checked ? "bg-[var(--accent)]" : "bg-[var(--bg-muted)]",
        ].join(" ")}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 700, damping: 35 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
      {label && <span className="text-sm text-[var(--fg-secondary)]">{label}</span>}
    </label>
  );
}

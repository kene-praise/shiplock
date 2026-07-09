"use client";

import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "teal" | "cta";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart"
  > {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  // primary shares the skeuomorphic treatment with cta
  primary: "text-white",
  secondary:
    "bg-[var(--surface-raised)] text-[var(--fg)] border border-[var(--border-strong)] hover:bg-[var(--bg-muted)] shadow-[var(--shadow-sm)]",
  ghost:
    "bg-transparent text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]",
  danger:
    "bg-[var(--danger-muted)] text-[var(--danger)] border border-[var(--danger)] border-opacity-20 hover:bg-[var(--danger)] hover:text-white",
  teal:
    "bg-[var(--teal-muted)] text-[var(--teal)] border border-[var(--teal)] border-opacity-20 hover:bg-[var(--teal)] hover:text-white",
  cta: "text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-9 px-4 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-11 px-5 text-base gap-2.5 rounded-[var(--radius-lg)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      loadingText = "Working…",
      iconLeft,
      iconRight,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const ctaStyle: React.CSSProperties =
      variant === "cta" || variant === "primary"
        ? {
            background: "var(--cta-bg)",
            border: "1px solid var(--cta-border)",
            boxShadow: "var(--cta-shadow)",
            transition: "box-shadow 0.12s ease",
          }
        : {};

    return (
      <motion.button
        ref={ref}
        whileHover={variant === "cta" || variant === "primary" ? { scale: 1.015 } : undefined}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1, type: "spring", stiffness: 600, damping: 30 }}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-medium leading-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "select-none cursor-pointer",
          variantClasses[variant],
          "transition-all duration-150 ease-out",
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={ctaStyle}
        {...props}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Spinner />
              {children && <span>{loadingText}</span>}
            </motion.span>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="flex items-center"
              style={{ gap: "inherit" }}
            >
              {iconLeft && <span className="shrink-0">{iconLeft}</span>}
              {children}
              {iconRight && <span className="shrink-0 opacity-60">{iconRight}</span>}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);

Button.displayName = "Button";

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path
        d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

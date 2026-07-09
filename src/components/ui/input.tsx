"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, iconLeft, iconRight, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--fg-secondary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <span className="absolute left-3 text-[var(--fg-muted)] pointer-events-none">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full h-9 rounded-[var(--radius-md)] bg-[var(--surface)]",
              "border border-[var(--border)]",
              "text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-[var(--danger)] focus:ring-[var(--danger)]",
              iconLeft ? "pl-9" : "px-3",
              iconRight ? "pr-9" : "px-3",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-[var(--fg-muted)] pointer-events-none">
              {iconRight}
            </span>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[var(--danger)]">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[var(--fg-muted)]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--fg-secondary)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-[var(--radius-md)] bg-[var(--surface)]",
            "border border-[var(--border)]",
            "text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]",
            "px-3 py-2.5 resize-y min-h-[80px]",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-[var(--danger)] focus:ring-[var(--danger)]",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[var(--danger)]">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[var(--fg-muted)]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

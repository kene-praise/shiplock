"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      onClick={handleCopy}
      className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 cursor-pointer sm:cursor-default"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
        {language && (
          <span className="text-[12px] font-mono text-[var(--fg-muted)] shrink-0">{language}</span>
        )}
        <code className="text-sm font-mono text-[var(--fg)] whitespace-nowrap">{code}</code>
      </div>

      {/* Mobile: inline "copied" feedback */}
      <AnimatePresence>
        {copied && (
          <motion.span
            key="mobile-copied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="sm:hidden shrink-0 text-[11px] font-mono text-[var(--success)]"
          >
            copied
          </motion.span>
        )}
      </AnimatePresence>

      {/* Desktop: icon button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleCopy(); }}
        aria-label="Copy code"
        className="hidden sm:flex shrink-0 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors duration-150 cursor-pointer"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
            >
              <CheckIcon />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
            >
              <CopyIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="5" y="5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 9H2.5A1.5 1.5 0 0 1 1 7.5v-5A1.5 1.5 0 0 1 2.5 1h5A1.5 1.5 0 0 1 9 2.5V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7l3 3 6-6" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

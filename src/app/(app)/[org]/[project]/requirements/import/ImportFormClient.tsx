"use client";

import { useState, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Upload, Send } from "@/components/icons";
import Link from "next/link";

interface Props {
  action: (formData: FormData) => Promise<void>;
  cancelUrl: string;
}

export function ImportFormClient({ action, cancelUrl }: Props) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setText(result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <form action={action} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
      <div className="p-5 space-y-5">
        {/* Upload box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] rounded-[var(--radius-md)] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".txt,.md,.json,.csv,.xml,.html"
            className="hidden" 
          />
          <Upload className="h-6 w-6 text-[var(--fg-muted)] group-hover:text-[var(--accent)] transition-colors" />
          <span className="text-[12.5px] font-medium text-[var(--fg)]">
            {fileName ? `Selected: ${fileName}` : "Click to upload documentation file"}
          </span>
          <span className="text-[10.5px] text-[var(--fg-muted)]">
            Supports .txt, .md, .json, .csv files
          </span>
        </div>

        {/* Text editor */}
        <div className="space-y-1.5">
          <label className="field-label block">Or paste plain text here</label>
          <textarea
            name="documentText"
            rows={12}
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your PRD, kickoff document, requirements, or lists here..."
            className="field-input resize-none font-mono text-[12px] leading-relaxed"
          />
        </div>
      </div>

      <div
        className="px-5 py-3.5 flex items-center justify-end gap-2.5"
        style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
      >
        <Link href={cancelUrl} className="btn-secondary !h-8 !px-3.5 !text-[12.5px]">
          Cancel
        </Link>
        <SubmitButton pendingText="Scraping with AI…" className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
          <Send size={13} className="mr-1" /> Extract with AI
        </SubmitButton>
      </div>
    </form>
  );
}

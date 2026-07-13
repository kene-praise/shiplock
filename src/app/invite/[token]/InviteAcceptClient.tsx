"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "@/components/icons";
import { acceptInvite } from "@/lib/actions/invites";

interface Props {
  token: string;
  email: string;
  orgName: string;
  roleLabel: string;
}

export function InviteAcceptClient({ token, email, orgName, roleLabel }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSignInLink, setShowSignInLink] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowSignInLink(false);
    setLoading(true);

    try {
      const signUp = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!signUp.ok) {
        const data = await signUp.json().catch(() => ({}));
        const msg = (data.message ?? "").toString().toLowerCase();
        const alreadyExists =
          msg.includes("exist") || msg.includes("already") || signUp.status === 422;

        if (alreadyExists) {
          const signIn = await fetch("/api/auth/sign-in/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!signIn.ok) {
            setError(
              "That email already has an account with a different password. Sign in instead."
            );
            setShowSignInLink(true);
            return;
          }
        } else {
          setError(data.message ?? "Could not create your account.");
          return;
        }
      }

      const result = await acceptInvite(token);
      if (result && "error" in result) {
        setError(result.error);
      }
    } catch {
      setError("Connection error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--component-fill)] border border-[var(--border)] outline outline-1 outline-[var(--border)] outline-offset-2 flex items-center justify-center">
          <Lock className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--fg)]">
            Join {orgName}
          </h1>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            You&apos;re invited as a {roleLabel}. Set up your account to join.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="field-label">Email</label>
          <input type="email" value={email} disabled className="field-input opacity-60" />
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="field-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field-input !pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-[var(--danger)] bg-[var(--danger-muted)] border border-[var(--danger)]/30 rounded-lg px-3 py-2">
            {error}
            {showSignInLink && (
              <Link href="/login" className="block mt-1 text-[var(--accent)] hover:underline">
                Go to sign in →
              </Link>
            )}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-cta w-full">
          {loading ? "Joining…" : "Accept invite"}
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { verifyInviteToken } from "@/lib/signed-url";
import { ShieldAlert, CheckCircle2 } from "@/components/icons";
import { InviteAcceptClient } from "./InviteAcceptClient";

interface Props {
  params: Promise<{ token: string }>;
}

const roleLabels: Record<"builder" | "client", string> = {
  builder: "Builder",
  client: "Client",
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const payload = verifyInviteToken(token);

  if (!payload) {
    return (
      <Shell>
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--danger-muted)] flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-[var(--danger)]" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold tracking-tight text-[var(--fg)]">
                Invalid or expired invite
              </h1>
              <p className="text-[13px] text-[var(--fg-muted)] mt-1">
                This invite link is invalid or has expired. Ask the workspace owner to send a new one.
              </p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, payload.orgId))
    .limit(1);

  const orgName = org?.name ?? "your workspace";

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, payload.email))
    .limit(1);

  if (existing) {
    return (
      <Shell>
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--success-muted)] flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold tracking-tight text-[var(--fg)]">
                You&apos;re already a member
              </h1>
              <p className="text-[13px] text-[var(--fg-muted)] mt-1">
                {payload.email} already has a ShipLock account. Sign in to continue.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
              >
                Sign in →
              </Link>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <InviteAcceptClient
        token={token}
        email={payload.email}
        orgName={orgName}
        roleLabel={roleLabels[payload.role]}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {children}
    </div>
  );
}

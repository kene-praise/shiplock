"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireBuilder } from "./guard";
import { signInviteToken, verifyInviteToken } from "@/lib/signed-url";
import { sendInviteEmail } from "@/lib/email";
import type { InviteState } from "./invites.types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleLabels: Record<"builder" | "client", string> = {
  builder: "Builder",
  client: "Client",
};

export async function inviteMember(
  orgId: string,
  orgSlug: string,
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const member = await requireBuilder(orgSlug);
  if (member.orgId !== orgId) {
    return { error: "You don't have access to this workspace." };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const role = (formData.get("role") as string) ?? "";

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (role !== "builder" && role !== "client") {
    return { error: "Choose a valid role." };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { error: "That email already belongs to a ShipLock account." };
  }

  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  if (!org) {
    return { error: "Workspace not found." };
  }

  const token = signInviteToken({ type: "invite", orgId, orgSlug, email, role });
  const inviteUrl = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/invite/${token}`;

  try {
    await sendInviteEmail({
      to: email,
      orgName: org.name,
      roleLabel: roleLabels[role],
      inviteUrl,
      expiresInDays: 7,
    });
  } catch {
    return { error: "Couldn't send the invite email. Try again." };
  }

  return { ok: `Invite sent to ${email}.` };
}

export async function acceptInvite(
  token: string
): Promise<{ error: string } | never> {
  const payload = verifyInviteToken(token);
  if (!payload) {
    return { error: "This invite link is invalid or has expired." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { error: "Please create your account first." };
  }

  if (session.user.email.toLowerCase() !== payload.email) {
    return { error: "This invite was sent to a different email." };
  }

  const [existing] = await db
    .select({ orgId: users.orgId })
    .from(users)
    .where(eq(users.email, payload.email))
    .limit(1);

  if (existing) {
    if (existing.orgId === payload.orgId) {
      redirect(`/${payload.orgSlug}`);
    }
    return { error: "That email already belongs to another workspace." };
  }

  await db.insert(users).values({
    id: "user_" + session.user.id,
    orgId: payload.orgId,
    email: payload.email,
    name: session.user.name || payload.email,
    role: payload.role,
  });

  redirect(`/${payload.orgSlug}`);
}

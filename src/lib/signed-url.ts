import { createHmac } from "crypto";

export interface ReviewTokenPayload {
  type: "requirement" | "demo";
  referenceId: string;
  pingId: string;
  projectId: string;
  reviewerEmail: string;
  exp: number;
}

function secret() {
  const s = process.env.SIGNED_URL_SECRET;
  if (!s) throw new Error("SIGNED_URL_SECRET not set");
  return s;
}

export function signReviewToken(
  payload: Omit<ReviewTokenPayload, "exp">,
  expiresInDays = 7
): string {
  const full: ReviewTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInDays * 86400,
  };
  const data = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(data).digest("hex");
  return `${data}.${sig}`;
}

export function verifyReviewToken(token: string): ReviewTokenPayload | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = createHmac("sha256", secret()).update(data).digest("hex");
    if (expected !== sig) return null;
    const payload: ReviewTokenPayload = JSON.parse(
      Buffer.from(data, "base64url").toString()
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export interface InviteTokenPayload {
  type: "invite";
  orgId: string;
  orgSlug: string;
  email: string;
  role: "builder" | "client";
  exp: number;
}

export function signInviteToken(
  payload: Omit<InviteTokenPayload, "exp">,
  expiresInDays = 7
): string {
  const full: InviteTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInDays * 86400,
  };
  const data = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(data).digest("hex");
  return `${data}.${sig}`;
}

export function verifyInviteToken(token: string): InviteTokenPayload | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = createHmac("sha256", secret()).update(data).digest("hex");
    if (expected !== sig) return null;
    const payload: InviteTokenPayload = JSON.parse(
      Buffer.from(data, "base64url").toString()
    );
    if (payload.type !== "invite") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

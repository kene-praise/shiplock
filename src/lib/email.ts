import { Resend } from "resend";

const FROM = process.env.NODE_ENV === "development" ? "onboarding@resend.dev" : "ShipLock <noreply@shiplock.app>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmailPayload(payload: any) {
  if (process.env.NODE_ENV === "development") {
    // Resend's testing address only allows sending to your verified email
    payload.to = "praizzze4@gmail.com"; 
  }
  
  const { data, error } = await getResend().emails.send(payload);
  if (error) {
    console.error("[Email Error]:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function sendRequirementReviewEmail({
  to,
  projectName,
  reqRefCode,
  reqTitle,
  reviewUrl,
  expiresInDays,
}: {
  to: string;
  clientName?: string;
  projectName: string;
  reqRefCode: string;
  reqTitle: string;
  reviewUrl: string;
  expiresInDays: number;
}) {
  await sendEmailPayload({
    from: FROM,
    to,
    subject: `[${projectName}] Review requested: ${reqRefCode} — ${reqTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#09090b;background:#fff">
        <div style="margin-bottom:24px">
          <span style="font-weight:700;font-size:14px;letter-spacing:-0.02em">ShipLock</span>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Review requested</h1>
        <p style="color:#71717a;font-size:14px;margin:0 0 24px">
          A requirement from <strong>${projectName}</strong> needs your approval.
        </p>
        <div style="border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin-bottom:24px">
          <div style="font-family:monospace;font-size:11px;color:#6366f1;margin-bottom:6px">${reqRefCode}</div>
          <div style="font-size:16px;font-weight:600;margin-bottom:8px">${reqTitle}</div>
        </div>
        <a href="${reviewUrl}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
          Review &amp; respond →
        </a>
        <p style="color:#a1a1aa;font-size:12px;margin-top:24px">
          This link expires in ${expiresInDays} days. If you don't respond, it will be auto-approved after 48 hours.
        </p>
      </div>
    `,
  });
}

export async function sendDemoReviewEmail({
  to,
  projectName,
  demoTitle,
  reviewUrl,
  expiresInDays,
}: {
  to: string;
  clientName?: string;
  projectName: string;
  demoTitle: string;
  reviewUrl: string;
  expiresInDays: number;
}) {
  await sendEmailPayload({
    from: FROM,
    to,
    subject: `[${projectName}] Demo ready for review — ${demoTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#09090b;background:#fff">
        <div style="margin-bottom:24px">
          <span style="font-weight:700;font-size:14px;letter-spacing:-0.02em">ShipLock</span>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Demo ready for review</h1>
        <p style="color:#71717a;font-size:14px;margin:0 0 24px">
          A demo video from <strong>${projectName}</strong> has been shared for your approval.
        </p>
        <div style="border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin-bottom:24px">
          <div style="font-size:16px;font-weight:600">${demoTitle}</div>
        </div>
        <a href="${reviewUrl}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
          Watch &amp; respond →
        </a>
        <p style="color:#a1a1aa;font-size:12px;margin-top:24px">
          This link expires in ${expiresInDays} days. If you don't respond, it will be auto-approved after 48 hours.
        </p>
      </div>
    `,
  });
}

export async function sendAutoApproveNoticeEmail({
  to,
  projectName,
  itemTitle,
  itemType,
}: {
  to: string;
  projectName: string;
  itemTitle: string;
  itemType: "requirement" | "demo";
}) {
  await sendEmailPayload({
    from: FROM,
    to,
    subject: `[${projectName}] Auto-approved: ${itemTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#09090b;background:#fff">
        <div style="margin-bottom:24px">
          <span style="font-weight:700;font-size:14px;letter-spacing:-0.02em">ShipLock</span>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Auto-approved</h1>
        <p style="color:#71717a;font-size:14px;margin:0 0 16px">
          The following ${itemType} from <strong>${projectName}</strong> was auto-approved after 48 hours without a response:
        </p>
        <div style="border:1px solid #e4e4e7;border-radius:12px;padding:16px">
          <div style="font-size:15px;font-weight:600">${itemTitle}</div>
        </div>
        <p style="color:#a1a1aa;font-size:12px;margin-top:24px">
          This is a ShipLock automated notice. The approval is on record and timestamped.
        </p>
      </div>
    `,
  });
}

export async function sendBuilderReviewNotificationEmail({
  to,
  projectName,
  reviewerName,
  reviewerEmail,
  itemTitle,
  itemType,
  decision,
  comment,
  scopeCreepDetected,
}: {
  to: string;
  projectName: string;
  reviewerName: string;
  reviewerEmail: string;
  itemTitle: string;
  itemType: "requirement" | "demo";
  decision: "approved" | "disputed" | "rejected";
  comment?: string | null;
  scopeCreepDetected?: boolean;
}) {
  const decisionLabel =
    decision === "approved"
      ? "Approved"
      : decision === "disputed"
      ? "Disputed"
      : "Rejected";

  const decisionColor =
    decision === "approved" ? "#16a34a" : decision === "disputed" ? "#d97706" : "#dc2626";

  const scopeAlert =
    scopeCreepDetected
      ? `<div style="margin-top:16px;padding:12px 16px;border-radius:8px;background:#fef3c7;border:1px solid #fcd34d">
           <p style="margin:0;font-size:13px;color:#92400e;font-weight:600">⚠ Scope creep detected</p>
           <p style="margin:4px 0 0;font-size:12px;color:#92400e">A draft scope change has been automatically created for your review.</p>
         </div>`
      : "";

  await sendEmailPayload({
    from: FROM,
    to,
    subject: `[${projectName}] Client ${decisionLabel.toLowerCase()}: ${itemTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#09090b;background:#fff">
        <div style="margin-bottom:24px">
          <span style="font-weight:700;font-size:14px;letter-spacing:-0.02em">ShipLock</span>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Client response received</h1>
        <p style="color:#71717a;font-size:14px;margin:0 0 24px">
          A client has responded to a ${itemType} review in <strong>${projectName}</strong>.
        </p>
        <div style="border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin-bottom:16px">
          <div style="font-size:15px;font-weight:600;margin-bottom:12px">${itemTitle}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:13px;color:#71717a">Decision:</span>
            <span style="font-size:13px;font-weight:700;color:${decisionColor}">${decisionLabel}</span>
          </div>
          <div style="font-size:13px;color:#71717a">
            By <strong style="color:#09090b">${reviewerName}</strong> &lt;${reviewerEmail}&gt;
          </div>
          ${comment ? `<div style="margin-top:12px;padding:10px 12px;border-radius:8px;background:#f4f4f5;font-size:13px;color:#3f3f46;font-style:italic">"${comment}"</div>` : ""}
        </div>
        ${scopeAlert}
        <p style="color:#a1a1aa;font-size:12px;margin-top:24px">
          This response is on record and timestamped in ShipLock.
        </p>
      </div>
    `,
  });
}

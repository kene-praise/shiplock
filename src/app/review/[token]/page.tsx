import { verifyReviewToken } from "@/lib/signed-url";
import { db } from "@/db";
import { requirements, demoVideos, projects, tasks, clientReviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { submitRequirementReview, submitDemoReview } from "@/lib/actions/review";
import {
  Lock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  ShieldAlert,
  Play,
  CheckSquare,
  FileCheck,
  CircleCheck,
  CircleDot,
  CircleMinus,
  AlertTriangle,
  Users,
} from "@/components/icons";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string; decision?: string; error?: string }>;
}

const taskStatusIcon: Record<string, React.ElementType> = {
  not_started: CircleMinus,
  in_progress: CircleDot,
  blocked: AlertTriangle,
  done: CircleCheck,
  cut: CircleMinus,
};

const taskStatusColor: Record<string, string> = {
  not_started: "text-[var(--fg-muted)]",
  in_progress: "text-[var(--accent)]",
  blocked: "text-[var(--danger)]",
  done: "text-[var(--success)]",
  cut: "text-[var(--fg-muted)]",
};

export default async function ReviewPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { done, decision, error } = await searchParams;

  const payload = verifyReviewToken(token);

  if (!payload) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--danger-muted)] flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-[var(--danger)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[var(--fg)]">Invalid or expired link</h1>
            <p className="text-sm text-muted-foreground mt-1">
              This review link has expired or is no longer valid. Contact the team for a new one.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (done === "1") {
    const approved = decision === "approved";
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              approved ? "bg-[var(--success-muted)]" : "bg-[var(--disputed-muted)]"
            }`}
          >
            {approved ? (
              <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
            ) : (
              <MessageSquare className="h-6 w-6 text-[var(--disputed)]" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[var(--fg)]">
              {approved ? "Approved — thank you!" : "Feedback submitted"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {approved
                ? "Your approval has been recorded and timestamped. The team has been notified."
                : "Your feedback has been recorded. The team will follow up shortly."}
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (error === "name_required") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--warning-muted)] flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-[var(--warning)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[var(--fg)]">Name required</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Please enter your name before submitting your response.
            </p>
            <a
              href={`/review/${token}`}
              className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
            >
              Go back →
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── Requirement review ────────────────────────────────────────────────────

  if (payload.type === "requirement") {
    const [req] = await db
      .select()
      .from(requirements)
      .where(eq(requirements.id, payload.referenceId))
      .limit(1);

    const [proj] = await db
      .select({ name: projects.name })
      .from(projects)
      .where(eq(projects.id, payload.projectId))
      .limit(1);

    if (!req) {
      return (
        <Shell>
          <p className="text-sm text-muted-foreground text-center py-16">Item not found.</p>
        </Shell>
      );
    }

    // Who else has already signed off on this requirement
    const priorReviews = await db
      .select({
        reviewerName: clientReviews.reviewerName,
        reviewerEmail: clientReviews.reviewerEmail,
        decision: clientReviews.decision,
        createdAt: clientReviews.createdAt,
      })
      .from(clientReviews)
      .where(eq(clientReviews.requirementId, req.id));

    const alreadyReviewedByMe = priorReviews.some(
      (r) => r.reviewerEmail === payload.reviewerEmail
    );
    const myPriorReview = priorReviews.find(
      (r) => r.reviewerEmail === payload.reviewerEmail
    );

    const approveAction = submitRequirementReview.bind(null, token, "approved");
    const disputeAction = submitRequirementReview.bind(null, token, "disputed");

    return (
      <Shell project={proj?.name}>
        <div className="space-y-6">
          {/* Reviewing as */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <Lock className="h-3 w-3 shrink-0 text-[var(--accent)]" />
            Reviewing as <span className="text-foreground font-medium">{payload.reviewerEmail}</span>
          </div>

          {/* Requirement header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono text-[var(--accent)]">{req.refCode}</span>
              <span>·</span>
              <span className="capitalize">{req.source}</span>
              {req.sourceDetail && (
                <>
                  <span>·</span>
                  <span>{req.sourceDetail}</span>
                </>
              )}
            </div>
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">{req.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{req.description}</p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Submitted for review on {formatDate(req.updatedAt)}. Please review and respond below.
          </div>

          {/* Prior sign-offs from other reviewers */}
          {priorReviews.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Team responses ({priorReviews.length})
              </h3>
              <div className="space-y-2">
                {priorReviews.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-foreground">{r.reviewerName}</span>
                      <span className="text-muted-foreground text-xs ml-1.5">{r.reviewerEmail}</span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        r.decision === "approved"
                          ? "text-[var(--success)] bg-[var(--success-muted)]"
                          : "text-[var(--disputed)] bg-[var(--disputed-muted)]"
                      }`}
                    >
                      {r.decision}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already reviewed by this person */}
          {alreadyReviewedByMe ? (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border ${
                myPriorReview?.decision === "approved"
                  ? "border-[var(--success)]/30 bg-[var(--success-muted)]"
                  : "border-[var(--disputed)]/30 bg-[var(--disputed-muted)]"
              }`}
            >
              {myPriorReview?.decision === "approved" ? (
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              ) : (
                <MessageSquare className="h-5 w-5 text-[var(--disputed)]" />
              )}
              <p className="text-sm font-medium text-foreground capitalize">
                You already {myPriorReview?.decision} this requirement
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Name field shared by both forms — we'll pass via hidden inputs */}
              <div className="space-y-1.5">
                <label className="field-label">
                  Your name <span className="text-[var(--danger)]">*</span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Required to record who is signing off.
                </p>
              </div>

              <form action={approveAction} className="space-y-3">
                <input
                  name="reviewerName"
                  required
                  placeholder="e.g. Amara Osei"
                  className="field-input"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--success)] hover:brightness-110 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve this requirement
                </button>
              </form>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or raise a concern</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form action={disputeAction} className="space-y-3">
                <input
                  name="reviewerName"
                  required
                  placeholder="e.g. Amara Osei"
                  className="field-input"
                />
                <textarea
                  name="comment"
                  rows={3}
                  required
                  placeholder="Describe your concern or what needs to change..."
                  className="field-input resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl border border-[var(--disputed)]/40 bg-[var(--disputed-muted)] hover:bg-[var(--disputed)] hover:text-white text-[var(--disputed)] font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Submit concern
                </button>
              </form>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  // ─── Demo review ───────────────────────────────────────────────────────────

  if (payload.type === "demo") {
    const [demo] = await db
      .select()
      .from(demoVideos)
      .where(eq(demoVideos.id, payload.referenceId))
      .limit(1);

    const [proj] = await db
      .select({ name: projects.name })
      .from(projects)
      .where(eq(projects.id, payload.projectId))
      .limit(1);

    if (!demo) {
      return (
        <Shell>
          <p className="text-sm text-muted-foreground text-center py-16">Item not found.</p>
        </Shell>
      );
    }

    // Load linked requirement + tasks
    const [linkedReq] = demo.requirementId
      ? await db
          .select()
          .from(requirements)
          .where(eq(requirements.id, demo.requirementId))
          .limit(1)
      : [undefined];

    const linkedTasks = linkedReq
      ? await db
          .select()
          .from(tasks)
          .where(eq(tasks.requirementId, linkedReq.id))
      : [];

    // Who has already responded
    const priorReviews = await db
      .select({
        reviewerName: clientReviews.reviewerName,
        reviewerEmail: clientReviews.reviewerEmail,
        decision: clientReviews.decision,
        comment: clientReviews.comment,
        createdAt: clientReviews.createdAt,
      })
      .from(clientReviews)
      .where(eq(clientReviews.demoVideoId, demo.id));

    const alreadyReviewedByMe = priorReviews.some(
      (r) => r.reviewerEmail === payload.reviewerEmail
    );
    const myPriorReview = priorReviews.find(
      (r) => r.reviewerEmail === payload.reviewerEmail
    );

    const approveAction = submitDemoReview.bind(null, token, "approved");
    const rejectAction = submitDemoReview.bind(null, token, "rejected");

    return (
      <Shell project={proj?.name}>
        <div className="space-y-6">
          {/* Reviewing as */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <Lock className="h-3 w-3 shrink-0 text-[var(--accent)]" />
            Reviewing as <span className="text-foreground font-medium">{payload.reviewerEmail}</span>
          </div>

          {/* Demo header */}
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">{demo.title}</h2>
            <p className="text-xs text-muted-foreground">
              Recorded {formatDate(demo.recordedAt)}
              {demo.durationSeconds &&
                ` · ${Math.floor(demo.durationSeconds / 60)}m ${demo.durationSeconds % 60}s`}
            </p>
          </div>

          {/* Video — prominent */}
          <a
            href={demo.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-border bg-card aspect-video relative overflow-hidden group hover:border-primary/40 transition-colors"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-muted)] group-hover:bg-[var(--accent)]/25 flex items-center justify-center transition-colors">
                <Play className="h-7 w-7 text-[var(--accent)] ml-1" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Click to watch demo
              </span>
            </div>
          </a>

          {/* Linked requirement */}
          {linkedReq && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5" />
                Requirement satisfied
              </h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[var(--accent)]">{linkedReq.refCode}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{linkedReq.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {linkedReq.description}
                </p>
              </div>

              {/* Tasks */}
              {linkedTasks.length > 0 && (
                <div className="pt-2 border-t border-border space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <CheckSquare className="h-3.5 w-3.5" />
                    Tasks completed
                  </p>
                  {linkedTasks.map((task) => {
                    const Icon = taskStatusIcon[task.status] ?? CircleMinus;
                    const color = taskStatusColor[task.status] ?? "text-[var(--fg-muted)]";
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 text-sm py-1"
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                        <span className="font-mono text-xs text-muted-foreground">
                          {task.refCode}
                        </span>
                        <span className="text-foreground truncate">{task.title}</span>
                        <span className={`text-xs capitalize shrink-0 ${color}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Prior team sign-offs */}
          {priorReviews.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Team responses ({priorReviews.length})
              </h3>
              <div className="space-y-2">
                {priorReviews.map((r, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-foreground">{r.reviewerName}</span>
                        <span className="text-muted-foreground text-xs ml-1.5">
                          {r.reviewerEmail}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          r.decision === "approved"
                            ? "text-[var(--success)] bg-[var(--success-muted)]"
                            : "text-[var(--danger)] bg-[var(--danger-muted)]"
                        }`}
                      >
                        {r.decision}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-muted-foreground italic pl-0">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review form */}
          {alreadyReviewedByMe ? (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border ${
                myPriorReview?.decision === "approved"
                  ? "border-[var(--success)]/30 bg-[var(--success-muted)]"
                  : "border-[var(--danger)]/30 bg-[var(--danger-muted)]"
              }`}
            >
              {myPriorReview?.decision === "approved" ? (
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              ) : (
                <XCircle className="h-5 w-5 text-[var(--danger)]" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground capitalize">
                  You already {myPriorReview?.decision} this demo
                </p>
                {myPriorReview?.comment && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    &ldquo;{myPriorReview.comment}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="field-label">
                  Your name <span className="text-[var(--danger)]">*</span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Required to record who is signing off.
                </p>
              </div>

              <form action={approveAction} className="space-y-3">
                <input
                  name="reviewerName"
                  required
                  placeholder="e.g. Amara Osei"
                  className="field-input"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--success)] hover:brightness-110 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve this demo
                </button>
              </form>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or request changes</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form action={rejectAction} className="space-y-3">
                <input
                  name="reviewerName"
                  required
                  placeholder="e.g. Amara Osei"
                  className="field-input"
                />
                <textarea
                  name="comment"
                  rows={3}
                  required
                  placeholder="What needs to change? Be specific — your feedback will be reviewed for scope."
                  className="field-input resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-muted)] hover:bg-[var(--danger-muted)] text-[var(--danger)] font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Request changes
                </button>
              </form>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  return null;
}

function Shell({ children, project }: { children: React.ReactNode; project?: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--accent-muted)] flex items-center justify-center">
            <Lock className="h-3 w-3 text-[var(--accent)]" />
          </div>
          <span className="font-semibold text-sm text-foreground">ShipLock</span>
        </div>
        {project && <span className="text-xs text-muted-foreground">{project}</span>}
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          This is a secure review link generated by ShipLock. Your response is recorded and timestamped.
        </p>
      </footer>
    </div>
  );
}

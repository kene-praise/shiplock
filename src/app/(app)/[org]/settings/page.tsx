import { db } from "@/db";
import { organizations, users, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateOrg } from "@/lib/actions/orgs";
import { inviteMember } from "@/lib/actions/invites";
import { PageHeader, SectionLabel } from "@/components/dashboard-ui";
import { SubmitButton } from "@/components/submit-button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { InviteMemberDialog } from "@/components/dialogs/InviteMemberDialog";

interface Props {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const roleColors: Record<string, string> = {
  owner:   "text-[var(--accent)] bg-[var(--accent-muted)]",
  builder: "text-[var(--accent)] bg-[var(--accent-muted)]",
  client:  "text-[var(--success)] bg-[var(--success-muted)]",
};

export default async function OrgSettingsPage({ params, searchParams }: Props) {
  const { org } = await params;
  const sParams = await searchParams;
  const slugTaken = sParams.error === "slug-taken";

  const [orgData] = await db.select().from(organizations).where(eq(organizations.slug, org)).limit(1);
  if (!orgData) notFound();

  const [members, projectList] = await Promise.all([
    db.select().from(users).where(eq(users.orgId, orgData.id)),
    db.select({ slug: projects.slug, name: projects.name, status: projects.status, description: projects.description })
      .from(projects)
      .where(eq(projects.orgId, orgData.id)),
  ]);

  const save = updateOrg.bind(null, orgData.id, orgData.slug);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] p-2 gap-1">
      <AppSidebar org={org} orgName={orgData.name} allProjects={projectList} />

      <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto px-8 py-6 space-y-6">
            <PageHeader title="Org Settings" meta={orgData.name} />

            {slugTaken && (
              <div className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[var(--danger-muted)] px-4 py-3 text-[12.5px] text-[var(--danger)]">
                That slug is already taken by another organization. Pick a different one.
              </div>
            )}

            {/* Org info */}
            <section
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden animate-enter"
              style={{ "--stagger": 1 } as React.CSSProperties}
            >
              <form action={save}>
                <div className="p-5 space-y-4">
                  <SectionLabel>Organization</SectionLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="field-label block">Name</label>
                      <input name="name" required defaultValue={orgData.name} className="field-input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="field-label block">Slug</label>
                      <input name="slug" required defaultValue={orgData.slug} className="field-input font-mono" />
                      <p className="text-xs text-[var(--disputed)]">
                        ⚠ Changing this breaks all existing URLs.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="px-5 py-3 flex justify-end"
                  style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
                >
                  <SubmitButton pendingText="Saving…" className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
                    Save
                  </SubmitButton>
                </div>
              </form>
            </section>

            {/* Team */}
            <section
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden animate-enter"
              style={{ "--stagger": 2 } as React.CSSProperties}
            >
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ background: "var(--card-footer)", borderBottom: "1px solid var(--border-footer)" }}
              >
                <SectionLabel>Team</SectionLabel>
                <InviteMemberDialog action={inviteMember.bind(null, orgData.id, orgData.slug)} />
              </div>
              <div className="divide-y divide-[var(--border)]">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[11px] font-semibold text-[var(--accent)]">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[var(--fg)] leading-tight">{member.name}</p>
                        <p className="text-[11.5px] text-[var(--fg-muted)] leading-tight mt-0.5">{member.email}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-[var(--radius-full)] font-medium capitalize ${roleColors[member.role] ?? ""}`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
      </main>
    </div>
  );
}

import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";
import { updateOrg } from "@/lib/actions/orgs";

interface Props {
  params: Promise<{ org: string }>;
}

const roleColors: Record<string, string> = {
  owner:   "text-indigo-400 bg-indigo-500/10",
  builder: "text-blue-400 bg-blue-500/10",
  client:  "text-green-400 bg-green-500/10",
};

export default async function OrgSettingsPage({ params }: Props) {
  const { org } = await params;

  const [orgData] = await db.select().from(organizations).where(eq(organizations.slug, org)).limit(1);
  if (!orgData) notFound();

  const members = await db.select().from(users).where(eq(users.orgId, orgData.id));
  const save = updateOrg.bind(null, orgData.id, orgData.slug);

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border flex items-center px-6 gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">ShipLock</span>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm text-muted-foreground">{orgData.name}</span>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm text-muted-foreground">Settings</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Org Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orgData.name}</p>
        </div>

        {/* Org info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Organization</h2>
          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                <input
                  name="name"
                  required
                  defaultValue={orgData.name}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Slug
                </label>
                <input
                  name="slug"
                  required
                  defaultValue={orgData.slug}
                  className="w-full px-3 py-2 rounded-lg border border-orange-800/60 bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition font-mono"
                />
                <p className="text-xs text-orange-400">
                  ⚠ Changing this breaks all existing URLs. Only change if you know what you&apos;re doing.
                </p>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
            >
              Save
            </button>
          </form>
        </section>

        {/* Team */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold text-foreground">Team</h2>
            <button className="text-xs text-primary hover:underline">Invite member</button>
          </div>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleColors[member.role] ?? ""}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

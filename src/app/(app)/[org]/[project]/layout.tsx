import { AppSidebar } from "@/components/layout/AppSidebar";
import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org: string; project: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { org, project } = await params;

  const [orgData] = await db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .where(eq(organizations.slug, org))
    .limit(1);

  const allProjects = orgData
    ? await db
        .select({ slug: projects.slug, name: projects.name, status: projects.status, description: projects.description })
        .from(projects)
        .where(eq(projects.orgId, orgData.id))
    : [];

  const currentProject = allProjects.find((p) => p.slug === project);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] p-2 gap-1">
      <AppSidebar
        org={org}
        project={project}
        projectName={currentProject?.name}
        orgName={orgData?.name}
        allProjects={allProjects}
      />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

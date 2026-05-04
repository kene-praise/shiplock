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

  const [projectData] = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.slug, project))
    .limit(1);

  const [orgData] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.slug, org))
    .limit(1);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        org={org}
        project={project}
        projectName={projectData?.name}
        orgName={orgData?.name}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

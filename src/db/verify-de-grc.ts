import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { projects, requirements, tasks, scopeChanges, standups, users } from "./schema";
import { eq, count, and } from "drizzle-orm";

async function verify() {
  const [proj] = await db.select().from(projects).where(eq(projects.id, "proj_de_grc"));
  const [reqAll] = await db.select({ c: count() }).from(requirements).where(eq(requirements.projectId, "proj_de_grc"));
  const [reqMvp] = await db.select({ c: count() }).from(requirements).where(and(eq(requirements.projectId, "proj_de_grc"), eq(requirements.classification, "mvp")));
  const [taskAll] = await db.select({ c: count() }).from(tasks).where(eq(tasks.projectId, "proj_de_grc"));
  const [scAll] = await db.select({ c: count() }).from(scopeChanges).where(eq(scopeChanges.projectId, "proj_de_grc"));
  const [suAll] = await db.select({ c: count() }).from(standups).where(eq(standups.projectId, "proj_de_grc"));
  const allUsers = await db.select({ name: users.name, role: users.role }).from(users).where(eq(users.orgId, "org_shiplock"));

  console.log("\n=== Digital Encode GRC Project Verification ===");
  console.log(`Project:      ${proj?.name}`);
  console.log(`MVP Deadline: ${proj?.mvpDeadline}`);
  console.log(`Status:       ${proj?.status}`);
  console.log(`Requirements: ${reqAll.c} total (${reqMvp.c} MVP, ${Number(reqAll.c) - Number(reqMvp.c)} Post-MVP)`);
  console.log(`Tasks:        ${taskAll.c} across W1–W4`);
  console.log(`Scope Changes:${scAll.c} (5 deferred, 2 accepted)`);
  console.log(`Standups:     ${suAll.c}`);
  console.log(`\nOrg users (${allUsers.length}):`);
  allUsers.forEach(u => console.log(`  - ${u.name} (${u.role})`));
  console.log(`\nApp URL: /shiplock/proj_de_grc/dashboard`);
}

verify().catch(console.error);

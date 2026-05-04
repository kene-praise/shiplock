import { inngest } from "./client";
import { db } from "@/db";
import { clientPings, requirements, demoVideos, users, projects } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { sendAutoApproveNoticeEmail } from "@/lib/email";

export const autoApproveCheck = inngest.createFunction(
  { id: "auto-approve-check", name: "Auto-approve overdue pings", triggers: [{ cron: "0 * * * *" }] },
  async ({ step }) => {
    const now = new Date();

    const overduePings = await step.run("fetch-overdue-pings", async () => {
      return db
        .select()
        .from(clientPings)
        .where(and(eq(clientPings.status, "pending"), lt(clientPings.deadline, now)));
    });

    if (overduePings.length === 0) return { processed: 0 };

    let processed = 0;

    for (const ping of overduePings) {
      await step.run(`process-ping-${ping.id}`, async () => {
        if (ping.type === "requirement_review" && ping.referenceId) {
          const [req] = await db
            .select()
            .from(requirements)
            .where(eq(requirements.id, ping.referenceId))
            .limit(1);

          if (req && req.status === "pending_approval") {
            await db
              .update(requirements)
              .set({ status: "approved", autoApproved: true, clientApprovedAt: now, updatedAt: now })
              .where(eq(requirements.id, req.id));

            // Notify client
            const [proj] = await db.select({ name: projects.name, orgId: projects.orgId }).from(projects).where(eq(projects.id, ping.projectId)).limit(1);
            if (proj) {
              const clientUsers = await db.select().from(users).where(and(eq(users.orgId, proj.orgId), eq(users.role, "client")));
              await Promise.all(clientUsers.map((u) =>
                sendAutoApproveNoticeEmail({ to: u.email, projectName: proj.name, itemTitle: req.title, itemType: "requirement" })
              ));
            }
          }
        }

        if (ping.type === "demo_review" && ping.referenceId) {
          const [demo] = await db
            .select()
            .from(demoVideos)
            .where(eq(demoVideos.id, ping.referenceId))
            .limit(1);

          if (demo && demo.clientStatus === "pending") {
            await db
              .update(demoVideos)
              .set({ clientStatus: "approved", autoApproved: true, clientResponseAt: now, updatedAt: now })
              .where(eq(demoVideos.id, demo.id));

            const [proj] = await db.select({ name: projects.name, orgId: projects.orgId }).from(projects).where(eq(projects.id, ping.projectId)).limit(1);
            if (proj) {
              const clientUsers = await db.select().from(users).where(and(eq(users.orgId, proj.orgId), eq(users.role, "client")));
              await Promise.all(clientUsers.map((u) =>
                sendAutoApproveNoticeEmail({ to: u.email, projectName: proj.name, itemTitle: demo.title, itemType: "demo" })
              ));
            }
          }
        }

        await db
          .update(clientPings)
          .set({ status: "responded", responseAt: now })
          .where(eq(clientPings.id, ping.id));
      });

      processed++;
    }

    return { processed };
  }
);

export const pingReminder24h = inngest.createFunction(
  { id: "ping-reminder-24h", name: "24h ping reminder", triggers: [{ cron: "0 * * * *" }] },
  async ({ step }) => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Find pings that expire between 24-25h from now (i.e. 24h warning window)
    const soonPings = await step.run("fetch-soon-pings", async () => {
      return db
        .select()
        .from(clientPings)
        .where(and(eq(clientPings.status, "pending"), lt(clientPings.deadline, in25h)));
    });

    const filtered = soonPings.filter((p) => {
      const d = new Date(p.deadline);
      return d >= in24h && d < in25h;
    });

    return { reminded: filtered.length };
  }
);

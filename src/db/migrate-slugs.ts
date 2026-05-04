import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { organizations, projects } from "./schema";
import { eq } from "drizzle-orm";

async function run() {
  // Update org: shiplock → digitalencode
  await db
    .update(organizations)
    .set({ name: "Digital Encode", slug: "digitalencode" })
    .where(eq(organizations.id, "org_shiplock"));
  console.log("✓ Org updated: slug=digitalencode, name=Digital Encode");

  // Set project slugs
  await db.update(projects).set({ slug: "grc" }).where(eq(projects.id, "proj_de_grc"));
  await db.update(projects).set({ slug: "grc-legacy" }).where(eq(projects.id, "proj_grc"));
  console.log("✓ proj_de_grc → slug: grc");
  console.log("✓ proj_grc     → slug: grc-legacy");

  console.log("\nURLs are now:");
  console.log("  /digitalencode/projects");
  console.log("  /digitalencode/grc/dashboard");
  console.log("  /digitalencode/grc/requirements");
  console.log("  /digitalencode/grc/tasks");
}

run().catch(console.error);

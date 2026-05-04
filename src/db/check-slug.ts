import { db } from "./index";
import { organizations } from "./schema";

async function main() {
  const orgs = await db.select().from(organizations);
  console.log("Current orgs:");
  orgs.forEach((o) => console.log(`  id=${o.id} | name="${o.name}" | slug="${o.slug}"`));
}
main().catch(console.error);

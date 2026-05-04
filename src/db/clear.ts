import { db } from "./index";
import {
  clientPings,
  standups,
  scopeChanges,
  tasks,
  requirements,
  projects,
  users,
  organizations,
} from "./schema";

async function clear() {
  await db.delete(clientPings);
  await db.delete(standups);
  await db.delete(scopeChanges);
  await db.delete(tasks);
  await db.delete(requirements);
  await db.delete(projects);
  await db.delete(users);
  await db.delete(organizations);
  console.log("Cleared.");
}

clear().catch((e) => { console.error(e); process.exit(1); });

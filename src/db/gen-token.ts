import { signReviewToken } from "../lib/signed-url";
import { db } from "./index";
import { requirements, clientPings } from "./schema";

async function main() {
  const [req] = await db.select().from(requirements).limit(1);
  const [ping] = await db.select().from(clientPings).limit(1);

  const token = signReviewToken({
    type: "requirement",
    referenceId: req.id,
    pingId: ping.id,
    projectId: req.projectId,
    reviewerEmail: "praiseofumaduadike@gmail.com",
  });

  console.log("\nTest review URL:");
  console.log("http://localhost:3000/review/" + token);
}

main().catch(console.error);

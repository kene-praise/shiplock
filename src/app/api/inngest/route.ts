import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { autoApproveCheck, pingReminder24h } from "@/inngest/auto-approve";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [autoApproveCheck, pingReminder24h],
});

"use server";

import { callAI } from "@/lib/ai";

export interface ScopeCreepResult {
  detected: boolean;
  title?: string;
  description?: string;
  summary?: string;
}

export async function detectScopeCreep(
  requirementTitle: string,
  requirementDescription: string,
  rejectionComment: string
): Promise<ScopeCreepResult> {
  const prompt = `You are analyzing a client's rejection comment on a completed software requirement to detect scope creep.

Original requirement:
Title: ${requirementTitle}
Description: ${requirementDescription}

Client's rejection comment:
"${rejectionComment}"

Does this comment describe new functionality, a change, or an addition that was NOT part of the original requirement? This would be scope creep.

Respond with JSON only, no other text:
{
  "detected": true or false,
  "title": "Short title for the scope change (if detected, else null)",
  "description": "One to two sentences describing what the client is asking for (if detected, else null)",
  "summary": "One sentence explaining why this is scope creep (if detected, else null)"
}`;

  const text = await callAI(prompt);
  const cleaned = text.replace(/```json\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(cleaned) as ScopeCreepResult;
}

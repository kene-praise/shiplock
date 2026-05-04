"use server";

import Anthropic from "@anthropic-ai/sdk";

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
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const parsed = JSON.parse(text) as ScopeCreepResult;
  return parsed;
}

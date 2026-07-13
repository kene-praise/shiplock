import Anthropic from "@anthropic-ai/sdk";

// Thrown when every configured provider fails (or none is configured). Callers
// should surface a friendly message — never the raw provider error, which can
// leak billing/quota details.
export class AIUnavailableError extends Error {
  constructor() {
    super("The AI service is temporarily unavailable. Please try again in a moment.");
    this.name = "AIUnavailableError";
  }
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}

// Gemini is the primary provider (free tier). Anthropic only runs if
// ANTHROPIC_API_KEY is set — it's an opt-in paid fallback, not required.
export async function callAI(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey) {
    try {
      return await callGemini(geminiKey, prompt);
    } catch (e) {
      console.error("Gemini API call failed:", e);
      if (!anthropicKey) throw new AIUnavailableError();
    }
  }

  if (anthropicKey) {
    try {
      return await callAnthropic(anthropicKey, prompt);
    } catch (e) {
      console.error("Anthropic API call failed:", e);
      throw new AIUnavailableError();
    }
  }

  throw new AIUnavailableError();
}

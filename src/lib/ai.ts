import Anthropic from "@anthropic-ai/sdk";

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

export async function callAI(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey) {
    try {
      return await callGemini(geminiKey, prompt);
    } catch (e) {
      console.error("Gemini API call failed:", e);
      if (!anthropicKey) throw e;
    }
  }

  if (anthropicKey) {
    try {
      return await callAnthropic(anthropicKey, prompt);
    } catch (e) {
      console.error("Anthropic API call failed:", e);
      throw e;
    }
  }

  throw new Error("No AI API key found. Please set GEMINI_API_KEY or ANTHROPIC_API_KEY in your .env.local file.");
}

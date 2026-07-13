import Anthropic from "@anthropic-ai/sdk";

export async function callAI(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
    } catch (e) {
      console.error("Gemini API call failed:", e);
      throw e;
    }
  }

  if (anthropicKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey });
      const message = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });
      return message.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");
    } catch (e) {
      console.error("Anthropic API call failed:", e);
      throw e;
    }
  }

  throw new Error("No AI API key found. Please set GEMINI_API_KEY or ANTHROPIC_API_KEY in your .env.local file.");
}

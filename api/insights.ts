// Vercel serverless function — proxies AI insights request to Lovable AI Gateway.
/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) {
    return res.status(503).json({
      error: "AI insights are not configured. Set LOVABLE_API_KEY in your Vercel environment variables.",
    });
  }

  const { summary } = req.body ?? {};
  if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
    return res.status(400).json({ error: "summary is required." });
  }

  const systemPrompt = `You are FinTrack's friendly financial coach. Given a user's transaction summary (in INR, ₹), produce 5 short, specific, actionable insights about their habits. Be encouraging and concrete. Avoid vague advice.`;

  try {
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: summary },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Return personalized financial insights",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        detail: { type: "string" },
                        tone: { type: "string", enum: ["positive", "warning", "tip"] },
                      },
                      required: ["title", "detail", "tone"],
                    },
                    minItems: 4,
                    maxItems: 6,
                  },
                },
                required: ["insights"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (aiRes.status === 429) return res.status(429).json({ error: "Rate limit reached. Try again in a moment." });
    if (aiRes.status === 402) return res.status(402).json({ error: "AI credits exhausted." });
    if (!aiRes.ok) return res.status(502).json({ error: `AI error (${aiRes.status}).` });

    const json = await aiRes.json() as any;
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return res.status(502).json({ error: "AI returned an unexpected response." });

    const parsed = JSON.parse(args);
    return res.status(200).json({ insights: parsed.insights });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Internal server error." });
  }
}

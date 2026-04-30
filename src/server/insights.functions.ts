// Server function: generate AI insights from transaction summary using Lovable AI Gateway.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  summary: z.string().min(1).max(8000),
});

export const generateInsights = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return { error: "AI service not configured." as const };
    }

    const systemPrompt = `You are FinTrack's friendly financial coach. Given a user's transaction summary (in INR, ₹), produce 5 short, specific, actionable insights about their habits. Be encouraging and concrete. Avoid vague advice.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: data.summary },
        ],
        tools: [{
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
                      title: { type: "string", description: "Short headline (under 60 chars)" },
                      detail: { type: "string", description: "1-2 sentence specific advice" },
                      tone: { type: "string", enum: ["positive", "warning", "tip"] },
                    },
                    required: ["title", "detail", "tone"],
                    additionalProperties: false,
                  },
                  minItems: 4,
                  maxItems: 6,
                },
              },
              required: ["insights"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (res.status === 429) return { error: "Rate limit reached. Try again in a moment." as const };
    if (res.status === 402) return { error: "AI credits exhausted. Add credits in Workspace settings." as const };
    if (!res.ok) return { error: `AI error (${res.status}).` as const };

    const json = await res.json() as {
      choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return { error: "AI returned an unexpected response." as const };
    try {
      const parsed = JSON.parse(args) as { insights: { title: string; detail: string; tone: "positive" | "warning" | "tip" }[] };
      return { insights: parsed.insights };
    } catch {
      return { error: "Could not parse AI response." as const };
    }
  });

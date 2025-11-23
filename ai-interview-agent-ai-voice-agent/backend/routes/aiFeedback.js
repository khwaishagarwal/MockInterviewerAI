import express from "express";
import OpenAI from "openai";
import { FEEDBACK_PROMPT } from "../services/constants.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { conversation } = req.body;

  if (!conversation || !Array.isArray(conversation)) {
    return res.status(400).json({ error: "Conversation missing or invalid" });
  }

  try {
    console.log("=== FEEDBACK REQUEST RECEIVED ===");

    const prompt = FEEDBACK_PROMPT.replace(
      "{{conversation}}",
      JSON.stringify(conversation, null, 2)
    );

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    console.log("Calling OpenRouter with GPT-4o-mini...");

    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",   // ⭐ NO FALLBACK MODEL ANYMORE
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Return ONLY VALID JSON. No markdown. No code fences. No prose. Strict JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const rawOutput = completion.choices?.[0]?.message?.content?.trim();
    console.log("Raw Output from OpenRouter:", rawOutput);

    if (!rawOutput) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    // Remove accidental ```json or ```
    let cleaned = rawOutput
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("Cleaned JSON:", cleaned);

    // Must parse valid JSON
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      console.log("❌ JSON Parse Error:", error);
      console.log("❌ Offending Content:", cleaned);
      return res.status(500).json({
        error: "Invalid JSON from AI",
        raw: cleaned
      });
    }

    console.log("=== FEEDBACK GENERATED SUCCESSFULLY ===");
    return res.json(parsed);

  } catch (error) {
    console.error("❌ FEEDBACK GENERATION SERVER ERROR:", error);
    return res.status(500).json({ error: "Server error generating feedback" });
  }
});

export default router;
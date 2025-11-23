import express from "express";
import OpenAI from "openai";
import { QUESTIONS_PROMPT } from "../services/constants.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { jobPosition, jobDescription, duration, type } = req.body;

  if (!jobPosition || !jobDescription || !duration || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const FINAL_PROMPT = QUESTIONS_PROMPT
    .replace("{{jobTitle}}", jobPosition)
    .replace("{{jobDescription}}", jobDescription)
    .replace("{{duration}}", duration)
    .replace("{{type}}", type);

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // MUCH better JSON compliance
      messages: [{ role: "user", content: FINAL_PROMPT }],
      temperature: 0,
    });

    let content = completion?.choices?.[0]?.message?.content;
    if (!content) return res.status(500).json({ error: "AI returned no content" });

    // Extract valid JSON
    const match = content.match(/```json([\s\S]*?)```/i);
    const jsonString = match ? match[1].trim() : content.trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.log("JSON parse error:", jsonString);
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }

    return res.json(parsed);
  } catch (error) {
    console.error("AI error:", error);
    return res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
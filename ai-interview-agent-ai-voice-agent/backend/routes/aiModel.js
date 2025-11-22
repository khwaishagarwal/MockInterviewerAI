import express from "express";
import OpenAI from "openai";
const router = express.Router();

router.post("/", async (req, res) => {
  const { jobPosition, jobDescription, duration, type } = req.body;

  const FINAL_PROMPT = `You are an expert interviewer. Generate structured interview questions for the following:
Job Title: ${jobPosition}
Description: ${jobDescription}
Duration: ${duration} minutes
Type: ${type}

Return ONLY the following JSON inside a Markdown code block:
\`\`\`json
{
  "interviewQuestions": [
    {
      "question": "Describe a time you solved a UI performance issue.",
      "type": "Technical"
    }
  ]
}
\`\`\`
`;

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-small-3.2-24b-instruct:free",
      messages: [{ role: "user", content: FINAL_PROMPT }],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "No content returned from AI." });
    }

    // Extract JSON inside ```json ... ```
    const match = content.match(/```json\s*([\s\S]*?)```/i);
    const jsonString = match ? match[1].trim() : content.trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error("❌ JSON parse error:", err.message, jsonString);
      return res.status(500).json({ error: "Invalid JSON returned from AI." });
    }

    return res.json(parsed);
  } catch (error) {
    console.error("❌ OpenRouter API Error:", error.message);
    return res.status(500).json({ error: "AI generation failed." });
  }
});

export default router;

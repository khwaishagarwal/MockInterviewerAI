import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { jobPosition, jobDescription, duration, type } = await req.json();

  const FINAL_PROMPT = QUESTIONS_PROMPT
    .replace("{{jobTitle}}", jobPosition)
    .replace("{{jobDescription}}", jobDescription)
    .replace("{{duration}}", duration)
    .replace("{{type}}", type);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "microsoft/mai-ds-r1:free",
        messages: [{ role: "user", content: FINAL_PROMPT }],
      }),
    });

    const data = await response.json();
    console.log("AI Response from OpenRouter:", data);

    if (data.choices && data.choices.length > 0) {
      return NextResponse.json(data.choices[0].message.content);
    } else {
      return NextResponse.json({ error: "No response from AI model." });
    }
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return NextResponse.json({ error: "AI generation failed." });
  }
}

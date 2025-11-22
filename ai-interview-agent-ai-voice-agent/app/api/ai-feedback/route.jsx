import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { conversation } = await req.json();

  const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
    "{{conversation}}",
    JSON.stringify(conversation)
  );

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: FINAL_PROMPT }],
      }),
    });

    const data = await response.json();

    console.log("OpenRouter Feedback Response:", data);

    if (data.choices && data.choices.length > 0) {
      return NextResponse.json(data.choices[0].message.content);
    } else {
      return NextResponse.json({ error: "No response from AI model." });
    }
  } catch (e) {
    console.error("Feedback AI Error:", e);
    return NextResponse.json({ error: "Feedback generation failed." });
  }
}

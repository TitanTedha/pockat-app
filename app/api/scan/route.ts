import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const formData = await req.formData();
    const file = formData.get("receipt") as File;
    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the specific model identifier (try "gemini-1.5-flash" or "models/gemini-1.5-flash")
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      "Extract receipt details. Return ONLY JSON format: {\"merchant\": string, \"amount\": number, \"date\": string}. If data is missing, use null.",
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text();
    // Clean up Markdown backticks if the AI includes them
    const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(jsonString));
  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    // 1. Force a clear error if the environment variable is missing in Vercel
    if (!apiKey) {
      console.error("CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is undefined");
      throw new Error("API Key configuration error");
    }

    const formData = await req.formData();
    const file = formData.get("receipt") as File;
    if (!file) throw new Error("No file provided");

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 2. Initialize with the key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 3. Use the most stable model identifier
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

    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      "Extract receipt details. Return ONLY this JSON format: {\"merchant\": string, \"amount\": number, \"date\": string}. If data is missing, use null.",
      { inlineData: { data: buffer.toString("base64"), mimeType: file.type } }
    ]);

    const text = result.response.text().replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    return NextResponse.json({ error: "Failed to scan receipt" }, { status: 500 });
  }
}
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("receipt") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ---------------------------------------------------------
    // ⬇️ UPDATE THE MODEL STRING HERE ⬇️
    // ---------------------------------------------------------
    const model = genAI.getGenerativeModel({ 
      model: "gemini-robotics-er-1.6-preview", // Your specialized model
      generationConfig: { 
        responseMimeType: "application/json" 
      } 
    });

    const result = await model.generateContent([
      `Extract the receipt details. You must strictly adhere to this JSON schema: 
      {
        "merchant": "string or null", 
        "amount": "number or null", 
        "date": "string (YYYY-MM-DD) or null"
      }`,
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type,
        },
      },
    ]);

    const jsonText = result.response.text();
    return NextResponse.json(JSON.parse(jsonText));

  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    // 1. Clear error handling with appropriate HTTP status codes
    if (!apiKey) {
      console.error("CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is undefined");
      return NextResponse.json({ error: "Server misconfiguration: Missing API Key" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("receipt") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No receipt file provided in the request" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 2. Initialize the model with native JSON mode
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { 
        responseMimeType: "application/json" // Forces the AI to return clean JSON without markdown
      } 
    });

    // 3. Clearer prompt explicitly defining the expected schema
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

    // 4. Safely parse the guaranteed JSON response
    const jsonText = result.response.text();
    const parsedData = JSON.parse(jsonText);
    
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to process receipt" }, { status: 500 });
  }
}

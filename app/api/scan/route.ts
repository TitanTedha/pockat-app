import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // FETCH AVAILABLE MODELS
    // In many SDK versions, listModels() is a static method on the GoogleGenerativeAI class
    const models = await GoogleGenerativeAI.listModels(apiKey); 
    const modelNames = models.models.map((m: any) => m.name);
    
    console.log("AVAILABLE MODELS:", JSON.stringify(modelNames));
    
    return NextResponse.json({ available: modelNames });
  } catch (error: any) {
    console.error("DEBUG ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

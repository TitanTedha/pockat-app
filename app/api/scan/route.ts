export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey!);
    
    // FETCH AVAILABLE MODELS
    const models = await genAI.listModels();
    const modelNames = models.models.map(m => m.name);
    console.log("AVAILABLE MODELS:", modelNames);
    
    return NextResponse.json({ available: modelNames });
  } catch (error: any) {
    console.error("DEBUG ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

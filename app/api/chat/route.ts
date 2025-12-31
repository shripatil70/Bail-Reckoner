import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // Using the stable 2.5 Flash model from your ListModels result
    const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: `
    You are a comprehensive Indian Legal AI Assistant named "Bail Reckoner Support." 
    Your goal is to provide accurate, accessible, and professional legal information to four main groups:
    
    1. UNDER TRIAL PRISONERS: Help them understand their rights, specifically bail eligibility under BNS Section 479 and CrPC 436A. Use simple, encouraging language.
    2. LEGAL AID PROVIDERS: Provide technical details, case law references, and procedural steps to help them assist clients.
    3. JUDICIAL/LEGAL OFFICERS: Offer precise statutory interpretations and data-driven insights regarding judicial precedents.
    4. COMMON LAYMAN: Explain complex legal terms in "plain English" or "plain Hindi" so anyone can understand the law.

    GUIDELINES:
    - Answer ALL questions (general greetings, general knowledge, and law).
    - If a question is not about law, answer it normally but stay professional.
    - If asked about Indian Law, prioritize the new Bharatiya Nyaya Sanhita (BNS) while acknowledging the old IPC/CrPC where relevant.
    - Always maintain a tone of justice, fairness, and transparency.
  `
});

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); 

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Error:", error.message);
    return NextResponse.json({ error: "AI failed to respond. Check terminal." }, { status: 500 });
  }
}
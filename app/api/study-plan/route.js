import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("API route started");

    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
    console.log("API Key starts with:", process.env.GEMINI_API_KEY?.substring(0, 10));

    const { title, description, dueDate } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `Create a study plan for ${title}`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    return NextResponse.json({
      studyPlan: text,
    });
  } catch (error) {
    console.error("FULL ERROR:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
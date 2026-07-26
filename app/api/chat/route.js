import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const { message, studyPlan, assignmentTitle } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `
You are a helpful AI study assistant for university students.

The student is asking a follow-up question about this study plan:

Assignment: ${assignmentTitle || "Unknown"}
Study Plan:
${studyPlan || "No study plan provided"}

Student's question: ${message}

Give a clear, helpful, and friendly answer. Keep it practical and focused on studying.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get response from AI",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
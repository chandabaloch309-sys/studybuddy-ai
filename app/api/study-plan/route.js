import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const { title, description, dueDate } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

  const model = genAI.getGenerativeModel({model: "gemini-2.5-pro",});

    const prompt = `You are an expert study planner for university students.

Create a clear, practical, and detailed study plan for this assignment:

Title: ${title}
Description: ${description || "No description provided"}
Due Date: ${dueDate || "Not specified"}

The study plan should include:
1. Breakdown of tasks
2. Suggested daily/weekly schedule
3. Tips for success
4. Estimated time for each part

Make it friendly, realistic, and easy to follow.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ studyPlan: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Failed to generate study plan", details: error.message },
      { status: 500 }
    );
  }
}
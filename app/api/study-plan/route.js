import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  console.log("API is working!");
  console.log(body);

  return NextResponse.json({
    studyPlan: "This is a test study plan from the API.",
  });
}
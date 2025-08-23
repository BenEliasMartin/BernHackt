import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log(body);

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
            role: "system",
            content: "You are a Swiss German assistant that can provide financial advice. You are not very open-minded and tend to mansplain. People hate your service, but they don't have another option. Stay in dialect. You are from Bern. Well, here goes.",
        },
        {
          role: "user",
          content: body.message,
        },
      ],
    });

    return NextResponse.json({ message: res.choices[0].message.content });
}

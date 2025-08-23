import { NextRequest, NextResponse } from "next/server";
import { getUserSummary } from "../tools/firebaseAccess";

export async function GET(request: NextRequest) {
  try {
    const userSummary = await getUserSummary();
    return NextResponse.json({ success: true, data: userSummary });
  } catch (error) {
    console.error("Error fetching user summary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user summary" },
      { status: 500 }
    );
  }
}

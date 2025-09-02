import { NextResponse } from "next/server"
import { competitions } from "@/lib/competitions"

export async function GET() {
  try {
    // Return static competition data to ensure pricing is always available
    return NextResponse.json(competitions)
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    )
  }
}

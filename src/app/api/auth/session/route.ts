import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    // Return session info with updated expiration
    return NextResponse.json({
      user: session.user,
      expires: session.expires,
      message: "Session refreshed successfully"
    })
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/dashboard/pending-count - Get pending themes count
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    const sessionToken = await db.sessionToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!sessionToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = sessionToken.user;

    // Only admins can see pending count
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ count: 0 });
    }

    const count = await db.theme.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching pending count:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending count" },
      { status: 500 }
    );
  }
}

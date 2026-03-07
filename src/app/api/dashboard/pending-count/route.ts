import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// GET /api/dashboard/pending-count - Get pending themes count
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    const { data: sessionToken, error: sessionError } = await supabase
      .from('SessionToken')
      .select('*, User(*)')
      .eq('token', token)
      .single();

    if (sessionError || !sessionToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = sessionToken.User as any;

    // Only admins can see pending count
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ count: 0 });
    }

    const { count, error } = await supabase
      .from('Theme')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching pending count:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending count" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Get user info from token
    const { data: sessionToken, error: sessionError } = await supabase
      .from('SessionToken')
      .select('*, User(*)')
      .eq('token', token)
      .single();

    if (sessionError || !sessionToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = sessionToken.User as any;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    let stats: any = {};

    if (isAdmin) {
      // Admin stats
      // Get active users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('User')
        .select('*', { count: 'exact', head: true })
        .eq('isActive', true);

      // Get total themes count
      const { count: totalThemes, error: themesError } = await supabase
        .from('Theme')
        .select('*', { count: 'exact', head: true });

      // Get pending themes count
      const { count: pendingThemes, error: pendingError } = await supabase
        .from('Theme')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');

      // Get theme creators count
      const { count: themeCreatorsCount, error: creatorsError } = await supabase
        .from('User')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'THEME_CREATOR')
        .eq('isActive', true);

      stats = {
        totalUsers: totalUsers || 0,
        totalThemes: totalThemes || 0,
        pendingThemes: pendingThemes || 0,
        themeCreatorsCount: themeCreatorsCount || 0,
      };
    } else {
      // Creator stats
      // Get my themes count
      const { count: myThemes, error: countError } = await supabase
        .from('Theme')
        .select('*', { count: 'exact', head: true })
        .eq('createdBy', user.id);

      // Get themes data for views and likes
      const { data: themesData, error: themesError } = await supabase
        .from('Theme')
        .select('viewsCount, likesCount')
        .eq('createdBy', user.id);

      const totalViews = themesData?.reduce((sum: number, t: any) => sum + (t.viewsCount || 0), 0) || 0;
      const totalLikes = themesData?.reduce((sum: number, t: any) => sum + (t.likesCount || 0), 0) || 0;

      stats = {
        myThemes: myThemes || 0,
        totalViews,
        totalLikes,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

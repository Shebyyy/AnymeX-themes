import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// GET /api/dashboard/activity - Get recent activity
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
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    // Fetch real activity data
    const activities: any[] = [];

    if (isAdmin) {
      // For admins: show recent theme status changes
      const { data: recentThemes, error: themesError } = await supabase
        .from('Theme')
        .select('*, creator:User(id, username)')
        .order('createdAt', { ascending: false })
        .limit(10);

      if (recentThemes) {
        recentThemes.forEach((theme: any) => {
          const iconMap: Record<string, string> = {
            PENDING: "solar:clock-circle-bold",
            APPROVED: "solar:check-circle-bold",
            REJECTED: "solar:close-circle-bold",
            BROKEN: "solar:danger-triangle-bold",
          };
          const colorMap: Record<string, string> = {
            PENDING: "bg-yellow-500/10 text-yellow-500",
            APPROVED: "bg-green-500/10 text-green-500",
            REJECTED: "bg-red-500/10 text-red-500",
            BROKEN: "bg-orange-500/10 text-orange-500",
          };

          activities.push({
            id: `theme-${theme.id}`,
            type: "theme_status",
            message: `${theme.creator?.username || "Unknown"} uploaded "${theme.name}" (${theme.status})`,
            timestamp: theme.createdAt,
            icon: iconMap[theme.status] || "solar:file-bold",
            color: colorMap[theme.status] || "bg-blue-500/10 text-blue-500",
          });
        });
      }

      // Add recent user registrations
      const { data: recentUsers, error: usersError } = await supabase
        .from('User')
        .select('*')
        .eq('isActive', true)
        .order('createdAt', { ascending: false })
        .limit(5);

      if (recentUsers) {
        recentUsers.forEach((newUser: any) => {
          activities.push({
            id: `user-${newUser.id}`,
            type: "user_created",
            message: `New user registered: @${newUser.username} (${newUser.role})`,
            timestamp: newUser.createdAt,
            icon: "solar:user-plus-bold",
            color: "bg-green-500/10 text-green-500",
          });
        });
      }
    } else {
      // For creators: show their own theme uploads only
      const { data: userThemes, error: themesError } = await supabase
        .from('Theme')
        .select('*')
        .eq('createdBy', user.id)
        .order('createdAt', { ascending: false })
        .limit(10);

      if (userThemes) {
        userThemes.forEach((theme: any) => {
          const iconMap: Record<string, string> = {
            PENDING: "solar:clock-circle-bold",
            APPROVED: "solar:check-circle-bold",
            REJECTED: "solar:close-circle-bold",
            BROKEN: "solar:danger-triangle-bold",
          };
          const colorMap: Record<string, string> = {
            PENDING: "bg-yellow-500/10 text-yellow-500",
            APPROVED: "bg-green-500/10 text-green-500",
            REJECTED: "bg-red-500/10 text-red-500",
            BROKEN: "bg-orange-500/10 text-orange-500",
          };

          activities.push({
            id: `theme-${theme.id}`,
            type: "theme_created",
            message: `You uploaded "${theme.name}" - Status: ${theme.status}`,
            timestamp: theme.createdAt,
            icon: iconMap[theme.status] || "solar:upload-bold",
            color: colorMap[theme.status] || "bg-purple-500/10 text-purple-500",
          });
        });
      }
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

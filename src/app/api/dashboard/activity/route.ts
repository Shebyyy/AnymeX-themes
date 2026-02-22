import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/dashboard/activity - Get recent activity
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
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    // Fetch real activity data
    const activities: any[] = [];

    if (isAdmin) {
      // For admins: show recent theme status changes
      const recentThemes = await db.theme.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: { username: true },
          },
        },
      });

      recentThemes.forEach((theme) => {
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
          timestamp: theme.createdAt.toISOString(),
          icon: iconMap[theme.status] || "solar:file-bold",
          color: colorMap[theme.status] || "bg-blue-500/10 text-blue-500",
        });
      });

      // Add recent user registrations
      const recentUsers = await db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { isActive: true },
      });

      recentUsers.forEach((newUser) => {
        activities.push({
          id: `user-${newUser.id}`,
          type: "user_created",
          message: `New user registered: @${newUser.username} (${newUser.role})`,
          timestamp: newUser.createdAt.toISOString(),
          icon: "solar:user-plus-bold",
          color: "bg-green-500/10 text-green-500",
        });
      });
    } else {
      // For creators: show their own theme uploads only
      const userThemes = await db.theme.findMany({
        where: { createdBy: user.id },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      userThemes.forEach((theme) => {
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
          timestamp: theme.createdAt.toISOString(),
          icon: iconMap[theme.status] || "solar:upload-bold",
          color: colorMap[theme.status] || "bg-purple-500/10 text-purple-500",
        });
      });
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

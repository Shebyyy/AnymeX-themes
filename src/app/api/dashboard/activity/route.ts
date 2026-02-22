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

    // Generate mock activities based on user role
    const activities: any[] = [];

    if (isAdmin) {
      activities.push(
        {
          id: "1",
          type: "user_created",
          message: "New user registered: @creator123",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: "solar:user-plus-bold",
          color: "bg-green-50 text-green-600",
        },
        {
          id: "2",
          type: "theme_submitted",
          message: "Theme submitted for review: 'Cyberpunk'",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          icon: "solar:file-bold",
          color: "bg-blue-50 text-blue-600",
        },
        {
          id: "3",
          type: "theme_approved",
          message: `You approved 5 themes today`,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          icon: "solar:check-circle-bold",
          color: "bg-emerald-50 text-emerald-600",
        }
      );
    } else {
      // Fetch user's themes for activity generation
      const userThemes = await db.theme.findMany({
        where: { createdBy: user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      userThemes.forEach((theme, index) => {
        const hoursAgo = (index + 1) * 2;
        activities.push({
          id: `theme-${theme.id}`,
          type: "theme_created",
          message: `You uploaded "${theme.name}"`,
          timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
          icon: "solar:upload-bold",
          color: "bg-purple-50 text-purple-600",
        });
      });

      // Add mock like/view activities
      if (userThemes.length > 0) {
        activities.push({
          id: "like-1",
          type: "theme_liked",
          message: `Someone liked your "${userThemes[0].name}" 💖`,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          icon: "solar:heart-bold",
          color: "bg-red-50 text-red-600",
        });

        activities.push({
          id: "view-1",
          type: "theme_viewed",
          message: `Your "${userThemes[0].name}" reached ${userThemes[0].viewsCount} total views! 🎉`,
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          icon: "solar:eye-bold",
          color: "bg-blue-50 text-blue-600",
        });
      }
    }

    // Sort by timestamp
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

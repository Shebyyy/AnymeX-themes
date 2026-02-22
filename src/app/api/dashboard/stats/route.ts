import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Get user info from token
    const sessionToken = await db.sessionToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!sessionToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = sessionToken.user;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    let stats: any = {};

    if (isAdmin) {
      // Admin stats
      const [totalUsers, totalThemes, pendingThemes, themeCreatorsCount] = await Promise.all([
        db.user.count({ where: { isActive: true } }),
        db.theme.count(),
        db.theme.count({ where: { status: "PENDING" } }),
        db.user.count({ where: { role: "THEME_CREATOR", isActive: true } }),
      ]);

      stats = {
        totalUsers,
        totalThemes,
        pendingThemes,
        themeCreatorsCount,
      };
    } else {
      // Creator stats
      const [myThemes, themesData] = await Promise.all([
        db.theme.count({
          where: { createdBy: user.id },
        }),
        db.theme.findMany({
          where: { createdBy: user.id },
          select: { viewsCount: true, likesCount: true },
        }),
      ]);

      const totalViews = themesData.reduce((sum, t) => sum + t.viewsCount, 0);
      const totalLikes = themesData.reduce((sum, t) => sum + t.likesCount, 0);

      stats = {
        myThemes,
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

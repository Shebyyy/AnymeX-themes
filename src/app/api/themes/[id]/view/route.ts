import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/themes/[id]/view - Track a theme view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userToken } = await request.json();

    if (!userToken) {
      return NextResponse.json(
        { error: "User token is required" },
        { status: 400 }
      );
    }

    // Check if theme exists
    const theme = await db.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    // Check if user already viewed this theme
    const existingView = await db.themeView.findUnique({
      where: {
        themeId_userToken: {
          themeId: id,
          userToken,
        },
      },
    });

    // Only count view if user hasn't viewed before
    if (!existingView) {
      await db.themeView.create({
        data: {
          themeId: id,
          userToken,
        },
      });

      // Increment view count
      const updatedTheme = await db.theme.update({
        where: { id },
        data: { viewsCount: theme.viewsCount + 1 },
      });

      return NextResponse.json({ viewsCount: updatedTheme.viewsCount });
    }

    // User already viewed, return current count
    return NextResponse.json({ viewsCount: theme.viewsCount });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/themes/by-id/[themeId] - Get a theme by its themeId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const { themeId } = await params;

    const theme = await db.theme.findFirst({
      where: { themeId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            profileUrl: true,
          },
        },
      },
    });

    if (!theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.theme.update({
      where: { id: theme.id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json(theme);
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

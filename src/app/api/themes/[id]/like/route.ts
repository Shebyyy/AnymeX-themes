import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/themes/[id]/like - Like or unlike a theme
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

    // Check if user already liked this theme
    const existingLike = await db.themeLike.findUnique({
      where: {
        themeId_userToken: {
          themeId: id,
          userToken,
        },
      },
    });

    let newLikesCount = theme.likesCount;
    let isLiked = false;

    if (existingLike) {
      // Unlike: remove the like record and decrement count
      await db.themeLike.delete({
        where: { id: existingLike.id },
      });
      newLikesCount = Math.max(0, theme.likesCount - 1);
      isLiked = false;
    } else {
      // Like: create a like record and increment count
      await db.themeLike.create({
        data: {
          themeId: id,
          userToken,
        },
      });
      newLikesCount = theme.likesCount + 1;
      isLiked = true;
    }

    // Update theme's like count
    const updatedTheme = await db.theme.update({
      where: { id },
      data: { likesCount: newLikesCount },
    });

    return NextResponse.json({
      likesCount: updatedTheme.likesCount,
      isLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

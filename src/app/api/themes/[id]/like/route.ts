import { NextRequest, NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { enqueueThemeCounterDelta, getProjectedCounts } from "@/lib/metrics-buffer";

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
    const { data: theme, error: themeError } = await supabase
      .from("Theme")
      .select("*")
      .eq("id", id)
      .single();

    if (themeError || !theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    // Check if user already liked this theme
    const { data: existingLike } = await supabase
      .from("ThemeLike")
      .select("id")
      .eq("themeId", id)
      .eq("userToken", userToken)
      .single();

    const projected = getProjectedCounts(id, theme.likesCount || 0, theme.viewsCount || 0);
    let newLikesCount = projected.likesCount;
    let isLiked = false;

    if (existingLike) {
      // Unlike: remove the like record and decrement count
      await supabase
        .from("ThemeLike")
        .delete()
        .eq("id", existingLike.id);
      enqueueThemeCounterDelta(id, { likes: -1 });
      newLikesCount = Math.max(0, projected.likesCount - 1);
      isLiked = false;
    } else {
      // Like: create a like record and increment count
      await supabase
        .from("ThemeLike")
        .insert({
          id: generateId(),
          themeId: id,
          userToken,
        });
      enqueueThemeCounterDelta(id, { likes: 1 });
      newLikesCount = projected.likesCount + 1;
      isLiked = true;
    }

    return NextResponse.json({
      likesCount: newLikesCount,
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

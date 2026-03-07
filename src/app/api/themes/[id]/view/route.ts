import { NextRequest, NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";

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

    // Check if user already viewed this theme
    const { data: existingView } = await supabase
      .from("ThemeView")
      .select("id")
      .eq("themeId", id)
      .eq("userToken", userToken)
      .single();

    // Only count view if user hasn't viewed before
    if (!existingView) {
      await supabase
        .from("ThemeView")
        .insert({
          id: generateId(),
          themeId: id,
          userToken,
        });

      // Increment view count
      const { data: updatedTheme } = await supabase
        .from("Theme")
        .update({ viewsCount: theme.viewsCount + 1 })
        .eq("id", id)
        .select("viewsCount")
        .single();

      return NextResponse.json({ viewsCount: updatedTheme?.viewsCount || theme.viewsCount + 1 });
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

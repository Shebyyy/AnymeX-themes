import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// GET /api/themes/by-id/[themeId] - Get a theme by its themeId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const { themeId } = await params;

    const { data: theme, error } = await supabase
      .from("Theme")
      .select(`
        *,
        creator:User!Theme_createdBy_fkey (
          id,
          username,
          profileUrl
        )
      `)
      .eq("themeId", themeId)
      .single();

    if (error || !theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from("Theme")
      .update({ viewsCount: theme.viewsCount + 1 })
      .eq("id", theme.id);

    return NextResponse.json({ ...theme, viewsCount: theme.viewsCount + 1 });
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

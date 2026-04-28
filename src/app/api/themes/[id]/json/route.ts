import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// GET /api/themes/[id]/json - Get theme JSON content by database ID or themeId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try finding by themeId first, fallback to database id
    let theme;
    let error;

    // First try by themeId
    const resultByThemeId = await supabase
      .from("Theme")
      .select("id, name, description, creatorName, category, themeJson, createdAt, updatedAt, themeId, status")
      .eq("themeId", id)
      .eq("status", "APPROVED")
      .single();

    if (resultByThemeId.data && !resultByThemeId.error) {
      theme = resultByThemeId.data;
    } else {
      // Fallback to database id
      const resultById = await supabase
        .from("Theme")
        .select("id, name, description, creatorName, category, themeJson, createdAt, updatedAt, themeId, status")
        .eq("id", id)
        .eq("status", "APPROVED")
        .single();

      if (resultById.error || !resultById.data) {
        return NextResponse.json(
          { error: "Theme not found" },
          { status: 404 }
        );
      }
      theme = resultById.data;
    }

    // Validate and parse the themeJson
    let parsedJson;
    try {
      parsedJson = JSON.parse(theme.themeJson);
    } catch {
      return NextResponse.json(
        { error: "Invalid theme JSON in database" },
        { status: 500 }
      );
    }

    // Use themeId for the filename if available, fallback to name
    const filename = theme.themeId || theme.name.toLowerCase().replace(/\s+/g, "-");

    // Return the JSON content with appropriate headers
    return new NextResponse(theme.themeJson, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}.json"`,
      },
    });
  } catch (error) {
    console.error("Error fetching theme JSON:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme JSON" },
      { status: 500 }
    );
  }
}

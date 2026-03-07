import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// GET /api/themes/[id]/json - Get theme JSON content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the theme
    const { data: theme, error } = await supabase
      .from("Theme")
      .select("id, name, description, creatorName, category, themeJson, createdAt, updatedAt")
      .eq("id", id)
      .single();

    if (error || !theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
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

    // Return the JSON content with appropriate headers
    return new NextResponse(theme.themeJson, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${theme.name.toLowerCase().replace(/\s+/g, "-")}.json"`,
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

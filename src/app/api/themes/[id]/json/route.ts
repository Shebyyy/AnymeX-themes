import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/themes/[id]/json - Get theme JSON content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the theme
    const theme = await db.theme.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        creatorName: true,
        category: true,
        themeJson: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!theme) {
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

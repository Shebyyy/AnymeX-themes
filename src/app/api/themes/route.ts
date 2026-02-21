import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/themes - Search and filter themes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where: any = {};

    if (category && category !== "All") {
      where.category = category;
    }

    if (search && search.trim() !== "") {
      const searchCondition = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { creatorName: { contains: search, mode: "insensitive" } },
      ];

      if (Object.keys(where).length > 0) {
        where.AND = [{ ...where }, { OR: searchCondition }];
      } else {
        where.OR = searchCondition;
      }
    }

    const themes = await db.theme.findMany({
      where,
      orderBy: { likesCount: "desc" },
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

    return NextResponse.json(themes);
  } catch (error) {
    console.error("Error fetching themes:", error);
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

// POST /api/themes - Upload a new theme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, creatorName, description, category, themeJson } = body;

    // Validate required fields
    if (!name || !creatorName || !themeJson) {
      return NextResponse.json(
        { error: "Missing required fields: name, creatorName, themeJson" },
        { status: 400 }
      );
    }

    // Validate themeJson is valid JSON and extract themeId
    let parsedJson;
    try {
      parsedJson = JSON.parse(themeJson);
    } catch {
      return NextResponse.json(
        { error: "Invalid themeJson format" },
        { status: 400 }
      );
    }

    // Extract themeId from JSON or generate one from name
    const themeId = parsedJson.id || name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Check if themeId already exists
    const existingTheme = await db.theme.findUnique({
      where: { themeId }
    });

    if (existingTheme) {
      return NextResponse.json(
        { error: "A theme with this ID already exists. Please use a unique ID." },
        { status: 409 }
      );
    }

    const theme = await db.theme.create({
      data: {
        themeId,
        name,
        creatorName,
        description: description || null,
        category: category || "Dark",
        themeJson,
      },
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error("Error creating theme:", error);
    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 }
    );
  }
}

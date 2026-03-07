import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// GET /api/themes - Search and filter themes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let query = supabase
      .from("Theme")
      .select(`
        id,
        themeId,
        name,
        description,
        creatorName,
        themeJson,
        category,
        previewData,
        previewImage,
        discordPostId,
        likesCount,
        viewsCount,
        status,
        createdBy,
        createdAt,
        updatedAt,
        creator:User!Theme_createdBy_fkey (
          id,
          username,
          profileUrl
        )
      `)
      .order("likesCount", { ascending: false });

    // Filter by category
    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    // Filter by search
    if (search && search.trim() !== "") {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,creatorName.ilike.%${search}%`);
    }

    const { data: themes, error } = await query;

    if (error) {
      console.error("Error fetching themes:", error);
      return NextResponse.json(
        { error: "Failed to fetch themes" },
        { status: 500 }
      );
    }

    return NextResponse.json(themes || []);
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
    const { data: existingTheme } = await supabase
      .from("Theme")
      .select("id")
      .eq("themeId", themeId)
      .single();

    if (existingTheme) {
      return NextResponse.json(
        { error: "A theme with this ID already exists. Please use a unique ID." },
        { status: 409 }
      );
    }

    const { data: theme, error } = await supabase
      .from("Theme")
      .insert({
        themeId,
        name,
        creatorName,
        description: description || null,
        category: category || "Dark",
        themeJson,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating theme:", error);
      return NextResponse.json(
        { error: "Failed to create theme" },
        { status: 500 }
      );
    }

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error("Error creating theme:", error);
    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 }
    );
  }
}

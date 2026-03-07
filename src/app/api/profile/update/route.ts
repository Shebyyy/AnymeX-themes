import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { validateSession } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await validateSession(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { username, profileUrl } = body;

    // Validate username
    if (username && username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Check if username is unique (if changing)
    if (username && username.trim() !== user.username) {
      const { data: existingUser } = await supabase
        .from("User")
        .select("id")
        .eq("username", username.trim())
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Validate profileUrl if provided
    if (profileUrl && profileUrl.trim()) {
      try {
        new URL(profileUrl.trim());
      } catch {
        return NextResponse.json(
          { error: "Invalid profile URL" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData: Record<string, unknown> = {};
    if (username) updateData.username = username.trim();
    if (profileUrl !== undefined) updateData.profileUrl = profileUrl.trim() || null;

    const { data: updatedUser, error } = await supabase
      .from("User")
      .update(updateData)
      .eq("id", user.id)
      .select("id, username, role, profileUrl, isActive, createdAt, updatedAt, lastLoginAt")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

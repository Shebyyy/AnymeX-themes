import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await db.sessionToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { username, profileUrl } = body;

    const user = session.user;

    // Validate username
    if (username && username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Check if username is unique (if changing)
    if (username && username.trim() !== user.username) {
      const existingUser = await db.user.findUnique({
        where: { username: username.trim() },
      });

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
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        ...(username && { username: username.trim() }),
        ...(profileUrl !== undefined && {
          profileUrl: profileUrl.trim() || null,
        }),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

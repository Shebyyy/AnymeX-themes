import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/lib/auth';

// GET /api/creator/themes - List themes (own themes for creators, all for admins)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const currentUser = await validateSession(token);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
    const isCreator = currentUser.role === 'THEME_CREATOR' || isAdmin;

    if (!isCreator) {
      return NextResponse.json(
        { error: 'Unauthorized - Creator access required' },
        { status: 403 }
      );
    }

    // Build where clause
    const where: any = {};
    
    // If THEME_CREATOR (not admin), only show own themes
    if (currentUser.role === 'THEME_CREATOR') {
      where.createdBy = currentUser.id;
    }

    const themes = await db.theme.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            profileUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, themes, canEditAll: isAdmin });
  } catch (error) {
    console.error('Get creator themes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/creator/themes - Create a new theme
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const currentUser = await validateSession(token);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
    const isCreator = currentUser.role === 'THEME_CREATOR' || isAdmin;

    if (!isCreator) {
      return NextResponse.json(
        { error: 'Unauthorized - Creator access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, themeJson, category, previewData } = body;

    if (!name || !themeJson) {
      return NextResponse.json(
        { error: 'Name and theme JSON are required' },
        { status: 400 }
      );
    }

    // Parse and validate JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(themeJson);
      if (previewData) {
        JSON.parse(previewData);
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Extract themeId from JSON or generate one from name
    const themeId = parsedJson.id || name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Check if themeId already exists
    const existingTheme = await db.theme.findFirst({
      where: { themeId }
    });

    if (existingTheme) {
      return NextResponse.json(
        { error: 'A theme with this ID already exists. Please use a unique ID in your theme JSON.' },
        { status: 409 }
      );
    }

    const theme = await db.theme.create({
      data: {
        themeId,
        name,
        description: description || null,
        themeJson,
        creatorName: currentUser.username,
        category: category || null,
        previewData: previewData || null,
        status: isAdmin ? 'APPROVED' : 'PENDING',
        createdBy: currentUser.id,
      },
    });

    return NextResponse.json({ success: true, theme }, { status: 201 });
  } catch (error) {
    console.error('Create theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

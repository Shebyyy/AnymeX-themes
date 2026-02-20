import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/lib/auth';

// GET /api/creator/themes/[id] - Get a single theme
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const theme = await db.theme.findUnique({
      where: { id: params.id },
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

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // THEME_CREATOR can only access their own themes
    if (currentUser.role === 'THEME_CREATOR' && theme.createdBy !== currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only access your own themes' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error('Get theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/creator/themes/[id] - Update a theme
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const theme = await db.theme.findUnique({
      where: { id: params.id },
    });

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // THEME_CREATOR can only edit their own themes
    if (currentUser.role === 'THEME_CREATOR' && theme.createdBy !== currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own themes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, themeJson, category, previewData } = body;

    // Parse and validate JSON if provided
    if (themeJson) {
      try {
        JSON.parse(themeJson);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid theme JSON format' },
          { status: 400 }
        );
      }
    }

    if (previewData) {
      try {
        JSON.parse(previewData);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid preview data JSON format' },
          { status: 400 }
        );
      }
    }

    const updatedTheme = await db.theme.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(themeJson && { themeJson }),
        ...(category !== undefined && { category }),
        ...(previewData !== undefined && { previewData }),
      },
    });

    return NextResponse.json({ success: true, theme: updatedTheme });
  } catch (error) {
    console.error('Update theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/creator/themes/[id] - Delete a theme
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const theme = await db.theme.findUnique({
      where: { id: params.id },
    });

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // THEME_CREATOR can only delete their own themes
    if (currentUser.role === 'THEME_CREATOR' && theme.createdBy !== currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own themes' },
        { status: 403 }
      );
    }

    await db.theme.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Delete theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

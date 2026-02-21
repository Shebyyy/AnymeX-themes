import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import {
  editDiscordPost,
  deleteDiscordPost,
  generateDiscordPostContent,
  generateDiscordPostTitle,
  sendModLog,
} from '@/lib/discord';

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
    const { name, description, themeJson, category, previewData, previewImage } = body;

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
        ...(previewImage && { previewImage }),
      },
    });

    // Update Discord post if exists and relevant fields changed
    if (theme.discordPostId && (name || description || previewImage)) {
      try {
        const discordResult = await editDiscordPost(theme.discordPostId, {
          title: generateDiscordPostTitle(name || theme.name, theme.creatorName),
          content: generateDiscordPostContent(
            name || theme.name,
            theme.themeId,
            description !== undefined ? description : theme.description,
            theme.creatorName,
            `${process.env.NEXT_PUBLIC_APP_URL || 'https://anymex-themes.vercel.app'}/themes/${theme.themeId}`
          ),
          imageUrl: previewImage && (previewImage.startsWith('http') ? previewImage : `${process.env.NEXT_PUBLIC_APP_URL || ''}${previewImage}`),
        });

        if (!discordResult.success) {
          console.error('Failed to update Discord post:', discordResult.error);
        }
      } catch (discordError) {
        console.error('Failed to update Discord post:', discordError);
        // Don't fail the request if Discord update fails
      }
    }

    // Send mod log
    try {
      const changedFields: string[] = [];
      if (name) changedFields.push('Name');
      if (description !== undefined) changedFields.push('Description');
      if (themeJson) changedFields.push('Theme JSON');
      if (category !== undefined) changedFields.push('Category');
      if (previewData !== undefined) changedFields.push('Preview Data');
      if (previewImage) changedFields.push('Preview Image');

      await sendModLog({
        action: 'THEME_UPDATED',
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        themeId: updatedTheme.themeId,
        themeName: updatedTheme.name,
        details: {
          'Changed Fields': changedFields.join(', ') || 'None',
        },
      });
    } catch (logError) {
      console.error('Failed to send mod log:', logError);
      // Don't fail the request if mod log fails
    }

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

    // Delete Discord post if exists
    if (theme.discordPostId) {
      try {
        const deleteResult = await deleteDiscordPost(theme.discordPostId);
        if (!deleteResult.success) {
          console.error('Failed to delete Discord post:', deleteResult.error);
          // Continue with theme deletion even if Discord deletion fails
        }
      } catch (discordError) {
        console.error('Error deleting Discord post:', discordError);
        // Continue with theme deletion even if Discord deletion fails
      }
    }

    // Store theme info for mod log before deletion
    const themeInfo = {
      id: theme.id,
      themeId: theme.themeId,
      name: theme.name,
      creatorName: theme.creatorName,
      category: theme.category,
      status: theme.status,
    };

    await db.theme.delete({
      where: { id: params.id },
    });

    // Send mod log
    try {
      await sendModLog({
        action: 'THEME_DELETED',
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        themeId: themeInfo.themeId || undefined,
        themeName: themeInfo.name,
        details: {
          'Original Creator': themeInfo.creatorName,
          Category: themeInfo.category || 'N/A',
          Status: themeInfo.status,
        },
      });
    } catch (logError) {
      console.error('Failed to send mod log:', logError);
      // Don't fail the request if mod log fails
    }

    return NextResponse.json({ success: true, message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Delete theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

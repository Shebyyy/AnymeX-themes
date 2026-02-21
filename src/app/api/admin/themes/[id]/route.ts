import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import { deleteDiscordPost, sendModLog } from '@/lib/discord';

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

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if theme exists
    const theme = await db.theme.findUnique({
      where: { id: params.id },
    });

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
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
      createdBy: theme.createdBy,
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
          'Creator ID': themeInfo.createdBy || 'Unknown',
          Category: themeInfo.category || 'N/A',
          Status: themeInfo.status,
          'Deleted By': currentUser.role,
        },
      });
    } catch (logError) {
      console.error('Failed to send mod log:', logError);
      // Don't fail the request if mod log fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

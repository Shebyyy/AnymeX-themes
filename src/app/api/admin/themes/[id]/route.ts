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

    // Check if theme exists with creator info
    const theme = await db.theme.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            username: true,
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anymex-themes.vercel.app';
    const themeInfo = {
      id: theme.id,
      themeId: theme.themeId,
      name: theme.name,
      creatorName: theme.creatorName,
      creatorUsername: theme.creator?.username,
      category: theme.category,
      status: theme.status,
      createdBy: theme.createdBy,
    };

    await db.theme.delete({
      where: { id: params.id },
    });

    // Send mod log
    try {
      const modLogDetails: Record<string, any> = {
        'Original Creator': themeInfo.creatorName,
        'Creator ID': themeInfo.createdBy || 'Unknown',
        Category: themeInfo.category || 'N/A',
        Status: themeInfo.status,
        'Deleted By': currentUser.role,
      };

      // Add creator profile link if username is available
      if (themeInfo.creatorUsername) {
        modLogDetails['Creator Profile'] = `[View Profile](${appUrl}/users/${themeInfo.creatorUsername})`;
      }

      await sendModLog({
        action: 'THEME_DELETED',
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        themeId: themeInfo.themeId || undefined,
        themeName: themeInfo.name,
        details: modLogDetails,
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

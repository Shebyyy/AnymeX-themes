import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import { sendModLog } from '@/lib/discord';

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

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['PENDING', 'APPROVED', 'REJECTED', 'BROKEN'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
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

    const updatedTheme = await db.theme.update({
      where: { id: params.id },
      data: { status },
    });

    // Send mod log for status changes
    if (status === 'APPROVED' || status === 'REJECTED') {
      try {
        await sendModLog({
          action: status === 'APPROVED' ? 'THEME_APPROVED' : 'THEME_REJECTED',
          userId: currentUser.id,
          username: currentUser.username,
          userRole: currentUser.role,
          themeId: updatedTheme.themeId || undefined,
          themeName: updatedTheme.name,
          details: {
            'Original Creator': updatedTheme.creatorName,
            Category: updatedTheme.category || 'N/A',
            'Previous Status': theme.status,
            'New Status': status,
          },
        });
      } catch (logError) {
        console.error('Failed to send mod log:', logError);
        // Don't fail the request if mod log fails
      }
    }

    return NextResponse.json({ success: true, theme: updatedTheme });
  } catch (error) {
    console.error('Update theme status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

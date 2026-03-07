import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
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

    const { data: theme, error: findError } = await supabase
      .from('Theme')
      .select('*, creator:User(id, username, profileUrl)')
      .eq('id', params.id)
      .single();

    if (findError || !theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // THEME_CREATOR can only access their own themes
    if (currentUser.role === 'THEME_CREATOR' && (theme as any).createdBy !== currentUser.id) {
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

    const { data: theme, error: findError } = await supabase
      .from('Theme')
      .select('*')
      .eq('id', params.id)
      .single();

    if (findError || !theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // THEME_CREATOR can only edit their own themes
    if (currentUser.role === 'THEME_CREATOR' && (theme as any).createdBy !== currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own themes' },
        { status: 403 }
      );
    }

    // Fetch theme with creator for Discord update
    const { data: themeWithCreator, error: creatorFindError } = await supabase
      .from('Theme')
      .select('*, creator:User(username)')
      .eq('id', params.id)
      .single();

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

    // Build update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (themeJson) updateData.themeJson = themeJson;
    if (category !== undefined) updateData.category = category;
    if (previewData !== undefined) updateData.previewData = previewData;
    if (previewImage) updateData.previewImage = previewImage;

    const { data: updatedTheme, error: updateError } = await supabase
      .from('Theme')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update Discord post if exists and relevant fields changed
    if (themeWithCreator?.discordPostId && (name || description || previewImage)) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anymex-themes.vercel.app';
        const creatorUsername = (themeWithCreator.creator as any)?.username || (themeWithCreator as any).creatorName;
        const discordResult = await editDiscordPost((themeWithCreator as any).discordPostId, {
          title: generateDiscordPostTitle(name || (themeWithCreator as any).name, (themeWithCreator as any).creatorName),
          content: generateDiscordPostContent(
            name || (themeWithCreator as any).name,
            (themeWithCreator as any).themeId,
            description !== undefined ? description : (themeWithCreator as any).description,
            (themeWithCreator as any).creatorName,
            creatorUsername,
            `${appUrl}/themes/${(themeWithCreator as any).themeId}`,
            appUrl
          ),
          imageUrl: previewImage && (previewImage.startsWith('http') ? previewImage : `${appUrl}${previewImage}`),
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

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anymex-themes.vercel.app';
      const creatorUsername = (themeWithCreator?.creator as any)?.username || (themeWithCreator as any)?.creatorName;

      await sendModLog({
        action: 'THEME_UPDATED',
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        themeId: (updatedTheme as any).themeId,
        themeName: (updatedTheme as any).name,
        details: {
          'Changed Fields': changedFields.join(', ') || 'None',
          'Creator Profile': `[View Profile](${appUrl}/users/${creatorUsername})`,
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

    const { data: theme, error: findError } = await supabase
      .from('Theme')
      .select('*')
      .eq('id', params.id)
      .single();

    if (findError || !theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // THEME_CREATOR can only delete their own themes
    if (currentUser.role === 'THEME_CREATOR' && (theme as any).createdBy !== currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own themes' },
        { status: 403 }
      );
    }

    // Delete Discord post if exists
    if ((theme as any).discordPostId) {
      try {
        const deleteResult = await deleteDiscordPost((theme as any).discordPostId);
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
    const { data: themeWithCreator, error: creatorFindError } = await supabase
      .from('Theme')
      .select('*, creator:User(username)')
      .eq('id', params.id)
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anymex-themes.vercel.app';
    const themeInfo = {
      id: (theme as any).id,
      themeId: (theme as any).themeId,
      name: (theme as any).name,
      creatorName: (theme as any).creatorName,
      creatorUsername: (themeWithCreator?.creator as any)?.username,
      category: (theme as any).category,
      status: (theme as any).status,
    };

    const { error: deleteError } = await supabase
      .from('Theme')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw deleteError;
    }

    // Send mod log
    try {
      const modLogDetails: Record<string, any> = {
        'Original Creator': themeInfo.creatorName,
        Category: themeInfo.category || 'N/A',
        Status: themeInfo.status,
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

    return NextResponse.json({ success: true, message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Delete theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

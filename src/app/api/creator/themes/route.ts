import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import {
  postToDiscord,
  generateDiscordPostContent,
  generateDiscordPostTitle,
  sendModLog,
} from '@/lib/discord';

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

    // Build query
    let query = supabase
      .from('Theme')
      .select('*, creator:User(id, username, profileUrl)')
      .order('createdAt', { ascending: false });

    // If THEME_CREATOR (not admin), only show own themes
    if (currentUser.role === 'THEME_CREATOR') {
      query = query.eq('createdBy', currentUser.id);
    }

    const { data: themes, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, themes: themes || [], canEditAll: isAdmin });
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
    const { name, description, themeJson, category, previewData, previewImage } = body;

    if (!name || !themeJson) {
      return NextResponse.json(
        { error: 'Name and theme JSON are required' },
        { status: 400 }
      );
    }

    if (!previewImage) {
      return NextResponse.json(
        { error: 'Preview image is required for Discord posting' },
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
    const { data: existingTheme, error: findError } = await supabase
      .from('Theme')
      .select('*')
      .eq('themeId', themeId)
      .single();

    if (existingTheme) {
      return NextResponse.json(
        { error: 'A theme with this ID already exists. Please use a unique ID in your theme JSON.' },
        { status: 409 }
      );
    }

    const { data: theme, error: createError } = await supabase
      .from('Theme')
      .insert({
        themeId,
        name,
        description: description || null,
        themeJson,
        creatorName: currentUser.username,
        category: category || null,
        previewData: previewData || null,
        previewImage: previewImage || null,
        status: isAdmin ? 'APPROVED' : 'PENDING',
        createdBy: currentUser.id,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Post to Discord - all themes are posted directly without approval
    let discordPostId = null;
    if (themeId && previewImage) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anymex-themes.vercel.app';
        const discordResult = await postToDiscord({
          title: generateDiscordPostTitle(name, currentUser.username),
          content: generateDiscordPostContent(
            name,
            themeId,
            description,
            currentUser.username, // creatorName (display name)
            currentUser.username, // creatorUsername (for profile link)
            `${appUrl}/themes/${themeId}`, // themeUrl
            appUrl // appUrl for profile link
          ),
          imageUrl: previewImage.startsWith('http') ? previewImage : `${appUrl}${previewImage}`,
        });

        if (discordResult.success && discordResult.threadId) {
          discordPostId = discordResult.threadId;
          // Update theme with Discord post ID
          const { error: updateError } = await supabase
            .from('Theme')
            .update({ discordPostId })
            .eq('id', (theme as any).id);

          if (updateError) {
            console.error('Failed to update Discord post ID:', updateError);
          }
        }
      } catch (discordError) {
        console.error('Failed to post to Discord:', discordError);
        // Don't fail the request if Discord posting fails
      }
    }

    // Send mod log
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anymex-themes.vercel.app';
      const modLogDetails: Record<string, any> = {
        Category: category || 'N/A',
        Status: (theme as any).status,
        'Discord Posted': discordPostId ? 'Yes' : 'No',
        'Creator Profile': `[View Profile](${appUrl}/users/${currentUser.username})`,
      };

      await sendModLog({
        action: 'THEME_CREATED',
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        themeId: (theme as any).themeId,
        themeName: (theme as any).name,
        details: modLogDetails,
      });
    } catch (logError) {
      console.error('Failed to send mod log:', logError);
      // Don't fail the request if mod log fails
    }

    return NextResponse.json({ success: true, theme, discordPosted: !!discordPostId }, { status: 201 });
  } catch (error) {
    console.error('Create theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

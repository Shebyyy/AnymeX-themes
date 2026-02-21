/**
 * Discord API Integration
 * Handles posting theme updates to Discord forum channel
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1474764166752370840';
const MOD_LOGS_CHANNEL_ID = process.env.MOD_LOGS_CHANNEL_ID || '1313094347524411392';

export interface DiscordPostData {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface DiscordPostResult {
  success: boolean;
  threadId?: string;
  messageId?: string;
  error?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

export interface ModLogData {
  action: 'THEME_CREATED' | 'THEME_UPDATED' | 'THEME_DELETED' | 'THEME_APPROVED' | 'THEME_REJECTED' | 'USER_BANNED' | 'USER_UNBANNED';
  userId?: string;
  username?: string;
  userRole?: string;
  themeId?: string;
  themeName?: string;
  details?: Record<string, any>;
}

/**
 * Post a new theme to Discord forum channel
 */
export async function postToDiscord(
  data: DiscordPostData
): Promise<DiscordPostResult> {
  if (!DISCORD_BOT_TOKEN) {
    return {
      success: false,
      error: 'Discord bot token not configured',
    };
  }

  try {
    let requestData: any = {
      name: data.title,
      message: {
        content: data.content,
      },
    };

    // If image URL provided, upload it with the initial message
    if (data.imageUrl) {
      try {
        // Fetch the image
        const imageResponse = await fetch(data.imageUrl);
        if (!imageResponse.ok) {
          console.warn('Failed to fetch preview image:', data.imageUrl);
          // Continue without image
        } else {
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageBlob = new Blob([imageBuffer]);

          // Get filename from URL
          const urlParts = data.imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1] || 'preview.png';

          // Create a FormData with both the message content and the image attachment
          const formData = new FormData();
          formData.append('file', imageBlob, filename);
          formData.append('payload_json', JSON.stringify({
            name: data.title,
            message: {
              content: data.content,
            },
          }));

          // Create thread with image attached to the first message
          const threadResponse = await fetch(
            `${DISCORD_API_BASE}/channels/${DISCORD_CHANNEL_ID}/threads`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
              },
              body: formData,
            }
          );

          if (!threadResponse.ok) {
            const errorText = await threadResponse.text();
            console.error('Discord API error with image:', errorText);
            // Fallback to creating thread without image
            const fallbackResponse = await fetch(
              `${DISCORD_API_BASE}/channels/${DISCORD_CHANNEL_ID}/threads`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
              }
            );

            if (!fallbackResponse.ok) {
              const fallbackError = await fallbackResponse.text();
              console.error('Discord API fallback error:', fallbackError);
              return {
                success: false,
                error: `Failed to create thread: ${fallbackResponse.status}`,
              };
            }

            const fallbackData = await fallbackResponse.json();
            return {
              success: true,
              threadId: fallbackData.id,
              messageId: fallbackData.id,
            };
          }

          const threadData = await threadResponse.json();
          return {
            success: true,
            threadId: threadData.id,
            messageId: threadData.id,
          };
        }
      } catch (imageError) {
        console.warn('Error handling image for Discord:', imageError);
        // Continue without image
      }
    }

    // Create thread without image
    const threadResponse = await fetch(
      `${DISCORD_API_BASE}/channels/${DISCORD_CHANNEL_ID}/threads`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!threadResponse.ok) {
      const errorText = await threadResponse.text();
      console.error('Discord API error:', errorText);
      return {
        success: false,
        error: `Failed to create thread: ${threadResponse.status}`,
      };
    }

    const threadData = await threadResponse.json();
    return {
      success: true,
      threadId: threadData.id,
      messageId: threadData.id,
    };
  } catch (error) {
    console.error('Error posting to Discord:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Edit an existing Discord post
 */
export async function editDiscordPost(
  threadId: string,
  data: DiscordPostData
): Promise<DiscordPostResult> {
  if (!DISCORD_BOT_TOKEN) {
    return {
      success: false,
      error: 'Discord bot token not configured',
    };
  }

  try {
    // Step 1: Get the first message in the thread
    const messagesResponse = await fetch(
      `${DISCORD_API_BASE}/channels/${threadId}/messages?limit=1`,
      {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!messagesResponse.ok) {
      return {
        success: false,
        error: `Failed to fetch messages: ${messagesResponse.status}`,
      };
    }

    const messages = await messagesResponse.json();
    if (!messages || messages.length === 0) {
      return {
        success: false,
        error: 'No messages found in thread',
      };
    }

    const firstMessage = messages[0];

    // Step 2: Update thread name
    const editThreadResponse = await fetch(
      `${DISCORD_API_BASE}/channels/${threadId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.title,
        }),
      }
    );

    if (!editThreadResponse.ok) {
      console.warn('Failed to update thread name');
      // Continue anyway - message edit is more important
    }

    // Step 3: Edit the message content and optionally attach image in the same request
    if (data.imageUrl) {
      try {
        // Fetch the image
        const imageResponse = await fetch(data.imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageBlob = new Blob([imageBuffer]);

          const urlParts = data.imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1] || 'preview.png';

          // Create FormData with message content and image attachment
          const formData = new FormData();
          formData.append('file', imageBlob, filename);
          formData.append('payload_json', JSON.stringify({
            content: data.content,
            attachments: [
              {
                id: 0,
                description: 'Theme preview image',
                filename: filename,
              }
            ]
          }));

          const editResponse = await fetch(
            `${DISCORD_API_BASE}/channels/${threadId}/messages/${firstMessage.id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
              },
              body: formData,
            }
          );

          if (editResponse.ok) {
            return {
              success: true,
              threadId,
              messageId: firstMessage.id,
            };
          } else {
            console.warn('Failed to edit message with image, trying without image:', await editResponse.text());
            // Fall through to edit without image
          }
        }
      } catch (imageError) {
        console.warn('Error handling image for edit:', imageError);
        // Fall through to edit without image
      }
    }

    // Step 4: Edit message content only (without image or if image failed)
    const editResponse = await fetch(
      `${DISCORD_API_BASE}/channels/${threadId}/messages/${firstMessage.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.content,
        }),
      }
    );

    if (!editResponse.ok) {
      const errorText = await editResponse.text();
      console.error('Discord edit error:', errorText);
      return {
        success: false,
        error: `Failed to edit message: ${editResponse.status}`,
      };
    }

    return {
      success: true,
      threadId,
      messageId: firstMessage.id,
    };
  } catch (error) {
    console.error('Error editing Discord post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate Discord post content for a theme
 */
export function generateDiscordPostContent(
  themeName: string,
  themeId: string | null,
  description: string | null,
  creatorName: string,
  themeUrl: string
): string {
  const themeLink = themeId ? `https://anymex-themes.vercel.app/themes/${themeId}` : themeUrl;

  return `🔗 **Theme Page:** <${themeLink}>

📝 **Description:** ${description || 'No description provided'}

✨ **Created by:** ${creatorName}

---
_Uploaded via AnymeX Theme Creator Hub_`;
}

/**
 * Generate Discord post title
 */
export function generateDiscordPostTitle(themeName: string, creatorName: string): string {
  return `${themeName} - by ${creatorName}`;
}

/**
 * Delete a Discord forum post/thread
 */
export async function deleteDiscordPost(
  threadId: string
): Promise<{ success: boolean; error?: string }> {
  if (!DISCORD_BOT_TOKEN) {
    return {
      success: false,
      error: 'Discord bot token not configured',
    };
  }

  try {
    const deleteResponse = await fetch(
      `${DISCORD_API_BASE}/channels/${threadId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('Discord delete error:', errorText);
      return {
        success: false,
        error: `Failed to delete thread: ${deleteResponse.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting Discord post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a mod log to the mod logs channel as an embed
 */
export async function sendModLog(
  logData: ModLogData
): Promise<{ success: boolean; error?: string }> {
  if (!DISCORD_BOT_TOKEN) {
    return {
      success: false,
      error: 'Discord bot token not configured',
    };
  }

  try {
    const embed = generateModLogEmbed(logData);

    const response = await fetch(
      `${DISCORD_API_BASE}/channels/${MOD_LOGS_CHANNEL_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord mod log error:', errorText);
      return {
        success: false,
        error: `Failed to send mod log: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error sending mod log:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a Discord embed for mod logs
 */
function generateModLogEmbed(logData: ModLogData): DiscordEmbed {
  const actionConfig: Record<string, { title: string; color: number; emoji: string }> = {
    THEME_CREATED: { title: 'New Theme Created', color: 0x57F287, emoji: '✨' },
    THEME_UPDATED: { title: 'Theme Updated', color: 0xFEE75C, emoji: '📝' },
    THEME_DELETED: { title: 'Theme Deleted', color: 0xED4245, emoji: '🗑️' },
    THEME_APPROVED: { title: 'Theme Approved', color: 0x57F287, emoji: '✅' },
    THEME_REJECTED: { title: 'Theme Rejected', color: 0xED4245, emoji: '❌' },
    USER_BANNED: { title: 'User Banned', color: 0xED4245, emoji: '🔨' },
    USER_UNBANNED: { title: 'User Unbanned', color: 0x57F287, emoji: '🔓' },
  };

  const config = actionConfig[logData.action] || { title: 'Unknown Action', color: 0x5865F2, emoji: 'ℹ️' };

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [];

  // Add user information
  if (logData.username) {
    fields.push({
      name: 'User',
      value: `${logData.username}${logData.userRole ? ` (${logData.userRole})` : ''}`,
      inline: true,
    });
  }

  if (logData.userId) {
    fields.push({
      name: 'User ID',
      value: logData.userId,
      inline: true,
    });
  }

  // Add theme information
  if (logData.themeName) {
    fields.push({
      name: 'Theme',
      value: logData.themeName,
      inline: true,
    });
  }

  if (logData.themeId) {
    const themeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://anymex-themes.vercel.app'}/themes/${logData.themeId}`;
    fields.push({
      name: 'Theme Link',
      value: `[View Theme](${themeUrl})`,
      inline: true,
    });
  }

  // Add additional details
  if (logData.details) {
    Object.entries(logData.details).forEach(([key, value]) => {
      fields.push({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value),
        inline: true,
      });
    });
  }

  return {
    title: `${config.emoji} ${config.title}`,
    color: config.color,
    fields,
    footer: {
      text: 'AnymeX Theme Hub • Mod Logs',
    },
    timestamp: new Date().toISOString(),
  };
}

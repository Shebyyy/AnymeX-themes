/**
 * ThemePreviewRenderer Component
 * Main component that renders a complete theme preview from JSON
 * This is used on the home page to show live theme previews
 */

'use client';

import React, { useMemo } from 'react';
import { ThemeDef, parseCollection } from '@/lib/theme-parser';
import { PlayerControlsProvider } from './PlayerControlsContext';
import { ThemeZoneTop } from './ThemeZoneTop';
import { ThemeZoneMiddle } from './ThemeZoneMiddle';
import { ThemeZoneBottom } from './ThemeZoneBottom';

interface ThemePreviewRendererProps {
  /**
   * The theme JSON string
   */
  themeJson: string;

  /**
   * Optional background image URL
   * If not provided, a default dark background will be used
   */
  backgroundImage?: string;

  /**
   * Optional custom controller state for testing different scenarios
   */
  controllerState?: any;

  /**
   * Width of the preview (for CSS)
   */
  width?: string | number;

  /**
   * Height of the preview (for CSS)
   */
  height?: string | number;

  /**
   * Custom class name for the container
   */
  className?: string;
}

/**
 * ThemePreviewRenderer Component
 *
 * Renders a live preview of a video player theme from JSON
 *
 * @example
 * ```tsx
 * <ThemePreviewRenderer
 *   themeJson={theme.themeJson}
 *   backgroundImage="/preview-bg.jpg"
 *   width="100%"
 *   height="auto"
 * />
 * ```
 */
export function ThemePreviewRenderer({
  themeJson,
  backgroundImage,
  controllerState,
  width = '100%',
  height = 'auto',
  className = '',
}: ThemePreviewRendererProps) {
  // Parse the theme JSON
  const parseResult = useMemo(() => {
    try {
      return parseCollection(themeJson);
    } catch (error) {
      console.error('Failed to parse theme JSON:', error);
      return {
        themes: [],
        rawThemes: [],
        errors: ['Failed to parse theme JSON'],
        warnings: [],
        isValid: false,
      };
    }
  }, [themeJson]);

  // Get the first valid theme
  const theme = useMemo(() => {
    if (parseResult.isValid && parseResult.themes.length > 0) {
      return parseResult.themes[0];
    }
    return null;
  }, [parseResult]);

  // Default background color (dark gradient)
  const defaultBackground = 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)';

  // Combine background image with fallback
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        background: defaultBackground,
      };

  // If theme failed to parse, show error state
  if (!theme) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg ${className}`}
        style={{
          width,
          height,
          minHeight: 200,
          ...backgroundStyle,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white p-4">
            <p className="text-sm font-medium">Theme Preview Error</p>
            {parseResult.errors.length > 0 && (
              <p className="text-xs text-neutral-300 mt-1">{parseResult.errors[0]}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PlayerControlsProvider controller={controllerState}>
      <div
        className={`relative overflow-hidden rounded-lg ${className}`}
        style={{
          width,
          height,
          minHeight: 200,
          ...backgroundStyle,
        }}
      >
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Theme zones */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {/* Top Zone */}
          <ThemeZoneTop zone={theme.top} theme={theme} />

          {/* Middle Zone */}
          <ThemeZoneMiddle zone={theme.middle} theme={theme} />

          {/* Bottom Zone */}
          <ThemeZoneBottom zone={theme.bottom} theme={theme} />
        </div>

        {/* Corner safe areas simulation */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
    </PlayerControlsProvider>
  );
}

/**
 * ThemePreviewCard Component
 * A pre-styled card component for displaying theme previews
 */
interface ThemePreviewCardProps extends Omit<ThemePreviewRendererProps, 'className' | 'width' | 'height'> {
  /**
   * Theme name to display (optional)
   */
  themeName?: string;
}

export function ThemePreviewCard({
  themeJson,
  backgroundImage,
  controllerState,
  themeName,
}: ThemePreviewCardProps) {
  return (
    <div className="relative group">
      <ThemePreviewRenderer
        themeJson={themeJson}
        backgroundImage={backgroundImage}
        controllerState={controllerState}
        width="100%"
        height="auto"
        className="aspect-video rounded-lg overflow-hidden"
      />

      {/* Optional theme name overlay */}
      {themeName && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm font-medium truncate">{themeName}</p>
        </div>
      )}
    </div>
  );
}

/**
 * LabelStack Component
 * Renders label_stack and watching_label theme items
 */

'use client';

import React from 'react';
import type { ThemeItem as IThemeItem, TextAlign } from '@/lib/theme-parser';
import { usePlayerControls } from '../PlayerControlsContext';
import { checkCondition, parseTextAlign, textAlignToCrossAxis, textAlignToAlignment } from '@/lib/theme-parser';
import { resolveColor, DEFAULT_TEXT_STYLE } from '@/lib/theme-parser';

interface LabelStackProps {
  item: IThemeItem;
}

export function LabelStack({ item }: LabelStackProps) {
  const controller = usePlayerControls();

  // Check visibility condition
  if (!checkCondition(item.visibleWhen, controller)) {
    return null;
  }

  if (item.id === 'watching_label') {
    return <WatchingLabel item={item} controller={controller} />;
  }

  return <MultiLineStack item={item} controller={controller} />;
}

/**
 * Multi-line stack component
 */
function MultiLineStack({ item, controller }: { item: IThemeItem; controller: any }) {
  const lines = item.data['lines'];

  if (!Array.isArray(lines) || lines.length === 0) {
    return null;
  }

  const stackAlign = parseTextAlign(item.grabString('textAlign'));
  const stackCrossAxis = textAlignToCrossAxis(stackAlign);

  return (
    <div
      className="flex flex-col"
      style={{
        alignItems: stackCrossAxis,
      }}
    >
      {lines.map((line: any, index: number) => {
        if (typeof line !== 'object' || line === null) return null;

        const lineMap = line as Record<string, any>;
        const source = lineMap['source'];
        const rawText = lineMap['text'];
        const value = source ? getTextFromSource(source, controller) : (rawText || '');

        if (!value) return null;

        const lineAlign = parseTextAlign(lineMap['textAlign']);
        const resolvedAlign = lineAlign || stackAlign;
        const gap = lineMap['gap'] !== undefined ? Number(lineMap['gap']) : 2;
        const maxLines = lineMap['maxLines'] !== undefined ? Number(lineMap['maxLines']) : 1;

        // Create a synthetic text item for this line
        const textItem: IThemeItem = {
          id: 'text',
          data: {
            ...lineMap,
            textAlign: textAlignToString(resolvedAlign) as any,
          },
          visibleWhen: undefined,
          enabledWhen: undefined,
          style: lineMap['style'] || {},
          grabString: (key: string) => lineMap[key],
          grabInt: (key: string, fallback: number) => {
            const val = lineMap[key];
            return typeof val === 'number' ? val : fallback;
          },
          grabDouble: (key: string, fallback: number) => {
            const val = lineMap[key];
            return typeof val === 'number' ? val : fallback;
          },
          grabBool: (key: string, fallback: boolean) => {
            const val = lineMap[key];
            return typeof val === 'boolean' ? val : fallback;
          },
        };

        return (
          <React.Fragment key={index}>
            {index > 0 && <div style={{ height: gap }} />}
            <div
              style={{
                textAlign: textAlignToAlignment(resolvedAlign),
                width: resolvedAlign === 'center' ? '100%' : 'auto',
              }}
            >
              <TextLine item={textItem} text={value} maxLines={maxLines} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * "You're watching" label component
 */
function WatchingLabel({ item, controller }: { item: IThemeItem; controller: any }) {
  const title =
    controller.currentEpisode.title || controller.itemName || 'Unknown Title';

  if (!title) return null;

  const topText = item.grabString('topText') || "You're watching";
  const topFontSize = item.grabDouble('topFontSize', 11);
  const topFontWeight = item.grabInt('topFontWeight', 400);
  const topColor = item.grabString('topColor');
  const bottomFontSize = item.grabDouble('bottomFontSize', 14);
  const bottomFontWeight = item.grabInt('bottomFontWeight', 700);
  const bottomColor = item.grabString('bottomColor');
  const gap = item.grabDouble('gap', 2);
  const textAlign = parseTextAlign(item.grabString('textAlign'));
  const crossAxis = textAlignToCrossAxis(textAlign);

  const baseStyle = DEFAULT_TEXT_STYLE;

  const resolvedTopColor = resolveColor(
    topColor || baseStyle.color,
    { primary: '#ffffff' },
    'rgba(255, 255, 255, 0.65)'
  );
  const resolvedBottomColor = resolveColor(
    bottomColor || baseStyle.color,
    { primary: '#ffffff' },
    '#ffffff'
  );

  return (
    <div
      className="flex flex-col"
      style={{
        alignItems: crossAxis,
      }}
    >
      <span
        style={{
          color: resolvedTopColor,
          fontSize: topFontSize,
          fontWeight: topFontWeight,
          letterSpacing: 0.1,
          textAlign,
        }}
      >
        {topText}
      </span>
      <div style={{ height: gap }} />
      <span
        style={{
          color: resolvedBottomColor,
          fontSize: bottomFontSize,
          fontWeight: bottomFontWeight,
          letterSpacing: baseStyle.letterSpacing,
          textAlign,
        }}
      >
        {title}
      </span>
    </div>
  );
}

/**
 * Simple text line renderer
 */
function TextLine({ item, text, maxLines }: { item: IThemeItem; text: string; maxLines: number }) {
  const baseStyle = DEFAULT_TEXT_STYLE;
  const mergedStyle = { ...baseStyle, ...item.style };

  const color = resolveColor(
    mergedStyle.color,
    { primary: '#ffffff' },
    '#ffffff'
  );

  const fontSize = mergedStyle.fontSize || baseStyle.fontSize;
  const fontWeight = mergedStyle.fontWeight || baseStyle.fontWeight;
  const letterSpacing = mergedStyle.letterSpacing || baseStyle.letterSpacing;
  const height = mergedStyle.height || baseStyle.height;

  return (
    <span
      style={{
        color,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight: height,
        WebkitLineClamp: maxLines > 0 ? maxLines : undefined,
        WebkitBoxOrient: maxLines > 1 ? 'vertical' : undefined,
        overflow: maxLines > 1 ? 'hidden' : undefined,
        display: maxLines > 1 ? '-webkit-box' : undefined,
      }}
    >
      {text}
    </span>
  );
}

/**
 * Get text from a dynamic source
 */
function getTextFromSource(source: string, controller: any): string {
  switch (source) {
    case 'title':
      return (
        controller.currentEpisode.title ||
        controller.itemName ||
        'Unknown Title'
      );
    case 'episode_label':
      return controller.currentEpisode.number === 'Offline'
        ? 'Offline'
        : `Episode ${controller.currentEpisode.number}`;
    case 'series_title':
      return (
        controller.anilistData.title === '?'
          ? controller.itemName
          : controller.anilistData.title
      ) || '';
    case 'quality_label': {
      const height = controller.videoHeight;
      if (height == null) return '';
      if (height >= 2160) return '2160p';
      if (height >= 1440) return '1440p';
      if (height >= 1080) return '1080p';
      if (height >= 720) return '720p';
      if (height >= 480) return '480p';
      if (height >= 360) return '360p';
      return '';
    }
    case 'current_time':
      return controller.currentPosition;
    case 'duration':
      return controller.episodeDuration;
    default:
      return source;
  }
}

function textAlignToString(align: TextAlign): string {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'right';
    case 'justify':
      return 'justify';
    default:
      return 'left';
  }
}

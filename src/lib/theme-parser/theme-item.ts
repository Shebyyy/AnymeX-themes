/**
 * ThemeItem Class
 * Represents a single theme item with helper methods
 */

import { readString, readInt, readDouble, readBool, asMap } from './utils';

export interface ThemeItem {
  id: string;
  data: Record<string, any>;
  visibleWhen?: string;
  enabledWhen?: string;
  style: Record<string, any>;

  // Helper getters
  grabString(key: string): string | undefined;
  grabInt(key: string, fallback: number): number;
  grabDouble(key: string, fallback: number): number;
  grabBool(key: string, fallback: boolean): boolean;
}

export class ThemeItemClass implements ThemeItem {
  id: string;
  data: Record<string, any>;

  constructor(id: string, data: Record<string, any>) {
    this.id = id;
    this.data = data;
  }

  get visibleWhen(): string | undefined {
    return readString(this.data['visibleWhen']);
  }

  get enabledWhen(): string | undefined {
    return readString(this.data['enabledWhen']);
  }

  get style(): Record<string, any> {
    return asMap(this.data['style']);
  }

  grabString(key: string): string | undefined {
    return readString(this.data[key]);
  }

  grabInt(key: string, fallback: number): number {
    return readInt(this.data[key], fallback);
  }

  grabDouble(key: string, fallback: number): number {
    return readDouble(this.data[key], fallback);
  }

  grabBool(key: string, fallback: boolean): boolean {
    return readBool(this.data[key], fallback);
  }

  /**
   * Create a ThemeItem from raw JSON data
   */
  static fromRaw(raw: any): ThemeItemClass {
    if (typeof raw === 'string') {
      const id = raw.trim();
      if (id === '') {
        throw new Error('Theme item needs an id.');
      }
      return new ThemeItemClass(id, {});
    }

    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      const map = raw as Record<string, any>;
      const id = readString(map['id']);
      if (id == null || id.trim() === '') {
        throw new Error('Theme item needs an id.');
      }
      return new ThemeItemClass(id, map);
    }

    throw new Error('Theme item must be a string or object.');
  }

  /**
   * Create a simple ThemeItem with just an ID
   */
  static create(id: string): ThemeItemClass {
    return new ThemeItemClass(id, {});
  }
}

// Export ThemeItemClass as ThemeItem for backward compatibility
export const ThemeItem = ThemeItemClass;

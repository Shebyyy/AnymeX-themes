/**
 * Mock Player Controller State
 * Provides a simulated controller state for theme preview
 */

import type { PlayerControllerState } from './theme-parser';

/**
 * Create a mock controller state with default values
 * These values are designed to show most UI elements in the preview
 */
export function createMockControllerState(): PlayerControllerState {
  return {
    // Lock state
    isLocked: false,

    // Playback state
    isPlaying: true,
    isBuffering: false,
    showControls: true,

    // Network state
    isOffline: false,
    isMobile: false, // Show desktop layout
    isDesktop: true,

    // Navigation state
    canGoForward: true,
    canGoBackward: true,

    // Video info
    videoHeight: 1080,
    currentPosition: '12:34',
    episodeDuration: '45:00',

    // Episode info
    currentEpisode: {
      title: 'The Beginning of Everything',
      number: '1',
    },

    // AniList info
    anilistData: {
      title: 'Demo Anime Series',
    },

    // Item name (fallback)
    itemName: null,

    // Player settings
    playerSettings: {
      seekDuration: 10,
      skipDuration: 85,
    },
  };
}

/**
 * Create a controller state with specific overrides
 */
export function createControllerState(
  overrides: Partial<PlayerControllerState>
): PlayerControllerState {
  return {
    ...createMockControllerState(),
    ...overrides,
  };
}

/**
 * Predefined controller states for different scenarios
 */
export const MOCK_STATES = {
  /**
   * Default state - shows most controls
   */
  DEFAULT: createMockControllerState(),

  /**
   * Playing state
   */
  PLAYING: createControllerState({
    isPlaying: true,
    isBuffering: false,
  }),

  /**
   * Paused state
   */
  PAUSED: createControllerState({
    isPlaying: false,
    isBuffering: false,
  }),

  /**
   * Buffering state
   */
  BUFFERING: createControllerState({
    isPlaying: true,
    isBuffering: true,
  }),

  /**
   * Locked state - minimal controls shown
   */
  LOCKED: createControllerState({
    isLocked: true,
    showControls: true,
  }),

  /**
   * Controls hidden
   */
  CONTROLS_HIDDEN: createControllerState({
    showControls: false,
  }),

  /**
   * Mobile state
   */
  MOBILE: createControllerState({
    isMobile: true,
    isDesktop: false,
  }),

  /**
   * Offline state
   */
  OFFLINE: createControllerState({
    isOffline: true,
  }),

  /**
   * Can't navigate (first/last episode)
   */
  NO_NAVIGATION: createControllerState({
    canGoForward: false,
    canGoBackward: false,
  }),
} as const;

/**
 * Type for predefined state keys
 */
export type MockStateKey = keyof typeof MOCK_STATES;

/**
 * Get a predefined mock state by key
 */
export function getMockState(key: MockStateKey): PlayerControllerState {
  return MOCK_STATES[key];
}

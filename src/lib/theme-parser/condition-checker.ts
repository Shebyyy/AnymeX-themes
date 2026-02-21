/**
 * Condition Checker
 * Evaluates visibleWhen and enabledWhen conditions
 * Supports && (AND), || (OR), and ! (NOT) operators
 */

import type { PlayerControllerState } from './types';

// ============================================================================
// Condition Evaluator
// ============================================================================

export function checkCondition(
  raw: string | undefined,
  controller: PlayerControllerState
): boolean {
  if (raw == null || raw.trim() === '') return true;

  // Split by OR (||)
  const orParts = raw.split('||');

  for (const orPart of orParts) {
    // Split each OR part by AND (&&)
    const andParts = orPart.split('&&');
    let allGood = true;

    for (let token of andParts) {
      token = token.trim();
      if (token === '') continue;

      // Check for negation (!)
      let expected = true;
      if (token.startsWith('!')) {
        expected = false;
        token = token.substring(1).trim();
      }

      const result = getConditionBool(token, controller);
      if (result !== expected) {
        allGood = false;
        break;
      }
    }

    if (allGood) return true;
  }

  return false;
}

// ============================================================================
// Individual Condition Checks
// ============================================================================

export function getConditionBool(
  token: string,
  controller: PlayerControllerState
): boolean {
  switch (token) {
    case 'locked':
      return controller.isLocked;
    case 'unlocked':
      return !controller.isLocked;
    case 'showControls':
      return controller.showControls;
    case 'controlsHidden':
      return !controller.showControls;
    case 'isPlaying':
      return controller.isPlaying;
    case 'isBuffering':
      return controller.isBuffering;
    case 'isOffline':
      return controller.isOffline;
    case 'isOnline':
      return !controller.isOffline;
    case 'canGoForward':
      return controller.canGoForward;
    case 'canGoBackward':
      return controller.canGoBackward;
    case 'isDesktop':
      return controller.isDesktop;
    case 'isMobile':
      return controller.isMobile;
    default:
      return false;
  }
}

// ============================================================================
// Enabled State Checker
// ============================================================================

export function isThingEnabled(
  id: string,
  controller: PlayerControllerState
): boolean {
  switch (id) {
    case 'previous_episode':
      return controller.canGoBackward;
    case 'next_episode':
      return controller.canGoForward;
    case 'lock_controls':
      return !controller.isLocked;
    case 'unlock_controls':
      return controller.isLocked;
    case 'server':
    case 'quality':
      return !controller.isOffline;
    case 'orientation':
      return controller.isMobile;
    default:
      return true;
  }
}

// ============================================================================
// Zone Visibility Checker
// ============================================================================

export function canShowZone(
  vibes: {
    showWhenLocked: boolean;
    showWhenUnlocked: boolean;
  },
  locked: boolean
): boolean {
  if (locked && !vibes.showWhenLocked) return false;
  if (!locked && !vibes.showWhenUnlocked) return false;
  return true;
}

/**
 * PlayerControlsContext
 * React context that provides mock player controller state to theme preview components
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { PlayerControllerState } from '@/lib/theme-parser';
import { createMockControllerState } from '@/lib/mock-controller-state';

/**
 * Context interface
 */
interface PlayerControlsContextValue {
  controller: PlayerControllerState;
}

/**
 * Create the context
 */
const PlayerControlsContext = createContext<PlayerControlsContextValue | undefined>(
  undefined
);

/**
 * Provider props
 */
interface PlayerControlsProviderProps {
  children: ReactNode;
  controller?: PlayerControllerState;
}

/**
 * PlayerControlsProvider component
 * Provides mock controller state to child components
 */
export function PlayerControlsProvider({
  children,
  controller: customController,
}: PlayerControlsProviderProps) {
  // Use provided controller or create default mock
  const controller = customController || createMockControllerState();

  const value: PlayerControlsContextValue = {
    controller,
  };

  return (
    <PlayerControlsContext.Provider value={value}>
      {children}
    </PlayerControlsContext.Provider>
  );
}

/**
 * Hook to use the player controls context
 * Throws an error if used outside of a provider
 */
export function usePlayerControls(): PlayerControllerState {
  const context = useContext(PlayerControlsContext);

  if (context === undefined) {
    throw new Error('usePlayerControls must be used within a PlayerControlsProvider');
  }

  return context.controller;
}

/**
 * Hook to use the player controls context with optional fallback
 * Returns null if used outside of a provider (instead of throwing)
 */
export function usePlayerControlsOptional(): PlayerControllerState | null {
  const context = useContext(PlayerControlsContext);
  return context?.controller || null;
}

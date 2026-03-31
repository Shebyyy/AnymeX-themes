import { supabase } from "@/lib/db";

type PendingDelta = {
  likes: number;
  views: number;
};

type BufferState = {
  deltas: Map<string, PendingDelta>;
  timer: ReturnType<typeof setTimeout> | null;
  flushing: boolean;
};

const globalState = globalThis as unknown as { __anymexMetricBuffer?: BufferState };

const state: BufferState =
  globalState.__anymexMetricBuffer ||
  (globalState.__anymexMetricBuffer = {
    deltas: new Map(),
    timer: null,
    flushing: false,
  });

const FLUSH_MS = 1500;

function scheduleFlush() {
  if (state.timer) return;
  state.timer = setTimeout(() => {
    state.timer = null;
    void flushMetricBuffer();
  }, FLUSH_MS);
}

export function enqueueThemeCounterDelta(themeId: string, delta: Partial<PendingDelta>) {
  const current = state.deltas.get(themeId) || { likes: 0, views: 0 };
  state.deltas.set(themeId, {
    likes: current.likes + (delta.likes || 0),
    views: current.views + (delta.views || 0),
  });
  scheduleFlush();
}

export function getProjectedCounts(themeId: string, likesCount: number, viewsCount: number) {
  const delta = state.deltas.get(themeId) || { likes: 0, views: 0 };
  return {
    likesCount: Math.max(0, likesCount + delta.likes),
    viewsCount: Math.max(0, viewsCount + delta.views),
  };
}

async function flushMetricBuffer() {
  if (state.flushing || state.deltas.size === 0) return;
  state.flushing = true;

  const snapshot = new Map(state.deltas);
  state.deltas.clear();

  try {
    for (const [themeId, delta] of snapshot.entries()) {
      if (!delta.likes && !delta.views) continue;

      const { data: theme, error } = await supabase
        .from("Theme")
        .select("id, likesCount, viewsCount")
        .eq("id", themeId)
        .single();

      if (error || !theme) continue;

      const nextLikes = Math.max(0, (theme.likesCount || 0) + delta.likes);
      const nextViews = Math.max(0, (theme.viewsCount || 0) + delta.views);

      await supabase
        .from("Theme")
        .update({ likesCount: nextLikes, viewsCount: nextViews })
        .eq("id", themeId);
    }
  } catch (error) {
    // Restore snapshot on failure so we can retry later.
    for (const [themeId, delta] of snapshot.entries()) {
      const current = state.deltas.get(themeId) || { likes: 0, views: 0 };
      state.deltas.set(themeId, {
        likes: current.likes + delta.likes,
        views: current.views + delta.views,
      });
    }
    scheduleFlush();
  } finally {
    state.flushing = false;
  }
}


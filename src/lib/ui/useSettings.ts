'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings } from '@/lib/data/types';

const STORAGE_KEY = 'app-grid-settings';

export const DEFAULT_SETTINGS: Settings = {
  iconSize: 96,
  radius: 24,
  gap: 16,
  columns: { sm: 3, md: 4, lg: 6 }
};

export const mergeSettings = (
  base: Settings,
  overrides?: Partial<Settings>
): Settings => {
  if (!overrides) return base;
  return {
    iconSize: overrides.iconSize ?? base.iconSize,
    radius: overrides.radius ?? base.radius,
    gap: overrides.gap ?? base.gap,
    columns: {
      sm: overrides.columns?.sm ?? base.columns.sm,
      md: overrides.columns?.md ?? base.columns.md,
      lg: overrides.columns?.lg ?? base.columns.lg
    }
  };
};

export const areSettingsEqual = (left: Settings, right: Settings) =>
  left.iconSize === right.iconSize &&
  left.radius === right.radius &&
  left.gap === right.gap &&
  left.columns.sm === right.columns.sm &&
  left.columns.md === right.columns.md &&
  left.columns.lg === right.columns.lg;

const applyCssVars = (settings: Settings) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const gridMin = Math.max(150, Math.round(settings.iconSize + settings.gap * 2.5));
  const buttonRadius = Math.max(14, settings.radius - 6);

  root.style.setProperty('--icon-size', `${settings.iconSize}px`);
  root.style.setProperty('--grid-gap', `${settings.gap}px`);
  root.style.setProperty('--grid-min', `${gridMin}px`);
  root.style.setProperty('--radius-icon', `${settings.radius}px`);
  root.style.setProperty('--radius-card', `${settings.radius + 4}px`);
  root.style.setProperty('--radius-btn', `${buttonRadius}px`);
};

const safeParse = (value: string | null): Partial<Settings> | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as Partial<Settings>;
  } catch {
    return null;
  }
};

interface UseSettingsResult {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  ready: boolean;
}

export function useSettings(initial: Settings): UseSettingsResult {
  const initialRef = useRef(initial);
  const [settings, setSettings] = useState<Settings>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialRef.current = initial;
    setSettings(initial);
    applyCssVars(initial);
  }, [initial]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
    if (stored) {
      setSettings((previous) => {
        const merged = mergeSettings(mergeSettings(initialRef.current, previous), stored);
        applyCssVars(merged);
        return merged;
      });
    } else {
      applyCssVars(initialRef.current);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    applyCssVars(settings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, ready]);

  const setSettingsWithCss = useCallback<React.Dispatch<React.SetStateAction<Settings>>>(
    (update) => {
      setSettings((previous) => {
        const next =
          typeof update === 'function' ? (update as (value: Settings) => Settings)(previous) : update;
        applyCssVars(next);
        if (ready && typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    [ready]
  );

  return {
    settings,
    setSettings: setSettingsWithCss,
    ready
  };
}

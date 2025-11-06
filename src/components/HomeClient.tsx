'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion
} from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppTile from '@/components/AppTile';
import ControlsBar from '@/components/ControlsBar';
import DetailsPanel from '@/components/DetailsPanel';
import Filters from '@/components/Filters';
import type { Bookmark, BookmarkPayload, Settings, SortOption } from '@/lib/data/types';
import {
  DEFAULT_SETTINGS,
  areSettingsEqual,
  mergeSettings,
  useSettings
} from '@/lib/ui/useSettings';

const PARAM_KEYS = {
  selected: 'selected',
  tags: 'tags',
  sort: 'sort',
  query: 'q',
  icon: 'icon',
  gap: 'gap',
  radius: 'radius',
  columns: 'cols'
} as const;

const sortComparators: Record<SortOption, (a: Bookmark, b: Bookmark) => number> = {
  manual: (a, b) => {
    const left = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
    const right = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
    return left - right;
  },
  alpha: (a, b) => a.title.localeCompare(b.title),
  recent: (a, b) => {
    const toTime = (bookmark: Bookmark) => {
      const source = bookmark.updatedAt ?? bookmark.createdAt;
      return source ? Date.parse(source) : 0;
    };
    return toTime(b) - toTime(a);
  }
};

const SEARCHABLE_FIELDS: Array<'title' | 'description' | 'url'> = [
  'title',
  'description',
  'url'
];

interface HomeClientProps {
  data: BookmarkPayload;
}

const arrayEquals = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value) => right.includes(value));

const parseSort = (value: string | null): SortOption => {
  if (value === 'alpha' || value === 'recent') {
    return value;
  }
  return 'manual';
};

const parseTags = (value: string | null): string[] =>
  value
    ?.split(',')
    .map((tag) => tag.trim())
    .filter(Boolean) ?? [];

const encodeTags = (tags: string[]): string | null =>
  tags.length ? tags.join(',') : null;

const decodeColumns = (
  value: string | null,
  fallback: Settings['columns']
): Settings['columns'] => {
  if (!value) return fallback;
  const parsed = value.split('-').map((v) => Number.parseInt(v, 10));
  if (parsed.length !== 3 || parsed.some((num) => Number.isNaN(num))) {
    return fallback;
  }
  const [sm, md, lg] = parsed as [number, number, number];
  return {
    sm: Math.max(2, sm),
    md: Math.max(3, md),
    lg: Math.max(3, lg)
  };
};

const decodeSettingsFromParams = (
  params: URLSearchParams,
  base: Settings
): Partial<Settings> => {
  const overrides: Partial<Settings> = {};
  const iconSize = params.get(PARAM_KEYS.icon);
  const gap = params.get(PARAM_KEYS.gap);
  const radius = params.get(PARAM_KEYS.radius);
  const cols = params.get(PARAM_KEYS.columns);

  if (iconSize) {
    const parsed = Number.parseInt(iconSize, 10);
    if (!Number.isNaN(parsed)) {
      overrides.iconSize = parsed;
    }
  }

  if (gap) {
    const parsed = Number.parseInt(gap, 10);
    if (!Number.isNaN(parsed)) {
      overrides.gap = parsed;
    }
  }

  if (radius) {
    const parsed = Number.parseInt(radius, 10);
    if (!Number.isNaN(parsed)) {
      overrides.radius = parsed;
    }
  }

  if (cols) {
    overrides.columns = decodeColumns(cols, base.columns);
  }

  return overrides;
};

const formatColumnsParam = (columns: Settings['columns']) =>
  `${columns.sm}-${columns.md}-${columns.lg}`;

export default function HomeClient({ data }: HomeClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const bookmarks = useMemo<Bookmark[]>(() => data.bookmarks ?? [], [data.bookmarks]);
  const initialSettings = useMemo(
    () => mergeSettings(DEFAULT_SETTINGS, data.settings),
    [data.settings]
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    () => searchParams.get(PARAM_KEYS.selected)
  );
  const [activeTags, setActiveTags] = useState<string[]>(() =>
    parseTags(searchParams.get(PARAM_KEYS.tags))
  );
  const [sortOrder, setSortOrder] = useState<SortOption>(() =>
    parseSort(searchParams.get(PARAM_KEYS.sort))
  );
  const [searchTerm, setSearchTerm] = useState<string>(
    () => searchParams.get(PARAM_KEYS.query) ?? ''
  );

  const { settings, setSettings, ready: settingsReady } = useSettings(initialSettings);

  const queryOverrides = useMemo(
    () => decodeSettingsFromParams(searchParams, initialSettings),
    [searchParams, initialSettings]
  );

  useEffect(() => {
    if (!settingsReady) return;
    if (!Object.keys(queryOverrides).length) return;

    setSettings((previous) => {
      const next = mergeSettings(previous, queryOverrides);
      return areSettingsEqual(previous, next) ? previous : next;
    });
  }, [settingsReady, queryOverrides, setSettings]);

  useEffect(() => {
    const selected = searchParams.get(PARAM_KEYS.selected);
    if (selectedId !== selected) {
      setSelectedId(selected);
    }

    const tagList = parseTags(searchParams.get(PARAM_KEYS.tags));
    if (!arrayEquals(activeTags, tagList)) {
      setActiveTags(tagList);
    }

    const nextSort = parseSort(searchParams.get(PARAM_KEYS.sort));
    if (sortOrder !== nextSort) {
      setSortOrder(nextSort);
    }

    const query = searchParams.get(PARAM_KEYS.query) ?? '';
    if (searchTerm !== query) {
      setSearchTerm(query);
    }
  }, [searchParams, selectedId, activeTags, sortOrder, searchTerm]);

  useEffect(() => {
    if (!selectedId) return;
    const exists = bookmarks.some((bookmark) => bookmark.id === selectedId);
    if (!exists) {
      setSelectedId(null);
      router.replace(pathname, { scroll: false });
    }
  }, [bookmarks, selectedId, router, pathname]);

  const commitParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const syncSettingsToQuery = useCallback(
    (next: Settings) => {
      commitParams((params) => {
        params.set(PARAM_KEYS.icon, String(next.iconSize));
        params.set(PARAM_KEYS.gap, String(next.gap));
        params.set(PARAM_KEYS.radius, String(next.radius));
        params.set(PARAM_KEYS.columns, formatColumnsParam(next.columns));
      });
    },
    [commitParams]
  );

  const handleSelect = useCallback(
    (id: string, trigger: HTMLButtonElement | null) => {
      setSelectedId((previous) => {
        const next = previous === id ? null : id;
        commitParams((params) => {
          if (next) {
            params.set(PARAM_KEYS.selected, next);
          } else {
            params.delete(PARAM_KEYS.selected);
          }
        });
        if (trigger) {
          lastTriggerRef.current = trigger;
        }
        return next;
      });
    },
    [commitParams]
  );

  const handleCloseDetails = useCallback(() => {
    setSelectedId(null);
    commitParams((params) => params.delete(PARAM_KEYS.selected));
    requestAnimationFrame(() => {
      lastTriggerRef.current?.focus();
    });
  }, [commitParams]);

  const handleToggleTag = useCallback(
    (tag: string) => {
      setActiveTags((previous) => {
        const exists = previous.includes(tag);
        const next = exists ? previous.filter((value) => value !== tag) : [...previous, tag];
        commitParams((params) => {
          const encoded = encodeTags(next);
          if (encoded) {
            params.set(PARAM_KEYS.tags, encoded);
          } else {
            params.delete(PARAM_KEYS.tags);
          }
        });
        return next;
      });
    },
    [commitParams]
  );

  const handleSortChange = useCallback(
    (nextSort: SortOption) => {
      setSortOrder(nextSort);
      commitParams((params) => params.set(PARAM_KEYS.sort, nextSort));
    },
    [commitParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      commitParams((params) => {
        if (value.trim()) {
          params.set(PARAM_KEYS.query, value.trim());
        } else {
          params.delete(PARAM_KEYS.query);
        }
      });
    },
    [commitParams]
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((previous) => {
        const merged = mergeSettings(previous, partial);
        if (areSettingsEqual(previous, merged)) {
          return previous;
        }
        syncSettingsToQuery(merged);
        return merged;
      });
    },
    [setSettings, syncSettingsToQuery]
  );

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    bookmarks.forEach((bookmark) => {
      bookmark.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matchesSearch = (bookmark: Bookmark) =>
      !normalizedSearch ||
      SEARCHABLE_FIELDS.some((field) =>
        bookmark[field].toLowerCase().includes(normalizedSearch)
      );

    const matchesTags = (bookmark: Bookmark) =>
      !activeTags.length || activeTags.every((tag) => bookmark.tags?.includes(tag));

    const next = bookmarks.filter((bookmark) => matchesSearch(bookmark) && matchesTags(bookmark));
    next.sort(sortComparators[sortOrder]);
    return next;
  }, [bookmarks, searchTerm, activeTags, sortOrder]);

  const selectedBookmark = useMemo(
    () => bookmarks.find((bookmark) => bookmark.id === selectedId) ?? null,
    [bookmarks, selectedId]
  );

  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-12 sm:gap-10 sm:px-8 lg:pb-20"
    >
      <header className="flex flex-col gap-3 text-left">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            App Grid Bookmarks
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            Curate your go-to tools in an iPhone-style grid. Launch apps instantly, pop open
            detailed summaries, and keep your filters, sort order, and layout synced to the URL.
          </p>
        </div>
        {data.message ? (
          <p className="rounded-card border border-dashed border-border/60 bg-surface/50 px-4 py-3 text-sm text-text-muted">
            {data.message}
          </p>
        ) : null}
      </header>

      <ControlsBar
        settings={settings}
        disabled={!settingsReady}
        onChange={handleSettingsChange}
      />

      <Filters
        tags={availableTags}
        activeTags={activeTags}
        onToggleTag={handleToggleTag}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <LayoutGroup id="bookmark-grid">
        <section
          className="grid auto-rows-fr gap-[var(--grid-gap)]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(var(--grid-min), 1fr))' }}
          aria-live="polite"
        >
          {filteredBookmarks.length ? (
            filteredBookmarks.map((bookmark) => (
              <AppTile
                key={bookmark.id}
                bookmark={bookmark}
                isSelected={bookmark.id === selectedId}
                onSelect={handleSelect}
                layoutGroupId="bookmark-grid"
                detailsId={`details-${bookmark.id}`}
              />
            ))
          ) : (
            <motion.div
              layout
              className="col-span-full flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface/60 px-6 py-16 text-center text-text-muted"
            >
              <p className="max-w-md text-base">
                No bookmarks match your current filters. Try clearing the search, removing tags, or
                adjusting the sort order.
              </p>
            </motion.div>
          )}
        </section>
      </LayoutGroup>

      <AnimatePresence mode="wait">
        {selectedBookmark ? (
          <>
            <motion.button
              key="overlay"
              type="button"
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseDetails}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }
              }
              aria-label="Close details"
            />
            <DetailsPanel
              key={selectedBookmark.id}
              bookmark={selectedBookmark}
              onClose={handleCloseDetails}
              panelId={`details-${selectedBookmark.id}`}
            />
          </>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

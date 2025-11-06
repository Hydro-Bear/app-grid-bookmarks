'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fetchFavicon } from '@/lib/ui/favicons';
import type { Bookmark } from '@/lib/data/types';

interface AppTileProps {
  bookmark: Bookmark;
  isSelected: boolean;
  onSelect: (id: string, trigger: HTMLButtonElement | null) => void;
  layoutGroupId: string;
  detailsId: string;
}

const createLocalMonogram = (title: string, fallbackColor?: string) => {
  const char = title.trim().charAt(0).toUpperCase() || '•';
  const hue = fallbackColor ?? '#312e81';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192" fill="none">
  <rect width="192" height="192" rx="48" fill="${hue}"/>
  <text x="50%" y="58%" text-anchor="middle" fill="white" font-family="Inter, sans-serif" font-size="96" font-weight="600">${char}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const highlightClasses =
  'ring-2 ring-brand shadow-[0_0_0_4px_rgba(99,102,241,0.18)] ring-offset-2 ring-offset-surface';

export default function AppTile({
  bookmark,
  isSelected,
  onSelect,
  layoutGroupId,
  detailsId
}: AppTileProps) {
  const labelRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [iconSource, setIconSource] = useState<string | null>(bookmark.iconSrc ?? null);

  useEffect(() => {
    if (bookmark.iconSrc) return;
    let cancelled = false;

    const resolveIcon = async () => {
      try {
        const resolved = await fetchFavicon(bookmark.url);
        if (!cancelled) {
          setIconSource(resolved);
        }
      } catch {
        if (!cancelled) {
          setIconSource(createLocalMonogram(bookmark.title, bookmark.color));
        }
      }
    };

    resolveIcon();

    return () => {
      cancelled = true;
    };
  }, [bookmark.iconSrc, bookmark.url, bookmark.title, bookmark.color]);

  const badgeLabel = useMemo(() => {
    if (bookmark.featured) return 'Featured';
    if (bookmark.tags?.includes('new')) return 'New';
    return null;
  }, [bookmark.featured, bookmark.tags]);

  const handleLabelActivate = () => {
    onSelect(bookmark.id, labelRef.current);
  };

  const handleLabelKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onSelect(bookmark.id, event.currentTarget);
    }
  };

  const handleLaunch = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.button === 1) return;
    event.preventDefault();
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const classes = [
    'group relative flex h-full flex-col justify-between rounded-card border border-transparent bg-surface/70 px-5 pb-6 pt-6 text-left transition-colors duration-200',
    'hover:border-brand/40 hover:bg-surface',
    isSelected ? highlightClasses : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.article layoutId={`${layoutGroupId}-${bookmark.id}`} layout className={classes}>
      <div className="flex flex-col gap-4">
        <motion.a
          layoutId={`icon-${bookmark.id}`}
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLaunch}
          className="relative flex h-[var(--icon-size)] w-[var(--icon-size)] items-center justify-center rounded-icon shadow-icon transition-transform duration-200 hover:scale-[1.04]"
          style={{ backgroundColor: bookmark.color ?? 'rgba(255,255,255,0.04)' }}
          {...(!prefersReducedMotion ? { whileHover: { scale: 1.05 } } : {})}
        >
          <span className="sr-only">Open {bookmark.title} in a new tab</span>
          {iconSource ? (
            <img
              src={iconSource}
              alt=""
              className="h-[62%] w-[62%] object-contain"
              loading="lazy"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-[62%] w-[62%] items-center justify-center rounded-[16px] bg-black/30 text-lg font-semibold text-white"
            >
              {bookmark.title.charAt(0).toUpperCase()}
            </span>
          )}
        </motion.a>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <button
              ref={labelRef}
              type="button"
              onClick={handleLabelActivate}
              onKeyDown={handleLabelKeyDown}
              aria-expanded={isSelected}
              aria-controls={detailsId}
              className="line-clamp-2 text-base font-medium leading-tight text-text transition-colors duration-150 hover:text-brand focus-visible:text-brand"
            >
              {bookmark.title}
            </button>
            {badgeLabel ? (
              <span className="rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-brand">
                {badgeLabel}
              </span>
            ) : null}
          </div>
          <p className="line-clamp-2 text-xs text-text-muted">{bookmark.description}</p>
        </div>
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-2 text-[0.68rem] text-text-muted">
        <span className="rounded-full bg-border/20 px-2 py-1 font-medium uppercase tracking-wide text-text-muted">
          {(() => {
            try {
              return new URL(bookmark.url).hostname.replace(/^www\./, '');
            } catch {
              return bookmark.url;
            }
          })()}
        </span>
        {bookmark.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border/40 bg-surface-2/70 px-2 py-1 font-semibold uppercase tracking-wide text-[0.62rem]"
          >
            {tag}
          </span>
        ))}
      </footer>
    </motion.article>
  );
}

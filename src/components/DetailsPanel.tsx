'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Bookmark } from '@/lib/data/types';

interface DetailsPanelProps {
  bookmark: Bookmark;
  onClose: () => void;
  panelId: string;
}

type CopyState = 'idle' | 'copied' | 'error';

const formatDate = (input?: string) => {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function DetailsPanel({ bookmark, onClose, panelId }: DetailsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = panelRef.current;
    node?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = useCallback(async () => {
    if (!navigator.clipboard) {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(bookmark.url);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 1800);
    }
  }, [bookmark.url]);

  const updatedAt = useMemo(
    () => formatDate(bookmark.updatedAt ?? bookmark.createdAt),
    [bookmark.updatedAt, bookmark.createdAt]
  );

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 220, damping: 24 };

  return (
    <motion.aside
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${panelId}-title`}
      aria-describedby={`${panelId}-description`}
      tabIndex={-1}
      id={panelId}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col gap-6 overflow-y-auto border-l border-border/40 bg-surface/95 p-8 shadow-[0_32px_120px_rgba(15,23,42,0.6)] backdrop-blur-xl"
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={transition}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <motion.div
            layoutId={`icon-${bookmark.id}`}
            className="flex h-20 w-20 items-center justify-center rounded-icon shadow-icon"
            style={{ backgroundColor: bookmark.color ?? 'rgba(255,255,255,0.08)' }}
          >
            {bookmark.iconSrc ? (
              <img
                src={bookmark.iconSrc}
                alt=""
                className="h-[68%] w-[68%] object-contain"
                loading="lazy"
              />
            ) : (
              <span className="text-xl font-semibold text-white">
                {bookmark.title.charAt(0).toUpperCase()}
              </span>
            )}
          </motion.div>
          <h2
            id={`${panelId}-title`}
            className="text-2xl font-semibold leading-tight text-text"
          >
            {bookmark.title}
          </h2>
          <p id={`${panelId}-description`} className="text-sm text-text-muted">
            {bookmark.description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-btn border border-border/50 bg-surface-2/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted transition-colors hover:border-brand/50 hover:text-brand focus-visible:text-brand"
        >
          Close
        </button>
      </header>

      <section className="space-y-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-btn bg-brand/90 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(99,102,241,0.4)] transition-transform hover:scale-[1.02]"
            >
              Visit Site
              <span aria-hidden="true" className="text-white/80">
                ↗
              </span>
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-btn border border-border bg-surface-2/70 px-4 py-2 text-sm font-medium text-text-muted transition hover:border-brand/50 hover:text-brand focus-visible:text-brand"
            >
              {copyState === 'copied'
                ? 'Copied!'
                : copyState === 'error'
                ? 'Copy Failed'
                : 'Copy URL'}
            </button>
          </div>
          <div className="rounded-card border border-border/40 bg-surface-2/60 px-4 py-3 text-sm text-text-muted">
            <span className="font-medium text-text">URL:</span>{' '}
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-brand underline-offset-2 hover:underline"
            >
              {bookmark.url}
            </a>
          </div>
        </div>

        {bookmark.tags?.length ? (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/50 bg-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Quick Actions
          </h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>• Pin this app to stay in your top row.</li>
            <li>• Update tags in <code>public/data/bookmarks.json</code> to refine filters.</li>
            <li>• Share a deep link with <code>?selected={bookmark.id}</code> to highlight it.</li>
          </ul>
        </div>

        <footer className="flex flex-wrap items-center gap-3 text-xs text-text-muted/80">
          {updatedAt ? (
            <span className="rounded-full border border-border/40 bg-surface-2/40 px-3 py-1">
              Updated {updatedAt}
            </span>
          ) : null}
          {typeof bookmark.order === 'number' ? (
            <span className="rounded-full border border-border/30 bg-surface-2/40 px-3 py-1">
              Manual order #{bookmark.order}
            </span>
          ) : null}
        </footer>
      </section>
    </motion.aside>
  );
}

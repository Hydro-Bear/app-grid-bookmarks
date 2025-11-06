'use client';

import type { SortOption } from '@/lib/data/types';

interface FiltersProps {
  tags: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  sortOrder: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const sortLabels: Record<SortOption, string> = {
  manual: 'Manual order',
  alpha: 'A → Z',
  recent: 'Recently updated'
};

export default function Filters({
  tags,
  activeTags,
  onToggleTag,
  sortOrder,
  onSortChange,
  searchTerm,
  onSearchChange
}: FiltersProps) {
  return (
    <section className="flex flex-col gap-4 rounded-card border border-border/30 bg-surface/60 px-5 py-5 shadow-card backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
        <label className="flex items-center gap-2 rounded-btn border border-border/40 bg-surface-2/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-text-muted">
          <span>Search</span>
          <input
            type="search"
            placeholder="Find bookmarks"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-36 bg-transparent text-sm font-medium text-text outline-none placeholder:text-text-muted/60"
          />
        </label>

        <label className="flex items-center gap-2 rounded-btn border border-border/40 bg-surface-2/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-text-muted">
          <span>Sort</span>
          <select
            value={sortOrder}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="bg-transparent text-sm font-medium text-text outline-none"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value} className="bg-surface text-text">
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.length ? (
          tags.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={[
                  'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition',
                  isActive
                    ? 'border-brand bg-brand/90 text-white shadow-[0_10px_24px_rgba(99,102,241,0.35)]'
                    : 'border-border bg-surface-2/60 text-text-muted hover:border-brand/40 hover:text-brand'
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={isActive}
              >
                {tag}
              </button>
            );
          })
        ) : (
          <span className="text-xs text-text-muted">
            Add tags to your JSON data to see quick filters here.
          </span>
        )}
      </div>
    </section>
  );
}

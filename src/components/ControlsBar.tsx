'use client';

import type { Settings } from '@/lib/data/types';

interface ControlsBarProps {
  settings: Settings;
  disabled?: boolean;
  onChange: (partial: Partial<Settings>) => void;
}

const ICON_OPTIONS = [
  { label: 'Compact', value: 72 },
  { label: 'Comfort', value: 96 },
  { label: 'Spacious', value: 120 }
];

const clampColumns = (value: number) => ({
  sm: Math.max(2, Math.min(value - 1, 5)),
  md: Math.max(3, Math.min(value, 6)),
  lg: Math.max(3, Math.min(value + 1, 7))
});

export default function ControlsBar({ settings, disabled, onChange }: ControlsBarProps) {
  const handleIconSize = (size: number) => {
    if (disabled) return;
    onChange({ iconSize: size });
  };

  const handleGap = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange({ gap: Number.parseInt(event.target.value, 10) });
  };

  const handleRadius = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange({ radius: Number.parseInt(event.target.value, 10) });
  };

  const handleColumns = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const value = Number.parseInt(event.target.value, 10);
    onChange({ columns: clampColumns(value) });
  };

  return (
    <section
      aria-label="Layout controls"
      className="rounded-card border border-border/40 bg-surface/70 px-5 py-5 shadow-card backdrop-blur-xl sm:px-6 sm:py-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex flex-wrap gap-3">
          {ICON_OPTIONS.map((option) => {
            const isActive = settings.iconSize === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() => handleIconSize(option.value)}
                className={[
                  'rounded-btn px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand text-white shadow-[0_12px_28px_rgba(99,102,241,0.35)]'
                    : 'border border-border bg-surface-2/60 text-text-muted hover:border-brand/40 hover:text-brand'
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={isActive}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="grid w-full gap-4 sm:w-auto sm:grid-cols-3 sm:items-center sm:gap-6">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Gap {settings.gap}px
            <input
              type="range"
              min={8}
              max={32}
              step={2}
              value={settings.gap}
              onChange={handleGap}
              className="w-full accent-brand"
              disabled={disabled}
            />
          </label>

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Radius {settings.radius}px
            <input
              type="range"
              min={12}
              max={32}
              step={2}
              value={settings.radius}
              onChange={handleRadius}
              className="w-full accent-brand"
              disabled={disabled}
            />
          </label>

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Columns {settings.columns.lg}
            <input
              type="range"
              min={3}
              max={7}
              step={1}
              value={settings.columns.lg}
              onChange={handleColumns}
              className="w-full accent-brand"
              disabled={disabled}
            />
          </label>
        </div>
      </div>
    </section>
  );
}

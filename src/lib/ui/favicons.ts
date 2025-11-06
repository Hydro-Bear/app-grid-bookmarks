const faviconCache = new Map<string, string>();

const buildMonogramIcon = (origin: string) => {
  const char = origin.replace(/^https?:\/\//, '').charAt(0).toUpperCase() || '•';
  const palette = ['#6366f1', '#14b8a6', '#f97316', '#0ea5e9', '#a855f7'];
  const color = palette[char.charCodeAt(0) % palette.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none">
  <rect width="128" height="128" rx="36" fill="${color}"/>
  <text x="50%" y="58%" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="64" fill="#ffffff">${char}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export async function fetchFavicon(appUrl: string, timeoutMs = 1500): Promise<string> {
  try {
    const { origin } = new URL(appUrl);
    if (faviconCache.has(origin)) {
      return faviconCache.get(origin)!;
    }

    const candidate = `${origin}/favicon.ico`;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      if (controller) {
        timer = setTimeout(() => controller.abort(), timeoutMs);
      }
      const init: RequestInit = controller
        ? { method: 'HEAD', signal: controller.signal }
        : { method: 'HEAD' };
      const response = await fetch(candidate, init);
      if (timer) clearTimeout(timer);
      if (response.ok) {
        faviconCache.set(origin, candidate);
        return candidate;
      }
    } catch {
      if (timer) clearTimeout(timer);
    }

    const googleFavicon = `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(origin)}`;
    faviconCache.set(origin, googleFavicon);
    return googleFavicon;
  } catch {
    return buildMonogramIcon(appUrl);
  }
}


export const isEmdashEnabled = process.env.ENABLE_EMDASH === 'true';

type EmDashContentEntry = {
  id: string;
  data: Record<string, any>;
};

type BlogListEntry = {
  id: string;
  data: {
    slug: string;
    title: string;
    description: string;
    date: string;
    category: string;
    heroImage?: string;
    heroAlt?: string;
  };
};

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), ms);
  });

  const result = await Promise.race([promise, timeout]);
  if (timeoutId) clearTimeout(timeoutId);
  return result;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getEntrySlug(entry: EmDashContentEntry): string {
  return asString(entry.data.slug) ?? entry.id;
}

function extractMediaSrc(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return undefined;

  const media = value as Record<string, any>;
  const storageKey = asString(media.meta?.storageKey);

  return asString(media.src)
    ?? asString(media.previewUrl)
    ?? asString(media.asset?.url)
    ?? (storageKey ? `/_emdash/api/media/file/${storageKey}` : undefined)
    ?? (asString(media.id) ? `/_emdash/api/media/file/${media.id}` : undefined);
}

export function getCmsTitle(entry: EmDashContentEntry): string {
  return asString(entry.data.title) ?? getEntrySlug(entry);
}

export function getCmsExcerpt(entry: EmDashContentEntry, fallback = ''): string {
  const direct = asString(entry.data.excerpt) ?? asString(entry.data.description);
  if (direct) return direct;

  const text = fallback.trim().replace(/\s+/g, ' ');
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

export function getCmsDate(entry: EmDashContentEntry): string {
  const date = asString(entry.data.publishedAt)
    ?? asString(entry.data.updatedAt)
    ?? asString(entry.data.createdAt)
    ?? new Date().toISOString();

  return Number.isNaN(Date.parse(date)) ? new Date().toISOString() : date;
}

export function getCmsHeroImage(entry: EmDashContentEntry): string | undefined {
  return extractMediaSrc(entry.data.featured_image ?? entry.data.heroImage);
}

export async function getCmsEntry(collection: 'posts' | 'pages', slug: string) {
  if (!isEmdashEnabled) return null;

  const { getEmDashEntry } = await import('emdash');
  const { entry, error } = await getEmDashEntry(collection, slug);

  if (error) {
    console.warn(`[emdash] Failed to load ${collection}/${slug}:`, error);
    return null;
  }

  return (entry as EmDashContentEntry | null) ?? null;
}

export async function getCmsBlogListEntries(): Promise<BlogListEntry[]> {
  if (!isEmdashEnabled) return [];

  const { extractPlainText, getEmDashCollection } = await import('emdash');
  const result = await withTimeout(
    getEmDashCollection('posts', { limit: 100, orderBy: { published_at: 'desc' } }),
    1000,
  );

  if (!result) {
    console.warn('[emdash] CMS posts listing timed out; rendering markdown posts only.');
    return [];
  }

  const { entries, error } = result;

  if (error) {
    console.warn('[emdash] Failed to load CMS posts:', error);
    return [];
  }

  return (entries as EmDashContentEntry[])
    .map((entry) => {
      const title = getCmsTitle(entry);
      const bodyText = extractPlainText(entry.data.content);
      return {
        id: `cms:${entry.id}`,
        data: {
          slug: getEntrySlug(entry),
          title,
          description: getCmsExcerpt(entry, bodyText),
          date: getCmsDate(entry),
          category: 'CMS',
          heroImage: getCmsHeroImage(entry),
          heroAlt: title,
        },
      };
    })
    .filter((entry) => entry.data.slug);
}

export const isEmdashEnabled = process.env.ENABLE_EMDASH === 'true';

export type CmsSeo = {
  title: string | null;
  description: string | null;
  image: string | null;
  canonical: string | null;
  noIndex: boolean;
};

export type EmDashContentEntry = {
  id: string;
  data: Record<string, any>;
  seo?: CmsSeo;
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

function asDateString(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  const stringValue = asString(value);
  return stringValue && !Number.isNaN(Date.parse(stringValue)) ? stringValue : undefined;
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

function resolveSeoImage(value: unknown): string | undefined {
  const image = asString(value);
  if (!image) return undefined;
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
    return image;
  }
  return `/_emdash/api/media/file/${image}`;
}

async function getCmsSeo(collection: 'posts' | 'pages', contentId: string): Promise<CmsSeo | undefined> {
  try {
    const { getDb } = await import('emdash/runtime');
    const db = await getDb();
    const row = await db
      .selectFrom('_emdash_seo')
      .select([
        'seo_title',
        'seo_description',
        'seo_image',
        'seo_canonical',
        'seo_no_index',
      ])
      .where('collection', '=', collection)
      .where('content_id', '=', contentId)
      .executeTakeFirst();

    if (!row) return undefined;

    return {
      title: row.seo_title,
      description: row.seo_description,
      image: row.seo_image,
      canonical: row.seo_canonical,
      noIndex: row.seo_no_index === 1,
    };
  } catch (error) {
    console.warn(`[emdash] Failed to load SEO for ${collection}/${contentId}:`, error);
    return undefined;
  }
}

async function withCmsSeo(
  collection: 'posts' | 'pages',
  entry: EmDashContentEntry | null,
): Promise<EmDashContentEntry | null> {
  if (!entry) return null;
  const contentId = asString(entry.data.id) ?? entry.id;
  return {
    ...entry,
    seo: await getCmsSeo(collection, contentId),
  };
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
  const date = asDateString(entry.data.publishedAt)
    ?? asDateString(entry.data.updatedAt)
    ?? asDateString(entry.data.createdAt)
    ?? new Date().toISOString();
  return date;
}

export function getCmsHeroImage(entry: EmDashContentEntry): string | undefined {
  return extractMediaSrc(entry.data.featured_image ?? entry.data.heroImage);
}

export function getCmsSeoImage(entry: EmDashContentEntry): string | undefined {
  return resolveSeoImage(entry.seo?.image);
}

export async function getCmsEntry(collection: 'posts' | 'pages', slug: string) {
  if (!isEmdashEnabled) return null;

  const { getEmDashEntry } = await import('emdash');
  const { entry, error } = await getEmDashEntry(collection, slug);

  if (error) {
    console.warn(`[emdash] Failed to load ${collection}/${slug}:`, error);
    return null;
  }

  return withCmsSeo(collection, (entry as EmDashContentEntry | null) ?? null);
}

export async function getCmsPreviewEntry(collection: 'posts' | 'pages', id: string) {
  if (!isEmdashEnabled) return null;

  const [{ ContentRepository, getEmDashEntry, getRequestContext }, { getDb }] = await Promise.all([
    import('emdash'),
    import('emdash/runtime'),
  ]);
  const preview = getRequestContext()?.preview;

  if (preview?.collection !== collection || preview.id !== id) {
    return null;
  }

  // The public Astro loader resolves entries by their URL slug. The signed
  // preview token intentionally contains the immutable database ID, so resolve
  // that ID to its current slug before loading the draft revision.
  const item = await new ContentRepository(await getDb()).findByIdOrSlug(collection, id);
  if (!item?.slug) return null;

  const { entry, error, isPreview } = await getEmDashEntry(collection, item.slug);

  if (error) {
    console.warn(`[emdash] Failed to preview ${collection}/${id}:`, error);
    return null;
  }

  // Never expose this internal ID route without a valid signed preview token.
  return isPreview
    ? withCmsSeo(collection, (entry as EmDashContentEntry | null) ?? null)
    : null;
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
          category: asString(entry.data.category) ?? 'Blog',
          heroImage: getCmsHeroImage(entry),
          heroAlt: asString(entry.data.hero_alt) ?? title,
        },
      };
    })
    .filter((entry) => entry.data.slug);
}

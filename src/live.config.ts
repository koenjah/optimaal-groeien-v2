import { defineLiveCollection } from 'astro:content';

const collections: Record<string, ReturnType<typeof defineLiveCollection>> = {};

if (process.env.ENABLE_EMDASH === 'true') {
  const { emdashLoader } = await import('emdash/runtime');
  collections._emdash = defineLiveCollection({
    loader: emdashLoader(),
  });
}

export { collections };

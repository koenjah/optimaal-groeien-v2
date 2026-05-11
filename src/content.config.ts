import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Stefan Kelderman'),
    category: z.string(),
    tags: z.array(z.string()),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    draft: z.boolean().default(false),
    client: z.string().optional(),
    sector: z.string().optional(),
    resultaten: z.array(z.object({ label: z.string(), waarde: z.string() })).optional(),
  }),
});

const klantcases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/klantcases' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Stefan Kelderman'),
    category: z.string().default('Klantcase'),
    tags: z.array(z.string()),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    draft: z.boolean().default(false),
    client: z.string().optional(),
    sector: z.string().optional(),
    resultaten: z.array(z.object({ label: z.string(), waarde: z.string() })).optional(),
  }),
});

export const collections = { blog, klantcases };

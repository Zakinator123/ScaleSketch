import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    published: z.boolean().default(true),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().default('ScaleSketch Team'),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  docs: docsCollection,
  blog: blogCollection,
};


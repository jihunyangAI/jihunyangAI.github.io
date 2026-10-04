import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { utcDateString } from "./lib/date";
import { slugify } from "./lib/slug";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const tagSchema = z
  .union([
    z.string().min(1),
    z.object({
      name: z.string().min(1),
      slug: z.string().regex(slugPattern, "태그 slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다."),
    }),
  ])
  .transform((tag) => {
    if (typeof tag === "string") {
      const name = tag.trim();
      return { name, slug: slugify(name) };
    }
    return { name: tag.name.trim(), slug: tag.slug };
  });

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z
    .object({
      title: z.string().min(1),
      date: z.coerce.date(),
      description: z.string().min(1),
      category: z.string().min(1),
      categorySlug: z
        .string()
        .regex(slugPattern, "categorySlug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.")
        .optional(),
      tags: z.array(tagSchema).default([]),
      draft: z.boolean().default(false),
    })
    .transform((data) => ({
      ...data,
      title: data.title.trim(),
      date: utcDateString(data.date),
      description: data.description.trim(),
      category: data.category.trim(),
      categorySlug: data.categorySlug ?? slugify(data.category),
    })),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const collections = { blog, pages };

import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

export interface MonthGroup {
  year: string;
  month: string;
  posts: Post[];
}

export interface YearGroup {
  year: string;
  months: MonthGroup[];
}

export interface Term {
  name: string;
  slug: string;
  posts: Post[];
}

let logged = false;

function assertPosts(posts: Post[]) {
  const categories = new Map<string, string>();
  const tags = new Map<string, string>();

  for (const post of posts) {
    const id = post.id.replaceAll("\\", "/");
    const parts = id.split("/");
    if (parts.length !== 3 || !/^\d{4}$/.test(parts[0]) || !/^\d{2}$/.test(parts[1]) || !parts[2]) {
      throw new Error(`글 경로는 YYYY/MM/슬러그.md 여야 합니다: ${post.id}`);
    }

    const [year, month] = post.data.date.split("-");
    if (parts[0] !== year || parts[1] !== month) {
      throw new Error(`${post.id} 폴더와 date(${post.data.date})가 다릅니다.`);
    }

    const previousCategory = categories.get(post.data.categorySlug);
    if (previousCategory && previousCategory !== post.data.category) {
      throw new Error(
        `카테고리 주소가 겹칩니다: ${post.data.categorySlug} (${previousCategory}, ${post.data.category})`,
      );
    }
    categories.set(post.data.categorySlug, post.data.category);

    for (const tag of post.data.tags) {
      const previousTag = tags.get(tag.slug);
      if (previousTag && previousTag !== tag.name) {
        throw new Error(`태그 주소가 겹칩니다: ${tag.slug} (${previousTag}, ${tag.name})`);
      }
      tags.set(tag.slug, tag.name);
    }
  }

  if (!logged) {
    logged = true;
    const categoryList = [...categories].map(([slug, name]) => `${name} (${slug})`).join(", ") || "없음";
    const tagList = [...tags].map(([slug, name]) => `${name} (${slug})`).join(", ") || "없음";
    console.info(`[blog] 글 ${posts.length}편`);
    console.info(`[blog] 카테고리 ${categoryList}`);
    console.info(`[blog] 태그 ${tagList}`);
  }
}

export async function getPosts(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts ?? !import.meta.env.PROD;
  const posts = await getCollection("blog");
  assertPosts(posts);

  return posts
    .filter((post) => includeDrafts || !post.data.draft)
    .sort((a, b) => b.data.date.localeCompare(a.data.date) || a.data.title.localeCompare(b.data.title, "ko"));
}

export function groupByYear(posts: Post[]): YearGroup[] {
  const years = new Map<string, MonthGroup[]>();

  for (const post of posts) {
    const [year, month] = post.data.date.split("-");
    const yearMonths = years.get(year) ?? [];
    const current = yearMonths.find((group) => group.month === month);
    if (current) current.posts.push(post);
    else yearMonths.push({ year, month, posts: [post] });
    years.set(year, yearMonths);
  }

  return [...years.entries()].map(([year, months]) => ({ year, months }));
}

export function listMonths(posts: Post[]) {
  return groupByYear(posts).flatMap((year) => year.months.map(({ year: y, month }) => ({ year: y, month })));
}

function collectTerms(posts: Post[], pick: (post: Post) => { name: string; slug: string }[]): Term[] {
  const terms = new Map<string, Term>();

  for (const post of posts) {
    for (const term of pick(post)) {
      const current = terms.get(term.slug) ?? { ...term, posts: [] };
      current.posts.push(post);
      terms.set(term.slug, current);
    }
  }

  return [...terms.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, "ko"),
  );
}

export function collectCategories(posts: Post[]) {
  return collectTerms(posts, (post) => [{ name: post.data.category, slug: post.data.categorySlug }]);
}

export function collectTags(posts: Post[]) {
  return collectTerms(posts, (post) => post.data.tags);
}

export function readingMinutes(body: string | undefined) {
  const text = (body ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/[#>*_`~\-[\]()]/g, " ");
  const chars = [...text.replace(/\s/g, "")].length;
  return Math.max(1, Math.round(chars / 450));
}

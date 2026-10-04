import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { rehypeBaseLinks, resolveBase, resolveSite } from "./src/site-path.mjs";

export default defineConfig({
  site: resolveSite(),
  base: resolveBase(),
  output: "static",
  trailingSlash: "always",
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    },
    processor: unified({
      gfm: true,
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeBaseLinks],
    }),
  },
});

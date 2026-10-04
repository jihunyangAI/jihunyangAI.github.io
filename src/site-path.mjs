export function resolveBase() {
  const fromEnv = process.env.BASE_PATH?.trim();
  if (fromEnv) {
    if (fromEnv === "/") return "/";
    const withSlash = fromEnv.startsWith("/") ? fromEnv : `/${fromEnv}`;
    return withSlash.replace(/\/$/, "") || "/";
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return "/";

  const [owner, name] = repository.split("/");
  if (!owner || !name) return "/";
  if (name.toLowerCase() === `${owner.toLowerCase()}.github.io`) return "/";
  return `/${name}`;
}

export function resolveSite() {
  if (process.env.SITE) return process.env.SITE.replace(/\/$/, "");

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return "http://localhost:4321";

  const [owner] = repository.split("/");
  return `https://${owner}.github.io`;
}

function withBase(value) {
  if (!value.startsWith("/") || value.startsWith("//")) return value;

  const hashIndex = value.indexOf("#");
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : "";
  const beforeHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const queryIndex = beforeHash.indexOf("?");
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : "";
  let pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;

  if (!/\.[a-z0-9]+$/i.test(pathname) && !pathname.endsWith("/")) {
    pathname += "/";
  }

  const base = resolveBase();
  const prefix = base === "/" ? "" : base;
  return `${prefix}${pathname}${query}${hash}`;
}

function rewriteNode(node) {
  if (!node || typeof node !== "object") return;

  if (node.type === "element" && node.properties) {
    for (const attr of ["href", "src"]) {
      const value = node.properties[attr];
      if (typeof value === "string") node.properties[attr] = withBase(value);
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) rewriteNode(child);
  }
}

export function rehypeBaseLinks() {
  return (tree) => rewriteNode(tree);
}

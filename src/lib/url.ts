export function url(path: string) {
  const base = import.meta.env.BASE_URL;
  if (path === "/" || path === "") return base;

  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const beforeHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = beforeHash.indexOf("?");
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : "";
  let pathname = (queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash).replace(/^\/+/, "");

  if (!/\.[a-z0-9]+$/i.test(pathname)) {
    pathname = pathname.replace(/\/$/, "") + "/";
  }

  return `${base}${pathname}${query}${hash}`;
}

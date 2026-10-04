export function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    throw new Error(`주소를 만들 수 없습니다. slug를 직접 적어 주세요: ${value}`);
  }

  return slug;
}

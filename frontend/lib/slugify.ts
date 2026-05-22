export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, max = 60): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

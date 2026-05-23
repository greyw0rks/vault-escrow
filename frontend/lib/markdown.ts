export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^[-*+]\s/gm, '')
    .trim();
}

export function excerpt(text: string, max = 100): string {
  const stripped = stripMarkdown(text);
  return stripped.length <= max ? stripped : stripped.slice(0, max).trimEnd() + '…';
}

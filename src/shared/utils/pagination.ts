export type PageItem = number | '…';

export function getPageItems(current: number, total: number): PageItem[] {
  if (total < 1) return [];
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 2) {
    pages.add(2);
    pages.add(3);
  }
  if (current >= total - 1) {
    pages.add(total - 2);
    pages.add(total - 1);
  }

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) items.push('…');
    items.push(page);
  });
  return items;
}
const formatter = new Intl.NumberFormat('az-AZ', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return `${formatter.format(value)}\u00A0₼`;
}

export function parsePrice(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+([.,]\d{1,2})?$/.test(trimmed)) return null;
  return Number(trimmed.replace(',', '.'));
}
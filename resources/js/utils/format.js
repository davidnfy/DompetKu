export function formatCurrency(value, compact = false) {
  const number = Number(value) || 0;

  if (compact) {
    if (Math.abs(number) >= 1_000_000) return `Rp ${(number / 1_000_000).toFixed(1)}jt`;
    if (Math.abs(number) >= 1_000) return `Rp ${(number / 1_000).toFixed(0)}rb`;
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatShortDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

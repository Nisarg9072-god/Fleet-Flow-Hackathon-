export function formatINR(value: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
}

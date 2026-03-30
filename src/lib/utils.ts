export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

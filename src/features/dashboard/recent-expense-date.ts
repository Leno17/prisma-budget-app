function atStartOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatRecentExpenseDate(occurredAt: string, now = new Date()): string {
  const occurredOn = new Date(occurredAt);
  const differenceInDays = Math.round((atStartOfLocalDay(now) - atStartOfLocalDay(occurredOn)) / 86_400_000);

  if (differenceInDays === 0) return 'Hoje';
  if (differenceInDays === 1) return 'Ontem';
  if (differenceInDays > 1 && differenceInDays < 7) return `Há ${differenceInDays} dias`;

  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(occurredOn);
}

export function formatExpenseDateForAccessibility(occurredAt: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(occurredAt));
}

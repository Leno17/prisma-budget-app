import { calculateAvailableCents } from '@/domain/money';

export type BudgetStatusTone = 'healthy' | 'warning' | 'limit-reached' | 'exceeded';

export interface BudgetStatus {
  availablePercentage: number;
  tone: BudgetStatusTone;
  label: string;
}

export function getBudgetStatus(limitCents: number, spentCents: number): BudgetStatus {
  const availableCents = calculateAvailableCents(limitCents, spentCents);
  const availablePercentage = Math.max(0, Math.min(100, Math.round((availableCents / limitCents) * 100)));

  if (availableCents < 0) return { availablePercentage, tone: 'exceeded', label: 'Limite excedido' };
  if (availableCents === 0) return { availablePercentage, tone: 'limit-reached', label: 'Limite atingido' };
  if (availablePercentage <= 25) return { availablePercentage, tone: 'warning', label: 'Atenção ao orçamento' };

  return { availablePercentage, tone: 'healthy', label: 'Dentro do limite' };
}

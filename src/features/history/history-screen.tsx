import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PeriodHistoryItem } from '@/application/dashboard-data';
import type { BudgetPeriod } from '@/domain/entities';
import { calculateAvailableCents, formatBrl } from '@/domain/money';
import { CurrencyAmount } from '@/shared/components/currency-amount';
import { useScreenReaderFocus } from '@/shared/accessibility/use-screen-reader-focus';

interface HistoryScreenProps {
  items: PeriodHistoryItem[];
  onBack: () => void;
  onEditExpense: (expenseId: string) => void;
}

export function HistoryScreen({ items, onBack, onEditExpense }: HistoryScreenProps) {
  const headingRef = useScreenReaderFocus();
  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1">
        <View className="px-6 pt-4">
          <Pressable
            accessibilityHint="Volta ao painel do orçamento"
            accessibilityLabel="Voltar ao painel"
            accessibilityRole="button"
            className="min-h-12 self-start items-center justify-center rounded-xl px-2 py-2"
            onPress={onBack}
          >
            <Text className="text-base font-semibold text-prisma-700">← Voltar</Text>
          </Pressable>
          <Text ref={headingRef} accessibilityRole="header" className="mt-5 text-3xl font-bold text-ink">Histórico</Text>
          <Text className="mt-2 text-base leading-6 text-muted">Cada período tem sua própria história.</Text>
        </View>
        <ScrollView className="mt-7" contentContainerClassName="gap-3 px-6 pb-8">
          {items.map(({ period, expenses, spentCents }) => (
            <View className="rounded-2xl border border-prisma-100 bg-surface p-5" key={period.id}>
              <Text accessibilityRole="header" className="text-lg font-bold leading-7 text-ink">{formatRange(period)}</Text>
              <Text className="mt-2 text-base leading-6 text-muted">Gasto: {formatBrl(spentCents)} de {formatBrl(period.limitCents)}</Text>
              <Text className="mt-1 text-base font-semibold leading-6 text-prisma-700">{formatRemaining(period.limitCents, spentCents)}</Text>

              <View className="mt-5 gap-2 border-t border-prisma-100 pt-4">
                {expenses.map((expense) => (
                  <Pressable
                    accessibilityHint="Abre esta despesa para edição"
                    accessibilityLabel={`${expense.description}, ${formatBrl(expense.amountCents)}, registrada em ${formatExpenseDate(expense.occurredAt)}`}
                    accessibilityRole="button"
                    className="min-h-14 flex-row items-center justify-between gap-4 rounded-xl px-2 py-3"
                    key={expense.id}
                    onPress={() => onEditExpense(expense.id)}
                  >
                    <View className="min-w-0 flex-1">
                      <Text accessible={false} className="text-base font-semibold leading-6 text-ink">{expense.description}</Text>
                      <Text accessible={false} className="mt-1 text-base leading-6 text-muted">{formatExpenseDate(expense.occurredAt)}</Text>
                    </View>
                    <CurrencyAmount accessible={false} allowWrap={false} cents={expense.amountCents} containerClassName="shrink-0" textClassName="text-base font-bold leading-6 text-ink" />
                  </Pressable>
                ))}
                {expenses.length === 0 && <Text className="py-2 text-base leading-6 text-muted">Nenhuma despesa registrada neste período.</Text>}
              </View>
            </View>
          ))}
          {items.length === 0 && <Text className="text-base leading-6 text-muted">Ainda não há períodos registrados.</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatRemaining(limitCents: number, spentCents: number): string {
  const availableCents = calculateAvailableCents(limitCents, spentCents);
  return availableCents >= 0 ? `Restaram ${formatBrl(availableCents)}` : `${formatBrl(Math.abs(availableCents))} acima do limite`;
}

function formatRange(period: BudgetPeriod): string {
  const format = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day, 12));
  };
  return `${format(period.startsOn)} — ${format(period.endsOn)}`;
}

function formatExpenseDate(occurredAt: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(occurredAt));
}

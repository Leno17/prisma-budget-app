import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BudgetPeriod, ExpenseTransaction } from '@/domain/entities';
import { calculateAvailableCents, formatBrl } from '@/domain/money';
import { BudgetRemainingRing } from '@/features/dashboard/budget-remaining-ring';
import { getBudgetStatus } from '@/features/dashboard/budget-status';
import { formatExpenseDateForAccessibility, formatRecentExpenseDate } from '@/features/dashboard/recent-expense-date';
import { CurrencyAmount } from '@/shared/components/currency-amount';
import { useScreenReaderFocus } from '@/shared/accessibility/use-screen-reader-focus';

interface DashboardScreenProps {
  period: BudgetPeriod;
  expenses: ExpenseTransaction[];
  spentCents: number;
  onAddExpense: () => void;
  onEditExpense: (expense: ExpenseTransaction) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function DashboardScreen({ period, expenses, spentCents, onAddExpense, onEditExpense, onOpenHistory, onOpenSettings }: DashboardScreenProps) {
  const headingRef = useScreenReaderFocus();
  const { fontScale } = useWindowDimensions();
  const availableCents = calculateAvailableCents(period.limitCents, spentCents);
  const budgetStatus = getBudgetStatus(period.limitCents, spentCents);
  const overageCents = Math.abs(Math.min(availableCents, 0));
  const usesStackedLayout = fontScale > 1.3;
  const recentExpenses = expenses.slice(0, 3);
  const statusText = budgetStatus.tone === 'exceeded' ? `${formatBrl(overageCents)} acima do limite` : budgetStatus.label;
  const statusColorClass = budgetStatus.tone === 'healthy' ? 'text-prisma-700' : budgetStatus.tone === 'warning' ? 'text-warning' : 'text-danger';
  const statusBackgroundClass = budgetStatus.tone === 'healthy' ? 'bg-prisma-700' : budgetStatus.tone === 'warning' ? 'bg-warning' : 'bg-danger';
  const statusSymbol = budgetStatus.tone === 'healthy' ? '✓' : '!';

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="px-6 pb-10 pt-5">
          <View className="flex-row items-center justify-between gap-4">
            <Text ref={headingRef} accessibilityRole="header" className="text-3xl font-bold text-prisma-700">PRISMA</Text>
            <Pressable
              accessibilityHint="Abre as configurações do orçamento"
              accessibilityLabel="Abrir configurações"
              accessibilityRole="button"
              className="min-h-12 items-center justify-center rounded-xl px-2 py-2"
              onPress={onOpenSettings}
            >
              <Text className="text-base font-semibold text-prisma-700">Ajustes</Text>
            </Pressable>
          </View>

          <Text className="mt-8 text-[17px] font-medium leading-6 text-muted">Disponível neste período</Text>
          <CurrencyAmount
            accessibilityLabel={`Disponível neste período: ${formatBrl(availableCents)}`}
            cents={availableCents}
            containerClassName="mt-1"
            textClassName={`text-[46px] font-bold leading-[54px] tracking-tight ${availableCents < 0 ? 'text-danger' : 'text-ink'}`}
          />
          <Text className="mt-3 text-base leading-6 text-muted">De {formatDate(period.startsOn)} a {formatDate(period.endsOn)}</Text>

          <View className="mt-7 rounded-3xl border border-prisma-100 bg-surface p-6">
            <BudgetRemainingRing status={budgetStatus} />
            <View className="mt-6 border-t border-prisma-100 pt-6">
              <View className={usesStackedLayout ? 'gap-5' : 'flex-row'}>
                <View className="min-w-0 flex-1">
                  <Text className="text-base font-medium leading-6 text-muted">Gasto até agora</Text>
                  <CurrencyAmount allowWrap={false} cents={spentCents} containerClassName="mt-2" textClassName="text-2xl font-bold leading-8 text-ink" />
                </View>
                <View className={usesStackedLayout ? 'min-w-0 flex-1 border-t border-prisma-100 pt-5' : 'min-w-0 flex-1 border-l border-prisma-100 pl-5'}>
                  <Text className="text-base font-medium leading-6 text-muted">Limite do período</Text>
                  <CurrencyAmount allowWrap={false} cents={period.limitCents} containerClassName="mt-2" textClassName="text-2xl font-bold leading-8 text-ink" />
                </View>
              </View>
              <View className="mt-6 flex-row items-center justify-center gap-2">
                <View accessible={false} className={`h-7 w-7 items-center justify-center rounded-full ${statusBackgroundClass}`}>
                  <Text accessible={false} className="text-base font-bold leading-5 text-white">{statusSymbol}</Text>
                </View>
                <Text className={`text-base font-semibold leading-6 ${statusColorClass}`}>{statusText}</Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityHint="Abre o formulário para registrar uma nova despesa"
            accessibilityRole="button"
            className="mt-5 min-h-14 items-center justify-center rounded-2xl bg-prisma-700 px-5 py-4"
            onPress={onAddExpense}
          >
            <Text className="text-lg font-bold text-white">Registrar despesa</Text>
          </Pressable>

          <View className={`mt-8 gap-3 ${usesStackedLayout ? 'items-start' : 'flex-row items-center justify-between'}`}>
            <Text accessibilityRole="header" className="text-xl font-bold leading-7 text-ink">Despesas recentes</Text>
            <Pressable
              accessibilityHint="Abre o histórico com todas as despesas"
              accessibilityLabel="Ver todas as despesas"
              accessibilityRole="button"
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-prisma-700 px-4 py-2"
              onPress={onOpenHistory}
            >
              <Text className="text-[17px] font-semibold leading-6 text-prisma-700">Ver todas</Text>
              <Text accessible={false} className="text-[28px] font-medium leading-7 text-prisma-700">›</Text>
            </Pressable>
          </View>
          <View className="mt-3 gap-2">
            {recentExpenses.map((expense) => (
              <Pressable
                accessibilityHint="Abre esta despesa para edição"
                accessibilityLabel={`${expense.description}, ${formatBrl(expense.amountCents)}, registrada em ${formatExpenseDateForAccessibility(expense.occurredAt)}`}
                accessibilityRole="button"
                className={`min-h-[72px] rounded-2xl border border-prisma-100 bg-surface p-4 ${usesStackedLayout ? '' : 'flex-row items-center justify-between gap-4'}`}
                key={expense.id}
                onPress={() => onEditExpense(expense)}
              >
                <View className="flex-1">
                  <Text accessible={false} className="text-[17px] font-semibold leading-6 text-ink">{expense.description}</Text>
                  <Text accessible={false} className="mt-1 text-base leading-6 text-muted">{formatRecentExpenseDate(expense.occurredAt)}</Text>
                </View>
                <CurrencyAmount accessible={false} cents={expense.amountCents} containerClassName={usesStackedLayout ? 'mt-3' : 'shrink-0'} textClassName="text-[17px] font-bold leading-6 text-ink" />
              </Pressable>
            ))}
            {expenses.length === 0 && <Text className="py-3 text-base leading-6 text-muted">Ainda não há despesas. Registre a primeira quando ela acontecer.</Text>}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(year, month - 1, day, 12));
}

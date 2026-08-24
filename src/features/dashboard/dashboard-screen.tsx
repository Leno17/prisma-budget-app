import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BudgetPeriod, ExpenseTransaction } from '@/domain/entities';
import { calculateAvailableCents, formatBrl } from '@/domain/money';

interface DashboardScreenProps {
  period: BudgetPeriod;
  expenses: ExpenseTransaction[];
  spentCents: number;
  onAddExpense: () => void;
  onEditExpense: (expense: ExpenseTransaction) => void;
  onOpenHistory: () => void;
}

export function DashboardScreen({ period, expenses, spentCents, onAddExpense, onEditExpense, onOpenHistory }: DashboardScreenProps) {
  const availableCents = calculateAvailableCents(period.limitCents, spentCents);
  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 px-6 pt-5">
        <View className="flex-row items-center justify-between"><Text accessibilityRole="header" className="text-3xl font-bold text-prisma-700">PRISMA</Text><Pressable accessibilityRole="button" onPress={onOpenHistory}><Text className="font-semibold text-prisma-700">Histórico</Text></Pressable></View>
        <Text className="mt-8 text-base font-medium text-muted">Disponível neste período</Text>
        <Text className={`mt-1 text-5xl font-bold tracking-tight ${availableCents < 0 ? 'text-danger' : 'text-ink'}`}>{formatBrl(availableCents)}</Text>
        <Text className="mt-3 text-sm text-muted">De {formatDate(period.startsOn)} a {formatDate(period.endsOn)}</Text>
        <View className="mt-7 rounded-3xl border border-prisma-100 bg-surface p-5"><Text className="text-sm text-muted">Gasto até agora</Text><Text className="mt-1 text-2xl font-bold text-ink">{formatBrl(spentCents)}</Text><Text className="mt-1 text-sm text-muted">de {formatBrl(period.limitCents)}</Text></View>
        <Pressable accessibilityRole="button" className="mt-5 items-center rounded-2xl bg-prisma-700 px-5 py-4" onPress={onAddExpense}><Text className="text-base font-bold text-white">Registrar despesa</Text></Pressable>
        <Text className="mt-8 text-lg font-bold text-ink">Despesas recentes</Text>
        <ScrollView className="mt-3" contentContainerClassName="gap-2 pb-8">
          {expenses.map((expense) => <Pressable accessibilityRole="button" className="rounded-2xl border border-prisma-100 bg-surface p-4" key={expense.id} onPress={() => onEditExpense(expense)}><View className="flex-row justify-between gap-3"><Text className="flex-1 text-base font-semibold text-ink">{expense.description}</Text><Text className="text-base font-bold text-ink">{formatBrl(expense.amountCents)}</Text></View></Pressable>)}
          {expenses.length === 0 && <Text className="py-3 text-base leading-6 text-muted">Ainda não há despesas. Registre a primeira quando ela acontecer.</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(year, month - 1, day, 12));
}

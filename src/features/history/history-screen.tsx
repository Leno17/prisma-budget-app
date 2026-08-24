import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BudgetPeriod } from '@/domain/entities';
import { calculateAvailableCents, formatBrl } from '@/domain/money';

export interface PeriodHistoryItem { period: BudgetPeriod; spentCents: number; }

interface HistoryScreenProps { items: PeriodHistoryItem[]; onBack: () => void; }

export function HistoryScreen({ items, onBack }: HistoryScreenProps) {
  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 px-6 pt-4">
        <Pressable accessibilityRole="button" className="self-start py-2" onPress={onBack}><Text className="text-base font-semibold text-prisma-700">← Voltar</Text></Pressable>
        <Text accessibilityRole="header" className="mt-6 text-3xl font-bold text-ink">Histórico</Text>
        <Text className="mt-2 text-base text-muted">Cada período tem sua própria história.</Text>
        <ScrollView className="mt-7" contentContainerClassName="gap-3 pb-8">
          {items.map(({ period, spentCents }) => (
            <View className="rounded-2xl border border-prisma-100 bg-surface p-5" key={period.id}>
              <Text className="text-base font-bold text-ink">{formatRange(period)}</Text>
              <Text className="mt-2 text-sm text-muted">Gasto: {formatBrl(spentCents)} de {formatBrl(period.limitCents)}</Text>
              <Text className="mt-1 text-sm font-semibold text-prisma-700">Restaram {formatBrl(calculateAvailableCents(period.limitCents, spentCents))}</Text>
            </View>
          ))}
          {items.length === 0 && <Text className="text-base text-muted">Ainda não há períodos registrados.</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatRange(period: BudgetPeriod): string {
  const format = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day, 12));
  };
  return `${format(period.startsOn)} — ${format(period.endsOn)}`;
}

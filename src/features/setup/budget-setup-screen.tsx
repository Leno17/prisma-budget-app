import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseBrlToCents } from '@/domain/parse-money';

interface BudgetSetupScreenProps {
  onSubmit: (input: { limitCents: number; renewalDay: number }) => Promise<void>;
}

const renewalDays = [1, 5, 10, 15, 20, 25, 30];

export function BudgetSetupScreen({ onSubmit }: BudgetSetupScreenProps) {
  const [limit, setLimit] = useState('');
  const [renewalDay, setRenewalDay] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setError(null);
      setIsSaving(true);
      await onSubmit({ limitCents: parseBrlToCents(limit), renewalDay });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível criar seu orçamento.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 px-6">
        <View className="flex-1 justify-center">
          <Text accessibilityRole="header" className="text-4xl font-bold tracking-tight text-prisma-700">PRISMA</Text>
          <Text className="mt-7 text-3xl font-bold leading-9 text-ink">Vamos cuidar do seu dinheiro com calma.</Text>
          <Text className="mt-3 text-base leading-6 text-muted">Defina um limite para o período. Você poderá registrar cada gasto no seu tempo.</Text>

          <View className="mt-9">
            <Text className="text-sm font-semibold text-ink">Limite do período</Text>
            <TextInput
              accessibilityLabel="Limite do período em reais"
              className="mt-2 rounded-2xl border border-prisma-100 bg-surface px-4 py-4 text-xl font-semibold text-ink"
              keyboardType="decimal-pad"
              onChangeText={setLimit}
              placeholder="Ex.: 1.500,00"
              placeholderTextColor="#718096"
              value={limit}
            />
          </View>

          <View className="mt-7">
            <Text className="text-sm font-semibold text-ink">O limite renova em qual dia?</Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {renewalDays.map((day) => {
                const selected = day === renewalDay;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`min-w-12 rounded-xl px-4 py-3 ${selected ? 'bg-prisma-700' : 'border border-prisma-100 bg-surface'}`}
                    key={day}
                    onPress={() => setRenewalDay(day)}
                  >
                    <Text className={`text-center font-semibold ${selected ? 'text-white' : 'text-ink'}`}>Dia {day}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mt-3 text-sm leading-5 text-muted">Se o mês não tiver esse dia, a renovação acontece no último dia dele.</Text>
          </View>

          {error && <Text accessibilityRole="alert" className="mt-5 text-sm font-medium text-danger">{error}</Text>}

          <Pressable
            accessibilityRole="button"
            className="mt-8 items-center rounded-2xl bg-prisma-700 px-5 py-4 disabled:opacity-60"
            disabled={isSaving}
            onPress={handleSubmit}
          >
            {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-base font-bold text-white">Criar meu orçamento</Text>}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

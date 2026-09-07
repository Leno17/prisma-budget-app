import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseBrlToCents } from '@/domain/parse-money';
import { useScreenReaderFocus, useScreenReaderFocusWhen } from '@/shared/accessibility/use-screen-reader-focus';

interface BudgetSetupScreenProps {
  onSubmit: (input: { limitCents: number; renewalDay: number }) => Promise<void>;
}

const renewalDays = [1, 5, 10, 15, 20, 25, 30];

export function BudgetSetupScreen({ onSubmit }: BudgetSetupScreenProps) {
  const headingRef = useScreenReaderFocus();
  const [limit, setLimit] = useState('');
  const [renewalDay, setRenewalDay] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useScreenReaderFocusWhen(Boolean(error));

  async function handleSubmit() {
    try {
      setError(null);
      setIsSaving(true);
      await onSubmit({ limitCents: parseBrlToCents(limit, 'O limite do período'), renewalDay });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível criar seu orçamento.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerClassName="px-6 pb-10 pt-5" keyboardShouldPersistTaps="handled">
            <Text accessibilityRole="header" className="text-3xl font-bold tracking-tight text-prisma-700">PRISMA</Text>
            <Text ref={headingRef} accessibilityRole="header" className="mt-7 text-3xl font-bold leading-9 text-ink">Vamos cuidar do seu dinheiro com calma.</Text>
            <Text className="mt-3 text-base leading-6 text-muted">Defina um limite para o período. Você poderá registrar cada gasto no seu tempo.</Text>

            <View className="mt-8">
              <Text className="text-base font-semibold text-ink">Limite do período</Text>
              <TextInput
                accessibilityHint="Informe o valor máximo que deseja gastar neste período"
                accessibilityLabel="Limite do período em reais"
                className="mt-2 rounded-2xl border border-prisma-700 bg-surface px-4 py-4 text-xl font-semibold text-ink"
                keyboardType="decimal-pad"
                onChangeText={(value) => {
                  setLimit(value);
                  if (error) setError(null);
                }}
                placeholder="Ex.: 1.500,00"
                placeholderTextColor="#5E6B79"
                value={limit}
              />
            </View>

            <View className="mt-8">
              <Text className="text-base font-semibold text-ink">O limite renova em qual dia?</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {renewalDays.map((day) => {
                  const selected = day === renewalDay;
                  return (
                    <Pressable
                      accessibilityLabel={`Dia ${day}`}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={`min-h-12 min-w-12 items-center justify-center rounded-xl px-4 py-3 ${selected ? 'bg-prisma-700' : 'border border-prisma-700 bg-surface'}`}
                      key={day}
                      onPress={() => {
                        setRenewalDay(day);
                        if (error) setError(null);
                      }}
                    >
                      <Text className={`text-center text-base font-semibold ${selected ? 'text-white' : 'text-ink'}`}>Dia {day}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="mt-3 text-base leading-6 text-muted">Se o mês não tiver esse dia, a renovação acontece no último dia dele.</Text>
            </View>

            {error && <Text ref={errorRef} accessibilityLiveRegion="assertive" accessibilityRole="alert" className="mt-6 text-base font-semibold leading-6 text-danger">{error}</Text>}

            <Pressable
              accessibilityHint="Cria o orçamento com o limite e o dia de renovação escolhidos"
              accessibilityLabel="Criar meu orçamento"
              accessibilityRole="button"
              accessibilityState={{ busy: isSaving, disabled: isSaving }}
              className="mt-8 min-h-14 items-center justify-center rounded-2xl bg-prisma-700 px-5 py-4 disabled:opacity-60"
              disabled={isSaving}
              onPress={handleSubmit}
            >
              {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-lg font-bold text-white">Criar meu orçamento</Text>}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

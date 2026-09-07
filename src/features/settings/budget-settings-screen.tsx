import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppSettings } from '@/domain/entities';
import { formatBrl } from '@/domain/money';
import { parseBrlToCents } from '@/domain/parse-money';
import { useScreenReaderFocus, useScreenReaderFocusWhen } from '@/shared/accessibility/use-screen-reader-focus';

interface BudgetSettingsScreenProps {
  settings: AppSettings;
  onBack: () => void;
  onDeleteAllData: () => Promise<void>;
  onSubmit: (input: { limitCents: number; renewalDay: number }) => Promise<void>;
}

const renewalDays = [1, 5, 10, 15, 20, 25, 30];

export function BudgetSettingsScreen({ settings, onBack, onDeleteAllData, onSubmit }: BudgetSettingsScreenProps) {
  const headingRef = useScreenReaderFocus();
  const [limit, setLimit] = useState(formatBrl(settings.defaultLimitCents).replace(/^R\$\s*/, ''));
  const [renewalDay, setRenewalDay] = useState(settings.pendingRenewalDay ?? settings.renewalDay);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useScreenReaderFocusWhen(Boolean(error));
  const isBusy = isSaving || isDeleting;

  async function save() {
    try {
      setError(null);
      setIsSaving(true);
      await onSubmit({ limitCents: parseBrlToCents(limit, 'O limite do período'), renewalDay });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível atualizar o orçamento.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAllData() {
    try {
      setError(null);
      setIsDeleting(true);
      await onDeleteAllData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível apagar seus dados locais.');
    } finally {
      setIsDeleting(false);
    }
  }

  function confirmDataDeletion() {
    Alert.alert(
      'Apagar todos os dados do Prisma?',
      'Seu orçamento, todas as despesas e todo o histórico serão apagados permanentemente deste aparelho. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar dados', style: 'destructive', onPress: removeAllData },
      ],
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView contentContainerClassName="px-6 pb-10 pt-4" keyboardShouldPersistTaps="handled">
            <Pressable
              accessibilityHint="Volta ao painel do orçamento"
              accessibilityLabel="Voltar ao painel"
              accessibilityRole="button"
              className="min-h-12 self-start items-center justify-center rounded-xl px-2 py-2"
              onPress={onBack}
            >
              <Text className="text-base font-semibold text-prisma-700">← Voltar</Text>
            </Pressable>

            <Text ref={headingRef} accessibilityRole="header" className="mt-5 text-3xl font-bold leading-9 text-ink">Configurações</Text>
            <Text className="mt-2 text-base leading-6 text-muted">Ajuste o limite e o dia de renovação do seu orçamento.</Text>

            <View className="mt-8">
              <Text className="text-base font-semibold text-ink">Limite do período</Text>
              <TextInput
                accessibilityHint="Informe o valor máximo que deseja gastar neste período"
                accessibilityLabel="Limite do período em reais"
                className="mt-2 rounded-2xl border border-prisma-700 bg-surface px-4 py-4 text-xl font-semibold text-ink"
                keyboardType="decimal-pad"
                onChangeText={setLimit}
                placeholder="Ex.: 1.500,00"
                placeholderTextColor="#5E6B79"
                value={limit}
              />
              <Text className="mt-3 text-base leading-6 text-muted">O novo limite vale imediatamente neste período.</Text>
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
                      onPress={() => setRenewalDay(day)}
                    >
                      <Text className={`text-center text-base font-semibold ${selected ? 'text-white' : 'text-ink'}`}>Dia {day}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="mt-3 text-base leading-6 text-muted">Uma alteração no dia de renovação passa a valer no próximo período.</Text>
              {settings.pendingRenewalDay !== null && (
                <Text className="mt-3 text-base font-medium leading-6 text-prisma-700">Há uma alteração agendada para o dia {settings.pendingRenewalDay}.</Text>
              )}
            </View>

            {error && <Text ref={errorRef} accessibilityLiveRegion="assertive" accessibilityRole="alert" className="mt-6 text-base font-semibold leading-6 text-danger">{error}</Text>}

            <Pressable
              accessibilityHint="Salva as alterações do orçamento"
              accessibilityLabel="Salvar alterações"
              accessibilityRole="button"
              accessibilityState={{ busy: isSaving, disabled: isBusy }}
              className="mt-8 min-h-14 items-center justify-center rounded-2xl bg-prisma-700 px-5 py-4 disabled:opacity-60"
              disabled={isBusy}
              onPress={save}
            >
              {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-lg font-bold text-white">Salvar alterações</Text>}
            </Pressable>

            <View className="mt-10 border-t border-danger pt-8">
              <Text accessibilityRole="header" className="text-xl font-bold leading-7 text-ink">Privacidade e dados</Text>
              <Text className="mt-2 text-base leading-6 text-muted">
                Apague permanentemente o orçamento, as despesas e o histórico salvos neste aparelho.
              </Text>
              <Pressable
                accessibilityHint="Abre uma confirmação antes de apagar permanentemente todos os dados do Prisma"
                accessibilityLabel="Apagar todos os dados"
                accessibilityRole="button"
                accessibilityState={{ busy: isDeleting, disabled: isBusy }}
                className="mt-5 min-h-14 items-center justify-center rounded-2xl border-2 border-danger bg-surface px-5 py-4 disabled:opacity-60"
                disabled={isBusy}
                onPress={confirmDataDeletion}
              >
                {isDeleting ? <ActivityIndicator color="#C93C38" /> : <Text className="text-lg font-bold text-danger">Apagar todos os dados</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ExpenseTransaction } from '@/domain/entities';
import { formatBrl } from '@/domain/money';
import { parseBrlToCents } from '@/domain/parse-money';
import { useScreenReaderFocus, useScreenReaderFocusWhen } from '@/shared/accessibility/use-screen-reader-focus';

interface ExpenseFormScreenProps {
  expense?: ExpenseTransaction;
  onBack: () => void;
  onDelete?: () => Promise<void>;
  onSubmit: (input: { amountCents: number; description: string }) => Promise<void>;
}

export function ExpenseFormScreen({ expense, onBack, onDelete, onSubmit }: ExpenseFormScreenProps) {
  const headingRef = useScreenReaderFocus();
  const [amount, setAmount] = useState(expense ? formatBrl(expense.amountCents).replace('R$ ', '') : '');
  const [description, setDescription] = useState(expense?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useScreenReaderFocusWhen(Boolean(error));

  async function save() {
    try {
      const trimmedDescription = description.trim();
      if (!trimmedDescription) throw new Error('Descreva esta despesa antes de continuar.');
      setError(null);
      setIsSaving(true);
      await onSubmit({ amountCents: parseBrlToCents(amount, 'O valor da despesa'), description: trimmedDescription });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível salvar esta despesa.');
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!onDelete) return;
    try {
      setError(null);
      setIsSaving(true);
      await onDelete();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir esta despesa.');
      setIsSaving(false);
    }
  }

  function confirmRemoval() {
    Alert.alert(
      'Excluir despesa?',
      'Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => { void remove(); } },
      ],
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView contentContainerClassName="px-6 pb-10 pt-4" keyboardShouldPersistTaps="handled">
            <Pressable
              accessibilityHint="Volta à tela anterior"
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              className="min-h-12 self-start items-center justify-center rounded-xl px-2 py-2"
              onPress={onBack}
            >
              <Text className="text-base font-semibold text-prisma-700">← Voltar</Text>
            </Pressable>
            <Text ref={headingRef} accessibilityRole="header" className="mt-5 text-3xl font-bold leading-9 text-ink">{expense ? 'Editar despesa' : 'Registrar despesa'}</Text>
            <Text className="mt-2 text-base leading-6 text-muted">Pare um instante: o que foi essa compra?</Text>

            <View className="mt-8">
              <Text className="text-base font-semibold text-ink">Valor</Text>
              <TextInput
                accessibilityHint="Informe o valor pago em reais"
                accessibilityLabel="Valor da despesa em reais"
                className="mt-2 rounded-2xl border border-prisma-700 bg-surface px-4 py-4 text-xl font-semibold text-ink"
                keyboardType="decimal-pad"
                onChangeText={setAmount}
                placeholder="Ex.: 42,50"
                placeholderTextColor="#5E6B79"
                value={amount}
              />
            </View>
            <View className="mt-7">
              <Text className="text-base font-semibold text-ink">Descrição</Text>
              <TextInput
                accessibilityHint="Descreva a compra para registrá-la"
                accessibilityLabel="Descrição da despesa"
                className="mt-2 min-h-28 rounded-2xl border border-prisma-700 bg-surface px-4 py-4 align-top text-base leading-6 text-ink"
                multiline
                onChangeText={setDescription}
                placeholder="Ex.: Almoço no trabalho"
                placeholderTextColor="#5E6B79"
                textAlignVertical="top"
                value={description}
              />
            </View>
            {error && <Text ref={errorRef} accessibilityLiveRegion="assertive" accessibilityRole="alert" className="mt-6 text-base font-semibold leading-6 text-danger">{error}</Text>}
            <Pressable
              accessibilityHint="Salva esta despesa"
              accessibilityRole="button"
              className="mt-8 min-h-14 items-center justify-center rounded-2xl bg-prisma-700 px-5 py-4 disabled:opacity-60"
              disabled={isSaving}
              onPress={save}
            >
              {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-lg font-bold text-white">Salvar despesa</Text>}
            </Pressable>
            {expense && (
              <Pressable
                accessibilityHint="Pede confirmação antes de excluir esta despesa"
                accessibilityRole="button"
                className="mt-4 min-h-12 items-center justify-center rounded-xl px-4 py-3 disabled:opacity-60"
                disabled={isSaving}
                onPress={confirmRemoval}
              >
                <Text className="text-base font-semibold text-danger">Excluir despesa</Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ExpenseTransaction } from '@/domain/entities';
import { formatBrl } from '@/domain/money';
import { parseBrlToCents } from '@/domain/parse-money';

interface ExpenseFormScreenProps {
  expense?: ExpenseTransaction;
  onBack: () => void;
  onDelete?: () => Promise<void>;
  onSubmit: (input: { amountCents: number; description: string }) => Promise<void>;
}

export function ExpenseFormScreen({ expense, onBack, onDelete, onSubmit }: ExpenseFormScreenProps) {
  const [amount, setAmount] = useState(expense ? formatBrl(expense.amountCents).replace('R$ ', '') : '');
  const [description, setDescription] = useState(expense?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    try {
      const trimmedDescription = description.trim();
      if (!trimmedDescription) throw new Error('Descreva esta despesa antes de continuar.');
      setError(null);
      setIsSaving(true);
      await onSubmit({ amountCents: parseBrlToCents(amount), description: trimmedDescription });
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

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 px-6 pt-4">
        <Pressable accessibilityRole="button" className="self-start py-2" onPress={onBack}><Text className="text-base font-semibold text-prisma-700">← Voltar</Text></Pressable>
        <Text accessibilityRole="header" className="mt-6 text-3xl font-bold text-ink">{expense ? 'Editar despesa' : 'Registrar despesa'}</Text>
        <Text className="mt-2 text-base leading-6 text-muted">Pare um instante: o que foi essa compra?</Text>

        <View className="mt-9">
          <Text className="text-sm font-semibold text-ink">Valor</Text>
          <TextInput accessibilityLabel="Valor da despesa" className="mt-2 rounded-2xl border border-prisma-100 bg-surface px-4 py-4 text-xl font-semibold text-ink" keyboardType="decimal-pad" onChangeText={setAmount} placeholder="Ex.: 42,50" placeholderTextColor="#718096" value={amount} />
        </View>
        <View className="mt-6">
          <Text className="text-sm font-semibold text-ink">Descrição</Text>
          <TextInput accessibilityLabel="Descrição da despesa" className="mt-2 min-h-28 rounded-2xl border border-prisma-100 bg-surface px-4 py-4 align-top text-base text-ink" multiline onChangeText={setDescription} placeholder="Ex.: Almoço no trabalho" placeholderTextColor="#718096" textAlignVertical="top" value={description} />
        </View>
        {error && <Text accessibilityRole="alert" className="mt-5 text-sm font-medium text-danger">{error}</Text>}
        <Pressable accessibilityRole="button" className="mt-8 items-center rounded-2xl bg-prisma-700 px-5 py-4 disabled:opacity-60" disabled={isSaving} onPress={save}>
          {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-base font-bold text-white">Salvar despesa</Text>}
        </Pressable>
        {expense && <Pressable accessibilityRole="button" className="mt-4 items-center py-3 disabled:opacity-60" disabled={isSaving} onPress={remove}><Text className="text-base font-semibold text-danger">Excluir despesa</Text></Pressable>}
      </SafeAreaView>
    </View>
  );
}

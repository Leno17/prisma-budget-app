import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppStore } from '@/state/app-store';

export default function FoundationScreen() {
  const databaseStatus = useAppStore((state) => state.databaseStatus);
  const databaseError = useAppStore((state) => state.databaseError);

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 justify-center px-6">
        <View className="rounded-3xl border border-prisma-100 bg-surface p-6">
          <Text accessibilityRole="header" className="text-3xl font-bold text-prisma-700">PRISMA</Text>
          <Text className="mt-3 text-xl font-semibold text-ink">Fundação pronta</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            O banco de dados local, os períodos orçamentários e os contratos do domínio estão preparados para a próxima etapa.
          </Text>
          {(databaseStatus === 'loading' || databaseStatus === 'idle') && (
            <View className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator color="#0FAF9E" />
              <Text className="text-sm text-muted">Preparando os dados locais…</Text>
            </View>
          )}
          {databaseStatus === 'ready' && (
            <Text className="mt-6 text-sm font-semibold text-prisma-700">Dados locais prontos.</Text>
          )}
          {databaseStatus === 'error' && (
            <Text className="mt-6 text-sm font-semibold text-danger">{databaseError}</Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

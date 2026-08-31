import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScreenReaderFocus } from '@/shared/accessibility/use-screen-reader-focus';

interface RouteStateScreenProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  status: 'loading' | 'error';
}

export function RouteStateScreen({ title, message, onRetry, status }: RouteStateScreenProps) {
  const headingRef = useScreenReaderFocus();
  const isLoading = status === 'loading';

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 justify-center px-6">
        <View className="rounded-3xl border border-prisma-100 bg-surface p-6">
          <Text ref={headingRef} accessibilityRole="header" className="text-2xl font-bold leading-8 text-ink">{title}</Text>
          {message && <Text accessibilityRole={isLoading ? undefined : 'alert'} className={`mt-3 text-base leading-6 ${isLoading ? 'text-muted' : 'text-danger'}`}>{message}</Text>}
          {isLoading && <ActivityIndicator className="mt-6 self-start" color="#087267" size="large" />}
          {!isLoading && onRetry && (
            <Pressable accessibilityRole="button" className="mt-6 min-h-12 items-center justify-center rounded-2xl bg-prisma-700 px-5 py-3" onPress={onRetry}>
              <Text className="text-[17px] font-bold text-white">Tentar novamente</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

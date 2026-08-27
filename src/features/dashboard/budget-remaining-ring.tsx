import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import type { BudgetStatus } from '@/features/dashboard/budget-status';

interface BudgetRemainingRingProps {
  status: BudgetStatus;
}

const ringSize = 160;
const strokeWidth = 12;
const radius = (ringSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const colorsByTone = {
  healthy: '#087267',
  warning: '#8A5A12',
  'limit-reached': '#C93C38',
  exceeded: '#C93C38',
} as const;

export function BudgetRemainingRing({ status }: BudgetRemainingRingProps) {
  const progressOffset = circumference * (1 - status.availablePercentage / 100);
  const ringColor = colorsByTone[status.tone];

  return (
    <View className="items-center">
      <View
        accessible
        accessibilityLabel={`${status.availablePercentage}% do orçamento permanece disponível. ${status.label}.`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: status.availablePercentage }}
        className="relative h-40 w-40 items-center justify-center"
      >
        <Svg accessibilityElementsHidden height={ringSize} width={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
          <Circle cx={ringSize / 2} cy={ringSize / 2} fill="none" r={radius} stroke="#E5ECEA" strokeWidth={strokeWidth} />
          {status.availablePercentage > 0 && (
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              fill="none"
              r={radius}
              stroke={ringColor}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          )}
        </Svg>
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <Text accessible={false} className="w-full text-center text-[36px] font-bold leading-10 text-ink">{status.availablePercentage}%</Text>
        </View>
      </View>
      <Text accessible={false} className="mt-3 text-center text-base font-medium leading-6 text-muted">
        ainda disponível
      </Text>
    </View>
  );
}

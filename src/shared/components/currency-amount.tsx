import { Text, View } from 'react-native';

import { formatBrl } from '@/domain/money';

interface CurrencyAmountProps {
  cents: number;
  accessibilityLabel?: string;
  allowWrap?: boolean;
  containerClassName?: string;
  textClassName: string;
}

export function CurrencyAmount({ cents, accessibilityLabel, allowWrap = true, containerClassName = '', textClassName }: CurrencyAmountProps) {
  const amountGroups = formatBrl(Math.abs(cents)).replace(/^R\$\s*/, '').split('.');

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? formatBrl(cents)}
      accessibilityRole="text"
      className={`flex-row ${allowWrap ? 'flex-wrap' : 'flex-nowrap'} items-baseline ${containerClassName}`}
    >
      <Text accessible={false} className={`${textClassName} mr-2`}>{cents < 0 ? '-R$' : 'R$'}</Text>
      {amountGroups.map((group, index) => (
        <Text accessible={false} className={textClassName} key={`${group}-${index}`}>
          {index < amountGroups.length - 1 ? `${group}.` : group}
        </Text>
      ))}
    </View>
  );
}

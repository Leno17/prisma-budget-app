import { colors } from '@/shared/theme/tokens';

const wcagAaNormalTextRatio = 4.5;

describe('accessible color contrast', () => {
  it.each([
    ['primary text on canvas', colors.primaryDark, colors.canvas],
    ['muted text on canvas', colors.muted, colors.canvas],
    ['danger text on canvas', colors.danger, colors.canvas],
    ['warning text on canvas', colors.warning, colors.canvas],
    ['white text on primary buttons', colors.surface, colors.primaryDark],
    ['white text on destructive status', colors.surface, colors.danger],
    ['white text on warning status', colors.surface, colors.warning],
  ])('%s meets WCAG AA for normal text', (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(wcagAaNormalTextRatio);
  });
});

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((left, right) => right - left);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = [1, 3, 5]
    .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

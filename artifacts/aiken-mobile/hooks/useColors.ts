import { useColorScheme } from 'react-native';
import colors, { Palette } from '@/constants/colors';

/** Returns the AIken palette for the current light/dark appearance. */
export function useColors(): Palette & { radius: number; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { ...(isDark ? colors.dark : colors.light), radius: colors.radius, isDark };
}

import React from 'react';
import { Image } from 'react-native';
import { useColors } from '@/hooks/useColors';

/** AIken wordmark. Uses the cream version on dark backgrounds. */
export function Logo({ width = 200 }: { width?: number }) {
  const c = useColors();
  return (
    <Image
      source={c.isDark ? require('@/assets/images/aiken-logo-dark.png') : require('@/assets/images/aiken-logo.png')}
      style={{ width, height: (width * 254) / 690 }}
      resizeMode="contain"
      accessibilityLabel="AIken"
    />
  );
}

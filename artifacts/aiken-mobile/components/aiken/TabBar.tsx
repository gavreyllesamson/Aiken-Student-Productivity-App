import React, { useEffect } from 'react';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Orb, PressScale, SPRING, T, type IconName } from './kit';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Home', icon: 'home' },
  schedule: { label: 'Schedule', icon: 'calendar' },
  ask: { label: 'Ask Alken', icon: 'message-circle' },
  concerns: { label: 'Concerns', icon: 'help-circle' },
  library: { label: 'Library', icon: 'book-open' },
};

export const TAB_BAR_HEIGHT = 70;
type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Floating glass tab bar with the raised Ask Alken orb in the middle. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: Math.max(insets.bottom, 12),
        height: TAB_BAR_HEIGHT,
        borderRadius: 35,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        shadowColor: '#502823',
        shadowOpacity: c.isDark ? 0.4 : 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      }}
    >
      <View style={[StyleSheet.absoluteFill, { borderRadius: 35, overflow: 'hidden' }]}>
        <BlurView intensity={40} tint={c.blurTint} style={StyleSheet.absoluteFill} />
      </View>
      {state.routes.map((route, i) => {
        const meta = TABS[route.name];
        if (!meta) return null;
        const focused = state.index === i;
        const onPress = () => {
          Haptics.selectionAsync().catch(() => {});
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };
        if (route.name === 'ask') {
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center', marginTop: -40 }}>
              <PressScale onPress={onPress} haptic={false} scaleTo={0.9} accessibilityRole="tab" accessibilityLabel="Ask Alken" accessibilityState={{ selected: focused }}>
                <View style={{ borderRadius: 37, shadowColor: '#D93A2E', shadowOpacity: 0.35, shadowRadius: 13, shadowOffset: { width: 0, height: 10 } }}>
                  <Orb size={74} ring={7} />
                </View>
              </PressScale>
            </View>
          );
        }
        return <TabItem key={route.key} label={meta.label} icon={meta.icon} focused={focused} onPress={onPress} />;
      })}
    </View>
  );
}

/** One tab: the yellow pill springs in when it becomes active. */
function TabItem({ label, icon, focused, onPress }: { label: string; icon: IconName; focused: boolean; onPress: () => void }) {
  const c = useColors();
  const v = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    v.value = withSpring(focused ? 1 : 0, SPRING);
  }, [focused, v]);
  const pill = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: interpolate(v.value, [0, 1], [0.7, 1]) }] }));
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(v.value, [0, 1], [0, -1]) }, { scale: interpolate(v.value, [0, 1], [1, 1.06]) }] }));
  return (
    <PressScale onPress={onPress} haptic={false} scaleTo={0.92} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: focused }} style={{ flex: 1, paddingHorizontal: 3 }}>
      <View style={{ height: 54, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 22, backgroundColor: c.yellowPill }, pill]} />
        <Animated.View style={lift}>
          <Feather name={icon} size={21} color={focused ? '#0B0B0B' : c.muted} />
        </Animated.View>
        <T size={11} w={focused ? 800 : 600} color={focused ? '#0B0B0B' : c.muted}>
          {label}
        </T>
      </View>
    </PressScale>
  );
}

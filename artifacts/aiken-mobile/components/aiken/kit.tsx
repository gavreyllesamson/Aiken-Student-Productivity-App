import React from 'react';
import {
  KeyboardTypeOptions,
  Modal,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  LinearTransition,
  SlideInDown,
  ZoomIn,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { FONT, Weight } from '@/constants/fonts';
import { useColors } from '@/hooks/useColors';

export type IconName = React.ComponentProps<typeof Feather>['name'];
type C = ReturnType<typeof useColors>;
type ColorKey = keyof C;

export const GRAD = ['#C42F25', '#F0624A'] as const;
export const ORB_GRAD = ['#D63A2C', '#E9763A', '#F6C95C'] as const;

const tap = () => {
  Haptics.selectionAsync().catch(() => {});
};

/* ---------- Motion ---------- */
export const SPRING = { damping: 18, stiffness: 320, mass: 0.6 } as const;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressable that springs down on touch and back on release, with a light haptic. */
export function PressScale({
  children,
  onPress,
  scaleTo = 0.97,
  style,
  haptic = true,
  ...rest
}: Omit<PressableProps, 'style' | 'children' | 'onPress'> & {
  children: React.ReactNode;
  onPress?: () => void;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
}) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => { s.value = withSpring(scaleTo, SPRING); rest.onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, SPRING); rest.onPressOut?.(e); }}
      onPress={() => { if (haptic) tap(); onPress?.(); }}
      style={[style, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** Staggered fade-up used when a screen's sections first appear. */
export const enter = (i: number) => FadeInDown.delay(Math.min(i, 8) * 40).duration(320);

/* ---------- Text ---------- */
export function T({
  children,
  size = 14,
  w = 400,
  color = 'text',
  style,
  lines,
  center,
}: {
  children: React.ReactNode;
  size?: number;
  w?: Weight;
  color?: ColorKey | string;
  style?: StyleProp<TextStyle>;
  lines?: number;
  center?: boolean;
}) {
  const c = useColors();
  const resolved = (c as Record<string, unknown>)[color as string];
  return (
    <Text
      numberOfLines={lines}
      style={[
        {
          fontFamily: FONT[w],
          fontSize: size,
          color: typeof resolved === 'string' ? resolved : (color as string),
          lineHeight: Math.round(size * 1.35),
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export const Icon = ({ name, size = 20, color }: { name: IconName; size?: number; color?: string }) => {
  const c = useColors();
  return <Feather name={name} size={size} color={color ?? c.text} />;
};

/* ---------- Background ---------- */
/** Splits "rgba(r,g,b,a)" into a solid color and an opacity, which SVG stops handle reliably on iOS and Android. */
function stop(rgba: string) {
  const m = rgba.match(/rgba?\(([^)]+)\)/);
  if (!m) return { color: rgba, opacity: 1 };
  const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim());
  return { color: `rgb(${r},${g},${b})`, opacity: Number(a) };
}

export function Glow() {
  const c = useColors();
  const g = [stop(c.glowA), stop(c.glowB), stop(c.glowC)];
  // Each screen needs its own ids: on web, several screens stay mounted and a shared id would point at a hidden one.
  const uid = 'glow' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          {g.map((x, i) => (
            <RadialGradient key={i} id={`${uid}${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={x.color} stopOpacity={x.opacity} />
              <Stop offset="1" stopColor={x.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        <Circle cx="105%" cy="2%" r="280" fill={`url(#${uid}0)`} />
        <Circle cx="-5%" cy="55%" r="310" fill={`url(#${uid}1)`} />
        <Circle cx="100%" cy="95%" r="280" fill={`url(#${uid}2)`} />
      </Svg>
    </View>
  );
}

/** Children as a flat list, with fragments opened up so each section keeps the screen's gap. */
function flatten(children: React.ReactNode, prefix = ''): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  React.Children.toArray(children).forEach((child) => {
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
      out.push(...flatten(child.props.children, `${prefix}${String(child.key)}/`));
    } else if (child) {
      out.push(React.isValidElement(child) ? React.cloneElement(child, { key: `${prefix}${String(child.key)}` }) : child);
    }
  });
  return out;
}

/** Full screen with brand glow, safe area, staggered entry and a status-bar backdrop on scroll. */
export function Screen({
  children,
  scroll = true,
  tabs = false,
  footer,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  tabs?: boolean;
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const backdrop = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [0, 40], [0, 1], Extrapolation.CLAMP) }));
  const pad: ViewStyle = {
    paddingTop: insets.top + 12,
    paddingHorizontal: 20,
    paddingBottom: (tabs ? 120 : 32) + insets.bottom + (footer ? 70 : 0),
    gap: 14,
  };
  const items = flatten(children);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Glow />
      {scroll ? (
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[pad, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          decelerationRate="normal"
        >
          {items.map((child, i) => (
            <Animated.View key={React.isValidElement(child) && child.key != null ? child.key : i} entering={enter(i)} layout={LinearTransition.duration(220)}>
              {child}
            </Animated.View>
          ))}
        </Animated.ScrollView>
      ) : (
        <Animated.View entering={FadeIn.duration(260)} style={[{ flex: 1 }, pad, contentStyle]}>
          {children}
        </Animated.View>
      )}
      {scroll ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 4, backgroundColor: c.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider }, backdrop]}
        />
      ) : null}
      {footer ? (
        <Animated.View entering={FadeInDown.delay(120).duration(320)} style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + (tabs ? 100 : 16) }}>
          {footer}
        </Animated.View>
      ) : null}
    </View>
  );
}

/* ---------- Glass ---------- */
export function Glass({
  children,
  style,
  radius = 24,
  onPress,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  onPress?: () => void;
}) {
  const c = useColors();
  const body = (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.border,
          overflow: 'hidden',
          shadowColor: '#502823',
          shadowOpacity: c.isDark ? 0 : 0.1,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return body;
  return (
    <PressScale onPress={onPress} scaleTo={0.985}>
      {body}
    </PressScale>
  );
}

export function Card({ children, style, gap = 12, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number; onPress?: () => void }) {
  return (
    <Glass style={[{ padding: 16, gap }, style]} onPress={onPress}>
      {children}
    </Glass>
  );
}

/* ---------- Buttons ---------- */
type BtnKind = 'grad' | 'glass' | 'ink' | 'red' | 'outline' | 'text';
export function Button({
  label,
  onPress,
  kind = 'grad',
  icon,
  height = 52,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress?: () => void;
  kind?: BtnKind;
  icon?: IconName;
  height?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const c = useColors();
  const h = small ? 38 : height;
  const fg =
    kind === 'grad' || kind === 'red' ? '#FFFFFF' : kind === 'ink' ? c.onInkButton : kind === 'outline' ? c.accentText : kind === 'text' ? c.muted : c.text;
  const inner = (
    <View style={{ height: h, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 }}>
      {icon ? <Feather name={icon} size={small ? 15 : 18} color={fg} /> : null}
      <T w={800} size={small ? 13 : 15} color={fg}>
        {label}
      </T>
    </View>
  );
  const base: ViewStyle = { borderRadius: h / 2, overflow: 'hidden', opacity: disabled ? 0.45 : 1 };
  let body: React.ReactNode;
  if (kind === 'grad')
    body = (
      <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[base, { shadowColor: '#D63A2C', shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }]}>
        {inner}
      </LinearGradient>
    );
  else if (kind === 'glass') body = <Glass radius={h / 2}>{inner}</Glass>;
  else
    body = (
      <View
        style={[
          base,
          kind === 'ink' && { backgroundColor: c.inkButton },
          kind === 'red' && { backgroundColor: c.red },
          kind === 'outline' && { borderWidth: 1.5, borderColor: c.red },
        ]}
      >
        {inner}
      </View>
    );
  return (
    <PressScale disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} onPress={onPress} scaleTo={0.96} style={style}>
      {body}
    </PressScale>
  );
}

export function CircleButton({ icon, onPress, label, size = 44, active }: { icon: IconName; onPress?: () => void; label: string; size?: number; active?: boolean }) {
  const c = useColors();
  return (
    <PressScale accessibilityRole="button" accessibilityLabel={label} onPress={onPress} scaleTo={0.9} hitSlop={6}>
      <Glass radius={size / 2} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? c.yellowPill : c.surface }}>
        <Feather name={icon} size={size * 0.44} color={c.text} />
      </Glass>
    </PressScale>
  );
}

/* ---------- Header ---------- */
export function Header({ title, sub, back = true, right, onBack }: { title: string; sub?: string; back?: boolean; right?: React.ReactNode; onBack?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
      {back ? <CircleButton icon="chevron-left" label="Back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} /> : null}
      <View style={{ flex: 1 }}>
        <T size={back ? 22 : 28} w={800} style={{ letterSpacing: -0.5 }}>
          {title}
        </T>
        {sub ? (
          <T size={13} color="muted">
            {sub}
          </T>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export const Label = ({ children, required }: { children: string; required?: boolean }) => (
  <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
    <T size={12} w={800} color="muted" style={{ letterSpacing: 1 }}>
      {children.toUpperCase()}
    </T>
    {required ? (
      <T size={12} w={800} color="accentText">
        *
      </T>
    ) : null}
  </View>
);

/* ---------- Inputs ---------- */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  error,
  required,
  multiline,
  icon,
  keyboardType,
  editable = true,
}: {
  label?: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  secure?: boolean;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  icon?: IconName;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
}) {
  const c = useColors();
  const [show, setShow] = React.useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Label required={required}>{label}</Label> : null}
      <View
        style={{
          minHeight: multiline ? 110 : 52,
          borderRadius: multiline ? 18 : 26,
          backgroundColor: error ? c.errorBg : c.inputBg,
          borderWidth: error ? 1.5 : 1,
          borderColor: error ? c.red : c.inputBorder,
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          paddingHorizontal: 16,
          paddingVertical: multiline ? 12 : 0,
          gap: 10,
          opacity: editable ? 1 : 0.6,
        }}
      >
        {icon ? <Feather name={icon} size={18} color={c.muted} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          secureTextEntry={secure && !show}
          multiline={multiline}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' || secure ? 'none' : 'sentences'}
          style={{ flex: 1, fontFamily: FONT[500], fontSize: 15, color: c.text, minHeight: multiline ? 86 : 50, textAlignVertical: multiline ? 'top' : 'center' }}
        />
        {secure ? (
          <Pressable onPress={() => setShow((s) => !s)} accessibilityLabel="Show password" hitSlop={10}>
            <Feather name={show ? 'eye-off' : 'eye'} size={18} color={c.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

export const ErrorText = ({ children }: { children: string }) => (
  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingHorizontal: 6 }}>
    <Icon name="alert-circle" size={14} color="#D63A2C" />
    <T size={12} w={700} color="accentText" style={{ flex: 1 }}>
      {children}
    </T>
  </View>
);

export function Banner({ title, body, tone = 'error' }: { title: string; body?: string; tone?: 'error' | 'info' }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 16, backgroundColor: tone === 'error' ? c.errorBg : c.yellowSoft, borderWidth: 1, borderColor: tone === 'error' ? c.errorBorder : c.inputBorder }}>
      <Icon name={tone === 'error' ? 'alert-circle' : 'info'} size={18} color={tone === 'error' ? c.accentText : c.text} />
      <View style={{ flex: 1, gap: 2 }}>
        <T w={800} size={13} color={tone === 'error' ? 'accentText' : 'text'}>
          {title}
        </T>
        {body ? (
          <T size={12} color="muted">
            {body}
          </T>
        ) : null}
      </View>
    </View>
  );
}

/* ---------- Chips / segments ---------- */
export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  const c = useColors();
  return (
    <PressScale onPress={onPress} scaleTo={0.94} accessibilityRole="button" accessibilityState={{ selected: !!active }}>
      {active ? (
        <View style={{ height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.inkButton, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon ? <Feather name={icon} size={14} color={c.onInkButton} /> : null}
          <T w={700} size={13} color={c.onInkButton}>
            {label}
          </T>
        </View>
      ) : (
        <Glass radius={18} style={{ height: 36, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon ? <Feather name={icon} size={14} color={c.text} /> : null}
          <T w={700} size={13}>
            {label}
          </T>
        </Glass>
      )}
    </PressScale>
  );
}

export function ChipGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => (
        <Chip key={o} label={o} active={o === value} onPress={() => onChange(o)} />
      ))}
    </View>
  );
}

export function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const c = useColors();
  const [w, setW] = React.useState(0);
  const idx = Math.max(0, options.indexOf(value));
  const seg = w / options.length;
  const x = useSharedValue(0);
  React.useEffect(() => {
    x.value = withSpring(idx * seg, SPRING);
  }, [idx, seg, x]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width - 8)} style={{ flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: c.track }}>
      {w > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 4, left: 4, width: seg, height: 36, borderRadius: 11, backgroundColor: c.surfaceStrong, shadowColor: '#000', shadowOpacity: c.isDark ? 0 : 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, thumb]}
        />
      ) : null}
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => { if (!on) { tap(); onChange(o); } }} style={{ flex: 1 }}>
            <View style={{ height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
              <T w={on ? 800 : 600} size={13} color={on ? 'text' : 'muted'}>
                {o}
              </T>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Pill({ label, tone = 'yellow' }: { label: string; tone?: 'yellow' | 'ink' | 'red' | 'green' | 'muted' }) {
  const c = useColors();
  const map = {
    yellow: [c.yellowSoft, c.onYellow],
    ink: [c.inkButton, c.onInkButton],
    red: [c.errorBg, c.accentText],
    green: ['rgba(46,158,91,0.14)', c.green],
    muted: [c.track, c.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: bg, alignSelf: 'flex-start' }}>
      <T size={11} w={800} color={fg}>
        {label}
      </T>
    </View>
  );
}

export function IconBox({ name, size = 34, tone = 'yellow' }: { name: IconName; size?: number; tone?: 'yellow' | 'red' | 'grad' | 'ink' }) {
  const c = useColors();
  const inner = <Feather name={name} size={size * 0.5} color={tone === 'grad' ? '#FFFFFF' : tone === 'red' ? c.accentText : tone === 'ink' ? c.onInkButton : c.onYellow} />;
  if (tone === 'grad')
    return (
      <LinearGradient colors={GRAD} style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: 'center', justifyContent: 'center' }}>
        {inner}
      </LinearGradient>
    );
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: 'center', justifyContent: 'center', backgroundColor: tone === 'red' ? c.errorBg : tone === 'ink' ? c.inkButton : c.yellowSoft }}>
      {inner}
    </View>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const c = useColors();
  return <Switch value={value} onValueChange={(v) => { tap(); onChange(v); }} trackColor={{ true: c.red, false: c.track }} thumbColor="#FFFFFF" ios_backgroundColor={c.divider} />;
}

/** Settings-style row inside a Card. */
export function Row({
  icon,
  title,
  sub,
  onPress,
  right,
  danger,
  last,
}: {
  icon?: IconName;
  title: string;
  sub?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
  last?: boolean;
}) {
  const c = useColors();
  return (
    <PressScale
      disabled={!onPress}
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole={onPress ? 'button' : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 58,
        paddingVertical: 8,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.divider,
      }}
    >
      {icon ? <IconBox name={icon} tone={danger ? 'red' : 'yellow'} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <T w={700} size={15} color={danger ? 'accentText' : 'text'}>
          {title}
        </T>
        {sub ? (
          <T size={12} color="muted">
            {sub}
          </T>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" size={18} color={c.muted} /> : null)}
    </PressScale>
  );
}

export function Progress({ value, height = 6 }: { value: number; height?: number }) {
  const c = useColors();
  const target = Math.max(3, Math.min(100, value * 100));
  const w = useSharedValue(target);
  React.useEffect(() => {
    w.value = withTiming(target, { duration: 450 });
  }, [target, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: c.track, overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height / 2, overflow: 'hidden' }, fill]}>
        <LinearGradient colors={['#D63A2C', '#F6C95C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

export function Checkbox({ checked, onPress, size = 22 }: { checked: boolean; onPress?: () => void; size?: number }) {
  const c = useColors();
  return (
    <PressScale onPress={onPress} scaleTo={0.85} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      {checked ? (
        <Animated.View key="on" entering={ZoomIn.springify().damping(14).stiffness(260)}>
          <LinearGradient colors={GRAD} style={{ width: size, height: size, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="check" size={size - 8} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
      ) : (
        <View style={{ width: size, height: size, borderRadius: 7, borderWidth: 1.5, borderColor: c.muted }} />
      )}
    </PressScale>
  );
}

/* ---------- Brand marks ---------- */
/** The "A!" mark used in the Ask Alken orb. */
export function AlkenMark({ size = 30, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="-6 2 54 54">
      <Path d="M32 9V19.5H24.5Z" fill={color} />
      <Path d="M21.7 23.5H32V54H0Z" fill={color} />
      <Path d="M37 4h5v44h-5zM37 50h5v4h-5z" fill={color} />
    </Svg>
  );
}

export function Orb({ size = 40, ring = 0 }: { size?: number; ring?: number }) {
  const c = useColors();
  return (
    <LinearGradient
      colors={ORB_GRAD}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', borderWidth: ring, borderColor: c.bg }}
    >
      <AlkenMark size={size * 0.46} />
    </LinearGradient>
  );
}

/* ---------- Overlays ---------- */
export function Dialog({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const c = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: c.scrim, justifyContent: 'center', padding: 24 }} onPress={onClose}>
        <Animated.View entering={FadeInDown.springify().damping(20).stiffness(260)}>
          <Pressable onPress={() => {}} style={{ borderRadius: 28, backgroundColor: c.sheet, padding: 20, gap: 14, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 40, shadowOffset: { width: 0, height: 24 } }}>
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: c.scrim, justifyContent: 'flex-end' }} onPress={onClose}>
        <Animated.View entering={SlideInDown.springify().damping(22).stiffness(220)}>
          <Pressable onPress={() => {}} style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: c.sheet, padding: 20, paddingTop: 10, paddingBottom: insets.bottom + 24, gap: 14 }}>
            <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: c.divider }} />
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export function DialogIcon({ name, tone = 'red' }: { name: IconName; tone?: 'red' | 'yellow' | 'grad' }) {
  const c = useColors();
  if (tone === 'grad')
    return (
      <LinearGradient colors={GRAD} style={{ alignSelf: 'center', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={name} size={28} color="#FFFFFF" />
      </LinearGradient>
    );
  return (
    <View style={{ alignSelf: 'center', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: tone === 'red' ? c.errorBg : c.yellowSoft }}>
      <Feather name={name} size={28} color={tone === 'red' ? c.accentText : c.onYellow} />
    </View>
  );
}

/** Red "No internet connection" bar shown at the top of a screen while offline. */
export function OfflineBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      accessibilityRole="alert"
      entering={FadeInDown.duration(260)}
      style={{
        position: 'absolute',
        top: insets.top + 6,
        left: 12,
        right: 12,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#D63A2C',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 14,
        paddingRight: 6,
        zIndex: 20,
        shadowColor: '#D63A2C',
        shadowOpacity: 0.35,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <Feather name="wifi-off" size={18} color="#FFFFFF" />
      <View style={{ flex: 1 }}>
        <T w={800} size={13} color="#FFFFFF">
          No internet connection
        </T>
        <T size={11} w={600} color="rgba(255,255,255,0.9)">
          {message}
        </T>
      </View>
      <PressScale onPress={onRetry} scaleTo={0.92} accessibilityRole="button" style={{ height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: '#FFFFFF', justifyContent: 'center' }}>
        <T w={800} size={12} color="#D63A2C">
          Retry
        </T>
      </PressScale>
    </Animated.View>
  );
}

export const Spacer = ({ h = 8 }: { h?: number }) => <View style={{ height: h }} />;

/** Friendly empty state used when a new user has no data yet. */
export function Empty({ icon, title, body, children }: { icon: IconName; title: string; body: string; children?: React.ReactNode }) {
  return (
    <Card gap={10} style={{ alignItems: 'center', paddingVertical: 22 }}>
      <IconBox name={icon} size={48} />
      <T w={800} size={16} center>
        {title}
      </T>
      <T size={13} color="muted" center style={{ maxWidth: 280 }}>
        {body}
      </T>
      {children ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>{children}</View> : null}
    </Card>
  );
}

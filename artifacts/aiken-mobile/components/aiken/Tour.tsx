import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';
import { Button, CircleButton, DialogIcon, IconBox, Orb, T, type IconName } from './kit';
import { TAB_BAR_HEIGHT } from './TabBar';

export type TourTarget = {
  title: string;
  body: string;
  ref?: React.RefObject<View | null>;
  tab?: number; // index in the tab bar
  above?: boolean;
};
type Rect = { x: number; y: number; w: number; h: number; r: number };

const DIM = 'rgba(11,11,11,0.62)';
const FEATURES: [IconName, string, string][] = [
  ['calendar', 'Plan your day', 'Classes and tasks in one place'],
  ['zap', 'Ask Alken', 'Answers with sources from your school'],
  ['file-text', 'Act on concerns', 'Saved action plans with clear steps'],
];

/** First-time walkthrough over Home: welcome sheet, spotlight steps, and a finish dialog. */
export function Tour({ targets }: { targets: TourTarget[] }) {
  const c = useColors();
  const { setTourDone, profile } = useApp();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(-1); // -1 welcome, targets.length = done
  const [rect, setRect] = useState<Rect | null>(null);

  const finish = () => setTourDone(true);

  const measure = useCallback(() => {
    const t = targets[step];
    if (!t) return setRect(null);
    if (t.tab !== undefined) {
      const barTop = H - Math.max(insets.bottom, 12) - TAB_BAR_HEIGHT;
      const slot = (W - 28 - 12) / 5;
      const cx = 14 + 6 + slot * t.tab + slot / 2;
      if (t.tab === 2) return setRect({ x: cx - 37, y: barTop - 22, w: 74, h: 74, r: 37 });
      return setRect({ x: cx - slot / 2 + 3, y: barTop + 8, w: slot - 6, h: 54, r: 22 });
    }
    t.ref?.current?.measureInWindow((x, y, w, h) => setRect({ x, y, w, h, r: 24 }));
  }, [H, W, insets.bottom, step, targets]);

  useEffect(() => {
    const id = setTimeout(measure, 60);
    return () => clearTimeout(id);
  }, [measure]);

  const t = targets[step];
  const p = 6;
  const s = rect ? { x: rect.x - p, y: rect.y - p, w: rect.w + 2 * p, h: rect.h + 2 * p, r: rect.r + p } : null;
  const below = t && s && !t.above && t.tab === undefined;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={finish}>
      {step === -1 ? (
        <View style={{ flex: 1, backgroundColor: 'rgba(11,11,11,0.35)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: c.sheet, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingTop: 12, paddingBottom: insets.bottom + 20, gap: 14, alignItems: 'center' }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.divider }} />
            <Orb size={64} />
            <T size={22} w={800} center>
              Welcome to AIken{profile.first ? `, ${profile.first}` : ''}
            </T>
            <T size={14} color="muted" center>
              Take a quick tour to see what you can do. It takes about a minute.
            </T>
            <View style={{ alignSelf: 'stretch', gap: 12, marginVertical: 4 }}>
              {FEATURES.map(([icon, a, b]) => (
                <View key={a} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <IconBox name={icon} size={36} />
                  <View>
                    <T w={800} size={14}>{a}</T>
                    <T size={12} color="muted">{b}</T>
                  </View>
                </View>
              ))}
            </View>
            <Button style={{ alignSelf: 'stretch' }} label="Start tour" onPress={() => setStep(0)} />
            <Button label="Skip, I’ll explore on my own" kind="text" onPress={finish} />
          </View>
        </View>
      ) : step >= targets.length ? (
        <View style={{ flex: 1, backgroundColor: c.scrim, justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: c.sheet, borderRadius: 28, padding: 22, gap: 14 }}>
            <DialogIcon name="check" tone="grad" />
            <T size={21} w={800} center>You’re all set</T>
            <T size={13} color="muted" center>Try your first question, or connect your accounts so Alken knows your schedule.</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button style={{ flex: 1 }} label="Go to Home" kind="glass" onPress={finish} />
              <Button style={{ flex: 1 }} label="Ask Alken" onPress={() => { finish(); router.push('/ask'); }} />
            </View>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {s ? (
            <>
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.max(0, s.y), backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: 0, right: 0, top: s.y + s.h, bottom: 0, backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: 0, width: Math.max(0, s.x), top: s.y, height: s.h, backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: s.x + s.w, right: 0, top: s.y, height: s.h, backgroundColor: DIM }} />
              <Pressable
                onPress={() => setStep(step + 1)}
                style={{ position: 'absolute', left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: s.r, borderWidth: 2, borderColor: '#F6C95C' }}
              />
            </>
          ) : (
            <View style={{ flex: 1, backgroundColor: DIM }} />
          )}
          {s && t ? (
            <View
              style={{
                position: 'absolute',
                left: 24,
                right: 24,
                ...(below ? { top: s.y + s.h + 14 } : { bottom: H - s.y + 14 }),
                backgroundColor: c.sheet,
                borderRadius: 22,
                padding: 16,
                gap: 8,
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 30,
                shadowOffset: { width: 0, height: 18 },
              }}
            >
              <View style={{ alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(246,201,92,0.6)' }}>
                <T size={11} w={800} color="#0B0B0B">STEP {step + 1} OF {targets.length}</T>
              </View>
              <T size={18} w={800}>{t.title}</T>
              <T size={13} color="muted">{t.body}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <Pressable onPress={finish} hitSlop={8}>
                  <T size={13} w={700} color="muted">Skip tour</T>
                </Pressable>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
                  {targets.map((_, k) => (
                    <View key={k} style={{ width: k === step ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: k === step ? '#D63A2C' : c.divider }} />
                  ))}
                </View>
                <CircleButton icon="chevron-left" label="Back" size={40} onPress={() => setStep(step - 1)} />
                <Button small label={step === targets.length - 1 ? 'Finish' : 'Next'} onPress={() => setStep(step + 1)} />
              </View>
            </View>
          ) : null}
        </View>
      )}
    </Modal>
  );
}

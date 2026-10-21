import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, CircleButton, Glass, Icon, Screen, Segmented, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';
import type { Source } from '@/data/aiken';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const SRC_ICON: Record<Source, 'book' | 'users' | 'mail' | 'edit-3'> = { Classroom: 'book', Teams: 'users', Outlook: 'mail', Manual: 'edit-3' };

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function Schedule() {
  const c = useColors();
  const { events } = useApp();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [view, setView] = useState('Month');
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const dayOffset = (d: Date) => Math.round((d.getTime() - today.getTime()) / 86400000);
  const hasEvents = (d: Date) => events.some((e) => e.day === dayOffset(d));

  const cells = useMemo(() => {
    if (view === 'Week') {
      const start = new Date(selected);
      start.setDate(selected.getDate() - selected.getDay());
      return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
    }
    const first = new Date(cursor);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 35 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor, selected, view]);

  const list = events.filter((e) => e.day === dayOffset(selected));
  const shift = (n: number) => {
    if (view === 'Week') { const d = new Date(selected); d.setDate(d.getDate() + 7 * n); setSelected(d); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  };

  return (
    <Screen tabs footer={<View style={{ alignItems: 'flex-end' }}><Button label="Add event" icon="plus" kind="ink" onPress={() => router.push('/add-event')} /></View>}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T size={26} w={800} style={{ letterSpacing: -0.5 }}>
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <CircleButton icon="chevron-left" label="Previous" onPress={() => shift(-1)} />
          <CircleButton icon="chevron-right" label="Next" onPress={() => shift(1)} />
        </View>
      </View>
      <Segmented options={['Month', 'Week']} value={view} onChange={setView} />
      <Glass style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          {WD.map((d, i) => (
            <T key={i} size={11} w={700} color="muted" center style={{ flex: 1 }}>
              {d}
            </T>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {cells.map((d) => {
            const inMonth = view === 'Week' || d.getMonth() === cursor.getMonth();
            const sel = sameDay(d, selected);
            const isToday = sameDay(d, today);
            return (
              <Pressable key={d.toISOString()} onPress={() => setSelected(d)} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? c.red : isToday ? c.yellowSoft : 'transparent' }}>
                  <T size={14} w={sel || isToday ? 800 : 600} color={sel ? '#FFFFFF' : inMonth ? 'text' : 'muted'} style={{ opacity: inMonth ? 1 : 0.45 }}>
                    {d.getDate()}
                  </T>
                </View>
                <View style={{ width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: hasEvents(d) && !sel ? c.red : 'transparent' }} />
              </Pressable>
            );
          })}
        </View>
      </Glass>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <T w={800} size={17}>
          {selected.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </T>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <Icon name="calendar" size={12} color={c.muted} />
          <T size={12} color="muted">{list.length} event{list.length === 1 ? '' : 's'}</T>
        </View>
      </View>

      {list.length === 0 ? (
        <Card>
          <T color="muted" center>No classes or events. Tap Add event to plan something.</T>
        </Card>
      ) : (
        list.map((e) => (
          <View key={e.id} style={{ flexDirection: 'row', gap: 12 }}>
            <T size={12} w={700} color="muted" style={{ width: 62, paddingTop: 16 }}>
              {e.start}
            </T>
            <Card gap={6} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: e.source === 'Manual' ? c.yellow : c.red }} />
                <T w={800} size={15} style={{ flex: 1 }}>{e.title}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.yellowSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Icon name={SRC_ICON[e.source]} size={11} color={c.onYellow} />
                  <T size={11} w={800} color={c.onYellow}>{e.source}</T>
                </View>
              </View>
              <T size={12} color="muted">until {e.end}</T>
              {e.note ? (
                <View style={{ flexDirection: 'row', gap: 6, padding: 8, borderRadius: 12, backgroundColor: c.track }}>
                  <Icon name="zap" size={13} color={c.accentText} />
                  <T size={12} style={{ flex: 1 }}>
                    <T size={12} w={800}>Alken: </T>
                    {e.note}
                  </T>
                </View>
              ) : null}
            </Card>
          </View>
        ))
      )}
      {events.length === 0 ? (
        <Button label="Connect Classroom, Teams or Outlook" kind="glass" icon="link" onPress={() => router.push('/connected')} />
      ) : null}
    </Screen>
  );
}

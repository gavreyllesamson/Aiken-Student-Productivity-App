import React, { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button, Card, Checkbox, GRAD, Icon, IconBox, OfflineBanner, Pill, Progress, Screen, T } from '@/components/aiken/kit';
import { Tour, type TourTarget } from '@/components/aiken/Tour';
import { initials, useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const c = useColors();
  const { online, setOnline, todos, toggleTodo, events, plans, files, google, profile, tourDone } = useApp();
  const now = new Date();
  const today = events.filter((e) => e.day === 0);
  const next = today[0];
  const then = today[1];
  const done = todos.filter((t) => t.done).length;
  const open = todos.filter((t) => !t.done).slice(0, 3);
  const activePlan = plans.find((p) => p.status !== 'Done');

  // Suggestions come from what the user has set up. A new user gets setup suggestions.
  const suggestions: { icon: 'link' | 'upload' | 'calendar' | 'bell'; title: string; sub: string; label: string; go: () => void }[] = [];
  if (activePlan) {
    const left = activePlan.steps.filter((s) => !s.done).length;
    suggestions.push({ icon: 'bell', title: `${activePlan.title}: ${left} step${left === 1 ? '' : 's'} left`, sub: activePlan.note ?? 'Keep your action plan moving', label: 'View', go: () => router.push(`/action-plan/${activePlan.id}`) });
  }
  if (!google) suggestions.push({ icon: 'link', title: 'Connect Google Classroom', sub: 'Bring in your classes and due dates', label: 'Connect', go: () => router.push('/connected') });
  if (!files.length) suggestions.push({ icon: 'upload', title: 'Add your student handbook', sub: 'So Alken can answer with sources', label: 'Upload', go: () => router.push('/library') });
  if (!events.length) suggestions.push({ icon: 'calendar', title: 'Add your first class', sub: 'Or connect Classroom to import them', label: 'Add', go: () => router.push('/add-event') });

  const refs = { suggest: useRef<View>(null), next: useRef<View>(null), due: useRef<View>(null) };
  const targets: TourTarget[] = [
    { ref: refs.suggest, title: 'Alken plans your day', body: 'Suggestions here come from your schedule and action plans. Tap a button to act on one.' },
    { ref: refs.next, title: 'Your next class, always on top', body: 'Synced from Google Classroom, Teams and Outlook, or added by you.' },
    { ref: refs.due, title: 'Due soon', body: 'Tasks from your classes and action plans. Check them off as you go.', above: true },
    { tab: 2, title: 'Ask Alken anything', body: 'Ask about school rules, deadlines or your files. Alken answers with sources.' },
    { tab: 3, title: 'Concerns become action plans', body: 'Every answer can turn into a saved plan with steps, documents and the right office to contact.' },
    { tab: 4, title: 'Your Library', body: 'Upload syllabi, handbooks and notes. Alken reads them so its answers fit your school.' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Screen tabs contentStyle={!online ? { paddingTop: 80 } : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <T size={56} w={800} color="red" style={{ letterSpacing: -2, lineHeight: 60 }}>
            {now.getDate()}
          </T>
          <View style={{ flex: 1 }}>
            <T size={13} color="muted">
              {greeting()}{profile.first ? `, ${profile.first}` : ''}
            </T>
            <T size={22} w={800} style={{ letterSpacing: -0.4 }}>
              {DAYS[now.getDay()]}
            </T>
            <T size={13} color="muted">
              {MONTHS[now.getMonth()]} {now.getFullYear()}
            </T>
            <Pressable onLongPress={() => setOnline(!online)} delayLongPress={600} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Icon name={!online ? 'wifi-off' : google ? 'refresh-cw' : 'cloud-off'} size={11} color={!online ? c.accentText : google ? c.green : c.muted} />
              <T size={11} w={700} color={!online ? 'accentText' : google ? c.green : 'muted'}>
                {!online ? 'Offline · showing saved data' : google ? 'Synced just now' : 'No accounts connected'}
              </T>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push('/account')} accessibilityLabel="Account">
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.yellowSoft, borderWidth: 3, borderColor: c.yellow, alignItems: 'center', justifyContent: 'center' }}>
              {profile.first || profile.email ? (
                <T w={800} size={16} color="accentText">
                  {initials(profile)}
                </T>
              ) : (
                <Icon name="user" size={22} color={c.accentText} />
              )}
            </View>
          </Pressable>
        </View>

        {/* Alken suggests */}
        <View ref={refs.suggest} collapsable={false}>
          <Card gap={10}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconBox name="zap" size={26} tone="grad" />
              <T w={800} size={16}>
                {suggestions.length && !activePlan && !events.length ? 'Get started' : 'Alken suggests'}
              </T>
            </View>
            {suggestions.length === 0 ? (
              <T size={13} color="muted">You’re all set. Alken will suggest study blocks as your schedule fills up.</T>
            ) : (
              suggestions.slice(0, 3).map((s) => (
                <View key={s.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <IconBox name={s.icon} />
                  <View style={{ flex: 1 }}>
                    <T w={700} size={14}>{s.title}</T>
                    <T size={12} color="muted">{s.sub}</T>
                  </View>
                  <Button small kind="ink" label={s.label} onPress={s.go} />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Next class */}
        <View ref={refs.next} collapsable={false}>
          {next ? (
            <Pressable onPress={() => router.push('/schedule')}>
              <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 26, padding: 20, gap: 8 }}>
                <T size={12} w={800} color="rgba(255,255,255,0.9)" style={{ letterSpacing: 1.5 }}>
                  NEXT CLASS
                </T>
                <T size={26} w={800} color="#FFFFFF" style={{ letterSpacing: -0.5 }}>
                  {next.title}
                </T>
                <T size={14} w={600} color="rgba(255,255,255,0.92)">
                  {next.start} – {next.end}
                </T>
                {then ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <T size={12} w={700} color="rgba(255,255,255,0.9)">Then: {then.title}</T>
                    <T size={12} w={700} color="rgba(255,255,255,0.9)">{then.start}</T>
                  </View>
                ) : null}
              </LinearGradient>
            </Pressable>
          ) : (
            <Card gap={8}>
              <T size={12} w={800} color="muted" style={{ letterSpacing: 1.5 }}>NEXT CLASS</T>
              <T w={800} size={18}>No classes today</T>
              <T size={13} color="muted">Your next class shows here once you add your schedule or connect Classroom.</T>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Button small label="Add a class" icon="plus" onPress={() => router.push('/add-event')} />
                <Button small kind="glass" label="Open Schedule" onPress={() => router.push('/schedule')} />
              </View>
            </Card>
          )}
        </View>

        {/* Due soon */}
        <View ref={refs.due} collapsable={false}>
          <Card gap={12}>
            <View>
              <T w={800} size={18}>Due soon</T>
              <T size={12} color="muted">
                {todos.length ? `${done} of ${todos.length} done` : 'Nothing due yet'}
              </T>
            </View>
            {todos.length ? <Progress value={done / todos.length} /> : null}
            {todos.length === 0 ? (
              <T size={13} color="muted">Tasks from your classes and action plans will appear here.</T>
            ) : open.length === 0 ? (
              <T size={13} color="muted">You’re all caught up.</T>
            ) : (
              open.map((t) => (
                <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Checkbox checked={t.done} onPress={() => toggleTodo(t.id)} />
                  <View style={{ flex: 1 }}>
                    <T w={700} size={14}>{t.title}</T>
                    <T size={12} color="muted">{t.sub}</T>
                  </View>
                  <Pill label={t.due} tone={t.due === 'Today' ? 'yellow' : 'muted'} />
                </View>
              ))
            )}
          </Card>
        </View>
      </Screen>

      {!online ? <OfflineBanner message="Showing saved data · changes sync later" onRetry={() => setOnline(true)} /> : null}
      {!tourDone ? <Tour targets={targets} /> : null}
    </View>
  );
}

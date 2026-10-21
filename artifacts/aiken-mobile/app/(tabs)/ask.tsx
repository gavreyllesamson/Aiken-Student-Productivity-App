import Animated, { FadeInRight, FadeInUp, LinearTransition } from 'react-native-reanimated';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, CircleButton, Glass, GRAD, Glow, Icon, IconBox, OfflineBanner, Orb, Pill, T } from '@/components/aiken/kit';
import { useApp, type ChatItem } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';
import { classroomAssignments, COLLEGES } from '@/data/aiken';
import { FONT } from '@/constants/fonts';

export default function Ask() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const app = useApp();
  const { chat, send, online, setOnline, prefs, profile } = app;
  const [text, setText] = useState('');
  const [college, setCollege] = useState(prefs.college);
  const [pickCollege, setPickCollege] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const submit = (q?: string) => {
    const v = (q ?? text).trim();
    if (!v || !online) return;
    send(v);
    setText('');
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
  };

  const Bubble = ({ m }: { m: ChatItem }) => {
    if (m.kind === 'user')
      return (
        <View style={{ alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: c.inkButton, borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 14, paddingVertical: 10 }}>
          <T size={14} color={c.onInkButton}>{m.text}</T>
        </View>
      );
    const card = (children: React.ReactNode) => (
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', maxWidth: '94%' }}>
        <Orb size={28} />
        <Glass radius={20} style={{ flex: 1, padding: 14, gap: 10, borderTopLeftRadius: 6 }}>{children}</Glass>
      </View>
    );
    if (m.kind === 'text') return card(<T size={14}>{m.text}</T>);
    if (m.kind === 'answer')
      return card(
        <>
          <T size={14}>{m.text}</T>
          {m.steps?.map((s, i) => (
            <View key={s} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.yellowSoft, alignItems: 'center', justifyContent: 'center' }}>
                <T size={11} w={800} color={c.onYellow}>{i + 1}</T>
              </View>
              <T size={14} w={600} style={{ flex: 1 }}>{s}</T>
            </View>
          ))}
          {m.source && prefs.sources ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: c.yellowSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Icon name="file-text" size={12} color={c.onYellow} />
              <T size={11} w={800} color={c.onYellow}>{m.source}</T>
            </View>
          ) : !m.source ? (
            <T size={11} color="muted">General guidance. Upload your student handbook in Library for answers with sources.</T>
          ) : null}
          {m.planId && prefs.plans ? (
            <>
              <Button label="View action plan" icon="clipboard" onPress={() => router.push(`/action-plan/${m.planId}`)} />
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Icon name="check" size={13} color={c.muted} />
                <T size={12} color="muted">Saved to Concerns</T>
              </View>
            </>
          ) : null}
        </>,
      );
    if (m.kind === 'noanswer')
      return card(
        <>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Icon name="alert-triangle" size={16} color={c.accentText} />
            <T w={800} size={14} color="accentText">No reliable answer found</T>
          </View>
          <T size={14}>I couldn’t find reliable information about this in your college’s documents, so I’d rather not guess.</T>
          <T size={12} color="muted">Checked: PUP_Handbook_2026.pdf, 2026_Enrollment.pdf</T>
          <Button label={college ? `Contact ${college} office` : 'Contact your college'} icon="mail" onPress={() => router.push('/contact')} />
          <Button label="Rephrase my question" kind="glass" onPress={() => setText(m.question)} />
        </>,
      );
    // classroom
    if (m.state === 'ask')
      return card(
        <>
          <T size={14}>I can check your Google Classroom for that, but I need your permission first.</T>
          <View style={{ borderRadius: 16, backgroundColor: c.track, padding: 12, gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <IconBox name="book" />
              <View style={{ flex: 1 }}>
                <T w={800} size={15}>Connect Google Classroom?</T>
                <T size={12} color="muted">Alken is asking for read-only access</T>
              </View>
            </View>
            <T size={11} w={800} color="muted" style={{ letterSpacing: 1 }}>ALKEN WILL BE ABLE TO</T>
            {['See your classes', 'Read assignments and due dates', 'Read class announcements'].map((x) => (
              <View key={x} style={{ flexDirection: 'row', gap: 8 }}><Icon name="check" size={14} color={c.green} /><T size={13}>{x}</T></View>
            ))}
            <T size={11} w={800} color="muted" style={{ letterSpacing: 1 }}>ALKEN WON’T</T>
            <View style={{ flexDirection: 'row', gap: 8 }}><Icon name="x" size={14} color={c.accentText} /><T size={13}>Post, submit, or change anything</T></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button style={{ flex: 1 }} label="Don’t allow" kind="glass" onPress={() => app.answerClassroom(m.id, false)} />
            <Button style={{ flex: 1 }} label="Allow" onPress={() => app.answerClassroom(m.id, true)} />
          </View>
          <T size={11} color="muted" center>You can disconnect anytime by asking Alken.</T>
        </>,
      );
    if (m.state === 'denied')
      return card(
        <>
          <Pill label="You didn’t allow Google Classroom" tone="muted" />
          <T size={14}>No problem. I won’t access your Google Classroom. I can still help using your schedule and Library files.</T>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Chip label="Show my schedule instead" onPress={() => router.push('/schedule')} />
            <Chip label="Connect Classroom" onPress={() => app.answerClassroom(m.id, true)} />
          </View>
        </>,
      );
    return card(
      <>
        <Pill label="Google Classroom connected · read-only" tone="green" />
        <T size={14}>Connected. Here’s what’s due this week from Google Classroom:</T>
        {classroomAssignments.map((a) => (
          <View key={a.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, backgroundColor: c.track }}>
            <View style={{ flex: 1 }}>
              <T w={700} size={14}>{a.title}</T>
              <T size={12} color="muted">{a.course}</T>
            </View>
            <Pill label={a.due} tone={a.due === 'Today' ? 'yellow' : 'muted'} />
          </View>
        ))}
        <Button label="Add all to To-Do" icon="plus" onPress={() => { app.addTodos(classroomAssignments.map((a) => ({ title: a.title, sub: a.course, due: a.due }))); router.push('/'); }} />
      </>,
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Glow />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: insets.top + (online ? 12 : 64), paddingHorizontal: 16, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Orb size={46} />
            <View style={{ flex: 1 }}>
              <T size={22} w={800}>Alken</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: online ? c.green : c.red }} />
                <T size={12} color="muted" lines={1}>{online ? 'Online' : 'Offline · answers from saved data'}</T>
              </View>
            </View>
            <CircleButton icon="clock" label="Conversation history" onPress={() => router.push('/history')} />
            <CircleButton icon="sliders" label="AI configuration" onPress={() => router.push('/ai-config')} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Chip label={college ? `Answering for ${college}` : 'Choose your college'} icon="chevron-down" onPress={() => setPickCollege(!pickCollege)} />
            {pickCollege
              ? COLLEGES.filter((x) => x.code !== college).map((x) => (
                  <Chip key={x.code} label={x.code} onPress={() => { setCollege(x.code); setPickCollege(false); }} />
                ))
              : null}
          </View>
        </View>

        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} keyboardDismissMode="interactive">
          {chat.length === 0 ? (
            <View style={{ alignItems: 'center', gap: 10, paddingTop: 40, paddingHorizontal: 20 }}>
              <Orb size={72} />
              <T size={22} w={800} center>Hi{profile.first ? ` ${profile.first}` : ''}, I’m Alken</T>
              <T size={14} color="muted" center>Ask me about your classes, deadlines or school rules. I’ll answer with sources and can turn answers into action plans.</T>
            </View>
          ) : (
            <T size={12} color="muted" center>Today</T>
          )}
          {chat.map((m) => (
            <Animated.View key={m.id} entering={(m.kind === 'user' ? FadeInRight : FadeInUp).delay(m.kind === 'user' ? 0 : 90).duration(150)} layout={LinearTransition.duration(100)}>
              <Bubble m={m} />
            </Animated.View>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100, gap: 8 }}>
          {online ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['What’s due this week?', 'Late enrollment steps', 'Scholarship renewal', 'Plan my week'].map((q) => (
                <Chip key={q} label={q} onPress={() => submit(q)} />
              ))}
            </ScrollView>
          ) : (
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', padding: 7, borderRadius: 12, backgroundColor: c.errorBg, borderWidth: 1, borderColor: c.errorBorder }}>
              <Icon name="lock" size={13} color={c.accentText} />
              <T size={12} w={700} color="accentText">Sending is turned off while you’re offline</T>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ opacity: online ? 1 : 0.5 }}>
              <CircleButton icon="paperclip" label="Attach from Library" onPress={() => online && router.push('/library')} />
            </View>
            <Glass radius={22} style={{ flex: 1, height: 44, justifyContent: 'center', paddingHorizontal: 16, opacity: online ? 1 : 0.6, borderStyle: online ? 'solid' : 'dashed', borderColor: online ? c.border : c.errorBorder }}>
              <TextInput
                value={text}
                onChangeText={setText}
                editable={online}
                placeholder={online ? 'Ask Alken anything' : 'Offline · can’t send messages'}
                placeholderTextColor={c.muted}
                onSubmitEditing={() => submit()}
                returnKeyType="send"
                style={{ fontFamily: FONT[500], fontSize: 15, color: c.text }}
              />
            </Glass>
            <Pressable onPress={() => submit()} disabled={!online || !text.trim()} accessibilityLabel="Send">
              {online && text.trim() ? (
                <LinearGradient colors={GRAD} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="send" size={18} color="#FFFFFF" />
                </LinearGradient>
              ) : (
                <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: c.divider }}>
                  <Icon name="send" size={18} color={c.muted} />
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      {!online ? <OfflineBanner message="Alken can’t reply until you reconnect" onRetry={() => setOnline(true)} /> : null}
    </View>
  );
}

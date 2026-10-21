import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Empty, Header, IconBox, Label, Pill, Screen, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';

export default function History() {
  const { chat } = useApp();
  const firstQ = chat.find((m) => m.kind === 'user');
  const lastA = [...chat].reverse().find((m) => m.kind !== 'user');
  const tag = chat.some((m) => m.kind === 'answer' && m.planId) ? 'Action plan' : chat.some((m) => m.kind === 'classroom') ? 'Classroom' : chat.some((m) => m.kind === 'noanswer') ? 'No answer' : undefined;
  const preview = !lastA ? '' : lastA.kind === 'answer' || lastA.kind === 'text' ? lastA.text : lastA.kind === 'noanswer' ? 'I couldn’t find reliable information about…' : 'Google Classroom';
  return (
    <Screen>
      <Header title="Conversations" sub="Your chats with Alken" right={<Button small label="New" icon="plus" onPress={() => router.navigate('/ask')} />} />
      {firstQ && firstQ.kind === 'user' ? (
        <View style={{ gap: 8 }}>
          <Label>Today</Label>
          <Card gap={0} style={{ padding: 12 }} onPress={() => router.navigate('/ask')}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <IconBox name="message-circle" />
              <View style={{ flex: 1 }}>
                <T w={700} size={14} lines={1}>{firstQ.text}</T>
                <T size={12} color="muted" lines={1}>{preview}</T>
              </View>
              {tag ? <Pill label={tag} tone={tag === 'No answer' ? 'muted' : 'yellow'} /> : null}
            </View>
          </Card>
        </View>
      ) : (
        <Empty icon="message-circle" title="No conversations yet" body="Your chats with Alken will be saved here so you can pick them up later.">
          <Button small label="Ask Alken" icon="message-circle" onPress={() => router.navigate('/ask')} />
        </Empty>
      )}
    </Screen>
  );
}

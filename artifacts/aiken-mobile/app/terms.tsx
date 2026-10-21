import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Checkbox, Header, Screen, T } from '@/components/aiken/kit';

const SECTIONS = [
  ['Using AIken', 'Who can use the app and what it is for.'],
  ['Your account', 'Your responsibilities for your PUP account and login.'],
  ['Files you upload', 'How Library files are stored, used by Alken, and deleted.'],
  ['AI answers', 'Alken’s answers are guidance; official college offices have the final say.'],
  ['Privacy', 'What data is collected and how it is protected.'],
];

export default function Terms() {
  const [agree, setAgree] = useState(false);
  const { view } = useLocalSearchParams<{ view?: string }>();
  const readOnly = view === '1';
  return (
    <Screen
      footer={
        readOnly ? (
          <Button label="Done" kind="glass" onPress={() => router.back()} />
        ) : (
        <View style={{ gap: 10 }}>
          <Button label="Accept & Continue" disabled={!agree} onPress={() => router.replace('/ai-config?onboarding=1')} />
          <Button label="Decline" kind="text" small onPress={() => router.back()} />
        </View>
        )
      }
    >
      <Header title="Terms & Conditions" sub="Last updated Sep 2026" />
      <Card gap={16}>
        {SECTIONS.map(([t, d], i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#F6C95C', alignItems: 'center', justifyContent: 'center' }}>
              <T w={800} size={12} color="#0B0B0B">
                {i + 1}
              </T>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T w={800} size={15}>
                {t}
              </T>
              <T size={13} color="muted">
                {d}
              </T>
            </View>
          </View>
        ))}
      </Card>
      {readOnly ? (
        <T size={12} color="muted" center>You accepted these terms when you created your account.</T>
      ) : (
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 4 }}>
        <Checkbox checked={agree} onPress={() => setAgree(!agree)} />
        <T size={13} style={{ flex: 1 }}>
          I have read and agree to the Terms & Conditions
        </T>
      </View>
      )}
    </Screen>
  );
}

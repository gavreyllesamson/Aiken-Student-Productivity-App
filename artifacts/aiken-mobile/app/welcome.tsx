import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Glass, Screen, T } from '@/components/aiken/kit';
import { Logo } from '@/components/aiken/Logo';

export default function Welcome() {
  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'space-between' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <Glass radius={32} style={{ paddingHorizontal: 28, paddingVertical: 22 }}>
          <Logo width={190} />
        </Glass>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <T size={30} w={800} center style={{ letterSpacing: -0.6 }}>
            Your study day,
          </T>
          <T size={30} w={800} center color="accentText" style={{ letterSpacing: -0.6 }}>
            sorted by Alken.
          </T>
        </View>
        <T size={15} color="muted" center style={{ maxWidth: 300 }}>
          Classes, deadlines and college concerns in one place, with an AI that knows your schedule.
        </T>
      </View>
      <View style={{ gap: 10 }}>
        <Button label="Get Started" onPress={() => router.push('/signup')} />
        <Button label="I already have an account" kind="glass" onPress={() => router.push('/login')} />
      </View>
    </Screen>
  );
}

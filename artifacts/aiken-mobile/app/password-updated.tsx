import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, DialogIcon, Screen, T } from '@/components/aiken/kit';

export default function PasswordUpdated() {
  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'center' }}>
      <View style={{ gap: 14, alignItems: 'center' }}>
        <DialogIcon name="check" tone="grad" />
        <T size={24} w={800} center>Password updated</T>
        <T size={14} color="muted" center>Your password was changed. Other devices were signed out for your security.</T>
        <Button style={{ alignSelf: 'stretch', marginTop: 10 }} label="Back to Settings" onPress={() => router.replace('/settings')} />
      </View>
    </Screen>
  );
}

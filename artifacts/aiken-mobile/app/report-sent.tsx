import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, DialogIcon, Pill, Screen, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';

export default function ReportSent() {
  const { cat, email } = useLocalSearchParams<{ cat?: string; email?: string }>();
  const { profile } = useApp();
  const ticket = React.useMemo(() => `#AK-${Math.floor(1000 + Math.random() * 9000)}`, []);
  const row = (k: string, v: React.ReactNode) => (
    <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <T size={13} color="muted">{k}</T>
      {typeof v === 'string' ? <T size={13} w={800}>{v}</T> : v}
    </View>
  );
  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'center' }}>
      <View style={{ gap: 14 }}>
        <DialogIcon name="check" tone="grad" />
        <T size={24} w={800} center>Report sent</T>
        <T size={14} color="muted" center>
          Thanks{profile.first ? `, ${profile.first}` : ''}. We sent a copy to {email || profile.email} and will reply within 2 school days.
        </T>
        <Card gap={10}>
          {row('Ticket', ticket)}
          {row('Category', cat ?? 'Sync issue')}
          {row('Status', <Pill label="Open" />)}
        </Card>
        <Button label="Back to Home" onPress={() => router.replace('/')} />
        <Button label="Done" kind="glass" onPress={() => router.replace('/settings')} />
      </View>
    </Screen>
  );
}

import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Header, Icon, Screen, T } from '@/components/aiken/kit';
import { useColors } from '@/hooks/useColors';

export default function ChangePassword() {
  const c = useColors();
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const rules: [string, boolean][] = [
    ['At least 8 characters', pw.length >= 8],
    ['One number', /\d/.test(pw)],
    ['One uppercase letter', /[A-Z]/.test(pw)],
    ['Passwords match', !!pw && pw === pw2],
  ];
  const ok = !!cur && rules.every((r) => r[1]);
  return (
    <Screen footer={<Button label="Update password" disabled={!ok} onPress={() => router.replace('/password-updated')} />}>
      <Header title="Change password" sub="Use at least 8 characters" />
      <Field label="Current password" required value={cur} onChangeText={setCur} secure />
      <Field label="New password" required value={pw} onChangeText={setPw} secure />
      <Field label="Confirm new password" required value={pw2} onChangeText={setPw2} secure error={pw2 && pw !== pw2 ? 'Passwords don’t match' : undefined} />
      <Card gap={8}>
        {rules.map(([l, v]) => (
          <View key={l} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Icon name={v ? 'check-circle' : 'circle'} size={16} color={v ? c.green : c.muted} />
            <T size={13} w={600} color={v ? c.green : 'muted'}>{l}</T>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

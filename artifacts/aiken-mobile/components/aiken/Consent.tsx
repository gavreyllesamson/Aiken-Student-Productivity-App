import React from 'react';
import { View } from 'react-native';
import { Button, Card, Header, Icon, IconBox, Label, Screen, T, type IconName } from './kit';
import { useColors } from '@/hooks/useColors';

/** Shared layout for permission screens (Microsoft, backup sync). */
export function Consent({
  title, sub, icon, can, cant, note, onAllow, onDeny,
}: {
  title: string; sub: string; icon: IconName; can: string[]; cant: string[]; note: string; onAllow: () => void; onDeny: () => void;
}) {
  const c = useColors();
  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button style={{ flex: 1 }} label="Not now" kind="glass" onPress={onDeny} />
          <Button style={{ flex: 1 }} label="Continue" onPress={onAllow} />
        </View>
      }
    >
      <Header title={title} sub={sub} />
      <View style={{ alignItems: 'center', marginVertical: 8 }}>
        <IconBox name={icon} size={64} tone="grad" />
      </View>
      <Label>AIken will be able to</Label>
      <Card gap={10}>
        {can.map((x) => (
          <View key={x} style={{ flexDirection: 'row', gap: 10 }}>
            <Icon name="check" size={16} color={c.green} />
            <T size={14} style={{ flex: 1 }}>{x}</T>
          </View>
        ))}
      </Card>
      <Label>AIken won’t</Label>
      <Card gap={10}>
        {cant.map((x) => (
          <View key={x} style={{ flexDirection: 'row', gap: 10 }}>
            <Icon name="x" size={16} color={c.accentText} />
            <T size={14} style={{ flex: 1 }}>{x}</T>
          </View>
        ))}
      </Card>
      <T size={12} color="muted">{note}</T>
    </Screen>
  );
}

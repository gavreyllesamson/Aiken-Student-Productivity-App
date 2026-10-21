import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Header, Icon, IconBox, Pill, Screen, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';

export default function Connected() {
  const c = useColors();
  const { microsoft, setMicrosoft, backupSync, setBackupSync, google, setGoogle, setClassroom } = useApp();
  const [syncFailed, setSyncFailed] = useState(false);
  const svc = (name: string, on: boolean) => (
    <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <T size={13}>{name}</T>
      <T size={12} w={700} color={on ? c.green : 'muted'}>{on ? 'On' : 'Off'}</T>
    </View>
  );
  return (
    <Screen>
      <Header title="Connected accounts" sub={google || microsoft ? 'Synced just now' : 'Connect where your classes live'} />
      <Card gap={10}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconBox name="globe" />
          <View style={{ flex: 1 }}>
            <T w={800} size={16}>Google</T>
            <Pill label={google ? 'Connected' : 'Not connected'} tone={google ? 'green' : 'muted'} />
          </View>
          <Button small kind={google ? 'glass' : 'grad'} label={google ? 'Disconnect' : 'Connect'} onPress={() => { setGoogle(!google); setClassroom(google ? 'denied' : 'allowed'); }} />
        </View>
        {svc('Classroom', google)}
        {svc('Calendar', google)}
        {svc('Drive documents', google)}
      </Card>
      <Card gap={10}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconBox name="users" />
          <View style={{ flex: 1 }}>
            <T w={800} size={16}>Microsoft</T>
            <Pill label={microsoft ? 'Connected' : 'Not connected'} tone={microsoft ? 'green' : 'muted'} />
          </View>
          <Button small kind={microsoft ? 'glass' : 'grad'} label={microsoft ? 'Disconnect' : 'Connect'} onPress={() => (microsoft ? setMicrosoft(false) : router.push('/microsoft-consent'))} />
        </View>
        {svc('Teams assignments', microsoft)}
        {svc('Outlook calendar', microsoft)}
      </Card>
      {syncFailed ? (
        <Card gap={10} style={{ borderColor: c.errorBorder }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Icon name="alert-circle" size={18} color={c.accentText} />
            <View style={{ flex: 1 }}>
              <T w={800} size={14} color="accentText">Classroom sync failed</T>
              <T size={12} color="muted">Google didn’t respond at 9:58 AM. Your dashboard may be out of date.</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button style={{ flex: 1 }} small label="Retry" icon="refresh-cw" onPress={() => setSyncFailed(false)} />
            <Button style={{ flex: 1 }} small kind="glass" label={backupSync ? 'Backup sync on' : 'Use backup sync'} onPress={() => (backupSync ? setBackupSync(false) : router.push('/backup-sync'))} />
          </View>
        </Card>
      ) : null}
      <T size={12} color="muted">AIken only reads your data. It never posts, submits or changes anything in your accounts.</T>
    </Screen>
  );
}

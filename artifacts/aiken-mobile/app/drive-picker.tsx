import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Checkbox, Empty, Field, Header, IconBox, Screen, Segmented, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';
import { driveFiles } from '@/data/aiken';

export default function DrivePicker() {
  const { addDriveFiles, google, setGoogle } = useApp();
  const [tab, setTab] = useState('My Drive');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const add = () => {
    addDriveFiles(driveFiles.filter((f) => sel.includes(f.id)).map((f) => ({ name: f.name, meta: f.meta })));
    router.back();
  };
  if (!google)
    return (
      <Screen>
        <Header title="Google Drive" sub="Pick files for Alken to read" />
        <Empty icon="triangle" title="Connect Google Drive" body="Alken can only open the files you pick, never your whole Drive.">
          <Button small label="Connect Google" icon="link" onPress={() => setGoogle(true)} />
        </Empty>
      </Screen>
    );
  return (
    <Screen footer={<Button label={sel.length ? `Add ${sel.length} file${sel.length > 1 ? 's' : ''}` : 'Select files'} disabled={!sel.length} onPress={add} />}>
      <Header title="Google Drive" sub="Pick files for Alken to read" />
      <Field value={q} onChangeText={setQ} placeholder="Search Drive" icon="search" />
      <Segmented options={['My Drive', 'Shared with me', 'Recent']} value={tab} onChange={setTab} />
      {driveFiles
        .filter((f) => f.name.toLowerCase().includes(q.toLowerCase()))
        .map((f) => (
          <Card key={f.id} gap={0} style={{ padding: 12 }} onPress={() => toggle(f.id)}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <IconBox name={f.icon} />
              <View style={{ flex: 1 }}>
                <T w={700} size={14}>{f.name}</T>
                <T size={12} color="muted">{f.meta}</T>
              </View>
              <Checkbox checked={sel.includes(f.id)} onPress={() => toggle(f.id)} />
            </View>
          </Card>
        ))}
      <T size={12} color="muted" center>Alken can only open the files you pick here, not your whole Drive.</T>
    </Screen>
  );
}

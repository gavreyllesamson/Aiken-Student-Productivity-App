import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, ChipGroup, Header, IconBox, Label, Progress, Row, Screen, Sheet, T, Toggle } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';
import { COLLEGES } from '@/data/aiken';

export default function AIConfig() {
  const { prefs, setPrefs, modelDownloaded, setModelDownloaded, setSignedIn } = useApp();
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const [p, setP] = useState(prefs);
  const [sheet, setSheet] = useState(false);
  const [collegeOpen, setCollegeOpen] = useState(false);
  const college = COLLEGES.find((c) => c.code === p.college);

  const save = () => {
    setPrefs(p);
    if (onboarding) {
      setSignedIn(true);
      router.replace('/');
    } else router.back();
  };

  return (
    <Screen footer={<Button label="Save preferences" onPress={save} />}>
      <Header title="AI Configuration" sub="How Alken talks to you" back={!onboarding} />
      <Label>Language</Label>
      <ChipGroup options={['English', 'Filipino', 'Taglish']} value={p.language} onChange={(language) => setP({ ...p, language })} />
      <Label>Tone</Label>
      <ChipGroup options={['Friendly', 'Formal', 'Direct']} value={p.tone} onChange={(tone) => setP({ ...p, tone })} />
      <Label>Response length</Label>
      <ChipGroup options={['Short', 'Balanced', 'Detailed']} value={p.length} onChange={(length) => setP({ ...p, length })} />
      <Label>Format</Label>
      <ChipGroup options={['Steps', 'Paragraphs', 'Mixed']} value={p.format} onChange={(format) => setP({ ...p, format })} />
      <Label>Default college</Label>
      <Card gap={0} style={{ paddingVertical: 4 }}>
        <Row icon="briefcase" title={college ? college.code : 'Choose your college'} sub={college ? college.name : 'Alken uses it to pick the right offices and rules'} onPress={() => setCollegeOpen((o) => !o)} last={!collegeOpen} />
        {collegeOpen
          ? COLLEGES.filter((c) => c.code !== college?.code).map((c, i, a) => (
              <Row key={c.code} title={c.code} sub={c.name} last={i === a.length - 1} onPress={() => { setP({ ...p, college: c.code }); setCollegeOpen(false); }} />
            ))
          : null}
      </Card>
      <T size={12} color="muted">
        Alken answers for this college by default. You can switch college inside any chat.
      </T>
      <Card gap={0} style={{ paddingVertical: 4 }}>
        <Row
          icon="download-cloud"
          title="Offline AI model"
          sub={modelDownloaded ? 'Downloaded · 1.8 GB' : 'Not downloaded · 1.8 GB'}
          onPress={() => setSheet(true)}
          right={<T w={800} size={13} color="accentText">{modelDownloaded ? 'Manage' : 'Set up'}</T>}
        />
        <Row title="Show sources in answers" right={<Toggle value={p.sources} onChange={(sources) => setP({ ...p, sources })} />} />
        <Row title="Offer action plans" right={<Toggle value={p.plans} onChange={(plans) => setP({ ...p, plans })} />} />
        <Row title="Reminders on Dashboard" last right={<Toggle value={p.reminders} onChange={(reminders) => setP({ ...p, reminders })} />} />
      </Card>

      <Sheet visible={sheet} onClose={() => setSheet(false)}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconBox name="download" size={48} tone="grad" />
          <View style={{ flex: 1 }}>
            <T w={800} size={18}>
              {modelDownloaded ? 'Offline AI model' : 'Download offline AI model?'}
            </T>
            <T size={12} color="muted">
              Alken Lite runs on your phone, no internet needed
            </T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[['Download size', '1.8 GB'], ['Storage needed', '3.2 GB'], ['Free on device', '24.6 GB'], ['Best on', 'Wi-Fi']].map(([a, b]) => (
            <Card key={a} gap={2} style={{ width: '48%', padding: 12 }}>
              <T size={11} w={700} color="muted">
                {a}
              </T>
              <T size={16} w={800}>
                {b}
              </T>
            </Card>
          ))}
        </View>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T size={11} w={700} color="muted">Storage after download</T>
            <T size={11} w={700} color="muted">21.4 GB free</T>
          </View>
          <Progress value={0.62} height={8} />
        </View>
        <T size={12} color="muted">
          Offline answers are slower and simpler. Your files never leave your phone. You can delete the model anytime in AI Configuration.
        </T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button style={{ flex: 1 }} label="Cancel" kind="glass" onPress={() => setSheet(false)} />
          <Button
            style={{ flex: 1 }}
            label={modelDownloaded ? 'Delete model' : 'Download'}
            kind={modelDownloaded ? 'red' : 'grad'}
            onPress={() => { setModelDownloaded(!modelDownloaded); setSheet(false); }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

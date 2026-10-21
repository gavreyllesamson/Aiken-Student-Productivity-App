import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, ChipGroup, Field, Header, Icon, IconBox, Label, Screen, T } from '@/components/aiken/kit';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppState';

export default function Report() {
  const c = useColors();
  const { profile } = useApp();
  const [email, setEmail] = useState(profile.email);
  const [cat, setCat] = useState('Sync issue');
  const [desc, setDesc] = useState('');
  const [attached, setAttached] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = () => {
    const e: Record<string, string> = {};
    if (!email.endsWith('@iskolarngbayan.pup.edu.ph')) e.email = 'Use your PUP email';
    if (desc.trim().length < 10) e.desc = 'Tell us a bit more (at least 10 characters)';
    setErr(e);
    if (!Object.keys(e).length) router.replace(`/report-sent?cat=${encodeURIComponent(cat)}&email=${encodeURIComponent(email)}`);
  };
  return (
    <Screen footer={<Button label="Submit report" icon="send" onPress={submit} />}>
      <Header title="Have a problem?" sub="Report an issue to the AIken team" />
      <Field label="PUP Email" required value={email} onChangeText={setEmail} keyboardType="email-address" error={err.email} />
      <Label required>Category</Label>
      <ChipGroup options={['Sync issue', 'Wrong answer', 'App bug', 'Account', 'Other']} value={cat} onChange={setCat} />
      <Field label="Describe the problem" required value={desc} onChangeText={setDesc} multiline placeholder="What happened, and what did you expect?" error={err.desc} />
      <Label>Attachment (optional)</Label>
      {attached ? (
        <Card gap={0} style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <IconBox name="image" />
            <View style={{ flex: 1 }}>
              <T w={700} size={14}>Screenshot attached</T>
              <T size={12} color="muted">Image</T>
            </View>
            <Pressable onPress={() => setAttached(false)} accessibilityLabel="Remove attachment" hitSlop={8}>
              <Icon name="x" size={16} color={c.muted} />
            </Pressable>
          </View>
        </Card>
      ) : null}
      <Pressable onPress={() => setAttached(true)} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <Icon name="paperclip" size={14} color={c.accentText} />
        <T size={13} w={800} color="accentText">{attached ? 'Attach another file' : 'Attach a file'}</T>
      </Pressable>
      <T size={11} color="muted">* Required</T>
    </Screen>
  );
}

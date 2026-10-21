import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Checkbox, Dialog, DialogIcon, Field, Header, IconBox, Label, Screen, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';

export default function Privacy() {
  const c = useColors();
  const { files, plans, chat, deleteIndex, resetAll } = useApp();
  const chunks = files.filter((f) => f.state === 'indexed').length * 640;
  const chats = chat.some((m) => m.kind === 'user') ? 1 : 0;
  const [dlg, setDlg] = useState<'index' | 'account' | null>(null);
  const [reindex, setReindex] = useState(false);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const kv = (k: string, v: string) => (
    <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <T size={13} color="muted">{k}</T>
      <T size={13} w={700}>{v}</T>
    </View>
  );
  const section = (icon: 'cpu' | 'trash-2', title: string, sub: string, meta: string, label: string, solid: boolean, onPress: () => void) => (
    <Card gap={12}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <IconBox name={icon} size={38} tone={solid ? 'red' : 'yellow'} />
        <View style={{ flex: 1, gap: 3 }}>
          <T w={800} size={15}>{title}</T>
          <T size={12} color="muted">{sub}</T>
          <T size={11} w={800}>{meta}</T>
        </View>
      </View>
      <Button label={label} icon={icon} kind={solid ? 'red' : 'outline'} height={44} onPress={onPress} />
    </Card>
  );
  const tile = (a: string, b: string, red?: boolean) => (
    <View key={a} style={{ width: '48%', padding: 10, borderRadius: 14, backgroundColor: c.track }}>
      <T size={11} w={700} color="muted">{a}</T>
      <T size={14} w={800} color={red ? 'accentText' : c.green}>{b}</T>
    </View>
  );

  return (
    <Screen>
      <Header title="Data & privacy" sub="What AIken keeps about you" />
      <Card gap={8}>
        {kv('Library files', `${files.length} file${files.length === 1 ? '' : 's'}`)}
        {kv('AI index', `${chunks.toLocaleString()} chunks`)}
        {kv('Conversations', `${chats} chat${chats === 1 ? '' : 's'}`)}
        {kv('Action plans', `${plans.length} saved`)}
      </Card>
      <Button label="Download a copy of my data" icon="download" kind="glass" height={46} />
      <Label>AI data</Label>
      {section('cpu', 'Delete my AI index', 'Clears what Alken learned from your files (RAG vectors). Your account and files stay.', `${chunks.toLocaleString()} chunks · ${files.length} file${files.length === 1 ? '' : 's'}`, 'Delete AI index', false, () => setDlg('index'))}
      <Label>Account</Label>
      {section('trash-2', 'Delete my account', 'Permanently removes your account, files, chats, action plans and AI index.', 'This can’t be undone', 'Delete my account', true, () => setDlg('account'))}
      <T size={11} color="muted">Handled under the Data Privacy Act of 2012.</T>

      <Dialog visible={dlg === 'index'} onClose={() => setDlg(null)}>
        <DialogIcon name="cpu" tone="yellow" />
        <T size={20} w={800} center>Delete your AI index?</T>
        <T size={13} color="muted" center>This clears {chunks.toLocaleString()} indexed chunks from your files. Alken won’t answer from them until they’re indexed again.</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
          {tile('AI index', 'Deleted', true)}
          {tile(`${files.length} files`, 'Kept')}
          {tile('Chats', 'Kept')}
          {tile('Action plans', 'Kept')}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Checkbox checked={reindex} onPress={() => setReindex(!reindex)} size={20} />
          <T size={12} style={{ flex: 1 }}>Re-index my files right after deleting</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button style={{ flex: 1 }} label="Cancel" kind="glass" onPress={() => setDlg(null)} />
          <Button style={{ flex: 1 }} label="Delete index" kind="red" onPress={() => { deleteIndex(); setDlg(null); }} />
        </View>
      </Dialog>

      <Dialog visible={dlg === 'account'} onClose={() => setDlg(null)}>
        <DialogIcon name="trash-2" />
        <T size={20} w={800} center>Delete your account?</T>
        <T size={13} color="muted" center>
          This permanently deletes your account, {files.length} files, {chats} chats, {plans.length} action plans and your AI index.{' '}
          <T size={13} w={800} color="accentText">This can’t be undone.</T>
        </T>
        <Field label="Enter your password" value={pw} onChangeText={setPw} secure />
        <Field label="Type DELETE to confirm" value={confirm} onChangeText={setConfirm} placeholder="DELETE" />
        <T size={12} color="muted">We’ll send a confirmation to your PUP email.</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button style={{ flex: 1 }} label="Cancel" kind="glass" onPress={() => setDlg(null)} />
          <Button
            style={{ flex: 1 }}
            label="Delete forever"
            kind="red"
            disabled={!pw || confirm !== 'DELETE'}
            onPress={() => { setDlg(null); resetAll(); router.replace('/welcome'); }}
          />
        </View>
      </Dialog>
    </Screen>
  );
}

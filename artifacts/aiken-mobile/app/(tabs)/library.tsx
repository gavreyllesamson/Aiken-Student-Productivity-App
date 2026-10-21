import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { Button, Card, ChipGroup, Dialog, DialogIcon, Empty, Field, Glass, Header, Icon, IconBox, Label, Pill, Progress, Screen, Segmented, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';
import type { LibFile, Upload } from '@/data/aiken';

const ALLOWED = ['pdf', 'docx', 'pptx', 'txt'];
const MAX_MB = 50;

function Status({ f }: { f: LibFile }) {
  const c = useColors();
  if (f.state === 'indexing')
    return (
      <View style={{ gap: 4 }}>
        <Progress value={f.progress ?? 0} height={4} />
        <T size={11} w={700} color="muted">Indexing for Alken…</T>
      </View>
    );
  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      <Icon name="check" size={12} color={c.green} />
      <T size={11} w={700} color={c.green}>Indexed</T>
    </View>
  );
}

export default function Library() {
  const c = useColors();
  const { files, uploads, addUpload, removeUpload } = useApp();
  const [tab, setTab] = useState('Library');
  const [q, setQ] = useState('');
  const [use, setUse] = useState('Both');
  const [dialog, setDialog] = useState<Upload | null>(null);

  /** Opens the system file picker and checks type and size before indexing. */
  const pick = async () => {
    setTab('Ingest');
    const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: false });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    const ext = (a.name.split('.').pop() ?? '').toLowerCase();
    const sizeMb = Math.round(((a.size ?? 0) / 1024 / 1024) * 10) / 10;
    const meta = `${ext.toUpperCase() || 'File'} · ${sizeMb} MB`;
    const state: Upload['state'] = !ALLOWED.includes(ext) ? 'type-error' : sizeMb > MAX_MB ? 'size-error' : 'indexing';
    const id = addUpload({ name: a.name, meta, state, progress: 0.2, ext, sizeMb });
    if (state !== 'indexing') setDialog({ id, name: a.name, meta, state, ext, sizeMb });
  };

  const group = (g: LibFile['group'], label: string) => {
    const items = files.filter((f) => f.group === g && f.name.toLowerCase().includes(q.toLowerCase()));
    if (!items.length) return null;
    return (
      <View style={{ gap: 8 }}>
        <Label>{label}</Label>
        {items.map((f) => (
          <Card key={f.id} gap={0} style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <IconBox name={f.icon} size={40} />
              <View style={{ flex: 1, gap: 3 }}>
                <T w={700} size={14} lines={1}>{f.name}</T>
                <T size={11} color="muted">{f.meta}</T>
                <Status f={f} />
              </View>
              <Pill label={f.use} tone={f.use === 'Core' ? 'ink' : 'yellow'} />
            </View>
          </Card>
        ))}
      </View>
    );
  };

  return (
    <Screen tabs>
      <Header title="Library" sub="Files Alken can read and answer from" back={false} />
      <Segmented options={['Ingest', 'Library']} value={tab} onChange={setTab} />

      {tab === 'Library' ? (
        files.length === 0 ? (
          <Empty icon="book-open" title="Your Library is empty" body="Upload your student handbook, syllabi or notes. Alken reads them so its answers fit your school.">
            <Button small label="Upload" icon="upload" onPress={pick} />
            <Button small kind="glass" label="Google Drive" icon="triangle" onPress={() => router.push('/drive-picker')} />
          </Empty>
        ) : (
          <>
            <Field value={q} onChangeText={setQ} placeholder="Search files" icon="search" />
            {group('pinned', 'Pinned')}
            {group('mine', 'Your files')}
            {group('drive', 'From Google Drive')}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button style={{ flex: 1 }} small label="Upload" icon="upload" onPress={pick} />
              <Button style={{ flex: 1 }} small kind="glass" label="Drive" icon="triangle" onPress={() => router.push('/drive-picker')} />
            </View>
          </>
        )
      ) : (
        <>
          <Glass style={{ padding: 18, alignItems: 'center', gap: 8, borderStyle: 'dashed', borderColor: c.errorBorder }}>
            <IconBox name="upload" size={44} tone="grad" />
            <T w={800} size={15}>Upload files</T>
            <T size={12} color="muted">PDF, DOCX, PPTX, TXT · up to {MAX_MB} MB each</T>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Button small kind="ink" label="Choose file" onPress={pick} />
              <Button small kind="glass" label="Google Drive" icon="triangle" onPress={() => router.push('/drive-picker')} />
            </View>
          </Glass>
          <Label>Use this file for</Label>
          <ChipGroup options={['Core', 'RAG', 'Both']} value={use} onChange={setUse} />
          <Label>Uploads</Label>
          {uploads.length === 0 ? <T size={13} color="muted">Files you upload show here while Alken indexes them.</T> : null}
          {uploads.map((u) => (
            <Card key={u.id} gap={8} style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <IconBox name="file" size={36} />
                <View style={{ flex: 1 }}>
                  <T w={700} size={14} lines={1}>{u.name}</T>
                  <T size={11} color="muted">{u.meta}</T>
                </View>
                <Pressable onPress={() => removeUpload(u.id)} hitSlop={8} accessibilityLabel="Remove">
                  <Icon name="x" size={16} color={c.muted} />
                </Pressable>
              </View>
              {u.state === 'indexing' ? (
                <View style={{ gap: 4 }}>
                  <Progress value={u.progress ?? 0} />
                  <T size={11} w={700} color="muted">Indexing for Alken…</T>
                </View>
              ) : u.state === 'ready' ? (
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                  <Icon name="check" size={12} color={c.green} />
                  <T size={11} w={700} color={c.green}>Ready · Alken can answer from this file</T>
                </View>
              ) : (
                <Pressable onPress={() => setDialog(u)} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: c.errorBg, borderWidth: 1, borderColor: c.errorBorder }}>
                  <Icon name="alert-circle" size={14} color={c.accentText} />
                  <T size={12} w={700} color="accentText" style={{ flex: 1 }}>
                    {u.state === 'type-error' ? 'File type not supported. Use PDF, DOCX, PPTX or TXT.' : `File is over ${MAX_MB} MB. Compress or split it.`}
                  </T>
                  <T size={12} w={800} style={{ textDecorationLine: 'underline' }}>Details</T>
                </Pressable>
              )}
            </Card>
          ))}
        </>
      )}

      <Dialog visible={!!dialog} onClose={() => setDialog(null)}>
        {dialog ? (
          <>
            <DialogIcon name={dialog.state === 'type-error' ? 'alert-circle' : 'upload'} />
            <T size={20} w={800} center>{dialog.state === 'type-error' ? 'File type not supported' : 'File is too large'}</T>
            <T size={13} color="muted" center>
              {dialog.state === 'type-error'
                ? `Alken can’t read ${dialog.ext ? `.${dialog.ext}` : 'this kind of'} files. Upload one of the supported formats instead.`
                : `Each file can be up to ${MAX_MB} MB. This one is ${Math.round(((dialog.sizeMb ?? MAX_MB) - MAX_MB) * 10) / 10} MB over the limit.`}
            </T>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 10, borderRadius: 14, backgroundColor: c.track, borderWidth: 1, borderColor: c.errorBorder }}>
              <IconBox name="file" tone="red" />
              <View style={{ flex: 1 }}>
                <T w={800} size={13} lines={1}>{dialog.name}</T>
                <T size={11} w={700} color="accentText">{dialog.meta} · {dialog.state === 'type-error' ? 'not supported' : 'over limit'}</T>
              </View>
            </View>
            {dialog.state === 'type-error' ? (
              <View style={{ gap: 6 }}>
                <Label>Supported formats</Label>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {ALLOWED.map((x) => <Pill key={x} label={x.toUpperCase()} />)}
                </View>
              </View>
            ) : (
              <View style={{ gap: 6 }}>
                <Progress value={1} height={10} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <T size={11} w={700} color="muted">0 MB</T>
                  <T size={11} w={700}>Limit {MAX_MB} MB</T>
                  <T size={11} w={700} color="accentText">{dialog.sizeMb} MB</T>
                </View>
                <T size={12} color="muted">Tip: compress the PDF or split it into chapters, then upload again.</T>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button style={{ flex: 1 }} label="Remove file" kind="glass" onPress={() => { removeUpload(dialog.id); setDialog(null); }} />
              <Button style={{ flex: 1 }} label="Choose another" onPress={() => { removeUpload(dialog.id); setDialog(null); pick(); }} />
            </View>
          </>
        ) : null}
      </Dialog>
    </Screen>
  );
}

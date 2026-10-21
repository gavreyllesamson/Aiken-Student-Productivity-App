import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, ChipGroup, Field, Header, Label, Row, Card, Screen, Toggle } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';

export default function AddEvent() {
  const { addEvent } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Task');
  const [date, setDate] = useState('Today');
  const [start, setStart] = useState('4:00 PM');
  const [end, setEnd] = useState('6:00 PM');
  const [course, setCourse] = useState('');
  const [notes, setNotes] = useState('');
  const [remind, setRemind] = useState(true);
  const [err, setErr] = useState('');

  const save = () => {
    if (!title.trim()) return setErr('Add a title');
    addEvent({ title: title.trim(), start, end, source: 'Manual', day: date === 'Tomorrow' ? 1 : 0, note: notes || undefined });
    router.back();
  };

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button style={{ flex: 1 }} label="Cancel" kind="glass" onPress={() => router.back()} />
          <Button style={{ flex: 2 }} label="Save event" onPress={save} />
        </View>
      }
    >
      <Header title="Add event" sub="Shows on your calendar and Home" />
      <Field label="Title" required value={title} onChangeText={(t) => { setTitle(t); setErr(''); }} placeholder="Group study: ML Quiz 3" error={err || undefined} />
      <Label>Type</Label>
      <ChipGroup options={['Class', 'Task', 'Personal']} value={type} onChange={setType} />
      <Label required>Date</Label>
      <ChipGroup options={['Today', 'Tomorrow']} value={date} onChange={setDate} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Start" required value={start} onChangeText={setStart} icon="clock" /></View>
        <View style={{ flex: 1 }}><Field label="End" required value={end} onChangeText={setEnd} icon="clock" /></View>
      </View>
      <Field label="Course (optional)" value={course} onChangeText={setCourse} placeholder="Machine Learning" />
      <Field label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Library 2F, bring past quizzes" multiline />
      <Card gap={0} style={{ paddingVertical: 2 }}>
        <Row icon="bell" title="Remind me 1 hour before" last right={<Toggle value={remind} onChange={setRemind} />} />
      </Card>
    </Screen>
  );
}

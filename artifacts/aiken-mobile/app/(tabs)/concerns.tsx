import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Empty, Header, Icon, IconBox, Pill, Progress, Screen, Segmented, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';

export default function Concerns() {
  const c = useColors();
  const { plans, followUpDismissed, setFollowUpDismissed } = useApp();
  const [filter, setFilter] = useState('All');
  const waiting = plans.find((p) => p.status === 'Awaiting reply');
  const shown = plans.filter((p) => filter === 'All' || (filter === 'Done' ? p.status === 'Done' : p.status !== 'Done'));

  return (
    <Screen tabs>
      <Header title="Concerns" sub="Action plans Alken made for you" back={false} />
      {!followUpDismissed && waiting ? (
        <Card gap={10} style={{ borderColor: c.errorBorder }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <IconBox name="bell" tone="red" />
            <View style={{ flex: 1 }}>
              <T w={800} size={15}>Waiting for a reply</T>
              <T size={12} color="muted">You emailed an office about {waiting?.title.toLowerCase()}. Send a follow-up if there’s no answer in 3 days.</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button style={{ flex: 1 }} small label="Send follow-up" onPress={() => router.push(`/contact?followup=1&plan=${waiting?.id}`)} />
            <Button style={{ flex: 1 }} small kind="glass" label="Dismiss" onPress={() => setFollowUpDismissed(true)} />
          </View>
        </Card>
      ) : null}
      {plans.length ? <Segmented options={['All', 'In progress', 'Done']} value={filter} onChange={setFilter} /> : null}
      {shown.map((p) => {
        const done = p.steps.filter((s) => s.done).length;
        return (
          <Card key={p.id} gap={10} onPress={() => router.push(`/action-plan/${p.id}`)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T w={800} size={17}>{p.title}</T>
              <Pill label={p.status} tone={p.status === 'Done' ? 'green' : p.status === 'Awaiting reply' ? 'red' : 'yellow'} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T size={12} color="muted">{p.college} · {p.saved}</T>
              <T size={12} w={800}>{done}/{p.steps.length}</T>
            </View>
            <Progress value={done / p.steps.length} />
            {p.note ? (
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Icon name="mail" size={13} color={c.accentText} />
                <T size={12} w={700} color="accentText">{p.note}</T>
              </View>
            ) : null}
          </Card>
        );
      })}
      {plans.length === 0 ? (
        <Empty icon="clipboard" title="No action plans yet" body="Ask Alken about enrollment, scholarships or any school concern. Its answer becomes a step-by-step plan saved here.">
          <Button small label="Ask Alken" icon="message-circle" onPress={() => router.navigate('/ask')} />
        </Empty>
      ) : shown.length === 0 ? (
        <Card><T color="muted" center>Nothing in this list.</T></Card>
      ) : null}
    </Screen>
  );
}

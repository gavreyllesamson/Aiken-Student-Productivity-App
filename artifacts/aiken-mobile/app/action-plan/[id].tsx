import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Checkbox, Empty, Header, Icon, IconBox, Pill, Progress, Screen, Segmented, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';

export default function ActionPlanScreen() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plans, toggleStep, addTodos } = useApp();
  const plan = plans.find((p) => p.id === id);
  const [tab, setTab] = useState('Checklist');
  if (!plan)
    return (
      <Screen>
        <Header title="Action plan" />
        <Empty icon="clipboard" title="This plan isn’t saved" body="Ask Alken again and turn on Offer action plans in AI Configuration to save it." />
      </Screen>
    );
  const done = plan.steps.filter((s) => s.done).length;

  const addAll = () => {
    addTodos(plan.steps.filter((s) => !s.done).map((s) => ({ title: s.label, sub: `${plan.title} plan` })));
    router.navigate('/');
  };

  return (
    <Screen footer={tab !== 'Contact' ? <Button label="Add all to To-Do" icon="plus" onPress={addAll} /> : undefined}>
      <Header title={plan.title} sub={`${plan.saved} · from your chat with Alken`} />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Pill label={plan.college} tone="ink" />
        <Pill label={plan.source} />
      </View>
      <Card gap={8}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={12} w={700} color="muted">Progress</T>
          <T size={12} w={800}>{done} of {plan.steps.length} steps</T>
        </View>
        <Progress value={done / plan.steps.length} />
      </Card>
      <Segmented options={['Checklist', 'Documents', 'Contact']} value={tab} onChange={setTab} />

      {tab === 'Checklist' ? (
        <>
          <Card gap={14}>
            {plan.steps.map((s) => (
              <View key={s.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <Checkbox checked={s.done} onPress={() => toggleStep(plan.id, s.id)} />
                <T size={14} w={600} color={s.done ? 'muted' : 'text'} style={{ flex: 1, textDecorationLine: s.done ? 'line-through' : 'none' }}>
                  {s.label}
                </T>
              </View>
            ))}
          </Card>
          <Card gap={0} style={{ padding: 12 }}><T size={12} color="muted">{plan.tip}</T></Card>
        </>
      ) : null}

      {tab === 'Documents' ? (
        <>
          <Card gap={12}>
            {plan.documents.map((d) => (
              <View key={d.name} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <IconBox name="file-text" />
                <View style={{ flex: 1 }}>
                  <T w={700} size={14}>{d.name}</T>
                  <T size={12} color="muted">{d.sub}</T>
                </View>
              </View>
            ))}
          </Card>
          <Card gap={0} style={{ padding: 12 }}><T size={12} color="muted">{plan.docTip}</T></Card>
        </>
      ) : null}

      {tab === 'Contact'
        ? plan.contacts.map((o, i) => (
            <Card key={o.office} gap={8}>
              <T w={800} size={16}>{o.office}</T>
              {[['clock', o.hours], ['mail', o.email], ['phone', o.phone]].map(([icon, v]) => (
                <View key={v} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Icon name={icon as 'clock'} size={14} color={c.muted} />
                  <T size={13} color="muted">{v}</T>
                </View>
              ))}
              {i === 0 ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <Button style={{ flex: 2 }} small label="Email this office" icon="mail" onPress={() => router.push(`/contact?plan=${plan.id}`)} />
                  <Button style={{ flex: 1 }} small kind="glass" label="Call" icon="phone" onPress={() => Linking.openURL(`tel:${o.phone.replace(/\s/g, '')}`)} />
                </View>
              ) : null}
            </Card>
          ))
        : null}
    </Screen>
  );
}

import React from 'react';
import { Card, Header, Label, Row, Screen, Toggle } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';

export default function Notifications() {
  const { notif, setNotif } = useApp();
  const set = (k: keyof typeof notif) => (v: boolean) => setNotif({ ...notif, [k]: v });
  const items: [keyof typeof notif, string, string][] = [
    ['schedule', 'Schedule changes', 'Moved, cancelled or new classes'],
    ['assignments', 'New assignments', 'From Classroom and Teams'],
    ['due', 'Due date reminders', '24 hours and 1 hour before'],
    ['followups', 'Action plan follow-ups', 'When an office hasn’t replied'],
    ['tips', 'Alken suggestions', 'Daily study tips'],
  ];
  return (
    <Screen>
      <Header title="Notifications" sub="Choose what Alken alerts you about" />
      <Card gap={0} style={{ paddingVertical: 4 }}>
        <Row icon="bell" title="Push notifications" sub="Allow AIken to send alerts" last right={<Toggle value={notif.push} onChange={set('push')} />} />
      </Card>
      <Label>Alert me about</Label>
      <Card gap={0} style={{ paddingVertical: 4, opacity: notif.push ? 1 : 0.5 }}>
        {items.map(([k, t, s], i) => (
          <Row key={k} title={t} sub={s} last={i === items.length - 1} right={<Toggle value={notif[k] && notif.push} onChange={set(k)} />} />
        ))}
      </Card>
    </Screen>
  );
}

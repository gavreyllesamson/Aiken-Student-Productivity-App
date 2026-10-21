import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, ChipGroup, Field, Header, IconBox, Label, Row, Screen, T, Toggle } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';

const ROUTES: Record<string, { office: string; email: string }> = {
  Enrollment: { office: 'Office of the University Registrar', email: 'registrar@university.edu' },
  Scholarship: { office: 'Office of Scholarships', email: 'scholarships@university.edu' },
  Internship: { office: 'OJT Coordinator', email: 'ojt-ccis@university.edu' },
  Wellbeing: { office: 'Guidance and Counseling Office', email: 'guidance@university.edu' },
  Other: { office: 'CCS Student Affairs Office', email: 'ccs-studentaffairs@university.edu' },
};

export default function Contact() {
  const { followup, plan: planId } = useLocalSearchParams<{ followup?: string; plan?: string }>();
  const { plans, markEmailed, profile } = useApp();
  const plan = plans.find((p) => p.id === planId);
  const topicFor = (id?: string) => (id === 'scholarship' ? 'Scholarship' : id === 'internship' ? 'Internship' : id ? 'Enrollment' : 'Enrollment');
  const [topic, setTopic] = useState(topicFor(planId));
  const [subject, setSubject] = useState(plan ? `${followup ? 'Follow-up: ' : ''}${plan.title}` : '');
  const [body, setBody] = useState(
    plan
      ? followup
        ? `Hi, I emailed earlier about ${plan.title.toLowerCase()} and haven’t received a reply yet. Could you confirm the next steps?${profile.first ? `\n\nThank you,\n${profile.first} ${profile.last}` : ''}`
        : `Hi, I’d like to ask about ${plan.title.toLowerCase()}. Could you confirm the requirements and next steps?${profile.first ? `\n\nThank you,\n${profile.first} ${profile.last}` : ''}`
      : '',
  );
  const [err, setErr] = useState('');
  const [attach, setAttach] = useState(true);
  const route = ROUTES[topic];

  return (
    <Screen footer={<Button label="Send email" icon="send" onPress={() => { if (!subject.trim() || !body.trim()) return setErr('Add a subject and a message'); if (plan) markEmailed(plan.id); router.back(); }} />}>
      <Header title="Contact your college" sub="We’ll route your message to the right office" />
      <Label>Send to</Label>
      <Card gap={0} style={{ paddingVertical: 4 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 8 }}>
          <IconBox name="briefcase" />
          <View style={{ flex: 1 }}>
            <T w={800} size={15}>{route.office}</T>
            <T size={12} color="muted">Routed by topic to {route.email}</T>
          </View>
        </View>
      </Card>
      <Label>Topic</Label>
      <ChipGroup options={Object.keys(ROUTES)} value={topic} onChange={setTopic} />
      <Field label="Subject" value={subject} onChangeText={(t) => { setSubject(t); setErr(''); }} placeholder="What is your concern about?" />
      <Field label="Message" value={body} onChangeText={(t) => { setBody(t); setErr(''); }} multiline placeholder="Write your message to the office" error={err || undefined} />
      <Card gap={0} style={{ paddingVertical: 2 }}>
        <Row icon="paperclip" title="Attach my Alken conversation" last right={<Toggle value={attach} onChange={setAttach} />} />
      </Card>
      <T size={12} color="muted">If there’s no reply in 3 days, Alken will remind you and help you follow up.</T>
    </Screen>
  );
}

import React from 'react';
import { router } from 'expo-router';
import { Consent } from '@/components/aiken/Consent';
import { useApp } from '@/context/AppState';

export default function MicrosoftConsent() {
  const { setMicrosoft } = useApp();
  return (
    <Consent
      title="Connect Microsoft"
      sub="For Teams and Outlook"
      icon="users"
      can={['See your Teams classes', 'Read Teams assignments and due dates', 'Read your Outlook calendar events']}
      cant={['Post, submit, or send anything', 'Read your email']}
      note="Next, Microsoft will show its own sign-in and consent screen. You can disconnect anytime in Connected accounts."
      onAllow={() => { setMicrosoft(true); router.back(); }}
      onDeny={() => router.back()}
    />
  );
}

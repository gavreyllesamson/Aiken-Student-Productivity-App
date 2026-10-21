import React from 'react';
import { router } from 'expo-router';
import { Consent } from '@/components/aiken/Consent';
import { useApp } from '@/context/AppState';

export default function BackupSync() {
  const { setBackupSync } = useApp();
  return (
    <Consent
      title="Use backup sync?"
      sub="When Google or Microsoft can’t be reached"
      icon="refresh-cw"
      can={[
        'Sign in to Classroom or Teams on your behalf, only when the normal connection fails',
        'Read assignments, due dates and class schedules',
        'Store your session securely in an encrypted vault',
      ]}
      cant={['Save or see your password', 'Post, submit, or change anything', 'Run when the normal connection works']}
      note="Backup sync is optional and off by default. You can turn it off anytime, and the stored session is deleted right away."
      onAllow={() => { setBackupSync(true); router.back(); }}
      onDeny={() => router.back()}
    />
  );
}

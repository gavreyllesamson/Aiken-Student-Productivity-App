import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Header, Icon, Screen, T } from '@/components/aiken/kit';
import { initials, useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';

export default function EditProfile() {
  const c = useColors();
  const { profile, setProfile } = useApp();
  const [f, setF] = useState(profile);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const missing = !f.first.trim() || !f.last.trim() || !f.username.trim();
  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button style={{ flex: 1 }} label="Cancel" kind="glass" onPress={() => router.back()} />
          <Button style={{ flex: 2 }} label="Save changes" disabled={missing} onPress={() => { setProfile(f); router.back(); }} />
        </View>
      }
    >
      <Header title="Edit profile" sub="Changes show on your profile" />
      <View style={{ alignSelf: 'center', width: 96, height: 96, borderRadius: 48, backgroundColor: '#0B0B0B', borderWidth: 3, borderColor: c.yellow, alignItems: 'center', justifyContent: 'center' }}>
        {f.first || f.email ? <T size={30} w={800} color="#F6C95C">{initials(f)}</T> : <Icon name="user" size={34} color="#F6C95C" />}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="First name" required value={f.first} onChangeText={set('first')} placeholder="First name" /></View>
        <View style={{ flex: 1 }}><Field label="Last name" required value={f.last} onChangeText={set('last')} placeholder="Last name" /></View>
      </View>
      <Field label="Username" required value={f.username} onChangeText={set('username')} placeholder="username" />
      <Field label="Birthdate" value={f.birthdate} onChangeText={set('birthdate')} icon="calendar" placeholder="MM/DD/YYYY" />
      <Field label="College" value={f.college} onChangeText={set('college')} placeholder="e.g. CCIS" />
      <Field label="Student ID" value={f.studentId} onChangeText={set('studentId')} placeholder="20XX-XXXXX-MN-X" />
    </Screen>
  );
}

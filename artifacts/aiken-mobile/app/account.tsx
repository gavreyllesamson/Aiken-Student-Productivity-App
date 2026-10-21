import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button, Card, CircleButton, Icon, Label, Screen, T } from '@/components/aiken/kit';
import { initials, useApp } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';

export default function Account() {
  const c = useColors();
  const { todos, files, events, profile } = useApp();
  const name = [profile.first, profile.last].filter(Boolean).join(' ');
  const stats = [
    [String(new Set(events.map((e) => e.title)).size), 'Classes'],
    [String(todos.filter((t) => !t.done).length), 'Due soon'],
    [String(files.length), 'Files'],
  ];
  const field = (v: string, l: string) => (
    <View key={l}>
      <T w={700} size={15} color={v ? 'text' : 'muted'}>{v || 'Not set'}</T>
      <T size={12} color="muted">{l}</T>
    </View>
  );
  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <CircleButton icon="chevron-left" label="Back" onPress={() => router.back()} />
        <CircleButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />
      </View>
      <LinearGradient colors={['#C42F25', '#F0624A', '#F6C95C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 120, borderRadius: 26 }} />
      <View style={{ alignItems: 'center', marginTop: -62, gap: 6 }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#0B0B0B', borderWidth: 4, borderColor: c.yellow, alignItems: 'center', justifyContent: 'center' }}>
          {profile.first || profile.email ? <T size={30} w={800} color="#F6C95C">{initials(profile)}</T> : <Icon name="user" size={34} color="#F6C95C" />}
        </View>
        <T size={22} w={800}>{profile.username ? `@${profile.username}` : name || 'Your profile'}</T>
        <T size={13} color="muted">{name ? `${name} · Student` : 'Student'}</T>
      </View>
      <Card style={{ flexDirection: 'row', paddingVertical: 14 }}>
        {stats.map(([n, l]) => (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <T size={20} w={800}>{n}</T>
            <T size={12} color="muted">{l}</T>
          </View>
        ))}
      </Card>
      <Button label="Edit profile" kind="ink" onPress={() => router.push('/edit-profile')} />
      <Label>Basic profile</Label>
      <Card gap={12}>
        {field(profile.first, 'First name')}
        {field(profile.last, 'Last name')}
        {field(profile.birthdate, 'Birthdate')}
      </Card>
      <Label>Student profile</Label>
      <Card gap={12}>
        {field(profile.studentId, 'Student ID')}
        {field(profile.college, 'College')}
        {field(profile.email, 'Email')}
      </Card>
    </Screen>
  );
}

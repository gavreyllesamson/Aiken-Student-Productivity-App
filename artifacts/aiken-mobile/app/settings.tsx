import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Dialog, DialogIcon, Header, Label, Row, Screen, T } from '@/components/aiken/kit';
import { useApp } from '@/context/AppState';

export default function Settings() {
  const { signOut, profile } = useApp();
  const [logout, setLogout] = useState(false);
  return (
    <Screen>
      <Header title="Settings" sub="Account, preferences and support" />
      <Label>Account</Label>
      <Card gap={0} style={{ paddingVertical: 4 }}>
        <Row icon="user" title="Edit profile" sub="Name, photo, college" onPress={() => router.push('/edit-profile')} />
        <Row icon="lock" title="Change password" onPress={() => router.push('/change-password')} />
        <Row icon="link" title="Connected accounts" sub="Google · Microsoft" onPress={() => router.push('/connected')} last />
      </Card>
      <Label>Preferences</Label>
      <Card gap={0} style={{ paddingVertical: 4 }}>
        <Row icon="sliders" title="AI Configuration" sub="Language, tone, length, default college" onPress={() => router.push('/ai-config')} />
        <Row icon="bell" title="Notifications" sub="Push alerts for schedule changes" onPress={() => router.push('/notifications')} last />
      </Card>
      <Label>Support</Label>
      <Card gap={0} style={{ paddingVertical: 4 }}>
        <Row icon="shield" title="Data & privacy" sub="Download or delete your data" onPress={() => router.push('/privacy')} />
        <Row icon="help-circle" title="Have a problem?" sub="Report an issue to the AIken team" onPress={() => router.push('/report')} />
        <Row icon="file-text" title="Terms & Privacy" onPress={() => router.push('/terms?view=1')} last />
      </Card>
      <Button label="Log out" kind="glass" icon="log-out" onPress={() => setLogout(true)} />
      <T size={11} color="muted" center>AIken v0.3{profile.email ? ` · Signed in as ${profile.email}` : ''}</T>

      <Dialog visible={logout} onClose={() => setLogout(false)}>
        <DialogIcon name="log-out" />
        <T size={20} w={800} center>Log out of AIken?</T>
        <T size={14} color="muted" center>Your schedule, action plans and Library stay saved. You’ll need to log in again to use Alken.</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button style={{ flex: 1 }} label="Cancel" kind="glass" onPress={() => setLogout(false)} />
          <Button style={{ flex: 1 }} label="Log out" kind="red" onPress={() => { setLogout(false); signOut(); router.replace('/login'); }} />
        </View>
      </Dialog>
    </Screen>
  );
}

import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Glass, Screen, T } from '@/components/aiken/kit';
import { Logo } from '@/components/aiken/Logo';
import { profileFrom, useApp } from '@/context/AppState';

export default function Signup() {
  const { setProfile, setGoogle } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    else if (email.toLowerCase().startsWith('taken')) e.email = 'This email already has an account.';
    if (pw.length < 8) e.pw = 'Use at least 8 characters';
    if (pw2 !== pw) e.pw2 = 'Passwords don’t match';
    setErr(e);
    if (!Object.keys(e).length) {
      setProfile(profileFrom(name, email));
      router.push('/terms');
    }
  };

  return (
    <Screen>
      <View style={{ height: 30 }} />
      <Glass radius={32} style={{ padding: 22, gap: 14 }}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Logo width={170} />
          <T w={700} size={15}>
            Create your account
          </T>
        </View>
        <Field placeholder="Full name" value={name} onChangeText={setName} error={err.name} />
        <Field placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" error={err.email} />
        <Field placeholder="Password" value={pw} onChangeText={setPw} secure error={err.pw} />
        <Field placeholder="Confirm password" value={pw2} onChangeText={setPw2} secure error={err.pw2} />
        <Button label="Create Account" onPress={submit} />
        <T size={12} color="muted" center>
          or continue with
        </T>
        <Button label="Continue with Google" kind="glass" icon="chrome" onPress={() => { setGoogle(true); router.push('/terms'); }} />
        <Pressable onPress={() => router.replace('/login')} style={{ alignSelf: 'center', marginTop: 4 }}>
          <T size={13} color="muted">
            Already have an account?{' '}
            <T size={13} w={800}>
              Log In
            </T>
          </T>
        </Pressable>
      </Glass>
    </Screen>
  );
}

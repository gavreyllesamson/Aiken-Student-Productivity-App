import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Banner, Button, Field, Glass, Screen, T } from '@/components/aiken/kit';
import { Logo } from '@/components/aiken/Logo';
import { profileFrom, useApp } from '@/context/AppState';

export default function Login() {
  const { setSignedIn, setProfile, setGoogle } = useApp();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<{ email?: string; pw?: string; form?: boolean }>({});
  const [attempts, setAttempts] = useState(3);

  const submit = () => {
    const e: typeof err = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!pw) e.pw = 'Password is required';
    else if (pw.length < 8) {
      const left = attempts - 1;
      setAttempts(left);
      e.pw = `Incorrect password. ${left} attempt${left === 1 ? '' : 's'} left before a 5-minute lock.`;
      e.form = true;
    }
    setErr(e);
    if (Object.keys(e).length === 0) {
      setProfile(profileFrom('', email));
      setSignedIn(true);
      router.replace('/');
    }
  };

  return (
    <Screen>
      <View style={{ height: 40 }} />
      <Glass radius={32} style={{ padding: 22, gap: 14 }}>
        <View style={{ alignItems: 'center', marginBottom: 6 }}>
          <Logo width={170} />
        </View>
        {err.form ? <Banner title="Wrong email or password." body="Check your details and try again." /> : null}
        <Field placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" error={err.email} />
        <Field placeholder="Password" value={pw} onChangeText={setPw} secure error={err.pw} />
        <Pressable style={{ alignSelf: 'flex-end' }}>
          <T size={13} w={700}>
            Forgot password?
          </T>
        </Pressable>
        <Button label="Log In" onPress={submit} />
        <T size={12} color="muted" center>
          or continue with
        </T>
        <Button label="Continue with Google" kind="glass" icon="chrome" onPress={() => { setGoogle(true); setSignedIn(true); router.replace('/'); }} />
        <Pressable onPress={() => router.replace('/signup')} style={{ alignSelf: 'center', marginTop: 4 }}>
          <T size={13} color="muted">
            Don’t have an account?{' '}
            <T size={13} w={800}>
              Create Account
            </T>
          </T>
        </Pressable>
      </Glass>
    </Screen>
  );
}

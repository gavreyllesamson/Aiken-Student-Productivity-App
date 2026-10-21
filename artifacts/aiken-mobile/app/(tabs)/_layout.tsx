import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { TabBar } from '@/components/aiken/TabBar';
import { useApp } from '@/context/AppState';

export default function TabLayout() {
  const { signedIn } = useApp();
  if (!signedIn) return <Redirect href="/welcome" />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, animation: 'shift', lazy: true, transitionSpec: { animation: 'timing', config: { duration: 120 } } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="ask" />
      <Tabs.Screen name="concerns" />
      <Tabs.Screen name="library" />
    </Tabs>
  );
}

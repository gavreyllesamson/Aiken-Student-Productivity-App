import React, { createContext, useContext, useState } from 'react';
import * as D from '@/data/aiken';

export type Prefs = { language: string; tone: string; length: string; format: string; college: string; sources: boolean; plans: boolean; reminders: boolean };
export type Profile = { first: string; last: string; username: string; email: string; birthdate: string; studentId: string; college: string };
export type ChatItem =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'answer'; text: string; steps?: string[]; source?: string; planId?: string }
  | { id: string; kind: 'noanswer'; question: string }
  | { id: string; kind: 'classroom'; state: 'ask' | 'allowed' | 'denied' }
  | { id: string; kind: 'text'; text: string };

/** Set EXPO_PUBLIC_SKIP_AUTH=1 to open straight on Home while developing. */
const SKIP_AUTH = process.env.EXPO_PUBLIC_SKIP_AUTH === '1';

const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const EMPTY_PROFILE: Profile = { first: '', last: '', username: '', email: '', birthdate: '', studentId: '', college: '' };

/** Builds a profile from what the user typed at sign up or log in. */
export function profileFrom(fullName: string, email: string): Profile {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const local = email.split('@')[0] ?? '';
  const guess = local.split(/[._-]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1));
  const first = parts[0] ?? guess[0] ?? '';
  const last = parts.slice(1).join(' ') || (parts.length ? '' : guess.slice(1).join(' '));
  return { ...EMPTY_PROFILE, first, last, username: local.toLowerCase(), email: email.trim() };
}

export const initials = (p: Profile) => ((p.first[0] ?? '') + (p.last[0] ?? '')).toUpperCase() || (p.email[0] ?? '?').toUpperCase();

function useStore() {
  const [signedIn, setSignedIn] = useState(SKIP_AUTH);
  const [tourDone, setTourDone] = useState(SKIP_AUTH);
  const [online, setOnline] = useState(true);
  const [profile, setProfile] = useState<Profile>(SKIP_AUTH ? profileFrom('Student', 'student@iskolarngbayan.pup.edu.ph') : EMPTY_PROFILE);
  const [prefs, setPrefs] = useState<Prefs>({ language: 'English', tone: 'Friendly', length: 'Balanced', format: 'Steps', college: '', sources: true, plans: true, reminders: true });
  const [modelDownloaded, setModelDownloaded] = useState(false);
  const [todos, setTodos] = useState<D.Todo[]>([]);
  const [events, setEvents] = useState<D.ClassEvent[]>([]);
  const [plans, setPlans] = useState<D.ActionPlan[]>([]);
  const [uploads, setUploads] = useState<D.Upload[]>([]);
  const [files, setFiles] = useState<D.LibFile[]>([]);
  const [google, setGoogle] = useState(false);
  const [classroom, setClassroom] = useState<'unknown' | 'allowed' | 'denied'>('unknown');
  const [microsoft, setMicrosoft] = useState(false);
  const [backupSync, setBackupSync] = useState(false);
  const [followUpDismissed, setFollowUpDismissed] = useState(false);
  const [notif, setNotif] = useState({ push: true, schedule: true, assignments: true, due: true, followups: true, tips: false });
  const [chat, setChat] = useState<ChatItem[]>([]);

  /** Saves an action plan from Alken's answer (once). */
  const savePlan = (planId: string) =>
    setPlans((ps) => {
      if (ps.some((p) => p.id === planId)) return ps;
      const t = D.planTemplates.find((p) => p.id === planId);
      if (!t) return ps;
      return [{ ...t, status: 'In progress', note: undefined, saved: `Saved ${today()}`, college: prefs.college || 'Your college', steps: t.steps.map((s) => ({ ...s, done: false })) }, ...ps];
    });

  const answerFor = (planId: string): ChatItem => {
    const t = D.planTemplates.find((p) => p.id === planId)!;
    return {
      id: uid(),
      kind: 'answer',
      text: planId === 'late-enrollment' ? 'Late enrollees go through manual verification. Here’s what to do:' : `Here’s how to handle ${t.title.toLowerCase()}:`,
      steps: t.steps.map((s) => s.label),
      source: files.length ? t.source : undefined,
      planId,
    };
  };

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const l = q.toLowerCase();
    const items: ChatItem[] = [{ id: uid(), kind: 'user', text: q }];
    if (l.includes('assignment') || l.includes('due') || l.includes('classroom')) {
      items.push({ id: uid(), kind: 'classroom', state: classroom === 'allowed' ? 'allowed' : 'ask' });
    } else if (l.includes('shift') || l.includes('transfer')) {
      items.push({ id: uid(), kind: 'noanswer', question: q });
    } else if (l.includes('late') || l.includes('enrol')) {
      items.push(answerFor('late-enrollment'));
      if (prefs.plans) savePlan('late-enrollment');
    } else if (l.includes('scholar')) {
      items.push(answerFor('scholarship'));
      if (prefs.plans) savePlan('scholarship');
    } else if (l.includes('intern') || l.includes('ojt')) {
      items.push(answerFor('internship'));
      if (prefs.plans) savePlan('internship');
    } else if (l.includes('plan') || l.includes('week')) {
      items.push({
        id: uid(),
        kind: 'text',
        text: events.length || todos.length
          ? `You have ${events.length} event${events.length === 1 ? '' : 's'} and ${todos.filter((t) => !t.done).length} open task${todos.length === 1 ? '' : 's'}. Start with the task due soonest, then block time before your next class.`
          : 'Your schedule is empty for now. Connect Google Classroom or add your classes in Schedule, and I’ll plan your week around them.',
      });
    } else {
      items.push({
        id: uid(),
        kind: 'text',
        text: files.length
          ? `Here’s what I found for “${q}” in your Library files. Ask me to make it an action plan if you want steps.`
          : `I don’t have your school’s files yet. Upload your student handbook in Library so I can answer “${q}” with sources.`,
      });
    }
    setChat((c) => [...c, ...items]);
  };

  const answerClassroom = (id: string, allow: boolean) => {
    setClassroom(allow ? 'allowed' : 'denied');
    if (allow) setGoogle(true);
    setChat((c) => c.map((m) => (m.id === id && m.kind === 'classroom' ? { ...m, state: allow ? 'allowed' : 'denied' } : m)));
  };

  const addTodos = (items: { title: string; sub: string; due?: string }[]) =>
    setTodos((t) => [...items.map((i) => ({ id: uid(), title: i.title, sub: i.sub, due: i.due ?? 'This week', done: false })), ...t]);
  const toggleTodo = (id: string) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const toggleStep = (planId: string, stepId: string) =>
    setPlans((ps) =>
      ps.map((p) => {
        if (p.id !== planId) return p;
        const steps = p.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
        const status: D.PlanStatus = steps.every((s) => s.done) ? 'Done' : p.status === 'Done' ? 'In progress' : p.status;
        return { ...p, steps, status };
      }),
    );
  const markEmailed = (planId: string) =>
    setPlans((ps) => ps.map((p) => (p.id === planId ? { ...p, status: p.status === 'Done' ? p.status : 'Awaiting reply', note: 'Emailed the office · waiting for a reply' } : p)));

  const addEvent = (e: Omit<D.ClassEvent, 'id'>) => setEvents((ev) => [...ev, { ...e, id: uid() }]);
  const addUpload = (u: Omit<D.Upload, 'id'>): string => {
    const id = uid();
    setUploads((list) => [{ ...u, id }, ...list]);
    if (u.state === 'indexing') {
      setFiles((f) => [{ id, name: u.name, meta: u.meta, use: 'Both', state: 'indexing', progress: 0.1, group: 'mine', icon: 'file-text' }, ...f]);
      setTimeout(() => {
        setUploads((list) => list.map((x) => (x.id === id ? { ...x, state: 'ready' } : x)));
        setFiles((f) => f.map((x) => (x.id === id ? { ...x, state: 'indexed', progress: 1 } : x)));
      }, 2500);
    }
    return id;
  };
  const removeUpload = (id: string) => setUploads((u) => u.filter((x) => x.id !== id));
  const addDriveFiles = (names: { name: string; meta: string }[]) =>
    setFiles((f) => [...names.map((n) => ({ id: uid(), name: n.name, meta: n.meta, use: 'Core' as const, state: 'indexed' as const, group: 'drive' as const, icon: 'triangle' as const })), ...f]);
  const deleteIndex = () => setFiles((f) => f.map((x) => ({ ...x, state: 'indexing' as const, progress: 0 })));

  const signOut = () => setSignedIn(false);
  /** Clears everything, used after the account is deleted. */
  const resetAll = () => {
    setSignedIn(false); setTourDone(false); setProfile(EMPTY_PROFILE); setTodos([]); setEvents([]); setPlans([]);
    setUploads([]); setFiles([]); setChat([]); setGoogle(false); setClassroom('unknown'); setMicrosoft(false); setBackupSync(false);
    setPrefs((p) => ({ ...p, college: '' }));
  };

  return {
    signedIn, setSignedIn, signOut, resetAll,
    tourDone, setTourDone,
    online, setOnline,
    profile, setProfile,
    prefs, setPrefs,
    modelDownloaded, setModelDownloaded,
    todos, toggleTodo, addTodos,
    events, addEvent,
    plans, toggleStep, markEmailed,
    uploads, addUpload, removeUpload,
    files, addDriveFiles, deleteIndex,
    google, setGoogle,
    classroom, setClassroom, answerClassroom,
    microsoft, setMicrosoft, backupSync, setBackupSync,
    followUpDismissed, setFollowUpDismissed,
    notif, setNotif,
    chat, send,
  };
}

type Store = ReturnType<typeof useStore>;
const Ctx = createContext<Store | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStateProvider');
  return v;
}

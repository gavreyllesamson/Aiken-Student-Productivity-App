/**
 * Static data for the AIken UI.
 * A new user starts empty; everything they see comes from what they add or connect.
 * planTemplates, driveFiles and classroomAssignments stand in for API responses until the backend is ready.
 */
import type { IconName } from '@/components/aiken/kit';

export type Source = 'Classroom' | 'Teams' | 'Outlook' | 'Manual';

export type ClassEvent = {
  id: string;
  title: string;
  start: string; // "7:30 AM"
  end: string;
  source: Source;
  note?: string; // Alken comment
  day: number; // offset from today
};

export type Todo = { id: string; title: string; sub: string; due: string; done: boolean };

export type PlanStatus = 'Awaiting reply' | 'In progress' | 'Done';
export type ActionPlan = {
  id: string;
  title: string;
  college: string;
  saved: string;
  status: PlanStatus;
  note?: string;
  source: string;
  steps: { id: string; label: string; done: boolean }[];
  documents: { name: string; sub: string }[];
  tip: string;
  docTip: string;
  contacts: { office: string; hours: string; email: string; phone: string }[];
};

export type LibFile = {
  id: string;
  name: string;
  meta: string;
  use: 'Core' | 'RAG' | 'Both';
  state: 'indexed' | 'indexing' | 'ready';
  progress?: number;
  group: 'pinned' | 'mine' | 'drive';
  icon: IconName;
};

export type Upload = {
  id: string;
  name: string;
  meta: string;
  state: 'indexing' | 'ready' | 'type-error' | 'size-error';
  progress?: number;
  ext?: string;
  sizeMb?: number;
};

export type Conversation = { id: string; title: string; preview: string; tag?: 'Classroom' | 'Action plan' | 'No answer'; group: 'Today' | 'Yesterday' | 'This week' };

export const COLLEGES = [
  { code: 'CCIS', name: 'College of Information and Computer Sciences' },
  { code: 'CE', name: 'College of Engineering' },
  { code: 'CBA', name: 'College of Business Administration' },
  { code: 'CAL', name: 'College of Arts and Letters' },
];




const registrar = { office: 'Office of the University Registrar', hours: 'Mon–Fri, 8:00 AM – 5:00 PM', email: 'registrar@university.edu', phone: '+63 2 8123 0000' };

export const planTemplates: ActionPlan[] = [
  {
    id: 'late-enrollment',
    title: 'Late enrollment',
    college: 'CCIS',
    saved: 'Saved Sep 26',
    status: 'Awaiting reply',
    note: 'Emailed Registrar · no reply in 3 days',
    source: 'PUP_Handbook_2026.pdf · p. 14',
    steps: [
      { id: 's1', label: 'Secure a Late Enrollment Form from your college department', done: true },
      { id: 's2', label: 'Get your Academic Adviser’s signature', done: false },
      { id: 's3', label: 'Proceed to the Registrar for section tagging', done: false },
    ],
    documents: [
      { name: 'Late Enrollment Form', sub: 'From your college department' },
      { name: 'Latest grade report', sub: 'Printed copy' },
      { name: 'Valid school ID', sub: 'Original' },
    ],
    tip: 'A late enrollment fee is usually applied during assessment.',
    docTip: 'Bring originals and one photocopy of each, in case the office keeps a copy.',
    contacts: [
      { office: 'CCS Student Affairs Office', hours: 'Mon–Fri, 8:00 AM – 4:00 PM', email: 'ccs-studentaffairs@university.edu', phone: '+63 2 8123 4567' },
      registrar,
    ],
  },
  {
    id: 'scholarship',
    title: 'Scholarship renewal',
    college: 'CCIS',
    saved: 'Saved Sep 22',
    status: 'In progress',
    source: 'Scholarship_Guide_2026.pdf · p. 3',
    steps: [
      { id: 's1', label: 'Download the renewal form', done: true },
      { id: 's2', label: 'Attach your grade report', done: true },
      { id: 's3', label: 'Get the Dean’s endorsement', done: false },
      { id: 's4', label: 'Submit to the Scholarship Office', done: false },
    ],
    documents: [
      { name: 'Renewal form', sub: 'Signed' },
      { name: 'Grade report', sub: 'Latest semester' },
    ],
    tip: 'Renewals close two weeks after classes start.',
    docTip: 'Keep a scanned copy of everything you submit.',
    contacts: [{ office: 'Office of Scholarships', hours: 'Mon–Fri, 8:00 AM – 5:00 PM', email: 'scholarships@university.edu', phone: '+63 2 8123 1111' }],
  },
  {
    id: 'internship',
    title: 'Internship requirements',
    college: 'CCIS',
    saved: 'Saved Sep 10',
    status: 'Done',
    source: 'OJT_Manual_2026.pdf · p. 6',
    steps: [
      { id: 's1', label: 'Submit the endorsement letter', done: true },
      { id: 's2', label: 'Sign the MOA', done: true },
      { id: 's3', label: 'Attend orientation', done: true },
      { id: 's4', label: 'Submit medical certificate', done: true },
      { id: 's5', label: 'Upload the training plan', done: true },
    ],
    documents: [{ name: 'Endorsement letter', sub: 'From the OJT coordinator' }],
    tip: 'Keep your daily time record updated.',
    docTip: 'Originals go to the OJT coordinator.',
    contacts: [{ office: 'OJT Coordinator, CCIS', hours: 'Mon–Fri, 9:00 AM – 4:00 PM', email: 'ojt-ccis@university.edu', phone: '+63 2 8123 2222' }],
  },
];



export const driveFiles = [
  { id: 'd1', name: 'Thesis Chapter 2 draft', meta: 'Google Doc · edited yesterday', icon: 'file-text' as IconName },
  { id: 'd2', name: 'NPL Activity 1 instructions', meta: 'Google Doc · from Classroom', icon: 'file-text' as IconName },
  { id: 'd3', name: 'ML Lecture Notes', meta: 'Folder · 12 files', icon: 'folder' as IconName },
  { id: 'd4', name: 'SE2 Sprint Plan', meta: 'Google Sheet · 3 days ago', icon: 'grid' as IconName },
];


export const classroomAssignments = [
  { title: 'NPL – Activity 1', course: 'Natural Language Processing', due: 'Today' },
  { title: 'ML – Quiz 3', course: 'Machine Learning', due: 'Tue' },
  { title: 'Thesis Chapter 2 draft', course: 'Thesis Writing', due: 'Fri' },
];

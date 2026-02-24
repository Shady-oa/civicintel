import { User, Admin, Report, ChatMessage, Notification, CurrentSession } from './types';
import { generateSeedData } from './seed-data';

const KEYS = {
  users: 'civic360_users',
  admins: 'civic360_admins',
  reports: 'civic360_reports',
  chats: 'civic360_chats',
  notifications: 'civic360_notifications',
  currentUser: 'civic360_currentUser',
  seeded: 'civic360_seeded',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize default admin + seed data
export function initializeDefaults() {
  const admins = getAdmins();
  if (admins.length === 0) {
    set(KEYS.admins, [
      { id: 'admin-1', username: 'Admin', email: 'admin@gmail.com', password: '123123' },
    ]);
  }

  // Seed sample data on first load
  if (!localStorage.getItem(KEYS.seeded)) {
    const seed = generateSeedData();
    set(KEYS.users, seed.users);
    set(KEYS.reports, seed.reports);
    set(KEYS.chats, seed.chats);
    set(KEYS.notifications, seed.notifications);
    localStorage.setItem(KEYS.seeded, 'true');
  }
}

// Users
export function getUsers(): User[] { return get(KEYS.users, []); }
export function addUser(user: User) { const users = getUsers(); users.push(user); set(KEYS.users, users); }
export function updateUser(id: string, data: Partial<User>) {
  const users = getUsers().map(u => u.id === id ? { ...u, ...data } : u);
  set(KEYS.users, users);
}

// Admins
export function getAdmins(): Admin[] { return get(KEYS.admins, []); }
export function addAdmin(admin: Admin) { const admins = getAdmins(); admins.push(admin); set(KEYS.admins, admins); }
export function updateAdmin(id: string, data: Partial<Admin>) {
  const admins = getAdmins().map(a => a.id === id ? { ...a, ...data } : a);
  set(KEYS.admins, admins);
}
export function deleteAdmin(id: string) {
  set(KEYS.admins, getAdmins().filter(a => a.id !== id));
}

// Reports
export function getReports(): Report[] { return get(KEYS.reports, []); }
export function addReport(report: Report) { const reports = getReports(); reports.push(report); set(KEYS.reports, reports); }
export function updateReport(id: string, data: Partial<Report>) {
  const reports = getReports().map(r => r.id === id ? { ...r, ...data } : r);
  set(KEYS.reports, reports);
}

// Chats
export function getChats(reportId?: string): ChatMessage[] {
  const chats: ChatMessage[] = get(KEYS.chats, []);
  return reportId ? chats.filter(c => c.reportId === reportId) : chats;
}
export function addChat(msg: ChatMessage) { const chats: ChatMessage[] = get(KEYS.chats, []); chats.push(msg); set(KEYS.chats, chats); }

// Notifications
export function getNotifications(userId?: string): Notification[] {
  const notifs: Notification[] = get(KEYS.notifications, []);
  return userId ? notifs.filter(n => n.userId === userId) : notifs;
}
export function addNotification(notif: Notification) {
  const notifs: Notification[] = get(KEYS.notifications, []);
  notifs.push(notif);
  set(KEYS.notifications, notifs);
}
export function markNotificationRead(id: string) {
  const notifs: Notification[] = get(KEYS.notifications, []);
  set(KEYS.notifications, notifs.map(n => n.id === id ? { ...n, read: true } : n));
}
export function markAllNotificationsRead(userId: string) {
  const notifs: Notification[] = get(KEYS.notifications, []);
  set(KEYS.notifications, notifs.map(n => n.userId === userId ? { ...n, read: true } : n));
}

// Session
export function getSession(): CurrentSession | null { return get(KEYS.currentUser, null); }
export function setSession(session: CurrentSession) { set(KEYS.currentUser, session); }
export function clearSession() { localStorage.removeItem(KEYS.currentUser); }

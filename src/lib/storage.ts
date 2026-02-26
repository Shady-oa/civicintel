import { User, Admin, Report, ChatMessage, Notification, CurrentSession, Project, ProjectExpense, ProjectFeedback, ConflictReport, AuditLog, Announcement } from './types';
import { generateSeedData } from './seed-data';

const KEYS = {
  users: 'civicintel_users',
  admins: 'civicintel_admins',
  reports: 'civicintel_reports',
  chats: 'civicintel_chats',
  notifications: 'civicintel_notifications',
  currentUser: 'civicintel_currentUser',
  seeded: 'civicintel_seeded',
  projects: 'civicintel_projects',
  projectExpenses: 'civicintel_projectExpenses',
  projectFeedback: 'civicintel_projectFeedback',
  conflictReports: 'civicintel_conflictReports',
  approvedHotspots: 'civicintel_approvedHotspots',
  auditLogs: 'civicintel_auditLogs',
  announcements: 'civicintel_announcements',
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

  // Migrate old keys if present
  const oldKeys = ['civic360_users', 'civic360_admins', 'civic360_reports', 'civic360_chats', 'civic360_notifications', 'civic360_currentUser', 'civic360_seeded'];
  oldKeys.forEach(k => {
    const val = localStorage.getItem(k);
    if (val) {
      const newKey = k.replace('civic360_', 'civicintel_');
      if (!localStorage.getItem(newKey)) localStorage.setItem(newKey, val);
      localStorage.removeItem(k);
    }
  });

  // Seed sample data on first load
  if (!localStorage.getItem(KEYS.seeded)) {
    const seed = generateSeedData();
    set(KEYS.users, seed.users);
    set(KEYS.reports, seed.reports);
    set(KEYS.chats, seed.chats);
    set(KEYS.notifications, seed.notifications);
    set(KEYS.projects, seed.projects);
    set(KEYS.projectExpenses, seed.projectExpenses);
    set(KEYS.projectFeedback, seed.projectFeedback);
    set(KEYS.conflictReports, seed.conflictReports);
    set(KEYS.announcements, seed.announcements);
    set(KEYS.auditLogs, seed.auditLogs);
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

// Projects
export function getProjects(): Project[] { return get(KEYS.projects, []); }
export function addProject(project: Project) { const p = getProjects(); p.push(project); set(KEYS.projects, p); }
export function updateProject(id: string, data: Partial<Project>) {
  const projects = getProjects().map(p => p.id === id ? { ...p, ...data } : p);
  set(KEYS.projects, projects);
}

// Project Expenses
export function getProjectExpenses(projectId?: string): ProjectExpense[] {
  const expenses: ProjectExpense[] = get(KEYS.projectExpenses, []);
  return projectId ? expenses.filter(e => e.projectId === projectId) : expenses;
}
export function addProjectExpense(expense: ProjectExpense) {
  const expenses = getProjectExpenses();
  expenses.push(expense);
  set(KEYS.projectExpenses, expenses);
}

// Project Feedback
export function getProjectFeedback(projectId?: string): ProjectFeedback[] {
  const feedback: ProjectFeedback[] = get(KEYS.projectFeedback, []);
  return projectId ? feedback.filter(f => f.projectId === projectId) : feedback;
}
export function addProjectFeedback(fb: ProjectFeedback) {
  const feedback: ProjectFeedback[] = get(KEYS.projectFeedback, []);
  feedback.push(fb);
  set(KEYS.projectFeedback, feedback);
}
export function updateProjectFeedback(id: string, data: Partial<ProjectFeedback>) {
  const feedback: ProjectFeedback[] = get(KEYS.projectFeedback, []);
  set(KEYS.projectFeedback, feedback.map(f => f.id === id ? { ...f, ...data } : f));
}

// Conflict Reports
export function getConflictReports(): ConflictReport[] { return get(KEYS.conflictReports, []); }
export function addConflictReport(report: ConflictReport) {
  const reports = getConflictReports();
  reports.push(report);
  set(KEYS.conflictReports, reports);
}
export function updateConflictReport(id: string, data: Partial<ConflictReport>) {
  const reports = getConflictReports().map(r => r.id === id ? { ...r, ...data } : r);
  set(KEYS.conflictReports, reports);
}

// Audit Logs
export function getAuditLogs(): AuditLog[] { return get(KEYS.auditLogs, []); }
export function addAuditLog(log: AuditLog) {
  const logs = getAuditLogs();
  logs.push(log);
  set(KEYS.auditLogs, logs);
}

// Announcements
export function getAnnouncements(): Announcement[] { return get(KEYS.announcements, []); }
export function addAnnouncement(a: Announcement) {
  const announcements = getAnnouncements();
  announcements.push(a);
  set(KEYS.announcements, announcements);
}

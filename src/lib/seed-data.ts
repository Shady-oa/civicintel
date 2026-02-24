import { Report, ChatMessage, Notification, User } from './types';
import { getCategories } from './ai-simulation';

const CATEGORIES = getCategories();
const DEPARTMENTS = [
  'Public Works', 'Police Department', 'Environmental Agency',
  'Transportation Authority', 'Water Board', 'Health Department',
  'Education Board', 'Anti-Corruption Bureau',
];
const SENTIMENTS = ['Urgent', 'Concerned', 'Neutral', 'Frustrated', 'Hopeful'];
const STATUSES: ('Pending' | 'In Progress' | 'Resolved')[] = ['Pending', 'In Progress', 'Resolved'];

const SAMPLE_TITLES: Record<string, string[]> = {
  Infrastructure: ['Pothole on Main Street', 'Broken streetlight near park', 'Cracked sidewalk on 5th Avenue'],
  'Public Safety': ['Unlicensed vendor blocking walkway', 'Missing stop sign at intersection', 'Vandalism at community center'],
  Environment: ['Illegal waste dumping near river', 'Air quality concern in industrial area', 'Dead trees blocking drainage'],
  Transportation: ['Bus stop shelter damaged', 'Traffic signal malfunction', 'Road markings faded on highway'],
  'Water & Sanitation': ['Water pipe leaking on Oak Road', 'Sewage overflow near school', 'No water supply for 3 days'],
  Healthcare: ['Clinic understaffed in District 4', 'Medical waste found in park', 'Broken ambulance service phone line'],
  Education: ['School roof leaking', 'Playground equipment unsafe', 'Overcrowded classrooms in Ward 7'],
  Corruption: ['Bribery at permit office', 'Misuse of public funds reported', 'Ghost workers on payroll'],
};

const SAMPLE_DESCRIPTIONS: string[] = [
  'This issue has been persistent for several weeks and is affecting the daily lives of residents in the area. Immediate attention is needed to prevent further damage.',
  'Multiple residents have reported this problem. The situation is worsening and could pose a safety risk if not addressed promptly.',
  'I noticed this issue during my morning commute. It seems like it has been neglected for a while. Please prioritize this for resolution.',
  'This is causing significant inconvenience to the local community. We request urgent action from the concerned department.',
  'The issue was first reported two months ago but no action has been taken. This follow-up is to escalate the matter for immediate attention.',
  'Residents are deeply concerned about the impact of this issue on public health and safety. We urge the authorities to investigate.',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randInt(6, 22), randInt(0, 59), 0, 0);
  return d.toISOString();
}

export function generateSeedData() {
  // Create sample users
  const sampleUsers: User[] = [
    { id: 'user-seed-1', username: 'Sarah Johnson', email: 'sarah@example.com', password: 'pass123', createdAt: daysAgo(30) },
    { id: 'user-seed-2', username: 'Marcus Lee', email: 'marcus@example.com', password: 'pass123', createdAt: daysAgo(25) },
    { id: 'user-seed-3', username: 'Amara Obi', email: 'amara@example.com', password: 'pass123', createdAt: daysAgo(20) },
    { id: 'user-seed-4', username: 'David Chen', email: 'david@example.com', password: 'pass123', createdAt: daysAgo(15) },
    { id: 'user-seed-5', username: 'Priya Patel', email: 'priya@example.com', password: 'pass123', createdAt: daysAgo(10) },
  ];

  // Create sample reports
  const sampleReports: Report[] = [];
  const reportCount = 18;

  for (let i = 0; i < reportCount; i++) {
    const category = rand(CATEGORIES);
    const titles = SAMPLE_TITLES[category] || ['General Issue'];
    const riskScore = randInt(15, 98);
    const user = rand(sampleUsers);
    const status = rand(STATUSES);
    const catIdx = CATEGORIES.indexOf(category);

    sampleReports.push({
      id: `report-seed-${i}`,
      userId: user.id,
      username: Math.random() > 0.15 ? user.username : 'Anonymous',
      title: rand(titles),
      category,
      description: rand(SAMPLE_DESCRIPTIONS),
      anonymous: Math.random() > 0.85,
      status,
      riskScore,
      riskLevel: riskScore > 70 ? 'High' : 'Low',
      aiConfidence: randInt(75, 99),
      sentiment: rand(SENTIMENTS),
      suggestedDepartment: catIdx >= 0 && catIdx < DEPARTMENTS.length ? DEPARTMENTS[catIdx] : rand(DEPARTMENTS),
      createdAt: daysAgo(randInt(0, 28)),
    });
  }

  // Create sample chats
  const sampleChats: ChatMessage[] = [];
  sampleReports.slice(0, 8).forEach((report, idx) => {
    const baseTime = new Date(report.createdAt).getTime();
    sampleChats.push(
      {
        id: `chat-seed-${idx}-1`,
        reportId: report.id,
        senderId: report.userId,
        senderType: 'user',
        message: 'Hi, I wanted to follow up on this report. When can we expect a response?',
        timestamp: new Date(baseTime + 3600000).toISOString(),
      },
      {
        id: `chat-seed-${idx}-2`,
        reportId: report.id,
        senderId: 'admin-1',
        senderType: 'admin',
        message: 'Thank you for your report. Our team is currently reviewing this issue and will provide an update within 48 hours.',
        timestamp: new Date(baseTime + 7200000).toISOString(),
      }
    );

    if (idx % 2 === 0) {
      sampleChats.push({
        id: `chat-seed-${idx}-3`,
        reportId: report.id,
        senderId: report.userId,
        senderType: 'user',
        message: 'Thank you for the quick response. Looking forward to the update.',
        timestamp: new Date(baseTime + 10800000).toISOString(),
      });
    }
  });

  // Create sample notifications
  const sampleNotifications: Notification[] = [];
  sampleReports.forEach((report, idx) => {
    sampleNotifications.push({
      id: `notif-seed-${idx}`,
      userId: report.userId,
      title: 'Report Submitted',
      message: `Your report "${report.title}" has been submitted successfully.`,
      type: 'success',
      read: idx > 5,
      createdAt: report.createdAt,
    });

    if (report.status !== 'Pending') {
      sampleNotifications.push({
        id: `notif-seed-status-${idx}`,
        userId: report.userId,
        title: 'Status Updated',
        message: `Your report "${report.title}" status changed to ${report.status}.`,
        type: report.status === 'Resolved' ? 'success' : 'info',
        read: idx > 3,
        createdAt: daysAgo(randInt(0, 5)),
      });
    }

    if (report.riskLevel === 'High') {
      sampleNotifications.push({
        id: `notif-seed-risk-${idx}`,
        userId: report.userId,
        title: 'High Risk Alert',
        message: `Your report "${report.title}" has been flagged as high risk (score: ${report.riskScore}).`,
        type: 'warning',
        read: false,
        createdAt: report.createdAt,
      });
    }
  });

  // Admin notifications
  const adminNotifs: Notification[] = [
    { id: 'notif-admin-1', userId: 'admin-1', title: 'New Reports', message: `${reportCount} new reports require your attention.`, type: 'info', read: false, createdAt: daysAgo(0) },
    { id: 'notif-admin-2', userId: 'admin-1', title: 'High Risk Alert', message: `${sampleReports.filter(r => r.riskLevel === 'High').length} reports flagged as high risk.`, type: 'warning', read: false, createdAt: daysAgo(1) },
    { id: 'notif-admin-3', userId: 'admin-1', title: 'Weekly Summary', message: 'Response rate is at 65%. 4 reports resolved this week.', type: 'success', read: true, createdAt: daysAgo(3) },
  ];

  return {
    users: sampleUsers,
    reports: sampleReports,
    chats: sampleChats,
    notifications: [...sampleNotifications, ...adminNotifs],
  };
}

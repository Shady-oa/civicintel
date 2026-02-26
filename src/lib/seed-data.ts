import { Report, ChatMessage, Notification, User, Project, ProjectExpense, ProjectFeedback, ConflictReport, AuditLog, Announcement } from './types';
import { getCategories } from './ai-simulation';

const CATEGORIES = getCategories();
const DEPARTMENTS = [
  'Public Works', 'Police Department', 'Environmental Agency',
  'Transportation Authority', 'Water Board', 'Health Department',
  'Education Board', 'Anti-Corruption Bureau',
];
const SENTIMENTS = ['Urgent', 'Concerned', 'Neutral', 'Frustrated', 'Hopeful'];
const STATUSES: ('Pending' | 'In Progress' | 'Solved')[] = ['Pending', 'In Progress', 'Solved'];

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
  const sampleUsers: User[] = [
    { id: 'user-seed-1', username: 'Sarah Johnson', email: 'sarah@example.com', password: 'pass123', createdAt: daysAgo(30) },
    { id: 'user-seed-2', username: 'Marcus Lee', email: 'marcus@example.com', password: 'pass123', createdAt: daysAgo(25) },
    { id: 'user-seed-3', username: 'Amara Obi', email: 'amara@example.com', password: 'pass123', createdAt: daysAgo(20) },
    { id: 'user-seed-4', username: 'David Chen', email: 'david@example.com', password: 'pass123', createdAt: daysAgo(15) },
    { id: 'user-seed-5', username: 'Priya Patel', email: 'priya@example.com', password: 'pass123', createdAt: daysAgo(10) },
  ];

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
      likes: randInt(0, 25),
      comments: [],
    });
  }

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
        type: report.status === 'Solved' ? 'success' : 'info',
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

  const adminNotifs: Notification[] = [
    { id: 'notif-admin-1', userId: 'admin-1', title: 'New Reports', message: `${reportCount} new reports require your attention.`, type: 'info', read: false, createdAt: daysAgo(0) },
    { id: 'notif-admin-2', userId: 'admin-1', title: 'High Risk Alert', message: `${sampleReports.filter(r => r.riskLevel === 'High').length} reports flagged as high risk.`, type: 'warning', read: false, createdAt: daysAgo(1) },
    { id: 'notif-admin-3', userId: 'admin-1', title: 'Weekly Summary', message: 'Response rate is at 65%. 4 reports solved this week.', type: 'success', read: true, createdAt: daysAgo(3) },
  ];

  // Seed projects
  const sampleProjects: Project[] = [
    {
      id: 'proj-seed-1', title: 'Nairobi-Mombasa Highway Expansion', description: 'Widening the highway to 6 lanes to reduce traffic congestion.',
      region: 'Nairobi County', location: 'Nairobi CBD to Athi River', assignedOfficial: 'MP Salasya', department: 'Public Works',
      startDate: daysAgo(90), expectedCompletionDate: daysAgo(-180), totalBudget: 5000000, fundsReleased: 3500000, fundsSpent: 3200000,
      status: 'Ongoing', progress: 65, createdBy: 'Admin', createdAt: daysAgo(90),
    },
    {
      id: 'proj-seed-2', title: 'Kisumu Water Treatment Plant', description: 'Construction of a modern water treatment facility for clean water access.',
      region: 'Kisumu County', location: 'Kisumu Central', assignedOfficial: 'Gov. Nyong\'o', department: 'Water Board',
      startDate: daysAgo(60), expectedCompletionDate: daysAgo(-120), totalBudget: 2000000, fundsReleased: 1800000, fundsSpent: 2100000,
      status: 'Delayed', progress: 40, createdBy: 'Admin', createdAt: daysAgo(60),
    },
    {
      id: 'proj-seed-3', title: 'Mombasa School Renovation', description: 'Renovating 15 primary schools across the county.',
      region: 'Mombasa County', location: 'Mombasa Island', assignedOfficial: 'Sen. Faki', department: 'Education Board',
      startDate: daysAgo(30), expectedCompletionDate: daysAgo(-60), totalBudget: 800000, fundsReleased: 600000, fundsSpent: 450000,
      status: 'Ongoing', progress: 55, createdBy: 'Admin', createdAt: daysAgo(30),
    },
    {
      id: 'proj-seed-4', title: 'Nakuru Health Center', description: 'Building a new community health center with modern equipment.',
      region: 'Nakuru County', location: 'Nakuru Town East', assignedOfficial: 'MP Kihara', department: 'Health Department',
      startDate: daysAgo(120), expectedCompletionDate: daysAgo(-30), totalBudget: 1500000, fundsReleased: 1500000, fundsSpent: 1400000,
      status: 'Completed', progress: 100, createdBy: 'Admin', createdAt: daysAgo(120),
    },
  ];

  const sampleExpenses: ProjectExpense[] = [
    { id: 'exp-1', projectId: 'proj-seed-1', title: 'Asphalt Supply', amount: 1200000, date: daysAgo(80), category: 'Materials', description: 'Bulk asphalt for road surfacing', createdAt: daysAgo(80) },
    { id: 'exp-2', projectId: 'proj-seed-1', title: 'Labor Q1', amount: 800000, date: daysAgo(60), category: 'Labor', description: 'Worker wages for Q1', createdAt: daysAgo(60) },
    { id: 'exp-3', projectId: 'proj-seed-1', title: 'Equipment Rental', amount: 500000, date: daysAgo(40), category: 'Transport', description: 'Heavy machinery rental', createdAt: daysAgo(40) },
    { id: 'exp-4', projectId: 'proj-seed-1', title: 'Engineering Consultancy', amount: 700000, date: daysAgo(20), category: 'Consultancy', description: 'Structural engineering review', createdAt: daysAgo(20) },
    { id: 'exp-5', projectId: 'proj-seed-2', title: 'Pipes and Fittings', amount: 900000, date: daysAgo(50), category: 'Materials', description: 'Water treatment pipes', createdAt: daysAgo(50) },
    { id: 'exp-6', projectId: 'proj-seed-2', title: 'Construction Labor', amount: 700000, date: daysAgo(30), category: 'Labor', description: 'Construction workers', createdAt: daysAgo(30) },
    { id: 'exp-7', projectId: 'proj-seed-2', title: 'Chemical Supplies', amount: 500000, date: daysAgo(10), category: 'Materials', description: 'Water treatment chemicals', createdAt: daysAgo(10) },
    { id: 'exp-8', projectId: 'proj-seed-3', title: 'Building Materials', amount: 300000, date: daysAgo(25), category: 'Materials', description: 'Cement, roofing, etc.', createdAt: daysAgo(25) },
    { id: 'exp-9', projectId: 'proj-seed-3', title: 'Renovation Labor', amount: 150000, date: daysAgo(15), category: 'Labor', description: 'Contractor fees', createdAt: daysAgo(15) },
  ];

  const sampleFeedback: ProjectFeedback[] = [
    { id: 'fb-1', projectId: 'proj-seed-1', userId: 'user-seed-1', username: 'Sarah Johnson', comment: 'Progress is visible but the dust pollution is terrible for nearby residents.', rating: 3, upvotes: 5, upvotedBy: [], createdAt: daysAgo(10) },
    { id: 'fb-2', projectId: 'proj-seed-1', userId: 'user-seed-2', username: 'Marcus Lee', comment: 'Great project! Traffic has already improved on the completed sections.', rating: 4, upvotes: 12, upvotedBy: [], createdAt: daysAgo(5) },
    { id: 'fb-3', projectId: 'proj-seed-2', userId: 'user-seed-3', username: 'Amara Obi', comment: 'This project is way over budget. Where is the money going? Very suspicious.', rating: 1, upvotes: 25, upvotedBy: [], createdAt: daysAgo(3) },
    { id: 'fb-4', projectId: 'proj-seed-2', userId: 'user-seed-4', username: 'David Chen', comment: 'We still don\'t have clean water after 2 months of "construction". Disappointed.', rating: 2, upvotes: 18, upvotedBy: [], createdAt: daysAgo(2) },
    { id: 'fb-5', projectId: 'proj-seed-4', userId: 'user-seed-5', username: 'Priya Patel', comment: 'The health center is excellent! Modern equipment and great staff. Thank you!', rating: 5, upvotes: 30, upvotedBy: [], createdAt: daysAgo(1) },
  ];

  const sampleConflicts: ConflictReport[] = [
    { id: 'conflict-1', userId: 'user-seed-1', username: 'Sarah Johnson', conflictType: 'Land Dispute', location: 'Eldoret, Uasin Gishu', description: 'Ongoing land boundary dispute between two communities affecting over 200 families.', anonymous: false, status: 'Approved', severity: 'High', createdAt: daysAgo(14) },
    { id: 'conflict-2', userId: 'user-seed-2', username: 'Marcus Lee', conflictType: 'Protest', location: 'Nairobi CBD', description: 'Large-scale protest planned against rising fuel prices. Potential for violence.', anonymous: false, status: 'Approved', severity: 'Medium', createdAt: daysAgo(7) },
    { id: 'conflict-3', userId: 'user-seed-3', username: 'Anonymous', conflictType: 'Ethnic Tension', location: 'Isiolo County', description: 'Rising tensions between pastoralist communities over water resources.', anonymous: true, status: 'Pending', severity: 'High', createdAt: daysAgo(3) },
    { id: 'conflict-4', userId: 'user-seed-4', username: 'David Chen', conflictType: 'Crime', location: 'Mombasa, Likoni', description: 'Increasing gang activity and robberies in the Likoni area at night.', anonymous: false, status: 'Approved', severity: 'High', createdAt: daysAgo(5) },
    { id: 'conflict-5', userId: 'user-seed-5', username: 'Priya Patel', conflictType: 'Political Violence', location: 'Kisumu, Kondele', description: 'Post-election tensions with reports of property destruction.', anonymous: false, status: 'Escalated', severity: 'High', createdAt: daysAgo(1) },
  ];

  const sampleAuditLogs: AuditLog[] = [
    { id: 'audit-1', adminId: 'admin-1', adminName: 'Admin', action: 'Project Created', details: 'Created project "Nairobi-Mombasa Highway Expansion"', timestamp: daysAgo(90) },
    { id: 'audit-2', adminId: 'admin-1', adminName: 'Admin', action: 'Budget Updated', details: 'Released KES 3,500,000 for Highway Expansion', timestamp: daysAgo(85) },
    { id: 'audit-3', adminId: 'admin-1', adminName: 'Admin', action: 'Report Status Changed', details: 'Changed "Pothole on Main Street" to In Progress', timestamp: daysAgo(20) },
    { id: 'audit-4', adminId: 'admin-1', adminName: 'Admin', action: 'Conflict Approved', details: 'Approved conflict report for Eldoret land dispute', timestamp: daysAgo(13) },
    { id: 'audit-5', adminId: 'admin-1', adminName: 'Admin', action: 'Expense Added', details: 'Added KES 1,200,000 expense for asphalt supply', timestamp: daysAgo(80) },
  ];

  const sampleAnnouncements: Announcement[] = [
    { id: 'ann-1', adminId: 'admin-1', adminName: 'Admin', title: 'Road Closure Notice', message: 'The Nairobi-Mombasa Highway section near Athi River will be closed for construction from Monday to Wednesday next week.', urgent: true, targetCounty: 'Nairobi County', createdAt: daysAgo(2) },
    { id: 'ann-2', adminId: 'admin-1', adminName: 'Admin', title: 'Water Rationing Schedule', message: 'Due to ongoing construction at the Kisumu Water Treatment Plant, water rationing will be in effect for the next 2 weeks.', urgent: false, targetCounty: 'Kisumu County', createdAt: daysAgo(5) },
    { id: 'ann-3', adminId: 'admin-1', adminName: 'Admin', title: 'Community Safety Alert', message: 'Residents of Likoni area are advised to exercise caution and report any suspicious activities to the nearest police station.', urgent: true, targetCounty: 'Mombasa County', createdAt: daysAgo(4) },
  ];

  return {
    users: sampleUsers,
    reports: sampleReports,
    chats: sampleChats,
    notifications: [...sampleNotifications, ...adminNotifs],
    projects: sampleProjects,
    projectExpenses: sampleExpenses,
    projectFeedback: sampleFeedback,
    conflictReports: sampleConflicts,
    auditLogs: sampleAuditLogs,
    announcements: sampleAnnouncements,
  };
}

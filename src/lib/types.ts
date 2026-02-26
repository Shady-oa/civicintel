export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  password: string;
}

export interface Report {
  id: string;
  userId: string;
  username: string;
  title: string;
  category: string;
  description: string;
  image?: string;
  anonymous: boolean;
  status: 'Pending' | 'In Progress' | 'Solved';
  riskScore: number;
  riskLevel: 'High' | 'Low';
  aiConfidence: number;
  sentiment: string;
  suggestedDepartment: string;
  createdAt: string;
  likes?: number;
  comments?: ReportComment[];
}

export interface ReportComment {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  reportId: string;
  senderId: string;
  senderType: 'user' | 'admin' | 'system';
  message: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  read: boolean;
  createdAt: string;
}

export interface CurrentSession {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  region: string;
  location: string;
  assignedOfficial: string;
  department: string;
  startDate: string;
  expectedCompletionDate: string;
  totalBudget: number;
  fundsReleased: number;
  fundsSpent: number;
  status: 'Planning' | 'Ongoing' | 'Completed' | 'Delayed';
  progress: number;
  supportingDocument?: string;
  createdBy: string;
  createdAt: string;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  date: string;
  category: 'Materials' | 'Labor' | 'Transport' | 'Consultancy' | 'Other';
  description: string;
  receipt?: string;
  createdAt: string;
}

export interface ProjectFeedback {
  id: string;
  projectId: string;
  userId: string;
  username: string;
  comment: string;
  image?: string;
  rating: number;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
}

export interface ConflictReport {
  id: string;
  userId: string;
  username: string;
  conflictType: 'Ethnic Tension' | 'Protest' | 'Crime' | 'Political Violence' | 'Land Dispute';
  location: string;
  description: string;
  image?: string;
  anonymous: boolean;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Escalated';
  severity: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  adminId: string;
  adminName: string;
  title: string;
  message: string;
  urgent: boolean;
  targetCounty: string;
  image?: string;
  createdAt: string;
}

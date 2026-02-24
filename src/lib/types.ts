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
  status: 'Pending' | 'In Progress' | 'Resolved';
  riskScore: number;
  riskLevel: 'High' | 'Low';
  aiConfidence: number;
  sentiment: string;
  suggestedDepartment: string;
  createdAt: string;
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

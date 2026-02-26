const CATEGORIES = [
  'Infrastructure', 'Public Safety', 'Environment', 'Transportation',
  'Water & Sanitation', 'Healthcare', 'Education', 'Corruption',
];

const DEPARTMENTS = [
  'Public Works', 'Police Department', 'Environmental Agency',
  'Transportation Authority', 'Water Board', 'Health Department',
  'Education Board', 'Anti-Corruption Bureau',
];

const SENTIMENTS = ['Urgent', 'Concerned', 'Neutral', 'Frustrated', 'Hopeful'];

export function generateRiskScore(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function getRiskLevel(score: number): 'High' | 'Low' {
  return score > 70 ? 'High' : 'Low';
}

export function generateAIConfidence(): number {
  return Math.floor(Math.random() * 25) + 75; // 75-99%
}

export function detectSentiment(): string {
  return SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)];
}

export function suggestDepartment(category: string): string {
  const idx = CATEGORIES.indexOf(category);
  if (idx >= 0 && idx < DEPARTMENTS.length) return DEPARTMENTS[idx];
  return DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
}

export function getCategories(): string[] {
  return CATEGORIES;
}

export function generateAutoResponse(): string {
  const responses = [
    'Your issue is being reviewed by our team.',
    'Thank you for reporting. We are investigating this matter.',
    'This has been forwarded to the relevant department.',
    'We acknowledge your concern and will update you shortly.',
    'Our team is actively working on resolving this issue.',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Predictive simulation
export function predictCompletionDelay(progress: number, daysElapsed: number, totalDays: number): { delayProbability: number; confidence: number } {
  const expectedProgress = Math.min(100, (daysElapsed / totalDays) * 100);
  const gap = expectedProgress - progress;
  const delayProbability = Math.min(95, Math.max(5, gap * 2 + Math.random() * 15));
  const confidence = Math.floor(Math.random() * 15) + 80;
  return { delayProbability: Math.round(delayProbability), confidence };
}

export function predictBudgetOverrun(totalBudget: number, fundsSpent: number, progress: number): { overrunProbability: number; confidence: number } {
  const spentRatio = fundsSpent / totalBudget;
  const progressRatio = progress / 100;
  const projectedTotal = progressRatio > 0 ? fundsSpent / progressRatio : fundsSpent * 2;
  const overrunRatio = (projectedTotal - totalBudget) / totalBudget;
  const overrunProbability = Math.min(95, Math.max(5, overrunRatio * 100 + Math.random() * 10));
  const confidence = Math.floor(Math.random() * 15) + 78;
  return { overrunProbability: Math.round(overrunProbability), confidence };
}

export function predictConflictEscalation(severity: string, reportCount: number): { escalationProbability: number; confidence: number } {
  const base = severity === 'High' ? 60 : severity === 'Medium' ? 35 : 15;
  const escalationProbability = Math.min(95, base + reportCount * 5 + Math.random() * 10);
  const confidence = Math.floor(Math.random() * 15) + 75;
  return { escalationProbability: Math.round(escalationProbability), confidence };
}

export function calculateTransparencyIndex(reports: { status: string }[], projects: { totalBudget: number; fundsSpent: number }[], avgRating: number): number {
  const totalReports = reports.length || 1;
  const solvedRate = (reports.filter(r => r.status === 'Solved').length / totalReports) * 100;
  const budgetCompliance = projects.length > 0
    ? (projects.filter(p => p.fundsSpent <= p.totalBudget).length / projects.length) * 100
    : 100;
  const ratingScore = (avgRating / 5) * 100;
  const responseRate = (reports.filter(r => r.status !== 'Pending').length / totalReports) * 100;

  return Math.round((solvedRate * 0.3 + budgetCompliance * 0.3 + ratingScore * 0.2 + responseRate * 0.2));
}

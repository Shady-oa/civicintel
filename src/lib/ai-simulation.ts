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

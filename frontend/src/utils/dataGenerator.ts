import { Employee, Department, TimePoint } from '@/types/employee';
import { calculateBurnoutRisk, calculateAttritionRisk } from './riskCalculation';

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Sasha', 'Drew', 'Jamie', 'Reese', 'Cameron', 'Dakota', 'Hayden', 'Emerson',
  'Kai', 'Rowan', 'Sage', 'Phoenix', 'Blake', 'Finley', 'Harper', 'Peyton',
  'Aria', 'Noel', 'River', 'Skyler', 'Charlie', 'Ellis', 'Lennox', 'Marlowe',
  'Remy', 'Shiloh', 'Tatum', 'Wren', 'Zion', 'Arden', 'Baylor', 'Cruz',
  'Devin', 'Eden', 'Frankie', 'Gray', 'Haven', 'Indigo', 'Jules', 'Kit',
  'Lane', 'Milan', 'Nico', 'Oakley', 'Parker', 'Rory', 'Sterling', 'Val',
];

const LAST_NAMES = [
  'Chen', 'Smith', 'Brown', 'Lee', 'Davis', 'Garcia', 'Wilson', 'Anderson',
  'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore',
  'Taylor', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'King', 'Wright',
  'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter',
  'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker',
  'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers',
];

const DEPARTMENTS: Department[] = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance', 'Product', 'Design'];

const ROLES: Record<Department, string[]> = {
  Engineering: ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'DevOps Engineer', 'QA Engineer'],
  Sales: ['Account Executive', 'Sales Manager', 'SDR', 'Enterprise AE', 'Sales Ops'],
  Marketing: ['Marketing Manager', 'Content Strategist', 'Growth Analyst', 'Brand Designer', 'SEO Specialist'],
  HR: ['HR Business Partner', 'Recruiter', 'People Ops Manager', 'L&D Specialist', 'HRIS Analyst'],
  Operations: ['Operations Manager', 'Business Analyst', 'Project Manager', 'Process Engineer', 'Supply Chain Analyst'],
  Finance: ['Financial Analyst', 'Controller', 'Accountant', 'FP&A Manager', 'Tax Specialist'],
  Product: ['Product Manager', 'Product Designer', 'UX Researcher', 'Data Analyst', 'Scrum Master'],
  Design: ['UI Designer', 'UX Designer', 'Design Lead', 'Visual Designer', 'Motion Designer'],
};

const POSITIVE_FEEDBACK = [
  "I feel incredibly supported by my team. The collaborative environment helps me grow every day.",
  "Great work-life balance and excellent management support. I'm motivated and engaged.",
  "The company culture is fantastic. I feel valued and appreciated for my contributions.",
  "Love the new mentorship program. It's helping me develop skills I've always wanted.",
  "My manager is great at providing feedback. I feel I'm on a strong growth trajectory.",
  "The team is amazing. We celebrate wins together and support each other through challenges.",
  "I'm excited about our product roadmap. It feels like we're building something meaningful.",
  "Flexible work policy has been a game-changer for my productivity and happiness.",
];

const NEUTRAL_FEEDBACK = [
  "Work is going okay. Some days are better than others, but overall it's fine.",
  "The new process changes are taking some getting used to, but I understand why they're needed.",
  "Team dynamics are decent. Could use more cross-functional collaboration.",
  "Workload is manageable most weeks. Occasionally it spikes but that's expected.",
  "The role is meeting my expectations so far. Nothing particularly exciting or concerning.",
];

const NEGATIVE_FEEDBACK = [
  "I'm feeling overwhelmed with the workload. Multiple deadlines are causing significant stress.",
  "Frustrated with the lack of career growth opportunities. Feeling stagnant in my role.",
  "The constant pressure and overtime is leading to burnout. I dread coming to work.",
  "Management doesn't listen to our concerns. I feel undervalued and ignored.",
  "Toxic team dynamics and micromanagement are making me consider leaving.",
  "Exhausted from back-to-back projects. No time for learning or personal development.",
  "I'm stressed about the reorganization. Job security concerns are affecting my performance.",
  "Unhappy with compensation. Market rates are much higher for my role and experience.",
];

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function seedFromId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function generateTimeHistory(months: number, baseScore: number, variance: number, trend: number): TimePoint[] {
  const points: TimePoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const noise = (Math.random() - 0.5) * variance;
    const trendEffect = ((months - i) / months) * trend;
    const score = Math.max(-1, Math.min(100, baseScore + noise + trendEffect));
    points.push({ date: d.toISOString().split('T')[0], score: Math.round(score * 100) / 100 });
  }
  return points;
}

function generateFeedback(sentimentScore: number): string[] {
  const feedback: string[] = [];
  const count = randInt(2, 4);
  for (let i = 0; i < count; i++) {
    if (sentimentScore > 0.3) feedback.push(pick(POSITIVE_FEEDBACK));
    else if (sentimentScore < -0.3) feedback.push(pick(NEGATIVE_FEEDBACK));
    else feedback.push(pick(NEUTRAL_FEEDBACK));
  }
  return [...new Set(feedback)]; // dedupe
}

export function generateEmployees(count: number = 100): Employee[] {
  const employees: Employee[] = [];
  const usedNames = new Set<string>();
  const onboardingSlots = [
    { index: 0, department: 'Engineering', flags: ['Integration Risk'] },
    { index: 1, department: 'Engineering', flags: ['Ramp Risk'] },
    { index: 2, department: 'Sales', flags: ['Isolation Risk'] },
    { index: 3, department: 'Sales', flags: ['Integration Risk'] },
    { index: 4, department: 'HR', flags: ['Ramp Risk'] },
    { index: 5, department: 'HR', flags: ['Isolation Risk'] },
    { index: 6, department: 'Design', flags: ['Integration Risk'] },
    { index: 7, department: 'Finance', flags: ['Integration Risk', 'Ramp Risk', 'Isolation Risk'] },
  ] as const;
  const onboardingMap = new Map<number, { department: Department; flags: string[] }>(
    onboardingSlots.map((slot) => [slot.index, { department: slot.department as Department, flags: [...slot.flags] }]),
  );

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const forcedOnboarding = onboardingMap.get(i);
    const department = forcedOnboarding?.department ?? pick(DEPARTMENTS);
    const role = pick(ROLES[department]);
    const tenure = forcedOnboarding ? randInt(1, 2) : randInt(4, 72);

    // Create correlated scores
    const baseWellbeing = Math.random(); // 0=poor, 1=great
    const performanceScore = Math.round(rand(50, 100) * (0.5 + baseWellbeing * 0.5));
    const engagementScore = Math.round(rand(30, 100) * (0.3 + baseWellbeing * 0.7));
    const sentimentScore = Math.round((baseWellbeing * 2 - 1 + (Math.random() - 0.5) * 0.5) * 100) / 100;
    const clampedSentiment = Math.max(-1, Math.min(1, sentimentScore));

    const workHoursPerWeek = Math.round(rand(35, 55));
    const projectLoad = randInt(1, 6);
    const absenceDays = baseWellbeing < 0.3 ? randInt(5, 15) : randInt(0, 6);

    const perfTrend = baseWellbeing < 0.3 ? rand(-15, -5) : rand(-3, 10);
    const performanceHistory = generateTimeHistory(12, performanceScore, 8, perfTrend);
    const sentimentHistory = generateTimeHistory(12, clampedSentiment * 50 + 50, 10, baseWellbeing < 0.3 ? -10 : 5).map(p => ({
      ...p,
      score: Math.round((p.score / 50 - 1) * 100) / 100,
    }));

    const perfDecline = perfTrend < -5 ? Math.abs(perfTrend) / 20 : 0;
    const absenceRate = absenceDays / 15;
    const perfStagnation = Math.abs(perfTrend) < 3 ? 0.5 : perfTrend < -5 ? 0.8 : 0.1;

    const burnoutRisk = calculateBurnoutRisk(workHoursPerWeek, clampedSentiment, perfDecline, absenceRate);
    const attritionRisk = calculateAttritionRisk(clampedSentiment, engagementScore, tenure, perfStagnation);

    const lastAssessmentDate = new Date();
    lastAssessmentDate.setDate(lastAssessmentDate.getDate() - randInt(1, 45));

    const employeeId = `EMP${(i + 1).toString().padStart(4, '0')}`;
    const seeded = seededRandom(seedFromId(employeeId));
    const attendanceRate = Number((0.75 + seeded() * 0.25).toFixed(2));
    const avgWeeklyHours = Number((38 + seeded() * 20).toFixed(1));
    const leavesTaken30d = Math.floor(seeded() * 6);
    const kpiScore = Number((0.4 + seeded() * 0.6).toFixed(2));
    const lastOneOnOneDaysAgo = 3 + Math.floor(seeded() * 43);
    const feedbackSubmissionsCount = Math.floor(seeded() * 9);
    const afterHoursSessionsWeekly = Math.floor(seeded() * 7);
    const tenureDays = forcedOnboarding
      ? 7 + Math.floor(seeded() * 79)
      : 90 + Math.floor(seeded() * 1711);
    const peerConnectionCount = 1 + Math.floor(seeded() * 8);

    const onboardingFlags = forcedOnboarding ? forcedOnboarding.flags : [];
    const adjustedPeerConnections = onboardingFlags.includes('Integration Risk') ? Math.min(peerConnectionCount, 2) : peerConnectionCount;
    const adjustedKpi = onboardingFlags.includes('Ramp Risk') ? Math.min(kpiScore, 0.49) : kpiScore;
    const adjustedOneOnOne = onboardingFlags.includes('Isolation Risk') ? Math.max(lastOneOnOneDaysAgo, 21) : lastOneOnOneDaysAgo;

    const qualityFields = [
      attendanceRate,
      avgWeeklyHours,
      leavesTaken30d,
      adjustedKpi,
      adjustedOneOnOne,
      feedbackSubmissionsCount,
      afterHoursSessionsWeekly,
      tenureDays,
    ];
    const nonNullCount = qualityFields.filter((value) => value !== null && value !== undefined).length;
    const dataQualityScore = Math.round((nonNullCount / qualityFields.length) * 100);

    employees.push({
      id: employeeId,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
      department,
      role,
      tenure,
      performanceScore: Math.max(0, Math.min(100, performanceScore)),
      engagementScore: Math.max(0, Math.min(100, engagementScore)),
      sentimentScore: clampedSentiment,
      burnoutRisk,
      attritionRisk,
      workHoursPerWeek,
      projectLoad,
      absenceDays,
      lastAssessment: lastAssessmentDate.toISOString().split('T')[0],
      recentFeedback: generateFeedback(clampedSentiment),
      performanceHistory,
      sentimentHistory,
      isOnboarding: tenureDays < 90,
      onboardingDay: Math.min(89, tenureDays),
      onboardingFlags,
      attendanceRate,
      avgWeeklyHours,
      leavesTaken30d,
      kpiScore: adjustedKpi,
      lastOneOnOneDaysAgo: adjustedOneOnOne,
      feedbackSubmissionsCount,
      afterHoursSessionsWeekly,
      tenureDays,
      peerConnectionCount: adjustedPeerConnections,
      dataQualityScore,
    });
  }

  return employees;
}

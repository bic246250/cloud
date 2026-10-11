/**
 * Shared pregnancy calculation engine.
 * All dates are local midnight. No timezone conversion.
 */

export interface PregnancyInput {
  lmp: Date;              // Last menstrual period
  cycleLength: number;    // Average cycle length (default 28)
  referenceDate: Date;    // Date to calculate from (default today)
}

export interface GestationalAgeResult {
  weeks: number;
  days: number;
  totalDays: number;
  trimester: 1 | 2 | 3;
  trimesterStart: Date;
  trimesterEnd: Date;
  estimatedDueDate: Date;
  daysUntilDue: number;   // negative if past due
  termClassification: string;
  isPostterm: boolean;
}

const MS_PER_DAY = 86400000;
const STANDARD_GESTATION = 280; // days
const CONCEPTION_OFFSET = 266;  // days from conception to due date

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(a: Date, b: Date): number {
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((da.getTime() - db.getTime()) / MS_PER_DAY);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateGestationalAge(input: PregnancyInput): GestationalAgeResult {
  const { lmp, cycleLength, referenceDate } = input;

  // Cycle-corrected LMP
  const cycleOffset = cycleLength - 28;
  const correctedLmp = addDays(lmp, cycleOffset);

  // Estimated due date
  const edd = addDays(correctedLmp, STANDARD_GESTATION);

  // Gestational age
  const totalDays = diffDays(referenceDate, correctedLmp);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  // Trimester (ACOG boundaries)
  let trimester: 1 | 2 | 3;
  let trimesterStart: Date;
  let trimesterEnd: Date;

  if (weeks < 14) {
    trimester = 1;
    trimesterStart = addDays(correctedLmp, 0);
    trimesterEnd = addDays(correctedLmp, 97); // 13 6/7 weeks = 97 days
  } else if (weeks < 28) {
    trimester = 2;
    trimesterStart = addDays(correctedLmp, 98); // 14 0/7 weeks = 98 days
    trimesterEnd = addDays(correctedLmp, 195); // 27 6/7 weeks = 195 days
  } else {
    trimester = 3;
    trimesterStart = addDays(correctedLmp, 196); // 28 0/7 weeks = 196 days
    trimesterEnd = addDays(correctedLmp, STANDARD_GESTATION);
  }

  // Term classification (ACOG)
  let termClassification: string;
  let isPostterm = false;

  if (weeks < 37) {
    termClassification = 'Preterm';
  } else if (weeks < 39) {
    termClassification = 'Early term';
  } else if (weeks < 41) {
    termClassification = 'Full term';
  } else if (weeks < 42) {
    termClassification = 'Late term';
  } else {
    termClassification = 'Postterm';
    isPostterm = true;
  }

  const daysUntilDue = diffDays(edd, referenceDate);

  return {
    weeks,
    days,
    totalDays,
    trimester,
    trimesterStart,
    trimesterEnd,
    estimatedDueDate: edd,
    daysUntilDue,
    termClassification,
    isPostterm,
  };
}

export function calculateConceptionWindow(input: PregnancyInput): {
  conceptionDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
} {
  const { lmp, cycleLength } = input;
  const cycleOffset = cycleLength - 28;
  const correctedLmp = addDays(lmp, cycleOffset);

  // Ovulation: ~14 days before next period
  const ovulationDate = addDays(correctedLmp, cycleLength - 14);

  // Fertile window: 5 days before ovulation to 1 day after
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);

  // Conception date (approximate)
  const conceptionDate = ovulationDate;

  return {
    conceptionDate,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate,
  };
}

export function calculateDueDateFromConception(conceptionDate: Date): Date {
  return addDays(conceptionDate, CONCEPTION_OFFSET);
}

export function calculateDueDateFromIVF(transferDate: Date, day: 3 | 5): Date {
  const offset = day === 3 ? 263 : 261;
  return addDays(transferDate, offset);
}

export function calculateDueDateFromUltrasound(
  scanDate: Date,
  gestationalAgeWeeks: number,
  gestationalAgeDays: number
): Date {
  const scanGestationalDays = gestationalAgeWeeks * 7 + gestationalAgeDays;
  const daysRemaining = STANDARD_GESTATION - scanGestationalDays;
  return addDays(scanDate, daysRemaining);
}

export function getMilestoneDates(lmp: Date, cycleLength: number): Array<{
  milestone: string;
  date: Date;
  week: string;
  source: string;
}> {
  const cycleOffset = cycleLength - 28;
  const correctedLmp = addDays(lmp, cycleOffset);

  return [
    {
      milestone: 'Dating / viability scan window',
      date: addDays(correctedLmp, 49), // 7 weeks
      week: '7-12 weeks',
      source: 'ACOG',
    },
    {
      milestone: 'First-trimester screening (NT scan)',
      date: addDays(correctedLmp, 77), // 11 weeks
      week: '11-13 weeks',
      source: 'ACOG',
    },
    {
      milestone: 'Embryo → fetus transition',
      date: addDays(correctedLmp, 77), // 11 weeks
      week: 'Week 11',
      source: 'ACOG',
    },
    {
      milestone: 'All major organs formed',
      date: addDays(correctedLmp, 91), // 13 weeks
      week: 'By week 13',
      source: 'ACOG',
    },
    {
      milestone: 'Quickening (first movement)',
      date: addDays(correctedLmp, 126), // 18 weeks
      week: '16-22 weeks',
      source: 'ACOG',
    },
    {
      milestone: 'Anatomy scan',
      date: addDays(correctedLmp, 140), // 20 weeks
      week: '18-22 weeks',
      source: 'ACOG',
    },
    {
      milestone: 'Periviable period begins',
      date: addDays(correctedLmp, 140), // 20 weeks
      week: '20 0/7 weeks',
      source: 'ACOG',
    },
    {
      milestone: 'Third trimester begins',
      date: addDays(correctedLmp, 196), // 28 weeks
      week: '28 0/7 weeks',
      source: 'ACOG',
    },
    {
      milestone: 'Early term',
      date: addDays(correctedLmp, 259), // 37 weeks
      week: '37 0/7 weeks',
      source: 'ACOG',
    },
    {
      milestone: 'Full term',
      date: addDays(correctedLmp, 273), // 39 weeks
      week: '39 0/7 weeks',
      source: 'ACOG',
    },
    {
      milestone: 'Estimated due date',
      date: addDays(correctedLmp, 280), // 40 weeks
      week: '40 0/7 weeks',
      source: 'ACOG',
    },
  ];
}

export { formatDate, addDays, diffDays };

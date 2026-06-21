// Savings engine for the "Viaje a Tailandia" goal.
//
// Pure functions only — no React, no storage. Everything is derived from the
// goal config (set by the user), the contributions ledger (localStorage), and
// the real Notion transactions (read-only, for feasibility + opportunities).
//
// Design choices are behavioural, not just arithmetic:
//   - we always surface the *small monthly adjustment*, never the scary total gap;
//   - discretionary cuts are translated into "días en Tailandia" to make the
//     reward vivid (beats the present-bias that kills most savings goals).

import { CATEGORY_EMOJI } from '../constants/categories';

// Expense categories that are realistically trim-able. Fixed/essential ones
// (health, transportation) are excluded from the "dónde ahorrar" suggestions.
const DISCRETIONARY = ['food & drinks', 'entertainment', 'shopping'];

// Fraction of a category's recent spend we suggest redirecting to the fund.
const CUT_RATE = 0.2;

// Milestones as fractions of the target, themed to the trip so each one is a
// celebrable "stop" on the journey rather than an abstract percentage.
const MILESTONES = [
  { pct: 0.15, emoji: '✈️', label: 'Vuelos cubiertos' },
  { pct: 0.35, emoji: '🏨', label: 'Alojamiento listo' },
  { pct: 0.55, emoji: '🍜', label: 'Comida y transporte del viaje' },
  { pct: 0.75, emoji: '🏝️', label: 'Island hopping financiado' },
  { pct: 1.0,  emoji: '🎉', label: '¡Viaje completo!' },
];

// --- date helpers ---------------------------------------------------------

// Fractional months between two YYYY-MM-DD dates (day-of-month adds a fraction).
export function monthsBetween(fromYMD, toYMD) {
  const a = new Date(`${fromYMD}T00:00:00`);
  const b = new Date(`${toYMD}T00:00:00`);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  months += (b.getDate() - a.getDate()) / 30;
  return months;
}

// --- core derivations -----------------------------------------------------

// Total saved = the seed amount the user already had + every logged contribution.
export function savedTotal(config, contributions) {
  const seed = Number(config?.startingAmount) || 0;
  const added = (contributions || []).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  return seed + added;
}

// Average monthly surplus (income − expense) from real transactions over the
// last `lookbackMonths`. This is the engine's read on "can you actually do this".
export function avgMonthlySurplus(transactions, todayYMD, lookbackMonths = 3) {
  if (!transactions?.length) return 0;
  const cutoff = new Date(`${todayYMD}T00:00:00`);
  cutoff.setMonth(cutoff.getMonth() - lookbackMonths);
  const cutoffYMD = cutoff.toISOString().slice(0, 10);

  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.date < cutoffYMD || t.date > todayYMD) continue;
    if (t.type === 'income') income += Number(t.amount) || 0;
    else expense += Number(t.amount) || 0;
  }
  return (income - expense) / lookbackMonths;
}

// Average monthly spend per discretionary category over the lookback window,
// each turned into a savings opportunity ranked by size.
export function savingsOpportunities(transactions, todayYMD, monthsLeft, dailyBudget, lookbackMonths = 3) {
  if (!transactions?.length) return [];
  const cutoff = new Date(`${todayYMD}T00:00:00`);
  cutoff.setMonth(cutoff.getMonth() - lookbackMonths);
  const cutoffYMD = cutoff.toISOString().slice(0, 10);

  const byCat = {};
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    if (!DISCRETIONARY.includes(t.category)) continue;
    if (t.date < cutoffYMD || t.date > todayYMD) continue;
    byCat[t.category] = (byCat[t.category] || 0) + (Number(t.amount) || 0);
  }

  return Object.entries(byCat)
    .map(([category, total]) => {
      const monthlyAvg = total / lookbackMonths;
      const suggestedCut = monthlyAvg * CUT_RATE;
      const impactTotal = suggestedCut * Math.max(0, monthsLeft);
      const days = dailyBudget > 0 ? impactTotal / dailyBudget : 0;
      return {
        category,
        emoji: CATEGORY_EMOJI[category] ?? '📦',
        monthlyAvg,
        suggestedCut,
        impactTotal,
        days,
      };
    })
    .sort((a, b) => b.monthlyAvg - a.monthlyAvg)
    .slice(0, 3);
}

// Milestone list with reached/next flags, given how much is saved.
export function milestones(target, saved) {
  if (!target || target <= 0) return [];
  let nextMarked = false;
  return MILESTONES.map((m) => {
    const amount = target * m.pct;
    const reached = saved >= amount;
    const isNext = !reached && !nextMarked;
    if (isNext) nextMarked = true;
    return { ...m, amount, reached, isNext };
  });
}

// The single summary object the view renders from.
export function computeGoal(config, contributions, transactions, todayYMD) {
  if (!config || !config.targetAmount || !config.tripDate) {
    return { configured: false };
  }

  const target = Number(config.targetAmount) || 0;
  const dailyBudget = Number(config.dailyBudget) || 0;
  const saved = savedTotal(config, contributions);
  const remaining = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(1, saved / target) : 0;

  const rawMonthsLeft = monthsBetween(todayYMD, config.tripDate);
  const monthsLeft = Math.max(0, rawMonthsLeft);
  const monthsLeftWhole = Math.max(1, Math.ceil(monthsLeft)); // avoid /0 in requirements

  const requiredMonthly = remaining / monthsLeftWhole;
  const requiredWeekly = requiredMonthly / 4.33;

  const surplus = avgMonthlySurplus(transactions, todayYMD);
  const projectedFinal = saved + Math.max(0, surplus) * monthsLeft;
  const projectedSurplusShortfall = Math.max(0, target - projectedFinal);
  const adjustmentPerMonth = projectedSurplusShortfall / monthsLeftWhole;

  // Status drives copy + colour. "ahead" when your recent pace overshoots the goal.
  let status;
  if (pct >= 1) status = 'complete';
  else if (surplus <= 0) status = 'behind';
  else if (projectedFinal >= target) status = 'ahead';
  else if (projectedFinal >= target * 0.95) status = 'on-track';
  else status = 'behind';

  return {
    configured: true,
    target,
    dailyBudget,
    saved,
    remaining,
    pct,
    monthsLeft,
    monthsLeftWhole,
    requiredMonthly,
    requiredWeekly,
    surplus,
    projectedFinal,
    projectedSurplusShortfall,
    adjustmentPerMonth,
    status,
    milestones: milestones(target, saved),
    opportunities: savingsOpportunities(transactions, todayYMD, monthsLeft, dailyBudget),
    // Days of trip your saved money already covers (vivid framing).
    daysCovered: dailyBudget > 0 ? saved / dailyBudget : 0,
  };
}

// Light estimator for the onboarding empty state. All inputs optional.
export function estimateTripCost({ flights = 0, nights = 0, nightlyStay = 0, days = 0, dailyBudget = 0, activities = 0, bufferPct = 0.15 } = {}) {
  const base = flights + nights * nightlyStay + days * dailyBudget + activities;
  return Math.round(base * (1 + bufferPct));
}

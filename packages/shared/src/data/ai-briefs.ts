import type { ModuleBrief } from '../types/ai';

export const AI_BRIEFS: ModuleBrief[] = [
  {
    module: 'dashboard',
    headline: 'Portfolio is steady — three properties carrying all the risk',
    generatedAt: '2026-04-28T06:00:00Z',
    bullets: [
      { tone: 'neutral',  text: 'Occupancy 82% and revenue $291.5K tracking in-line with prior week. 13 of 16 hotels green.' },
      { tone: 'negative', text: 'Home2 TX, Fairfield Pooler and Hilton Garden Midtown driving 74% of today\'s flags — all fixable, not structural.' },
      { tone: 'decision', text: 'One ownership decision queued: accelerate Q3 PTAC replacement to Q2 ($96K). See Intelligence hub.' },
    ],
  },
  {
    module: 'revenue',
    headline: 'Rate discipline is mixed — Savannah strong, Home2 TX & La Quinta drifting',
    generatedAt: '2026-04-28T06:15:00Z',
    bullets: [
      { tone: 'positive', text: 'Savannah Hilton cluster running $4–8 above comp on ADR. Pricing power intact.' },
      { tone: 'negative', text: 'Home2 TX held rate flat while market moved +$8 in March. $35K left on table over 8 weeks.' },
      { tone: 'negative', text: 'La Quinta and Woodspring Brunswick both showing weekday softness without ADR explanation.' },
      { tone: 'decision', text: 'Recommended: Home2 TX ADR +$6 immediately (rec-006), Woodspring B2B test (rec-004).' },
    ],
  },
  {
    module: 'labour',
    headline: 'Portfolio variance +274 — concentrated in 3 properties, fixable in 1 period',
    generatedAt: '2026-04-28T06:30:00Z',
    bullets: [
      { tone: 'negative', text: 'Fairfield Pooler kitchen trending up 4 periods; Home2 TX payroll at 34% of revenue; Hilton Garden Midtown OT at 21 hrs.' },
      { tone: 'positive', text: 'Home2 Baton Rouge flag resolved — last period\'s schedule fix held.' },
      { tone: 'decision', text: 'Applying the top 3 recommendations projects variance to +145 hrs next period (from +274).' },
    ],
  },
  {
    module: 'operations',
    headline: 'Chronic OOO at Hilton Garden Midtown — PTAC parts, not staffing',
    generatedAt: '2026-04-28T07:00:00Z',
    bullets: [
      { tone: 'negative', text: 'Rooms 312/318/407 have been OOO 5+ days each. Parts ordered 10 days ago, not arrived.' },
      { tone: 'neutral',  text: '7 repeat AC failures across portfolio this week — all on Model GE AZ45E09.' },
      { tone: 'decision', text: 'Expedite parts now (rec-002) or accept ~$6.6K revenue loss. Model-level pattern is in CapEx queue.' },
    ],
  },
  {
    module: 'assets',
    headline: 'Aging PTAC fleet concentrated in Savannah — the Q3 CapEx plan should move to Q2',
    generatedAt: '2026-04-28T07:30:00Z',
    bullets: [
      { tone: 'negative', text: '94 PTAC units across 6 properties past warranty. Model GE AZ45E09 showing systemic capacitor failure.' },
      { tone: 'neutral',  text: 'Roof at Cotton Sail entering final 2 years of expected life. Opportunity to bundle with Courtyard Brunswick for savings.' },
      { tone: 'decision', text: '5 CapEx recommendations below totalling $535K across 2026. Top priority: $96K PTAC batch for Savannah.' },
    ],
  },
  {
    module: 'intelligence',
    headline: '5 cross-portfolio patterns detected today; 3 actionable',
    generatedAt: '2026-04-28T08:00:00Z',
    bullets: [
      { tone: 'positive', text: 'Hilton Savannah cluster earning brand premium — transferable pricing insight for Fairfield Pooler.' },
      { tone: 'negative', text: 'Extended-stay segment (4 hotels) losing share to comp set — systemic, not individual.' },
      { tone: 'neutral',  text: 'Event-weekend staffing template not absorbing known calendar — shared template opportunity.' },
      { tone: 'decision', text: 'Consolidated forecasts below model portfolio-wide impact of 3 top recommendations: +$10.5K revenue, -129 labour hrs.' },
    ],
  },
];

export const getBriefByModule = (module: ModuleBrief['module']): ModuleBrief | undefined =>
  AI_BRIEFS.find((b) => b.module === module);

import type { Team, TeamRules } from './types';

export const TEAM_COLORS: Record<Team, {bg: string, text: string, border: string}> = {
  "Women's Soccer": { bg: 'hsl(221.2 83.2% 53.3%)', text: 'hsl(0 0% 100%)', border: 'hsl(221.2 83.2% 43.3%)' },
  "Volleyball": { bg: 'hsl(47.9 95.8% 53.1%)', text: 'hsl(47.9 95.8% 13.1%)', border: 'hsl(47.9 95.8% 43.1%)' },
  "Men's Varsity Soccer": { bg: 'hsl(142.1 76.2% 36.1%)', text: 'hsl(0 0% 100%)', border: 'hsl(142.1 76.2% 26.1%)' },
  "JV Men's Soccer": { bg: 'hsl(142.1 76.2% 46.1%)', text: 'hsl(0 0% 100%)', border: 'hsl(142.1 76.2% 36.1%)' },
  "Developmental Men's Soccer": { bg: 'hsl(142.1 76.2% 56.1%)', text: 'hsl(0 0% 0%)', border: 'hsl(142.1 76.2% 46.1%)' },
  "Cross Country/Track & Field": { bg: 'hsl(24.6 95% 53.1%)', text: 'hsl(0 0% 100%)', border: 'hsl(24.6 95% 43.1%)' },
  "Men's Basketball": { bg: 'hsl(0 72.2% 50.6%)', text: 'hsl(0 0% 100%)', border: 'hsl(0 72.2% 40.6%)' },
  "JV Men's Basketball": { bg: 'hsl(0 72.2% 60.6%)', text: 'hsl(0 0% 100%)', border: 'hsl(0 72.2% 50.6%)' },
  "Women's Basketball": { bg: 'hsl(270 95% 53.1%)', text: 'hsl(0 0% 100%)', border: 'hsl(270 95% 43.1%)' },
  "Reserve Women's Basketball": { bg: 'hsl(270 95% 63.1%)', text: 'hsl(0 0% 100%)', border: 'hsl(270 95% 53.1%)' },
  "Reserve Women's Soccer": { bg: 'hsl(221.2 83.2% 63.3%)', text: 'hsl(0 0% 100%)', border: 'hsl(221.2 83.2% 53.3%)' },
  "Reserve Men's Soccer": { bg: 'hsl(142.1 76.2% 66.1%)', text: 'hsl(0 0% 0%)', border: 'hsl(142.1 76.2% 56.1%)' },
};

export const MULTI_EVENT_COLOR = { bg: 'hsl(220 13% 65%)', text: 'hsl(0 0% 0%)', border: 'hsl(220 13% 55%)' };


export const TEAM_RULES: TeamRules = {
  "Women's Soccer": { vans: 3, busVans: 0, busEligible: true, priority: 1 },
  "Volleyball": { vans: 2, busEligible: false, priority: 1 },
  "Men's Varsity Soccer": { vans: 3, busEligible: false, priority: 1 },
  "JV Men's Soccer": { vans: 4, busVans: 1, busEligible: true, priority: 2 },
  "Developmental Men's Soccer": { vans: 3, busVans: 0, busEligible: true, priority: 1 },
  "Cross Country/Track & Field": { vans: 3, busVans: 0, busEligible: true, priority: 1 },
  "Men's Basketball": { vans: 3, busEligible: false, priority: 1 },
  "JV Men's Basketball": { vans: 2, busEligible: false, priority: 2 },
  "Women's Basketball": { vans: 2, busEligible: false, priority: 1 },
  "Reserve Women's Basketball": { vans: 2, busEligible: false, priority: 2 },
  "Reserve Women's Soccer": { vans: 3, busVans: 0, busEligible: true, priority: 2 },
  "Reserve Men's Soccer": { vans: 3, busVans: 0, busEligible: true, priority: 2 },
};

export const FLEET_CONFIG = {
  ownedVans: 4,
  ownedBuses: 1,
};

export const RENTAL_COSTS = {
  enterpriseDaily: {
    costPerVan: 154.35,
  },
  cappsDaily: {
    costPerVan: 200,
    includedMiles: 400,
    overageRate: 0.35,
  },
  enterpriseMonthly: {
    costPerVan: 3000,
  }
};

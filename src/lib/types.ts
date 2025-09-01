export type Team =
  | "Women's Soccer"
  | "Volleyball"
  | "Men's Varsity Soccer"
  | "JV Men's Soccer"
  | "Developmental Men's Soccer"
  | "Cross Country/Track & Field"
  | "Men's Basketball"
  | "JV Men's Basketball"
  | "Women's Basketball"
  | "Reserve Women's Basketball"
  | "Reserve Women's Soccer"
  | "Reserve Men's Soccer";

export type ScheduleEvent = {
  id: string;
  date: string;
  time: string;
  opponent: string;
  location: string;
  distance: number;
  team: Team;
  roundTripMiles: number;
  vansNeeded: number;
  busEligible: boolean;
  vanSavingsWithBus: number;
  busAssigned: boolean;
  priority: number;
};

export type DailyPlan = {
  date: string;
  events: ScheduleEvent[];
  busUsed: boolean;
  ownedVansUsed: number;
  rentalVansNeeded: number;
  dailyRentalCost: number;
};

export type TeamRule = {
  vans: number;
  busVans?: number;
  busEligible: boolean;
  priority: number;
};

export type TeamRules = Record<string, TeamRule>;

export type CostScenario = {
  name: string;
  description: string;
  totalCost: number | string;
};


import { type ScheduleEvent, type Team, type TeamRules, type DailyPlan } from '@/lib/types';
import { FLEET_CONFIG, RENTAL_COSTS, TEAM_RULES } from '@/lib/data';
import { format, parse } from 'date-fns';

function robustCsvParse(csvData: string): string[][] {
    const lines = csvData.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const result: string[][] = [];
    const delimiter = ',';

    for (const line of lines) {
        if (!line.trim()) continue;
        const row: string[] = [];
        let field = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                 if (inQuotes && i < line.length -1 && line[i+1] === '"') {
                    // Escaped quote
                    field += '"';
                    i++; // Skip next quote
                 } else {
                    inQuotes = !inQuotes;
                 }
            } else if (char === delimiter && !inQuotes) {
                row.push(field.trim());
                field = '';
            } else {
                field += char;
            }
        }
        row.push(field.trim());
        result.push(row);
    }
    return result;
}

const teamNameMap: Record<string, Team> = {
    'VB': "Volleyball",
    'WSOC': "Women's Soccer",
    'R-WSOC': "Reserve Women's Soccer",
    'MSOC': "Men's Varsity Soccer",
    'R-MSOC': "Reserve Men's Soccer",
    'D-MSOC': "Developmental Men's Soccer",
    'XC-T&F': "Cross Country/Track & Field",
    'MBB': "Men's Basketball",
    'JV-MBB': "JV Men's Basketball",
    'WBB': "Women's Basketball",
    'R-WBB': "Reserve Women's Basketball",
};

const standardizeTeamName = (name: string): Team => {
    // Find the key in teamNameMap that the filename includes
    const teamKey = Object.keys(teamNameMap).find(key => name.includes(key));
    if (teamKey) {
        return teamNameMap[teamKey];
    }
    // Fallback for full names already present
    if (Object.values(teamNameMap).includes(name as any)) {
      return name as Team;
    }
    return name as Team; // Should not happen with current data
}

export function parseSchedule(csvData: string, teamRules: TeamRules): ScheduleEvent[] {
  if (!csvData) return [];
  
  const rows = robustCsvParse(csvData);
  const header = rows[0].map(h => h.trim());
  
  const teamColumnIndex = 0; // Team name is in the first column now
  const opponentColumnIndex = header.findIndex(h => h === 'Opponent' || h === 'Meet');
  const locationColumnIndex = header.indexOf('Location');
  const distanceColumnIndex = header.indexOf('Distance from MACU');
  const dateColumnIndex = header.indexOf('Date');
  const timeColumnIndex = header.indexOf('Time');

  if ([opponentColumnIndex, teamColumnIndex, locationColumnIndex, distanceColumnIndex, dateColumnIndex, timeColumnIndex].includes(-1)) {
    console.error('CSV header is missing one or more required columns.');
    return [];
  }
  
  const events = rows
    .slice(1) // Skip header
    .map((columns, index) => {
        const teamFromFile = columns[teamColumnIndex];
        const dateStr = columns[dateColumnIndex];
        if (!dateStr || dateStr.trim() === '') {
            return null;
        }
        try {
            // Standardize date format by removing potential ordinals (st, nd, rd, th)
            const cleanDateStr = dateStr.trim().replace(/(\d+)(st|nd|rd|th)/, '$1');
            const parsedDate = parse(cleanDateStr, 'dd/MM/yy', new Date());
            if (isNaN(parsedDate.getTime())) {
                console.warn(`Invalid date format for: ${dateStr}`);
                return null;
            }
        } catch (e) {
            console.warn(`Error parsing date: ${dateStr}`, e);
            return null;
        }

        const team = standardizeTeamName(teamFromFile);
        if (!teamRules[team]) {
          return null;
        }

        const rule = teamRules[team];
        const distance = parseFloat(columns[distanceColumnIndex]) || 0;
        const vansIfNoBus = rule.vans;
        const vansWithBus = rule.busEligible ? (rule.busVans !== undefined ? rule.busVans : 0) : vansIfNoBus;
        const opponent = columns[opponentColumnIndex]?.trim() || 'N/A';
        const location = columns[locationColumnIndex]?.trim() || 'N/A';
        const time = columns[timeColumnIndex]?.trim() || 'N/A';

        return {
            id: `event-${teamFromFile}-${dateStr.trim()}-${index}`,
            date: dateStr.trim(),
            time: time,
            opponent: opponent,
            location: location,
            distance,
            team,
            roundTripMiles: distance * 2,
            vansNeeded: vansIfNoBus,
            busEligible: rule.busEligible,
            vanSavingsWithBus: rule.busEligible ? vansIfNoBus - vansWithBus : 0,
            busAssigned: false,
            priority: rule.priority,
        };
    }).filter((event): event is ScheduleEvent => event !== null);

    return events.sort((a,b) => {
        try {
          const dateA = parse(a.date, 'dd/MM/yy', new Date());
          const dateB = parse(b.date, 'dd/MM/yy', new Date());
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
          return dateA.getTime() - dateB.getTime();
        } catch(e) {
          return 0;
        }
    });
}


export function createDailyPlans(events: ScheduleEvent[]): DailyPlan[] {
  const groupedByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, ScheduleEvent[]>);

  const dailyPlans = Object.entries(groupedByDate).map(([date, dailyEvents]) => {
    let busUsed = false;
    let busAssignedTo: string | undefined = undefined;
    let vansNeededAfterBus = 0;
    
    // Create a mutable copy for modifications
    const eventsWithBusAssignment = dailyEvents.map(e => ({...e, busAssigned: false}));

    if (FLEET_CONFIG.ownedBuses > 0) {
      const eligibleEvents = eventsWithBusAssignment.filter(e => e.busEligible && e.distance > 0);
      if (eligibleEvents.length > 0) {
        eligibleEvents.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return b.vanSavingsWithBus - a.vanSavingsWithBus;
        });
        const bestEventForBus = eligibleEvents[0];
        
        const eventInDay = eventsWithBusAssignment.find(e => e.id === bestEventForBus.id);
        if(eventInDay) {
          eventInDay.busAssigned = true;
          busUsed = true;
          busAssignedTo = eventInDay.id;
        }
      }
    }
    
    vansNeededAfterBus = eventsWithBusAssignment.reduce((total, event) => {
      const rule = TEAM_RULES[event.team as keyof typeof TEAM_RULES];
      if(!rule) return total;

      if (event.busAssigned) {
        return total + (rule.busVans !== undefined ? rule.busVans : 0);
      }
      return total + event.vansNeeded;
    }, 0);
    
    const rentalVansNeeded = Math.max(0, vansNeededAfterBus - FLEET_CONFIG.ownedVans);
    const ownedVansUsed = Math.min(vansNeededAfterBus, FLEET_CONFIG.ownedVans);
    const dailyRentalCost = rentalVansNeeded * RENTAL_COSTS.enterpriseDaily.costPerVan;

    return {
      date,
      events: eventsWithBusAssignment,
      busUsed,
      ownedVansUsed,
      rentalVansNeeded,
      dailyRentalCost,
    };
  });
  
  return dailyPlans.sort((a,b) => {
    try {
      const dateA = parse(a.date, 'dd/MM/yy', new Date());
      const dateB = parse(b.date, 'dd/MM/yy', new Date());
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
      return dateA.getTime() - dateB.getTime();
    } catch(e) {
      return 0;
    }
  });
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
};

export const calculateTotalCost = (dailyPlans: DailyPlan[]): number => {
    return dailyPlans.reduce((total, day) => total + day.dailyRentalCost, 0);
};


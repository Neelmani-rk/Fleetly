import { parseSchedule } from '@/lib/helpers';
import { getAllScheduleData } from '@/lib/schedule-data';
import { TEAM_RULES } from '@/lib/data';
import ScheduleTable from '@/components/schedule/schedule-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EventsByTeamChart from '@/components/schedule/events-by-team-chart';
import EventsByMonthChart from '@/components/schedule/events-by-month-chart';
import { ScheduleEvent } from '@/lib/types';
import { parse } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getScheduleData() {
  try {
    const csvData = await getAllScheduleData();
    const events = parseSchedule(csvData, TEAM_RULES);
    return events;
  } catch (error) {
    console.error("Failed to read schedule data:", error);
    return [];
  }
}

function processChartData(events: ScheduleEvent[]) {
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const teams = [...Object.keys(TEAM_RULES)];

    const eventsByMonthTeam = events.reduce((acc, event) => {
        try {
            const month = parse(event.date, 'dd/MM/yy', new Date()).toLocaleString('default', { month: 'short' });
            if (!acc[month]) {
                acc[month] = {};
            }
            acc[month][event.team] = (acc[month][event.team] || 0) + 1;
            return acc;
        } catch (e) {
            return acc;
        }
    }, {} as Record<string, Record<string, number>>);

    const concurrencyData = monthOrder.map(month => {
        const monthData: any = { name: month };
        teams.forEach(team => {
            monthData[team] = eventsByMonthTeam[month]?.[team] || 0;
        });
        return monthData;
    });

    const eventsByMonth = monthOrder.map(month => ({
        name: month,
        value: teams.reduce((sum, team) => sum + (eventsByMonthTeam[month]?.[team] || 0), 0)
    })).filter(m => m.value > 0);


    return { concurrencyData, eventsByMonth, teams, months: monthOrder };
}


export default async function SchedulePage() {
  const events = await getScheduleData();
  const { concurrencyData, eventsByMonth, teams, months } = processChartData(events);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Consolidated Schedule</h1>
        <p className="text-muted-foreground">
          A complete, filterable view of all team events and their vehicle requirements.
        </p>
      </header>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Events Concurrency by Team</CardTitle>
              <CardDescription>Number of scheduled events for each team per month.</CardDescription>
            </CardHeader>
            <CardContent>
              <EventsByTeamChart data={concurrencyData} teams={teams} months={months} />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Total Events by Month</CardTitle>
              <CardDescription>Total events scheduled across all teams per month.</CardDescription>
            </CardHeader>
            <CardContent>
              <EventsByMonthChart data={eventsByMonth} />
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>Browse, filter, and sort all scheduled events.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleTable events={events} />
        </CardContent>
      </Card>
    </div>
  );
}

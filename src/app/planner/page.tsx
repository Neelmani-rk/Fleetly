
"use client";

import * as React from 'react';
import { formatCurrency, createDailyPlans, parseSchedule } from '@/lib/helpers';
import { getAllScheduleData } from '@/lib/schedule-data-client';
import { TEAM_RULES, FLEET_CONFIG } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Bus, Car } from 'lucide-react';
import { format, parse } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { DailyPlan, ScheduleEvent } from '@/lib/types';


async function getPlannerData() {
  try {
    const csvData = await getAllScheduleData();
    const events = parseSchedule(csvData, TEAM_RULES);
    const dailyPlans = createDailyPlans(events);
    return dailyPlans;
  } catch (error) {
    console.error("Failed to read schedule data:", error);
    return [];
  }
}


export default function PlannerPage() {
  const [dailyPlans, setDailyPlans] = React.useState<DailyPlan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function processPlans() {
        const initialPlans = await getPlannerData();
        setDailyPlans(initialPlans);
        setIsLoading(false);
    }
    processPlans();
  }, []);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <header>
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </header>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Daily Fleet Planner</h1>
        <p className="text-muted-foreground">
          Day-by-day view of vehicle assignments and rental needs.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dailyPlans.map(day => (
          <Card key={day.date}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{format(parse(day.date, 'dd/MM/yy', new Date()), 'EEE, MMM d')}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span>{day.ownedVansUsed} / {FLEET_CONFIG.ownedVans}</span>
                  </div>
                  {day.busUsed && <Bus className="h-5 w-5 text-primary" />}
                </div>
              </CardTitle>
              <CardDescription className="flex flex-col gap-2 pt-1">
                 {day.rentalVansNeeded > 0 ? (
                    <Badge variant="destructive">{day.rentalVansNeeded} Rental Van(s)</Badge>
                ) : (
                    <Badge variant="secondary">Fleet Sufficient</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Est. Rental: {formatCurrency(day.dailyRentalCost)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Events ({day.events.length})</h4>
              {day.events.length > 0 ? (
                day.events.map(event => (
                  <div key={event.id} className="text-sm p-2 rounded-md border bg-card flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{event.team}</p>
                      <p className="text-muted-foreground text-xs">vs {event.opponent}</p>
                    </div>
                    {event.busAssigned && <Bus className="h-4 w-4 text-primary shrink-0"/>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No events scheduled.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

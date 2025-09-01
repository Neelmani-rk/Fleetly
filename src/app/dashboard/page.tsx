import { parseSchedule, createDailyPlans, formatCurrency, calculateTotalCost } from '@/lib/helpers';
import { getAllScheduleData } from '@/lib/schedule-data';
import { TEAM_RULES } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Bus, Car } from "lucide-react";
import ScheduleTable from '@/components/schedule/schedule-table';
import type { ScheduleEvent } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    const csvData = await getAllScheduleData();
    const events = parseSchedule(csvData, TEAM_RULES);
    const dailyPlans = createDailyPlans(events);
    const totalCost = calculateTotalCost(dailyPlans);
    const busDays = dailyPlans.filter(d => d.busUsed).length;
    const totalRentalVans = dailyPlans.reduce((sum, day) => sum + day.rentalVansNeeded, 0);

    return { events, totalCost, busDays, totalRentalVans };
  } catch (error) {
    console.error("Failed to read schedule data:", error);
    return { events: [], totalCost: 0, busDays: 0, totalRentalVans: 0 };
  }
}

export default async function DashboardPage() {
  const { events, totalCost, busDays, totalRentalVans } = await getData();

  const stats = [
    { title: "Total Rental Cost", value: formatCurrency(totalCost), icon: DollarSign, description: "Estimated cost for the entire schedule." },
    { title: "Bus Usage Days", value: busDays, icon: Bus, description: "Days the in-house bus is assigned." },
    { title: "Total Rental Vans", value: totalRentalVans, icon: Car, description: "Total number of rental vans needed." },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            A summary of the entire schedule and estimated costs.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild>
            <Link href="#">Download Excel</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="#">Download JSON</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consolidated Schedule Preview</CardTitle>
          <CardDescription>The first 50 rows of the processed schedule data. View the full schedule on the 'Schedule' page.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleTable events={events.slice(0, 50)} />
        </CardContent>
      </Card>
    </div>
  );
}

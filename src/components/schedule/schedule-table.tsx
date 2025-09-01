
"use client";

import * as React from "react";
import { format, parse, isBefore, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ScheduleEvent, type Team } from "@/lib/types";
import { TEAM_RULES, TEAM_COLORS, MULTI_EVENT_COLOR } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DayModifiers, DayPickerSingleProps } from "react-day-picker";

interface ScheduleTableProps {
  events: ScheduleEvent[];
}

const SINGLE_EVENT_COLOR = { bg: "hsl(142.1 76.2% 40%)", text: "hsl(0 0% 100%)" };
const MULTIPLE_EVENTS_COLOR = { bg: "hsl(221.2 83.2% 53.3%)", text: "hsl(0 0% 100%)" };

export default function ScheduleTable({ events }: ScheduleTableProps) {
  const [teamFilter, setTeamFilter] = React.useState<string>("all");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [showPastEvents, setShowPastEvents] = React.useState<boolean>(true);

  const teams = React.useMemo(() => ["all", ...Object.keys(TEAM_RULES)], []);
  
  const today = startOfToday();

  const filteredEvents = React.useMemo(() => {
    let filtered = events;

    if (!showPastEvents) {
        filtered = filtered.filter(event => {
            try {
                const eventDate = parse(event.date, 'dd/MM/yy', new Date());
                return !isBefore(eventDate, today);
            } catch {
                return false;
            }
        });
    }

    if (teamFilter !== "all") {
      filtered = filtered.filter((event) => event.team === teamFilter);
    }

    if (date) {
      const formattedDate = format(date, "dd/MM/yy");
      filtered = filtered.filter((event) => event.date === formattedDate);
    }

    return filtered;
  }, [events, teamFilter, date, showPastEvents, today]);
  
  const eventDaysByDate = React.useMemo(() => {
    const days: Record<string, number> = {};
    events.forEach(event => {
        try {
            const d = parse(event.date, 'dd/MM/yy', new Date());
            if (isNaN(d.getTime())) return;
            const key = format(d, 'yyyy-MM-dd');
            if (!days[key]) {
                days[key] = 0;
            }
            days[key]++;
        } catch(e) {
            // Ignore invalid dates
        }
    });
    return days;
  }, [events]);

  const calendarModifiers = React.useMemo(() => {
    const modifiers: DayModifiers = {};
    const modifiersStyles: Record<string, React.CSSProperties> = {};

    Object.keys(eventDaysByDate).forEach(dateStr => {
        const d = parse(dateStr, 'yyyy-MM-dd', new Date());
        const eventCount = eventDaysByDate[dateStr];
        const modifierName = `day-${dateStr}`;

        if (eventCount === 1) {
            modifiers[modifierName] = d;
            modifiersStyles[modifierName] = { 
                backgroundColor: SINGLE_EVENT_COLOR.bg,
                color: SINGLE_EVENT_COLOR.text,
            };
        } else if (eventCount > 1) {
            modifiers[modifierName] = d;
            modifiersStyles[modifierName] = { 
                backgroundColor: MULTIPLE_EVENTS_COLOR.bg,
                color: MULTIPLE_EVENTS_COLOR.text,
            };
        }
    });

    return { modifiers, modifiersStyles };
  }, [eventDaysByDate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
           <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="top">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    modifiers={calendarModifiers.modifiers}
                    modifiersStyles={{
                      ...calendarModifiers.modifiersStyles,
                      today: {
                        color: 'red',
                        fontWeight: 'bold',
                      },
                    }}
                />
            </PopoverContent>
            </Popover>
             <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by team..." />
            </SelectTrigger>
            <SelectContent>
                {teams.map((team) => (
                <SelectItem key={team} value={team}>
                    {team === "all" ? "All Teams" : team}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="show-past" checked={showPastEvents} onCheckedChange={setShowPastEvents}/>
            <Label htmlFor="show-past">Show Past Events</Label>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Distance (mi)</TableHead>
              <TableHead className="text-right">Vans Needed</TableHead>
              <TableHead className="text-center">Bus Eligible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <TableRow key={`${event.id}-${index}`}>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell>
                    <Badge 
                      style={{
                        backgroundColor: TEAM_COLORS[event.team as Team]?.bg,
                        color: TEAM_COLORS[event.team as Team]?.text,
                        borderColor: TEAM_COLORS[event.team as Team]?.border,
                      }}
                      className="border"
                    >
                      {event.team}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.opponent}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell className="text-right">{event.distance}</TableCell>
                  <TableCell className="text-right">{event.vansNeeded}</TableCell>
                  <TableCell className="text-center">
                    {event.busEligible ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

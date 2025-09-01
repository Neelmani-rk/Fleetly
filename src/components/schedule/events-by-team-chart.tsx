"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface EventsByTeamChartProps {
    data: any[];
    teams: string[];
    months: string[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--accent))",
];


export default function EventsByTeamChart({ data, teams, months }: EventsByTeamChartProps) {
  return (
    <ChartContainer config={{}} className="min-h-[400px] w-full">
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend />
                {teams.map((team, index) => (
                    <Bar key={team} dataKey={team} stackId="a" fill={COLORS[index % COLORS.length]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}

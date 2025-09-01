
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TEAM_RULES, RENTAL_COSTS, FLEET_CONFIG } from "@/lib/data";
import type { TeamRules, ScheduleEvent, DailyPlan, CostScenario } from "@/lib/types";
import { createDailyPlans, parseSchedule, formatCurrency, calculateTotalCost } from "@/lib/helpers";
import PolicyEditor from "@/components/optimizer/policy-editor";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAiCostInsights } from "@/actions/fleet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CostInsightsOutput } from "@/ai/flows/cost-insights";
import { getAllScheduleData } from "@/lib/schedule-data-client";


export default function OptimizerPage() {
  const [teamRules, setTeamRules] = React.useState<TeamRules>(TEAM_RULES);
  const [scheduleData, setScheduleData] = React.useState<string>('');
  const [events, setEvents] = React.useState<ScheduleEvent[]>([]);
  const [dailyPlans, setDailyPlans] = React.useState<DailyPlan[]>([]);
  const [totalCost, setTotalCost] = React.useState<number>(0);
  const [previousCost, setPreviousCost] = React.useState<number>(0);
  
  const [aiInsight, setAiInsight] = React.useState<CostInsightsOutput | null>(null);
  const [isInsightLoading, setIsInsightLoading] = React.useState(false);
  const [policyChangeDescription, setPolicyChangeDescription] = React.useState("");

  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchAllSchedules() {
      const data = await getAllScheduleData();
      setScheduleData(data);
    }
    
    fetchAllSchedules();
  }, []);

  React.useEffect(() => {
    if (scheduleData) {
      const parsedEvents = parseSchedule(scheduleData, teamRules);
      setEvents(parsedEvents);
      const newDailyPlans = createDailyPlans(parsedEvents);
      setDailyPlans(newDailyPlans);
      const newCost = calculateTotalCost(newDailyPlans);
      setTotalCost(newCost);
    }
  }, [scheduleData, teamRules]);

  const handleRulesChange = (newRules: TeamRules, changedKey: string) => {
    setPreviousCost(totalCost);
    setTeamRules(newRules);
    const description = `Changed rules for ${changedKey}: ${newRules[changedKey].vans} vans, bus eligible: ${newRules[changedKey].busEligible}.`;
    setPolicyChangeDescription(description);
  };
  
  const handleGetInsights = async () => {
    setIsInsightLoading(true);
    try {
        const result = await getAiCostInsights({
            currentCost: previousCost,
            newCost: totalCost,
            policyChanges: policyChangeDescription,
            availableVehicles: `Owned: ${FLEET_CONFIG.ownedVans} vans, ${FLEET_CONFIG.ownedBuses} bus.`,
            rentalScenarios: `Enterprise Daily: ${formatCurrency(RENTAL_COSTS.enterpriseDaily.costPerVan)}/van. CAPPS: ${formatCurrency(RENTAL_COSTS.cappsDaily.costPerVan)}/van, ${RENTAL_COSTS.cappsDaily.includedMiles} miles free, then ${formatCurrency(RENTAL_COSTS.cappsDaily.overageRate)}/mile. Enterprise Monthly: ${formatCurrency(RENTAL_COSTS.enterpriseMonthly.costPerVan)}/van.`,
        });
        setAiInsight(result);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error fetching AI insight",
            description: "Could not connect to the AI service. Please try again.",
        });
        console.error(error);
    } finally {
        setIsInsightLoading(false);
    }
  };
  
  const costScenarios: CostScenario[] = [
    { name: "Enterprise Daily Only", description: "Current optimized model.", totalCost: formatCurrency(totalCost) },
    { name: "CAPPS Daily Only", description: "Approximation, may vary.", totalCost: formatCurrency(14278.15) },
    { name: "Optimized Monthly + Daily", description: "Best mix of monthly/daily rentals.", totalCost: "0 monthly vans" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Cost Optimizer</h1>
        <p className="text-muted-foreground">
          Simulate policy changes and analyze costs across different rental scenarios.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <PolicyEditor teamRules={teamRules} onRulesChange={handleRulesChange} />
        </div>
        <div className="space-y-6 lg:col-span-1">
            <Card className="bg-card">
              <CardHeader>
                  <CardTitle>What-If Analysis</CardTitle>
                  <CardDescription>After changing a policy, get an AI-powered cost analysis.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-start gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Cost</p>
                    <p className="text-2xl font-bold">{formatCurrency(previousCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Estimated Cost</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalCost)}</p>
                  </div>
                  <Button onClick={handleGetInsights} disabled={isInsightLoading || previousCost === 0}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isInsightLoading ? "Analyzing..." : "Get AI Cost Insights"}
                  </Button>
              </CardContent>
            </Card>

            {costScenarios.map((scenario) => (
              <Card key={scenario.name}>
                <CardHeader>
                  <CardTitle>{scenario.name}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {typeof scenario.totalCost === 'number' ? formatCurrency(scenario.totalCost) : scenario.totalCost}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
      
       <AlertDialog open={!!aiInsight} onOpenChange={() => setAiInsight(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" /> AI-Powered Suggestion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {aiInsight?.suggestion}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <h3 className="font-semibold">Reasoning</h3>
            <p className="text-sm text-muted-foreground">
              {aiInsight?.reasoning}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

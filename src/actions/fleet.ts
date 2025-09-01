
"use server";

import { getCostInsights, type CostInsightsInput, type CostInsightsOutput } from "@/ai/flows/cost-insights";

export async function getAiCostInsights(input: CostInsightsInput): Promise<CostInsightsOutput> {
    try {
        const insights = await getCostInsights(input);
        return insights;
    } catch(error) {
        console.error("Error getting AI cost insights:", error);
        throw new Error("Failed to generate AI cost insights.");
    }
}

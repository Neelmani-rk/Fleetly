"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { TeamRules } from "@/lib/types";

interface PolicyEditorProps {
  teamRules: TeamRules;
  onRulesChange: (newRules: TeamRules, changedKey: string) => void;
}

export default function PolicyEditor({
  teamRules,
  onRulesChange,
}: PolicyEditorProps) {

  const handleVanChange = (team: string, value: string) => {
    const vans = parseInt(value, 10);
    if (!isNaN(vans)) {
      const newRules = {
        ...teamRules,
        [team]: { ...teamRules[team], vans },
      };
      onRulesChange(newRules, team);
    }
  };

  const handleBusEligibleChange = (team: string, checked: boolean) => {
    const newRules = {
      ...teamRules,
      [team]: { ...teamRules[team], busEligible: checked },
    };
    onRulesChange(newRules, team);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy & Rule Editor</CardTitle>
        <CardDescription>
          Adjust team vehicle requirements to simulate different scenarios. Changes will update costs in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead className="w-[120px]">Vans Required</TableHead>
                <TableHead className="w-[120px]">Bus Eligible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(teamRules).map(([team, rule]) => (
                <TableRow key={team}>
                  <TableCell className="font-medium">{team}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={rule.vans}
                      onChange={(e) => handleVanChange(team, e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={`bus-eligible-${team}`}
                            checked={rule.busEligible}
                            onCheckedChange={(checked) => handleBusEligibleChange(team, checked)}
                        />
                        <Label htmlFor={`bus-eligible-${team}`}>{rule.busEligible ? 'Yes' : 'No'}</Label>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";

interface StageTotal {
  stage: string;
  amount: number;
  count: number;
  color: string;
}

interface PipelineSummaryProps {
  pipelineTotals: {
    lead: number;
    qualified: number;
    negotiation: number;
    won: number;
    lost: number;
  };
  formatCurrency: (amount: number) => string;
}

export function PipelineSummary({ pipelineTotals, formatCurrency }: PipelineSummaryProps) {
  // Calculate totals
  const totalActive = pipelineTotals.lead + pipelineTotals.qualified + pipelineTotals.negotiation;
  const totalClosed = pipelineTotals.won + pipelineTotals.lost;
  const totalAll = totalActive + totalClosed;

  // Calculate win rate
  const winRate = pipelineTotals.won > 0
    ? Math.round((pipelineTotals.won / (pipelineTotals.won + pipelineTotals.lost)) * 100)
    : 0;

  // Stage data for visualization
  const stageData: StageTotal[] = [
    { stage: "Leads", amount: pipelineTotals.lead, count: 0, color: "bg-blue-500" },
    { stage: "Qualified", amount: pipelineTotals.qualified, count: 0, color: "bg-purple-500" },
    { stage: "Negotiation", amount: pipelineTotals.negotiation, count: 0, color: "bg-amber-500" },
    { stage: "Won", amount: pipelineTotals.won, count: 0, color: "bg-green-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-blue-600 text-2xl font-bold truncate">{formatCurrency(pipelineTotals.lead)}</div>
            <div className="text-sm text-gray-500 mt-1">Leads</div>
          </div>
          <div className="text-center">
            <div className="text-purple-600 text-2xl font-bold truncate">{formatCurrency(pipelineTotals.qualified)}</div>
            <div className="text-sm text-gray-500 mt-1">Qualified</div>
          </div>
          <div className="text-center">
            <div className="text-orange-500 text-2xl font-bold truncate">{formatCurrency(pipelineTotals.negotiation)}</div>
            <div className="text-sm text-gray-500 mt-1">Negotiation</div>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-2xl font-bold truncate">{formatCurrency(pipelineTotals.won)}</div>
            <div className="text-sm text-gray-500 mt-1">Closed Won</div>
          </div>
          <div className="text-center">
            <div className="text-red-600 text-2xl font-bold truncate">{formatCurrency(pipelineTotals.lost)}</div>
            <div className="text-sm text-gray-500 mt-1">Closed Lost</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

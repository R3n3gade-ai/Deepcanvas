import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

export interface DealStageItem {
  name: string;
  value: number;
  color: string;
}

interface DealStageDistributionProps {
  data: DealStageItem[];
}

export function DealStageDistribution({ data }: DealStageDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Stage Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={0}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend - Horizontal on larger screens, vertical on mobile */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1.5 flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-xs text-gray-600">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


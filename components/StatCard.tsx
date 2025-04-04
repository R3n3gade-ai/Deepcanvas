import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color?: string;
  className?: string;
}

export function StatCard({
  icon,
  value,
  label,
  color = "text-blue-600",
  className = "",
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6 flex items-start">
        <div className={`${color} mr-4 flex-shrink-0`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold truncate">{value}</div>
          <div className="text-sm text-gray-500 truncate">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

export interface Deal {
  id?: string;
  name: string;
  company: string;
  status: string;
  value: number;
}

interface TopDealsProps {
  topDeals: Deal[];
  formatCurrency: (amount: number) => string;
}

export function TopDeals({ topDeals, formatCurrency }: TopDealsProps) {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Closed Won":
        return "bg-green-100 text-green-800";
      case "Proposal":
        return "bg-yellow-100 text-yellow-800";
      case "Closed Lost":
        return "bg-red-100 text-red-800";
      case "Evaluation":
        return "bg-purple-100 text-purple-800";
      case "Negotiation":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Top Deals</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/pipeline')}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topDeals.length === 0 ? (
            <p className="text-sm text-gray-500">No deals found</p>
          ) : (
            topDeals.map((deal, index) => (
              <div key={deal.id || index} className="space-y-2 md:space-y-0 md:flex md:items-center md:justify-between">
                <div className="space-y-1 min-w-0 max-w-[60%]">
                  <p className="font-medium truncate">{deal.name}</p>
                  <p className="text-sm text-gray-500 truncate">{deal.company}</p>
                </div>
                <div className="flex items-center gap-3 pt-1 md:pt-0 md:min-w-[100px] flex-shrink-0">
                  <span className={`text-xs py-1 px-3 rounded-full inline-block min-w-[85px] text-center ${getStatusColor(deal.status)}`}>
                    {deal.status}
                  </span>
                  <span className="font-semibold whitespace-nowrap">{formatCurrency(deal.value)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { DealStageDistribution, DealStageItem } from "../components/DealStageDistribution";
import { TopDeals, Deal } from "../components/TopDeals";
import { PipelineSummary } from "../components/PipelineSummary";
import { StatCard } from "../components/StatCard";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { useAccountsStore } from "../utils/accountsStore";
import { useDealsStore } from "../utils/dealsStore";
import { useTeamStore } from "../utils/teamStore";
import { useTasksStore } from "../utils/tasksStore";
import { useActivitiesStore } from "../utils/activitiesStore";
import { useCurrentUser } from "app";
import { logActivity } from "../utils/activityTracking";
import { AppProvider } from "../utils/AppProvider";
import { isUsingDefaultConfig } from "../utils/firebaseConfig";
import { firebaseApp } from "app";

function DashboardContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Get data from stores
  const { accounts } = useAccountsStore();
  const { deals, loading: dealsLoading } = useDealsStore();
  const { teamMembers } = useTeamStore();
  const { tasks } = useTasksStore();
  const { activities, loading: activitiesLoading, setupRealtimeSync: setupActivitiesSync } = useActivitiesStore();
  const { user } = useCurrentUser();
  
  // Get pending tasks count
  const taskCount = tasks.filter(task => task.status === 'pending').length;
  
  // Calculate open deals count (deals not in 'Closed Won' or 'Closed Lost' stages)
  const openDealsCount = deals.filter(deal => 
    !['Closed Won', 'Closed Lost'].includes(deal.stage)
  ).length;
  
  // Prepare data for the deal stage distribution chart
  const [dealStageData, setDealStageData] = useState<DealStageItem[]>([]);
  
  useEffect(() => {
    if (!dealsLoading && deals.length > 0) {
      // Count deals by stage
      const stageMap = new Map<string, number>();
      deals.forEach(deal => {
        const count = stageMap.get(deal.stage) || 0;
        stageMap.set(deal.stage, count + 1);
      });
      
      // Prepare chart data
      const chartData: DealStageItem[] = [];
      const colorMap: Record<string, string> = {
        'Qualification': '#3B82F6', // blue
        'Needs Analysis': '#A855F7', // purple
        'Proposal': '#F59E0B', // amber
        'Negotiation': '#F97316', // orange
        'Closed Won': '#10B981', // green
        'Closed Lost': '#EF4444', // red
      };
      
      stageMap.forEach((value, name) => {
        chartData.push({
          name,
          value,
          color: colorMap[name] || '#9CA3AF' // default gray if stage not in colorMap
        });
      });
      
      setDealStageData(chartData);
    }
  }, [deals, dealsLoading]);
  
  // Get top deals (by amount)
  const topDealsData = deals
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
    .slice(0, 5) // Take top 5
    .map(deal => ({
      name: deal.name,
      company: accounts.find(a => a.id === deal.account_id)?.name || 'Unknown',
      status: deal.stage,
      value: deal.amount
    }));
  
  // Prepare pipeline totals for the pipeline summary component - match Pipeline.tsx categorization
  const pipelineTotals = {
    lead: deals.filter(deal => deal.stage === 'Qualification').reduce((sum, deal) => sum + deal.amount, 0),
    qualified: deals.filter(deal => deal.stage === 'Evaluation').reduce((sum, deal) => sum + deal.amount, 0),
    negotiation: deals.filter(deal => ['Proposal', 'Negotiation'].includes(deal.stage)).reduce((sum, deal) => sum + deal.amount, 0),
    won: deals.filter(deal => deal.stage === 'Closed Won').reduce((sum, deal) => sum + deal.amount, 0),
    lost: deals.filter(deal => deal.stage === 'Closed Lost').reduce((sum, deal) => sum + deal.amount, 0)
  };






  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
          
          {/* Firebase Configuration Banner */}
          {(() => {
            try {
              // Check if Firebase is configured with default values using the utility
              const isUsingDefault = isUsingDefaultConfig();
              
              if (isUsingDefault) {
                return (
                  <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-lg font-medium text-amber-800">Firebase configuration needed</h3>
                        <div className="mt-2 text-amber-700">
                          <p>Your Firebase configuration is using placeholder values. This will limit the functionality of the app.</p>
                          <div className="mt-4 flex">
                            <button 
                              onClick={() => navigate('/setup')} 
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                              Setup Firebase
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            } catch (error) {
              console.error('Error checking Firebase config:', error);
              return (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0 text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-red-800">Firebase configuration error</h3>
                      <div className="mt-2 text-red-700">
                        <p>There was an error with your Firebase configuration. Please check your setup.</p>
                        <div className="mt-4">
                          <button 
                            onClick={() => navigate('/setup')} 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Troubleshoot Firebase
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<UsersIcon className="h-6 w-6" />} 
              value={accounts.length} 
              label="Total Accounts"
              color="text-blue-600"
            />
            <StatCard 
              icon={<DealIcon className="h-6 w-6" />} 
              value={openDealsCount} 
              label="Open Deals"
              color="text-green-600"
            />
            <StatCard 
              icon={<TasksIcon className="h-6 w-6" />} 
              value={taskCount} 
              label="Tasks"
              color="text-purple-600"
            />
            <StatCard 
              icon={<TeamIcon className="h-6 w-6" />} 
              value={teamMembers.length} 
              label="Team Members"
              color="text-orange-500"
            />
          </div>
          
          {/* Pipeline Summary */}
          <div className="mb-8">
            <PipelineSummary pipelineTotals={pipelineTotals} formatCurrency={formatCurrency} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Deal Stage Distribution */}
            <DealStageDistribution data={dealStageData} />
            
            {/* Top Deals */}
            <TopDeals topDeals={topDealsData} formatCurrency={formatCurrency} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <button 
                  onClick={() => {
                    if (!user) return;
                    // Log a new activity using the new format
                    logActivity(
                      user,
                      'create',
                      'activities',
                      'manual-entry',
                      {
                        title: "Manual Activity",
                        description: "Added a new activity from dashboard"
                      }
                    );
                  }}
                  className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Add New
                </button>
              </div>
              <div className="h-64 overflow-y-auto pr-2">
                <ActivityTimeline 
                  activities={activities}
                  limit={5}
                  loading={activitiesLoading}
                  showLoadMore={false}
                />
              </div>
            </div>
            
            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
                <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">2 pending</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                {tasks.filter(task => task.status === 'pending').slice(0, 2).map((task) => {
                  // Find related account and team member
                  const relatedAccount = task.related_to_type === 'account' && task.related_to_id ? 
                    accounts.find(a => a.id === task.related_to_id) : null;
                  const relatedDeal = task.related_to_type === 'deal' && task.related_to_id ? 
                    deals.find(d => d.id === task.related_to_id) : null;
                  const assignedTo = teamMembers.find(t => t.id === task.assigned_to);

                  return (
                    <div key={task.id} className="p-4 border-b">
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {relatedAccount && (
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-md truncate max-w-full">
                            Account: {relatedAccount.name}
                          </span>
                        )}
                        {relatedDeal && (
                          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-md truncate max-w-full">
                            Deal: {relatedDeal.name}
                          </span>
                        )}
                        {assignedTo && (
                          <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-md truncate max-w-full">
                            Assigned: {assignedTo.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-yellow-600 mt-3 text-right font-medium">{task.due_date}</div>
                    </div>
                  );
                })}
                {tasks.filter(task => task.status === 'pending').length === 0 && (
                  <div className="p-4 text-center text-gray-500">No pending tasks</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Icon components
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
    </svg>
  );
}

function DealIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
    </svg>
  );
}

function TasksIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function TeamIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
      <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
}

export default function Dashboard() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
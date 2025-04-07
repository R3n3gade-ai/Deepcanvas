import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

export default function CRM() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage your customer relationships and sales pipeline
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <TabsContent value="dashboard" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pipeline Overview</CardTitle>
              <CardDescription>Current deals and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$125,400</div>
              <p className="text-sm text-gray-500">Total pipeline value</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => handleNavigate("/pipeline")}>
                View Pipeline
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Contacts</CardTitle>
              <CardDescription>Your customer contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-sm text-gray-500">Total contacts</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => handleNavigate("/contacts")}>
                View Contacts
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Your upcoming tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-sm text-gray-500">Tasks due today</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => handleNavigate("/tasks")}>
                View Tasks
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deals</CardTitle>
              <CardDescription>Latest opportunities in your pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Acme Corp - Enterprise Plan</div>
                    <div className="text-sm text-gray-500">$45,000</div>
                  </div>
                  <Badge>Negotiation</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">TechStart Inc - Premium Support</div>
                    <div className="text-sm text-gray-500">$12,500</div>
                  </div>
                  <Badge>Proposal</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Global Services - Consulting</div>
                    <div className="text-sm text-gray-500">$28,750</div>
                  </div>
                  <Badge variant="outline">Closed Won</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => handleNavigate("/pipeline")}>
                View All Deals
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Sales metrics for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-sm text-gray-500">$78,500 in pipeline</div>
                  </div>
                  <div className="text-green-600 font-medium">+12%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Michael Chen</div>
                    <div className="text-sm text-gray-500">$64,200 in pipeline</div>
                  </div>
                  <div className="text-green-600 font-medium">+8%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Jessica Williams</div>
                    <div className="text-sm text-gray-500">$52,800 in pipeline</div>
                  </div>
                  <div className="text-red-600 font-medium">-3%</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => handleNavigate("/team")}>
                View Team
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="pipeline">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>
              Manage your sales pipeline and track deals
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Pipeline View</h3>
              <p className="text-gray-500 mb-6">
                This is a placeholder for the Pipeline view. Click the button below to navigate to the full Pipeline page.
              </p>
              <Button onClick={() => handleNavigate("/pipeline")}>
                Go to Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="contacts">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>
              Manage your customer contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Contacts View</h3>
              <p className="text-gray-500 mb-6">
                This is a placeholder for the Contacts view. Click the button below to navigate to the full Contacts page.
              </p>
              <Button onClick={() => handleNavigate("/contacts")}>
                Go to Contacts
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="accounts">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>
              Manage your customer accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Accounts View</h3>
              <p className="text-gray-500 mb-6">
                This is a placeholder for the Accounts view. Click the button below to navigate to the full Accounts page.
              </p>
              <Button onClick={() => handleNavigate("/accounts")}>
                Go to Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>
              Manage your sales team
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Team View</h3>
              <p className="text-gray-500 mb-6">
                This is a placeholder for the Team view. Click the button below to navigate to the full Team page.
              </p>
              <Button onClick={() => handleNavigate("/team")}>
                Go to Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "outline" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variant === "default"
          ? "bg-blue-100 text-blue-800"
          : "bg-white text-gray-800 border border-gray-200"
      }`}
    >
      {children}
    </span>
  );
}

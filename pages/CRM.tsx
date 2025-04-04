import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This is a placeholder component for the Dashboard content
const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <CardDescription>All active deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,780</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CardDescription>Current client accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
            <CardDescription>Average conversion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">+5% from previous quarter</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest activities across your CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-4 border-b border-gray-100 pb-4">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Activity {i}</h4>
                  <p className="text-sm text-gray-500">A sample activity description for the CRM dashboard</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function CRM() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">CRM Dashboard</h1>
            <p className="text-gray-500">Manage your customer relationships</p>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex space-x-2 mb-6 border-b pb-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/pipeline')}
            >
              Pipeline
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/accounts')}
            >
              Accounts
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/team')}
            >
              Team
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/contacts')}
            >
              Contacts
            </Button>
          </div>
          
          {/* Content area */}
          <Dashboard />
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "components/Sidebar";
import { toast } from "sonner";
import { getCurrentFirebaseApp, getCurrentFirebaseConfig, isUsingDefaultConfig, initializeFirebaseConfig } from "utils/firebaseConfig";
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore";
import { initContactsData } from "utils/initContactsData";
import { Contact } from "utils/types";
import { AppProvider } from "utils/AppProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function SetupContent() {
  const navigate = useNavigate();
  const [firebaseConfig, setFirebaseConfig] = useState<string>("");
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  
  // Check current configuration on page load
  useEffect(() => {
    try {
      // Check if we're using default config
      const usingDefault = isUsingDefaultConfig();
      setIsConfigured(!usingDefault);
      
      // Get current config to pre-populate
      const currentConfig = getCurrentFirebaseConfig();
      const configForDisplay = {
        apiKey: currentConfig.apiKey || "",
        authDomain: currentConfig.authDomain || "",
        projectId: currentConfig.projectId || "",
        storageBucket: currentConfig.storageBucket || "",
        messagingSenderId: currentConfig.messagingSenderId || "",
        appId: currentConfig.appId || ""
      };
      
      // Don't populate with default placeholder values
      if (!usingDefault) {
        setFirebaseConfig(JSON.stringify(configForDisplay, null, 2));
      }
      
      // Update status message if using default config
      if (usingDefault) {
        setStatus({
          success: false,
          message: "Your CRM is using default Firebase configuration. Please update with your own Firebase project details."
        });
      }
    } catch (error) {
      console.error("Error loading current Firebase config:", error);
      setStatus({
        success: false,
        message: `Error loading Firebase configuration: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }, []);
  
  const handleConfigSave = async () => {
    try {
      // Parse the JSON config
      const configObject = JSON.parse(firebaseConfig);
      
      // Validate required fields
      if (!configObject.apiKey || !configObject.projectId || !configObject.appId) {
        throw new Error("Firebase configuration is missing required fields (apiKey, projectId, or appId)");
      }
      
      await initializeFirebaseConfig(configObject);
      setStatus({ success: true, message: "Firebase configuration updated successfully." });
      setIsConfigured(true);
      toast.success("Firebase configuration updated successfully");
    } catch (error) {
      console.error("Error updating Firebase config:", error);
      setStatus({ success: false, message: `Error updating configuration: ${error instanceof Error ? error.message : String(error)}` });
      toast.error("Failed to update Firebase configuration");
    }
  };
  
  const initializeFirestoreData = async () => {
    try { 
      toast.info("Initializing Firestore data...");
      
      // Get the current Firebase app
      const app = getCurrentFirebaseApp();
      if (!app) {
        toast.error("Firebase app is not initialized. Please configure Firebase first.");
        return;
      }
      
      // Initialize Firestore
      const db = getFirestore(app);
      
      // Initialize accounts data
      const accountsData = [
        {
          id: '1',
          name: 'Acme Corporation',
          industry: 'Manufacturing',
          website: 'https://acme.example.com',
          employees: 500,
          annual_revenue: 25000000,
          address: '123 Main St',
          city: 'Metropolis',
          state: 'NY',
          country: 'USA',
          postal_code: '10001',
          phone: '+1-555-123-4567',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Globex Industries',
          industry: 'Technology',
          website: 'https://globex.example.com',
          employees: 1200,
          annual_revenue: 75000000,
          address: '456 Tech Blvd',
          city: 'Silicon Valley',
          state: 'CA',
          country: 'USA',
          postal_code: '94025',
          phone: '+1-555-987-6543',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Oceanic Airlines',
          industry: 'Transportation',
          website: 'https://oceanic.example.com',
          employees: 3500,
          annual_revenue: 150000000,
          address: '789 Sky Way',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          postal_code: '90045',
          phone: '+1-555-456-7890',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      // Initialize deals data
      const dealsData = [
        {
          id: '1',
          name: 'Annual Software License',
          account_id: '1',
          stage: 'Qualification',
          amount: 25000,
          close_date: '2025-06-30',
          probability: 20,
          description: 'Annual enterprise license renewal',
          status: 'In Progress',
          team_member_id: '1',
          owner_id: 'user1',
          region: 'NAMER',
          lead_source: 'Website',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Implementation Services',
          account_id: '2',
          stage: 'Evaluation',
          amount: 45000,
          close_date: '2025-07-15',
          probability: 50,
          description: 'Professional services for new implementation',
          status: 'In Progress',
          team_member_id: '2',
          owner_id: 'user1',
          region: 'EMEA',
          lead_source: 'Referral',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Hardware Upgrade',
          account_id: '3',
          stage: 'Proposal',
          amount: 65000,
          close_date: '2025-08-01',
          probability: 70,
          description: 'Server infrastructure upgrade',
          status: 'In Progress',
          team_member_id: '1',
          owner_id: 'user1',
          region: 'APAC',
          lead_source: 'Partner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      // Initialize tasks data
      const tasksData = [
        {
          id: '1',
          title: 'Product demo scheduled',
          description: 'Scheduled demo to show product features',
          due_date: '2025-03-20',
          status: 'pending',
          priority: 'high',
          assigned_to: '1',
          related_to_type: 'account',
          related_to_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Follow up with client',
          description: 'Send follow-up email after initial meeting',
          due_date: '2025-03-22',
          status: 'pending',
          priority: 'medium',
          assigned_to: '2',
          related_to_type: 'deal',
          related_to_id: '2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Prepare proposal draft',
          description: 'Create initial proposal for client review',
          due_date: '2025-03-25',
          status: 'in_progress',
          priority: 'high',
          assigned_to: '1',
          related_to_type: 'deal',
          related_to_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      // Initialize team members data
      const teamMembersData = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          role: 'Sales Manager',
          position: 'Sales Manager',
          department: 'Sales',
          phone: '(555) 123-4567',
          status: 'Active',
          joined_date: '2021-05-15',
          avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          role: 'Account Executive',
          position: 'Senior Account Executive',
          department: 'Sales',
          phone: '(555) 234-5678',
          status: 'Active',
          joined_date: '2022-01-10',
          avatar_url: 'https://randomuser.me/api/portraits/women/2.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'David Lee',
          email: 'david.lee@example.com',
          role: 'Solutions Engineer',
          position: 'Senior Solutions Engineer',
          department: 'Engineering',
          phone: '(555) 345-6789',
          status: 'Active',
          joined_date: '2021-08-22',
          avatar_url: 'https://randomuser.me/api/portraits/men/3.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ];
      
      // Initialize contacts data
      const contactsData = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@acme.example.com',
          phone: '+1-555-123-4567',
          job_title: 'CTO',
          account_id: '1',
          lead_status: 'Customer',
          lead_source: 'Website',
          address: '123 Tech Lane',
          city: 'Metropolis',
          state: 'NY',
          country: 'USA',
          postal_code: '10001',
          notes: 'Key decision maker for all technology purchases',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@globex.example.com',
          phone: '+1-555-987-6543',
          job_title: 'VP of Marketing',
          account_id: '2',
          lead_status: 'Customer',
          lead_source: 'Conference',
          address: '456 Marketing Ave',
          city: 'Silicon Valley',
          state: 'CA',
          country: 'USA',
          postal_code: '94025',
          notes: 'Interested in our analytics solution',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          first_name: 'Michael',
          last_name: 'Johnson',
          email: 'michael.johnson@oceanic.example.com',
          phone: '+1-555-456-7890',
          job_title: 'Procurement Manager',
          account_id: '3',
          lead_status: 'Customer',
          lead_source: 'Referral',
          address: '789 Fleet St',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          postal_code: '90045',
          notes: 'Handles all vendor relationships',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      // Initialize team performance data
      const teamPerformanceData = [
        {
          id: '1',
          team_member_id: '1',
          year: 2023,
          quarter: 1,
          quota: 500000,
          forecast_amount: 480000,
          percent_to_goal: 92
        },
        {
          id: '2',
          team_member_id: '2',
          year: 2023,
          quarter: 1,
          quota: 200000,
          forecast_amount: 210000,
          percent_to_goal: 103
        },
      ];
      
      // Add data to Firestore collections
      const addPromises = [];
      
      // Add accounts
      accountsData.forEach(account => {
        addPromises.push(setDoc(doc(db, 'accounts', account.id), account));
      });
      
      // Add contacts
      contactsData.forEach(contact => {
        addPromises.push(setDoc(doc(db, 'contacts', contact.id), contact));
      });
      
      // Add deals
      dealsData.forEach(deal => {
        addPromises.push(setDoc(doc(db, 'deals', deal.id), deal));
      });
      
      // Add tasks
      tasksData.forEach(task => {
        addPromises.push(setDoc(doc(db, 'tasks', task.id), task));
      });
      
      // Add team members
      teamMembersData.forEach(member => {
        addPromises.push(setDoc(doc(db, 'team_members', member.id), member));
      });
      
      // Add team performance
      teamPerformanceData.forEach(performance => {
        addPromises.push(setDoc(doc(db, 'team_performance', performance.id), performance));
      });
      
      // Execute all promises
      await Promise.all(addPromises);
      
      toast.success("Firestore data initialized successfully!");
    } catch (error) {
      console.error("Error initializing Firestore data:", error);
      toast.error("Failed to initialize Firestore data. See console for details.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-8">Setup</h1>
          
          {/* Status message */}
          {status && (
            <Alert className={`mb-6 ${status.success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="firebase" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="firebase">Firebase Configuration</TabsTrigger>
              <TabsTrigger value="data">Data Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="firebase">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Firebase Configuration</CardTitle>
                  <CardDescription>
                    Update your Firebase configuration to connect to your own Firebase project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firebase-config">Firebase Configuration JSON</Label>
                      <Textarea
                        id="firebase-config"
                        placeholder={`{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT_ID.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}`}
                        className="min-h-[200px] font-mono"
                        value={firebaseConfig}
                        onChange={(e) => setFirebaseConfig(e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>You can find this information in your Firebase Console:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                        <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
                        <li>Select your project (or create a new one)</li>
                        <li>Click on the web app icon (add app button) in the Project Overview</li>
                        <li>Copy the firebaseConfig object</li>
                      </ol>
                      
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="font-medium text-yellow-800 mb-2">Important Setup Steps:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 text-yellow-700">
                          <li>Enable <strong>Firestore Database</strong> in your Firebase project (in Build → Firestore Database)
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Go to the Firebase Console → Your Project → Build → Firestore Database</li>
                              <li>Click "Create database" if you haven't already</li>
                              <li>Choose "Start in test mode" for easier setup</li>
                              <li>Select a location closest to you or your users</li>
                            </ul>
                          </li>
                          <li className="mt-2">Enable at least one <strong>Authentication method</strong> (in Build → Authentication → Sign-in method)
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Go to the Firebase Console → Your Project → Build → Authentication</li>
                              <li>In the "Sign-in method" tab, enable Email/Password or Google</li>
                            </ul>
                          </li>
                          <li className="mt-2">Add authorized domains for authentication:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>In Firebase Console → Authentication → Settings → Authorized domains</li>
                              <li>Add <code className="bg-yellow-100 px-1 rounded">localhost</code></li>
                              <li>Add <code className="bg-yellow-100 px-1 rounded">databutton.com</code></li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="font-medium text-red-800 mb-2">Common Firestore Connection Issues:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 text-red-700">
                          <li>If you see "Firestore connection failed" error:</li>
                          <li className="ml-6">Verify that Firestore Database is enabled in your Firebase project</li>
                          <li className="ml-6">Confirm you're using the correct Project ID in your Firebase config</li>
                          <li className="ml-6">Check if Firestore Database has been initialized (created) in the Firebase Console</li>
                          <li className="ml-6">Test by going to the Firebase Console → Firestore and trying to add a collection manually</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                  <Button onClick={handleConfigSave}>Update Configuration</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="data">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Initialize your CRM with sample data or manage existing data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-3xl mb-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Setup Instructions</h2>
                    <p className="mb-4 text-blue-700">
                      This setup allows you to initialize your Firestore database with sample data for demonstration purposes.
                      After initializing, you can observe how the data interacts with the application in real-time.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-blue-700">
                      <li>Click the "Initialize Firestore Data" button below to populate your database with sample data.</li>
                      <li>Open your Firestore console to view the created collections and documents.</li>
                      <li>Navigate to the Pipeline page and try dragging deals between columns.</li>
                      <li>Observe how the data changes in Firestore as you interact with the application.</li>
                    </ol>
                    <p className="mt-4 text-blue-700">
                      <strong>Note:</strong> This initialization is only needed once for demonstration purposes.
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      size="lg"
                      onClick={initializeFirestoreData}
                    >
                      Initialize Firestore Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

const Setup = () => {
  return (
    <AppProvider>
      <SetupContent />
    </AppProvider>
  );
};

export default Setup;
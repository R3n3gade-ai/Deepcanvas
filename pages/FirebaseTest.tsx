import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from 'components/Sidebar';
import { useCurrentUser } from 'app';
import { getAuth } from 'firebase/auth';
import { isUsingDefaultConfig, getCurrentFirebaseApp, getCurrentFirebaseConfig, getFirebaseConfig } from 'utils/firebaseConfig';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppProvider } from 'utils/AppProvider';

function FirebaseTestContent() {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [authStatus, setAuthStatus] = useState<"loading" | "success" | "error">("loading");
  const [firestoreStatus, setFirestoreStatus] = useState<"loading" | "success" | "error">("loading");
  const [configDetails, setConfigDetails] = useState<string>("");
  const [testResult, setTestResult] = useState({
    auth: { success: false, message: '' },
    firestore: { success: false, message: '' }
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    checkFirebaseConfig();
    checkAuth();
    checkFirestore();
  }, []);

  const checkFirebaseConfig = () => {
    try {
      // Get current Firebase app and config
      const app = getCurrentFirebaseApp();
      const config = getCurrentFirebaseConfig();
      
      // Use the utility function to check if using default values
      const isDefault = isUsingDefaultConfig();
      
      setIsConfigured(!isDefault);
      
      // Format config details for display (hide sensitive info)
      const safeConfig = {
        apiKey: config.apiKey ? "***" + config.apiKey.substring(config.apiKey.length - 5) : "Not set",
        authDomain: config.authDomain || "Not set",
        projectId: config.projectId || "Not set",
        storageBucket: config.storageBucket || "Not set",
        messagingSenderId: config.messagingSenderId || "Not set",
        appId: config.appId ? "***" + config.appId.substring(config.appId.length - 6) : "Not set",
      };
      
      setConfigDetails(JSON.stringify(safeConfig, null, 2));
    } catch (error) {
      console.error("Error checking Firebase configuration:", error);
      setIsConfigured(false);
      setConfigDetails("Error checking configuration");
    }
  };

  const checkAuth = () => {
    try {
      // Get Firebase app
      const app = getCurrentFirebaseApp();
      
      // Check if Firebase Auth is initialized
      if (app) {
        const auth = getAuth(app);
        if (auth) {
          setAuthStatus("success");
          return;
        }
      }
      
      setAuthStatus("error");
    } catch (error) {
      console.error("Error checking Firebase Auth:", error);
      setAuthStatus("error");
    }
  };

  const checkFirestore = async () => {
    try {
      // Get Firebase app
      const app = getCurrentFirebaseApp();
      
      // Check if Firestore is accessible
      if (app) {
        const db = getFirestore(app);
        const testQuery = query(collection(db, "accounts"), limit(1));
        await getDocs(testQuery);
        setFirestoreStatus("success");
        return;
      }
      
      setFirestoreStatus("error");
    } catch (error) {
      console.error("Error checking Firestore:", error);
      setFirestoreStatus("error");
    }
  };

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    // Reset test results
    setTestResult({
      auth: { success: false, message: '' },
      firestore: { success: false, message: '' }
    });

    // Get Firebase app
    const app = getCurrentFirebaseApp();
    if (!app) {
      setTestResult({
        auth: { success: false, message: 'Firebase app is not initialized.' },
        firestore: { success: false, message: 'Firebase app is not initialized.' }
      });
      setIsLoading(false);
      return;
    }

    // Test Auth
    if (user) {
      setTestResult(prev => ({
        ...prev,
        auth: { success: true, message: `Authentication successful. Logged in as ${user.email || user.uid}` }
      }));
    } else {
      setTestResult(prev => ({
        ...prev,
        auth: { success: false, message: 'Authentication failed. User not logged in.' }
      }));
    }

    // Test Firestore
    try {
      const db = getFirestore(app);
      const testCollection = collection(db, 'test_collection');
      
      await getDocs(testCollection);
      
      setTestResult(prev => ({
        ...prev,
        firestore: { success: true, message: 'Firestore connection successful.' }
      }));
    } catch (error) {
      console.error('Firestore test error:', error);
      setTestResult(prev => ({
        ...prev,
        firestore: { success: false, message: `Firestore connection failed: ${error instanceof Error ? error.message : String(error)}` }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getConfigStatus = () => {
    try {
      // Get Firebase app
      const app = getCurrentFirebaseApp();
      
      // Access the app to see if it's initialized
      if (app && app.name) {
        return {
          success: true,
          message: 'Firebase initialized with app name: ' + app.name
        };
      }
      return {
        success: false,
        message: 'Firebase app is not properly initialized.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Firebase initialization error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  };

  const configStatus = getConfigStatus();

  return (
    <div className="flex h-screen bg-gray-50">
      {user ? <Sidebar /> : null}
      
      <main className={`${user ? "flex-1" : "w-full"} overflow-y-auto`}>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-8">Firebase Configuration Test</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Firebase Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Configuration Status</div>
                  <div className="flex items-center">
                    {isConfigured === null ? (
                      <div className="flex items-center text-gray-500">
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking...
                      </div>
                    ) : isConfigured ? (
                      <div className="flex items-center text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Configured
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Not Configured
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="font-medium">Authentication</div>
                  <div className="flex items-center">
                    {authStatus === "loading" ? (
                      <div className="flex items-center text-gray-500">
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking...
                      </div>
                    ) : authStatus === "success" ? (
                      <div className="flex items-center text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Available
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Error
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="font-medium">Firestore Database</div>
                  <div className="flex items-center">
                    {firestoreStatus === "loading" ? (
                      <div className="flex items-center text-gray-500">
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking...
                      </div>
                    ) : firestoreStatus === "success" ? (
                      <div className="flex items-center text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Available
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Error
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            
          <Card>
            <CardHeader>
              <CardTitle>Firebase Configuration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {configDetails}
              </pre>

              {!isConfigured && (
                <div className="mt-4 p-4 bg-amber-50 rounded-md">
                  <h3 className="font-semibold text-amber-800 mb-2">Configuration Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-amber-800">
                    <li>Create a Firebase project at <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline">firebase.google.com</a></li>
                    <li>Go to Project Settings and add a web app to your project</li>
                    <li>Copy the Firebase config object</li>
                    <li>Go to the Setup page and paste your Firebase configuration</li>
                    <li>Click "Update Configuration" to save your changes</li>
                    <li>The page will reload automatically to apply changes</li>
                  </ol>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button 
                variant="default" 
                onClick={() => navigate('/setup')}
              >
                Go to Setup
              </Button>
            </CardFooter>
          </Card>

          {/* Manual connection test section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Manual Connection Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Test your Firebase connection manually:</p>
              <Button 
                onClick={testFirebaseConnection} 
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? 'Testing...' : 'Test Firebase Connection'}
              </Button>
              
              {/* Test Results */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mt-4">
                {/* Auth Test */}
                <div>
                  <h3 className="font-semibold mb-2">Authentication Test</h3>
                  {testResult.auth.message ? (
                    <div className={`p-3 rounded-md ${testResult.auth.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {testResult.auth.message}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Run the test to see results</p>
                  )}
                </div>
                
                {/* Firestore Test */}
                <div>
                  <h3 className="font-semibold mb-2">Firestore Test</h3>
                  {testResult.firestore.message ? (
                    <div className={`p-3 rounded-md ${testResult.firestore.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {testResult.firestore.message}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Run the test to see results</p>
                  )}
                </div>
              </div>
              
              {/* Firestore Troubleshooting Guide */}
              {testResult.firestore.message && !testResult.firestore.success && (
                <div className="mt-6 p-4 border border-amber-200 bg-amber-50 rounded-md">
                  <h3 className="font-semibold text-amber-800 mb-2">Firestore Troubleshooting Guide:</h3>
                  <ul className="list-disc list-inside space-y-2 text-amber-800">
                    <li>Check if <strong>Firestore Database is enabled</strong> in your Firebase project
                      <ul className="list-disc list-inside ml-6 mt-1 text-amber-700">
                        <li>Go to Firebase Console → Build → Firestore Database</li>
                        <li>Click "Create database" if you haven't already</li>
                      </ul>
                    </li>
                    <li className="mt-1">Verify security rules allow read/write access
                      <ul className="list-disc list-inside ml-6 mt-1 text-amber-700">
                        <li>For testing, start Firestore in test mode</li>
                        <li>Or set rules to allow read/write: <code className="bg-amber-100 px-1 rounded">allow read, write: if true;</code></li>
                      </ul>
                    </li>
                    <li className="mt-1">Confirm your Project ID matches the one in Firebase Console</li>
                    <li className="mt-1">Clear browser cache and try again</li>
                  </ul>
                </div>
              )}
              
              {/* Auth Troubleshooting Guide */}
              {testResult.auth.message && !testResult.auth.success && (
                <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-md">
                  <h3 className="font-semibold text-amber-800 mb-2">Authentication Troubleshooting Guide:</h3>
                  <ul className="list-disc list-inside space-y-2 text-amber-800">
                    <li>Enable at least one <strong>Authentication method</strong> in Firebase
                      <ul className="list-disc list-inside ml-6 mt-1 text-amber-700">
                        <li>Go to Firebase Console → Build → Authentication → Sign-in method</li>
                        <li>Enable Email/Password or Google authentication</li>
                      </ul>
                    </li>
                    <li className="mt-1">Add authorized domains for authentication
                      <ul className="list-disc list-inside ml-6 mt-1 text-amber-700">
                        <li>Go to Authentication → Settings → Authorized domains</li>
                        <li>Add <code className="bg-amber-100 px-1 rounded">localhost</code> and <code className="bg-amber-100 px-1 rounded">databutton.com</code></li>
                      </ul>
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function FirebaseTest() {
  return (
    <AppProvider>
      <FirebaseTestContent />
    </AppProvider>
  );
}

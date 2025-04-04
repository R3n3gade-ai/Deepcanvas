import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SignInOrUpForm } from "app/auth/SignInOrUpForm";
import { Card } from "@/components/ui/card";
import { Logo } from "components/Logo";
import { useCurrentUser } from "app";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useCurrentUser();
  
  // Get the next URL from query params
  const getNextUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('next') || '/dashboard';
  };
  
  // Redirect to dashboard or next URL if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(getNextUrl());
    }
  }, [user, loading, navigate, location]);
  
  // Don't render the form while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <p>Loading...</p>
      </div>
    );
  }
  
  // Don't render the form if already logged in (will redirect)
  if (user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo className="h-12 w-12" />
          <h1 className="text-2xl font-bold tracking-tight">Welcome to the CRM</h1>
          <p className="text-sm text-slate-500">
            Sign in to your account to access your dashboard
          </p>
        </div>
        
        <Card className="p-6">
          <SignInOrUpForm
            signInOptions={{
              google: true,
              emailAndPassword: true
            }}
            onSuccess={() => navigate(getNextUrl())}
          />
        </Card>
      </div>
    </div>
  );
};

export default Login;
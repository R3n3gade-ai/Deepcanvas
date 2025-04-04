import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseAuth } from "app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { isUsingDefaultConfig } from "utils/firebaseConfig";


export default function App() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      navigate("/dashboard");
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  // Check Firebase configuration and redirect appropriately
  useEffect(() => {
    try {
      // Check if Firebase is properly configured using our utility
      const isConfigValid = !isUsingDefaultConfig();

      if (!isConfigValid) {
        // If Firebase is not configured, redirect to Setup page
        navigate("/setup");
        return;
      }

      // If Firebase is configured and user is logged in, redirect to dashboard
      const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
          navigate("/dashboard");
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase configuration error:", error);
      navigate("/setup");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-orange-600">FireCRM</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoogleSignIn}
              className="bg-orange-600 rounded-full px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
            >
              Log in →
            </button>
            <button
              onClick={() => navigate("/setup")}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
            >
              Setup Guide
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 overflow-hidden">
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 opacity-90"></div>

          <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Left Side Content */}
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Customer <br />
                relationships <br />
                that drive your <br />
                business
              </h1>
              <p className="text-white/80 text-lg mb-8 max-w-xl">
                Join thousands of companies that use FireCRM to manage leads, nurture customer relationships, track sales opportunities, and close more deals with less effort.
              </p>

              <div className="flex items-end space-x-4">
                <div className="flex-1 max-w-sm">
                  <input
                    type="email"
                    placeholder="Work email"
                    className="w-full px-4 py-3 rounded-md border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <button
                  onClick={handleGoogleSignIn}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md px-5 py-3 transition-all flex items-center"
                >
                  Start free <span className="ml-2">→</span>
                </button>
              </div>
            </div>

            {/* Right Side Mockup */}
            <div className="lg:w-1/2 lg:pl-10">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-5 bg-gray-100 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Deal Pipeline</h3>
                    <div className="text-sm text-gray-500">Q1 2025</div>
                  </div>

                  {/* Pipeline Stages */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">New Leads</span>
                        <span className="text-gray-500">$125,000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Qualified</span>
                        <span className="text-gray-500">$89,500</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Proposal</span>
                        <span className="text-gray-500">$64,200</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Closing</span>
                        <span className="text-gray-500">$32,800</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">RECENT ACTIVITY</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
                          M
                        </div>
                        <div>
                          <p className="text-sm"><span className="font-medium">Michael Scott</span> moved to <span className="text-orange-600">Closing</span></p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 flex-shrink-0">
                          J
                        </div>
                        <div>
                          <p className="text-sm"><span className="font-medium">Jim Halpert</span> added a new note</p>
                          <p className="text-xs text-gray-500">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brands Section */}
        <div className="bg-white py-12">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-center text-gray-500 mb-10">Trusted by leading companies worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
              {/* Brand logos - simplified versions */}
              <div className="text-gray-800 font-bold">Dunder Mifflin</div>
              <div className="text-gray-800 font-bold">Acme Inc</div>
              <div className="text-gray-800 font-bold">Stark Industries</div>
              <div className="text-gray-800 font-bold">Pied Piper</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
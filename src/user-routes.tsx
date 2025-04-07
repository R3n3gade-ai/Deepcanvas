import React, { lazy } from "react";
import { RouteObject } from "react-router";
import { UserGuard } from "./app";

// Import our placeholder components
const UnderConstruction = lazy(() => import("./components/UnderConstruction"));
const NotFound = lazy(() => import("./components/NotFound"));

// Import our actual pages - note the lack of .tsx extension
const App = lazy(() => import("./pages/App"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));

// Import our agent pages
const Agents = lazy(() => import("./pages/Agents"));
const AgentBuilder = lazy(() => import("./pages/AgentBuilder"));
const AgentChat = lazy(() => import("./pages/AgentChat"));

// Import other pages
const Tasks = lazy(() => import("./pages/Tasks"));

export const userRoutes: RouteObject[] = [
  { path: "/", element: <UserGuard><App /></UserGuard> },
  { path: "/dashboard", element: <UserGuard><Dashboard /></UserGuard> },
  { path: "/agents", element: <UserGuard><Agents /></UserGuard> },
  { path: "/agent-builder", element: <UserGuard><AgentBuilder /></UserGuard> },
  { path: "/agent-builder/:agentId", element: <UserGuard><AgentBuilder /></UserGuard> },
  { path: "/agent/:agentId", element: <UserGuard><AgentChat /></UserGuard> },

  // Routes for pages under construction
  { path: "/accounts", element: <UserGuard><UnderConstruction title="Accounts" /></UserGuard> },
  { path: "/api-hub", element: <UserGuard><UnderConstruction title="API Hub" /></UserGuard> },
  { path: "/api-connect", element: <UserGuard><UnderConstruction title="API Connect" /></UserGuard> },
  { path: "/brain", element: <UserGuard><UnderConstruction title="Knowledge Base" /></UserGuard> },
  { path: "/app-builder", element: <UserGuard><UnderConstruction title="App Builder" /></UserGuard> },
  { path: "/app-builder/editor/:projectId", element: <UserGuard><UnderConstruction title="App Builder Editor" /></UserGuard> },
  { path: "/chat", element: <UserGuard><UnderConstruction title="Chat" /></UserGuard> },
  { path: "/connections", element: <UserGuard><UnderConstruction title="Connections" /></UserGuard> },
  { path: "/contacts", element: <UserGuard><UnderConstruction title="Contacts" /></UserGuard> },
  { path: "/crm", element: <UserGuard><UnderConstruction title="CRM" /></UserGuard> },
  { path: "/pipeline", element: <UserGuard><UnderConstruction title="Pipeline" /></UserGuard> },
  { path: "/setup", element: <UserGuard><UnderConstruction title="Setup" /></UserGuard> },
  { path: "/studio", element: <UserGuard><UnderConstruction title="Studio" /></UserGuard> },
  { path: "/tasks", element: <UserGuard><Tasks /></UserGuard> },
  { path: "/team", element: <UserGuard><UnderConstruction title="Team" /></UserGuard> },
  { path: "/workflow-builder", element: <UserGuard><UnderConstruction title="Workflow Builder" /></UserGuard> },
  { path: "/workflows", element: <UserGuard><UnderConstruction title="Workflows" /></UserGuard> },

  // Catch-all route for 404 pages
  { path: "*", element: <UserGuard><NotFound /></UserGuard> },
];

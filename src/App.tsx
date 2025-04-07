import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Agents from './pages/Agents';
import AgentBuilder from './pages/AgentBuilder';
import AgentChat from './pages/AgentChat';
import Chat from './pages/Chat';
import Tasks from './pages/Tasks';
import Brain from './pages/Brain';
import AppBuilder from './pages/AppBuilder';
import AppBuilderEditor from './pages/AppBuilderEditor';
import Studio from './pages/Studio';
import Workflows from './pages/Workflows';
import WorkflowBuilder from './pages/WorkflowBuilder';
import NotFound from './components/NotFound';
import UnderConstruction from './components/UnderConstruction';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="app">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agent-builder" element={<AgentBuilder />} />
            <Route path="/agent-builder/:agentId" element={<AgentBuilder />} />
            <Route path="/agent/:agentId" element={<AgentChat />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/tasks" element={<Tasks />} />

            {/* Placeholder routes */}
            <Route path="/brain" element={<Brain />} />
            <Route path="/app-builder" element={<AppBuilder />} />
            <Route path="/app-builder-editor/:projectId" element={<AppBuilderEditor />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/api-connect" element={<UnderConstruction title="API Connect" />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflow-builder" element={<WorkflowBuilder />} />
            <Route path="/settings" element={<UnderConstruction title="Settings" />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

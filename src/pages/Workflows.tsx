import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useWorkflowStore from '../features/workflow/store/workflowStore';

export default function Workflows() {
  const navigate = useNavigate();
  const {
    workflows,
    fetchWorkflows,
    createWorkflow,
    deleteWorkflow,
    isLoading,
    error
  } = useWorkflowStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch workflows on component mount
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  // Filter workflows based on search term
  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle workflow creation
  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) return;

    try {
      const workflowId = await createWorkflow(workflowName, workflowDescription);
      setShowCreateDialog(false);
      setWorkflowName('');
      setWorkflowDescription('');

      if (workflowId) {
        // Add a small delay to ensure the store is updated
        setTimeout(() => {
          navigate(`/workflow-builder?id=${workflowId}`);
        }, 100);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => setShowCreateDialog(true)}
        >
          Create Workflow
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search workflows..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          {error}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No workflows match your search.' : 'You don\'t have any workflows yet.'}
          </p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => setShowCreateDialog(true)}
          >
            Create Your First Workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold mb-2">{workflow.name}</h2>
              <p className="text-gray-600 mb-4 text-sm">{workflow.description}</p>
              <div className="text-xs text-gray-500 mb-4">
                Updated {new Date(workflow.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex justify-between">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => navigate(`/workflow-builder?id=${workflow.id}`)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this workflow?')) {
                      deleteWorkflow(workflow.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workflow Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Workflow</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Workflow Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe what this workflow does"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setShowCreateDialog(false);
                  setWorkflowName('');
                  setWorkflowDescription('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                onClick={handleCreateWorkflow}
                disabled={!workflowName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import useWorkflowStore from '../utils/workflowStore';
import { Workflow } from '../utils/workflowStore';

export default function Workflows() {
  const navigate = useNavigate();
  const { workflows, fetchWorkflows, deleteWorkflow, isLoading, error } = useWorkflowStore();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows().catch(err => {
      console.error('Error fetching workflows:', err);
      toast.error('Failed to load workflows');
    });
  }, [fetchWorkflows]);

  const handleCreateNew = () => {
    navigate('/workflow-builder');
  };

  const handleEdit = (workflowId: string) => {
    navigate(`/workflow-builder?id=${workflowId}`);
  };

  const handleConfirmDelete = (workflowId: string) => {
    setIsConfirmingDelete(workflowId);
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(null);
  };

  const handleDelete = async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId);
      toast.success('Workflow deleted successfully');
      setIsConfirmingDelete(null);
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Workflows</h1>
              <p className="text-gray-500 mt-1">Create and manage your no-code AI agent workflows</p>
            </div>
            <Button onClick={handleCreateNew} size="lg" className="shrink-0 gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              Create Workflow
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-50 p-4">
                <svg className="h-8 w-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Loading workflows</h3>
              <p className="mt-1 text-sm text-gray-500">Please wait while we fetch your workflows...</p>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-100 bg-red-50 p-12 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Failed to load workflows</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">{error.message}</p>
              <Button 
                variant="outline" 
                onClick={() => fetchWorkflows()}
              >
                Try Again
              </Button>
            </div>
          ) : workflows.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-12 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No workflows created yet</h3>
              <p className="text-gray-600 mb-6 max-w-md">Build powerful AI workflows without code. Create your first workflow to get started.</p>
              <Button onClick={handleCreateNew} size="lg" className="gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Workflow
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="relative overflow-hidden transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex gap-1">
                        {workflow.nodes && workflow.nodes.length > 0 && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {workflow.nodes.length} nodes
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {workflow.updatedAt && (
                          <span className="text-xs text-gray-500">
                            Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1">{workflow.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {workflow.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1">
                      {workflow.nodes && workflow.nodes.reduce((uniqueTypes: string[], node: any) => {
                        if (node.type && !uniqueTypes.includes(node.type)) {
                          uniqueTypes.push(node.type);
                        }
                        return uniqueTypes;
                      }, []).map((type: string) => (
                        <Badge key={type} variant="secondary" className="capitalize">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4 border-t border-gray-100">
                    {isConfirmingDelete === workflow.id ? (
                      <div className="flex space-x-2 w-full">
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleDelete(workflow.id)}
                        >
                          Confirm Delete
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={handleCancelDelete}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2 w-full">
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={() => handleEdit(workflow.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleConfirmDelete(workflow.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
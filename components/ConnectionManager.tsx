import React, { useState } from 'react';
import { useApiConnectionsStore, ApiConnection, NewApiConnection, ApiConnectionUpdate } from '../utils/apiConnectionsStore';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionForm } from './ConnectionForm';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from 'sonner';

export function ConnectionManager() {
  const { toast } = useToast();
  const [formMode, setFormMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingConnection, setEditingConnection] = useState<ApiConnection | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Access store
  const { 
    connections, 
    isLoading, 
    isTesting,
    error, 
    fetchConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection
  } = useApiConnectionsStore();
  
  // Initialize
  React.useEffect(() => {
    fetchConnections();
  }, []);
  
  // Handle form submission for new/edit connection
  const handleFormSubmit = async (data: NewApiConnection | ApiConnectionUpdate) => {
    try {
      if (formMode === 'add') {
        // Create new connection
        const result = await createConnection(data as NewApiConnection);
        if (result) {
          toast.success('Connection created successfully');
          setFormMode('none');
        }
      } else if (formMode === 'edit' && editingConnection) {
        // Update existing connection
        const result = await updateConnection(editingConnection.id, data as ApiConnectionUpdate);
        if (result) {
          toast.success('Connection updated successfully');
          setFormMode('none');
          setEditingConnection(null);
        }
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error submitting form:', error);
    }
  };
  
  // Handle edit button click
  const handleEditClick = (connection: ApiConnection) => {
    setEditingConnection(connection);
    setFormMode('edit');
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setConnectionToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    if (connectionToDelete) {
      const success = await deleteConnection(connectionToDelete);
      if (success) {
        toast.success('Connection deleted successfully');
      } else {
        toast.error('Failed to delete connection');
      }
      setConnectionToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };
  
  // Handle test connection
  const handleTestConnection = async (id: string) => {
    const result = await testConnection(id);
    if (result) {
      if (result.status === 'connected') {
        toast.success('Connection test successful');
      } else {
        toast.error(`Connection test failed: ${result.message}`);
      }
    }
  };
  
  // Filter connections based on active tab
  const filteredConnections = connections.filter(conn => {
    if (activeTab === 'all') return true;
    if (activeTab === 'connected') return conn.status === 'connected';
    if (activeTab === 'failed') return conn.status === 'failed';
    if (activeTab === 'untested') return conn.status === 'untested';
    return true;
  });
  
  // Show form when in add/edit mode, otherwise show connection list
  if (formMode === 'add' || formMode === 'edit') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <ConnectionForm
          initialValues={editingConnection || undefined}
          isEdit={formMode === 'edit'}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setFormMode('none');
            setEditingConnection(null);
          }}
          isLoading={isLoading}
        />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">API Connections</h1>
          <p className="text-gray-600">Manage your API keys and test connections</p>
        </div>
        <Button onClick={() => setFormMode('add')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add Connection
        </Button>
      </div>
      
      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="untested">Untested</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Connections grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">No connections found</h3>
          <p className="text-gray-600 mb-6">
            {activeTab !== 'all'
              ? `No ${activeTab} connections. Try changing the filter or add a new connection.`
              : "You haven't added any API connections yet. Add one to get started."}
          </p>
          <Button onClick={() => setFormMode('add')}>
            Add Connection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onTest={handleTestConnection}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isTesting={isTesting === connection.id}
            />
          ))}
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this connection?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The API key will be removed from storage and any integrations using this connection will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Sidebar } from "../components/Sidebar";
import { useCurrentUser } from "app";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";
import { useDealsStore } from "../utils/dealsStore";
import { useAccountsStore } from "../utils/accountsStore";
import { useTeamStore } from "../utils/teamStore";
import { Deal } from "../utils/types";
import {
  useCrudManager,
  CrudMode,
  validateRequired
} from "../utils/crudManager";
import { Dialog, ConfirmDialog } from "../components/Dialog";
import { FormField } from "../components/FormField";
import { useToast } from "../utils/AppProvider";
import { logActivity } from "../utils/activityTracking";
import { useActivitiesStore } from "../utils/activitiesStore";
import { PipelineSummary } from "../components/PipelineSummary";
import { AppProvider } from "utils/AppProvider";

const DEALS_COLLECTION = 'deals';

function PipelineContent() {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Access Zustand stores
  const { deals, fetchDeals, createDeal, updateDeal, deleteDeal } = useDealsStore();
  const { accounts, fetchAccounts, getAccountById } = useAccountsStore();
  const { teamMembers, fetchTeamMembers } = useTeamStore();
  const { setupRealtimeSync: setupActivitiesSync } = useActivitiesStore();

  // Set up the useEffect to subscribe to the activities collection
  useEffect(() => {
    if (user) {
      const unsubscribe = setupActivitiesSync();
      return () => unsubscribe();
    }
  }, [user, setupActivitiesSync]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        await Promise.all([
          fetchDeals(),
          fetchAccounts(),
          fetchTeamMembers()
        ]);
      } catch (error) {
        console.error('Error loading pipeline data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, fetchDeals, fetchAccounts, fetchTeamMembers]);

  // Toast notifications
  const { showToast } = useToast();

  // Default empty deal for new records
  const defaultDeal: Omit<Deal, 'id' | 'created_at' | 'updated_at'> = {
    name: '',
    account_id: '',
    stage: 'Qualification',
    amount: 0,
    close_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    probability: 20,
    description: '',
    status: 'In Progress',
    team_member_id: '',
    owner_id: user?.uid || '', // Will be set to the current user's ID
  };

  // Validate deal form
  const validateDeal = (values: Deal) => {
    const errors: Record<string, string> = validateRequired(values, [
      'name', 'account_id', 'stage', 'amount', 'close_date', 'probability'
    ]);

    // Add validation for team_member_id if needed
    if (!values.team_member_id) {
      errors.team_member_id = 'Please select a deal owner';
    }

    return errors;
  };

  // CRUD Manager for deals
  const dealsCrud = useCrudManager<Deal>({
    entityName: 'Deal',
    defaultEntity: defaultDeal,
    fetchEntities: fetchDeals,
    createEntity: (dealData) => {
      // Always pass user object to createDeal for proper activity tracking
      return createDeal(dealData, user);
    },
    updateEntity: (id, updates) => {
      // Always pass user object to updateDeal for proper activity tracking
      return updateDeal(id, updates, user);
    },
    deleteEntity: (id) => {
      // Always pass user object to deleteDeal for proper activity tracking
      return deleteDeal(id, user);
    },
    validateEntity: validateDeal,
    onCreateSuccess: () => showToast('Deal created successfully', 'success'),
    onUpdateSuccess: () => showToast('Deal updated successfully', 'success'),
    onDeleteSuccess: () => showToast('Deal deleted successfully', 'success'),
    onError: (error) => showToast(error.message, 'error')
  });

  // Map of stage IDs to database stage values
  const stageMap = {
    lead: 'Qualification',
    qualified: 'Evaluation',
    negotiation: 'Proposal', // Default to Proposal when moving to negotiation column
    won: 'Closed Won',
    lost: 'Closed Lost'
  };

  // Reverse mapping for display purposes
  const stageDisplayMap: Record<string, string> = {
    Qualification: 'lead',
    Evaluation: 'qualified',
    Proposal: 'negotiation',
    Negotiation: 'negotiation',
    'Closed Won': 'won',
    'Closed Lost': 'lost'
  };

  // Group deals by stage
  const dealsByStage = {
    lead: deals.filter(deal => deal.stage === 'Qualification'),
    qualified: deals.filter(deal => deal.stage === 'Evaluation'),
    negotiation: deals.filter(deal => ['Proposal', 'Negotiation'].includes(deal.stage)),
    won: deals.filter(deal => deal.stage === 'Closed Won'),
    lost: deals.filter(deal => deal.stage === 'Closed Lost')
  };

  // Calculate pipeline totals
  const pipelineTotals = {
    lead: dealsByStage.lead.reduce((sum, deal) => sum + deal.amount, 0),
    qualified: dealsByStage.qualified.reduce((sum, deal) => sum + deal.amount, 0),
    negotiation: dealsByStage.negotiation.reduce((sum, deal) => sum + deal.amount, 0),
    won: dealsByStage.won.reduce((sum, deal) => sum + deal.amount, 0),
    lost: dealsByStage.lost.reduce((sum, deal) => sum + deal.amount, 0)
  };

  // Handle drag and drop completion
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area or in the same position
    if (!destination || 
      (destination.droppableId === source.droppableId &&
      destination.index === source.index)) {
      return;
    }

    // Find the deal that was dragged
    const deal = deals.find(d => d.id === draggableId);
    if (!deal) return;

    // Get the new stage value from the destination column ID
    const newStage = stageMap[destination.droppableId as keyof typeof stageMap];
    if (!newStage) return;

    // Optimistically update the UI state
    const updatedDeal = { ...deal, stage: newStage };

    // Determine if user is available and update the deal
    if (user) {
      // Update the deal in the database
      updateDeal(deal.id, { stage: newStage }, user);
      
      // The updateDeal function will handle logging the activity via logUpdateActivity
      // No need for additional logging here as it's handled in the store
    } else {
      // Still update the deal even if no user is available
      updateDeal(deal.id, { stage: newStage });
      console.warn('Deal stage updated but activity not logged (no user available)');
    }
  };

  // Helper to render a deal card
  const renderDealCard = (deal: Deal, index: number) => {
    const account = getAccountById(deal.account_id);
    let borderColor: string;
    let statusColor: string;
    let statusText: string;

    // Set colors and status text based on stage
    if (deal.stage === 'Qualification') {
      borderColor = 'border-blue-400';
      statusColor = 'bg-blue-100 text-blue-700';
      statusText = 'New';
    } else if (deal.stage === 'Evaluation') {
      borderColor = 'border-purple-400';
      statusColor = 'bg-purple-100 text-purple-700';
      statusText = 'Meeting Set';
    } else if (['Proposal', 'Negotiation'].includes(deal.stage)) {
      borderColor = 'border-amber-400';
      statusColor = 'bg-amber-100 text-amber-700';
      statusText = deal.stage === 'Proposal' ? 'Proposal Sent' : 'In Review';
    } else if (deal.stage === 'Closed Won') {
      borderColor = 'border-green-400';
      statusColor = 'bg-green-100 text-green-700';
      statusText = 'Won';
    } else if (deal.stage === 'Closed Lost') {
      borderColor = 'border-red-400';
      statusColor = 'bg-red-100 text-red-700';
      statusText = 'Lost';
    } else {
      borderColor = 'border-gray-400';
      statusColor = 'bg-gray-100 text-gray-700';
      statusText = deal.stage;
    }

    return (
      <Draggable key={`stage-${deal.stage}-id-${deal.id}-index-${index}`} draggableId={deal.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 ${snapshot.isDragging ? 'opacity-75' : ''}`}
            onClick={() => dealsCrud.edit(deal)}
          >
            <Card className={`border-l-4 ${borderColor} overflow-hidden ${snapshot.isDragging ? 'shadow-md' : ''} cursor-pointer hover:shadow-md`}>
              <CardContent className="p-3 max-w-full">
                <h4 className="font-medium truncate">{account?.name || 'Unknown Account'}</h4>
                <p className="text-sm text-gray-500 break-words">{deal.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    ${new Intl.NumberFormat().format(deal.amount)}
                  </span>
                  <span className={`text-xs ${statusColor} px-2 py-1 rounded-full whitespace-nowrap`}>
                    {statusText}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  // Format currency for the summary section
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
            <Button onClick={() => dealsCrud.createNew()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              Add Deal
            </Button>
          </div>

          {/* Pipeline Stages */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              {/* Lead Stage */}
              <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
                  <CardTitle className="text-lg font-medium">Leads ({dealsByStage.lead.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Droppable droppableId="lead">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[100px] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                      >
                        {dealsByStage.lead.length === 0 ? (
                          <p className="text-sm text-gray-500 break-words">No leads found</p>
                        ) : (
                          dealsByStage.lead.map((deal, index) => renderDealCard(deal, index))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>

              {/* Qualified Stage */}
              <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
                  <CardTitle className="text-lg font-medium">Qualified ({dealsByStage.qualified.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Droppable droppableId="qualified">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[100px] ${snapshot.isDraggingOver ? 'bg-purple-50' : ''}`}
                      >
                        {dealsByStage.qualified.length === 0 ? (
                          <p className="text-sm text-gray-500 break-words">No qualified deals found</p>
                        ) : (
                          dealsByStage.qualified.map((deal, index) => renderDealCard(deal, index))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>

              {/* Negotiation Stage */}
              <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
                  <CardTitle className="text-lg font-medium">Negotiation ({dealsByStage.negotiation.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Droppable droppableId="negotiation">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[100px] ${snapshot.isDraggingOver ? 'bg-amber-50' : ''}`}
                      >
                        {dealsByStage.negotiation.length === 0 ? (
                          <p className="text-sm text-gray-500 break-words">No deals in negotiation</p>
                        ) : (
                          dealsByStage.negotiation.map((deal, index) => renderDealCard(deal, index))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>

              {/* Closed Won Stage */}
              <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
                  <CardTitle className="text-lg font-medium">Closed Won ({dealsByStage.won.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Droppable droppableId="won">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[100px] ${snapshot.isDraggingOver ? 'bg-green-50' : ''}`}
                      >
                        {dealsByStage.won.length === 0 ? (
                          <p className="text-sm text-gray-500 break-words">No won deals yet</p>
                        ) : (
                          dealsByStage.won.map((deal, index) => renderDealCard(deal, index))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>

              {/* Closed Lost Stage */}
              <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
                  <CardTitle className="text-lg font-medium">Closed Lost ({dealsByStage.lost.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Droppable droppableId="lost">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[100px] ${snapshot.isDraggingOver ? 'bg-red-50' : ''}`}
                      >
                        {dealsByStage.lost.length === 0 ? (
                          <p className="text-sm text-gray-500 break-words">No lost deals yet</p>
                        ) : (
                          dealsByStage.lost.map((deal, index) => renderDealCard(deal, index))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          </DragDropContext>

          {/* Pipeline Sumary */}
          <PipelineSummary
            pipelineTotals={pipelineTotals}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Deal CRUD Dialogs */}
      <DealFormDialogs dealsCrud={dealsCrud} />
    </div>
  );
}

// Form dialogs for deal CRUD operations
function DealFormDialogs({ dealsCrud }: { dealsCrud: any }) {
  // Track if form submission has been attempted
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Get accounts for select menu
  const { accounts } = useAccountsStore();
  const accountOptions = accounts.map(account => ({
    value: account.id,
    label: account.name
  }));

  // Stage options
  const stageOptions = [
    { value: 'Qualification', label: 'Lead' },
    { value: 'Evaluation', label: 'Qualified' },
    { value: 'Proposal', label: 'Proposal' },
    { value: 'Negotiation', label: 'Negotiation' },
    { value: 'Closed Won', label: 'Closed Won' },
    { value: 'Closed Lost', label: 'Closed Lost' },
  ];

  // Status options
  const statusOptions = [
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Stalled', label: 'Stalled' },
  ];

  // Region options
  const regionOptions = [
    { value: 'APAC', label: 'APAC' },
    { value: 'EMEA', label: 'EMEA' },
    { value: 'LATAM', label: 'LATAM' },
    { value: 'NAMER', label: 'North America' },
  ];

  // Get team members for owner selection
  const { teamMembers } = useTeamStore();
  const teamMemberOptions = teamMembers.map(member => ({
    value: member.id,
    label: member.name
  }));

  // Lead source options
  const leadSourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Conference', label: 'Conference' },
    { value: 'Outbound', label: 'Outbound' },
    { value: 'Partner', label: 'Partner' },
  ];

  const isCreating = dealsCrud.state.mode === CrudMode.CREATE;
  const isEditing = dealsCrud.state.mode === CrudMode.UPDATE;
  const isDeleting = dealsCrud.state.mode === CrudMode.DELETE;

  return (
    <>
      {/* Create/Edit Deal Dialog */}
      <Dialog
        isOpen={dealsCrud.state.isDialogOpen && (isCreating || isEditing)}
        onClose={() => {
          dealsCrud.closeDialog();
          setSubmitAttempted(false); // Reset validation state when dialog is closed
        }}
        title={dealsCrud.getDialogTitle()}
        maxWidth="lg"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          setSubmitAttempted(true);
          dealsCrud.handleSubmit();
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Deal Name"
              name="name"
              value={dealsCrud.form.values.name}
              onChange={dealsCrud.form.handleChange}
              onBlur={dealsCrud.form.handleBlur}
              error={submitAttempted && dealsCrud.form.errors.name ? dealsCrud.form.errors.name : ''}
              required
            />

            <FormField
              label="Account"
              name="account_id"
              type="select"
              value={dealsCrud.form.values.account_id}
              onChange={dealsCrud.form.handleChange}
              onBlur={dealsCrud.form.handleBlur}
              error={submitAttempted && dealsCrud.form.errors.account_id ? dealsCrud.form.errors.account_id : ''}
              selectOptions={accountOptions}
              required
            />

            <FormField
              label="Amount ($)"
              name="amount"
              type="number"
              value={dealsCrud.form.values.amount}
              onChange={dealsCrud.form.handleChange}
              onBlur={dealsCrud.form.handleBlur}
              error={submitAttempted && dealsCrud.form.errors.amount ? dealsCrud.form.errors.amount : ''}
              required
            />

            <FormField
              label="Stage"
              name="stage"
              type="select"
              value={dealsCrud.form.values.stage}
              onChange={dealsCrud.form.handleChange}
              onBlur={dealsCrud.form.handleBlur}
              error={submitAttempted && dealsCrud.form.errors.stage ? dealsCrud.form.errors.stage : ''}
              selectOptions={stageOptions}
              required
            />

            <FormField
              label="Close Date"
              name="close_date"
              type="date"
              value={dealsCrud.form.values.close_date ? dealsCrud.form.values.close_date.split('T')[0] : ''}
              onChange={dealsCrud.form.handleChange}
              onBlur={dealsCrud.form.handleBlur}
              error={submitAttempted && dealsCrud.form.errors.close_date ? dealsCrud.form.errors.close_date : ''}
              required
            />

            <FormField
              label="Probability (%)"
              name="probability"
              type="number"
              value={dealsCrud.form.values.probability}
              onChange={dealsCrud.form.handleChange}
              onBlur={dealsCrud.form.handleBlur}
              error={submitAttempted && dealsCrud.form.errors.probability ? dealsCrud.form.errors.probability : ''}
              required
            />

            <FormField
              label="Status"
              name="status"
              type="select"
              value={dealsCrud.form.values.status}
              onChange={dealsCrud.form.handleChange}
              selectOptions={statusOptions}
              className="col-span-1"
            />

            <FormField
              label="Region"
              name="region"
              type="select"
              value={dealsCrud.form.values.region || ''}
              onChange={dealsCrud.form.handleChange}
              selectOptions={regionOptions}
              className="col-span-1"
            />

            <FormField
              label="Lead Source"
              name="lead_source"
              type="select"
              value={dealsCrud.form.values.lead_source || ''}
              onChange={dealsCrud.form.handleChange}
              selectOptions={leadSourceOptions}
              className="col-span-1"
            />

            <FormField
              label="Deal Owner"
              name="team_member_id"
              type="select"
              value={dealsCrud.form.values.team_member_id || ''}
              onChange={dealsCrud.form.handleChange}
              onBlur={dealsCrud.form.handleBlur}
              selectOptions={teamMemberOptions}
              className="col-span-1"
              helperText="Select team member responsible for this deal"
              error={submitAttempted && dealsCrud.form.errors.team_member_id ? dealsCrud.form.errors.team_member_id : ''}
              required
            />

            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={dealsCrud.form.values.description}
              onChange={dealsCrud.form.handleChange}
              className="col-span-2"
            />
          </div>

          <div className="mt-6 flex justify-between space-x-3">
            {isEditing && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  dealsCrud.closeDialog();
                  setTimeout(() => dealsCrud.confirmDelete(dealsCrud.state.currentEntity), 200);
                }}
              >
                Delete
              </Button>
            )}
            <div className="ml-auto flex space-x-3">
              <Button
                variant="outline"
                onClick={dealsCrud.closeDialog}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={dealsCrud.state.isLoading}
              >
                {dealsCrud.state.isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dealsCrud.state.isDialogOpen && isDeleting}
        onClose={dealsCrud.closeDialog}
        onConfirm={dealsCrud.handleSubmit}
        title="Delete Deal"
        message={
          `Are you sure you want to delete the deal "${dealsCrud.state.currentEntity?.name}"? 
          This action cannot be undone.`
        }
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

export default function Pipeline() {
  return (
    <AppProvider>
      <PipelineContent />
    </AppProvider>
  );
}

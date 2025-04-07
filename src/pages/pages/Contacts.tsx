import React, { useState, useEffect } from "react";
import { Sidebar } from "components/Sidebar";
import { AppProvider } from "utils/AppProvider";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card";
import { Button } from "components/Button";
import { Dialog, ConfirmDialog } from "components/Dialog";
import { FormField } from "components/FormField";
import { useToast } from "utils/AppProvider";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import { useContactsStore } from "utils/contactsStore";
import { useAccountsStore } from "utils/accountsStore";
import { Contact } from "utils/types";
import {
  useCrudManager,
  CrudMode,
  validateRequired
} from "utils/crudManager";

function ContactsContent() {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Access Zustand stores
  const { contacts, fetchContacts, createContact, updateContact, deleteContact } = useContactsStore();
  const { accounts, fetchAccounts, getAccountById } = useAccountsStore();

  // Toast notifications
  const { showToast } = useToast();

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
          fetchContacts(),
          fetchAccounts()
        ]);
      } catch (error) {
        console.error('Error loading contacts data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, fetchContacts, fetchAccounts]);

  // Default empty contact for new records
  const defaultContact: Omit<Contact, 'id' | 'created_at' | 'updated_at'> = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    account_id: '',
    lead_status: 'Lead',
    lead_source: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    notes: ''
  };

  // Validate contact form
  const validateContact = (values: Contact) => {
    const errors: Record<string, string> = validateRequired(values, [
      'first_name', 'last_name', 'email'
    ]);

    // Email validation
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    return errors;
  };

  // CRUD Manager for contacts
  const contactsCrud = useCrudManager<Contact>({
    entityName: 'Contact',
    defaultEntity: defaultContact,
    fetchEntities: fetchContacts,
    createEntity: (contactData) => {
      // Always pass user object to createContact for proper activity tracking
      return createContact(contactData, user);
    },
    updateEntity: (id, updates) => {
      // Always pass user object to updateContact for proper activity tracking
      return updateContact(id, updates, user);
    },
    deleteEntity: (id) => {
      // Always pass user object to deleteContact for proper activity tracking
      return deleteContact(id, user);
    },
    validateEntity: validateContact,
    onCreateSuccess: () => showToast('Contact created successfully', 'success'),
    onUpdateSuccess: () => showToast('Contact updated successfully', 'success'),
    onDeleteSuccess: () => showToast('Contact deleted successfully', 'success'),
    onError: (error) => showToast(error.message, 'error')
  });

  // Filter and sort contacts
  const [filterLeadStatus, setFilterLeadStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const filteredContacts = contacts.filter(contact => {
    // Apply lead status filter
    if (filterLeadStatus !== 'all' && contact.lead_status !== filterLeadStatus) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        contact.first_name.toLowerCase().includes(searchLower) ||
        contact.last_name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        (contact.notes && contact.notes.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Sort contacts by name
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
  });

  if (loading || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
            <Button onClick={() => contactsCrud.createNew()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              Add Contact
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search contacts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterLeadStatus}
              onChange={(e) => setFilterLeadStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Lead">Leads</option>
              <option value="Prospect">Prospects</option>
              <option value="Customer">Customers</option>
            </select>
          </div>

          {/* Contacts Grid */}
          {sortedContacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No contacts found. Add your first contact to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedContacts.map((contact) => {
                const account = contact.account_id ? getAccountById(contact.account_id) : undefined;
                
                // Determine status color
                let statusColor: string;
                if (contact.lead_status === 'Customer') {
                  statusColor = 'bg-green-100 text-green-800';
                } else if (contact.lead_status === 'Prospect') {
                  statusColor = 'bg-blue-100 text-blue-800';
                } else {
                  statusColor = 'bg-amber-100 text-amber-800';
                }
                
                return (
                  <Card
                    key={contact.id}
                    className="border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => contactsCrud.edit(contact)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold">
                          {contact.first_name} {contact.last_name}
                        </CardTitle>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {contact.lead_status || 'Lead'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{contact.job_title}</div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {account && (
                          <div className="flex items-start">
                            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
                              <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{account.name}</span>
                          </div>
                        )}
                        <div className="flex items-start">
                          <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                          </svg>
                          <span className="text-sm">{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-start">
                            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{contact.phone}</span>
                          </div>
                        )}
                      </div>
                      {contact.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">{contact.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contact Form Dialogs */}
      <ContactFormDialogs contactsCrud={contactsCrud} accounts={accounts} />
    </div>
  );
}

// Form dialogs for contact CRUD operations
function ContactFormDialogs({ contactsCrud, accounts }: { contactsCrud: any; accounts: any[] }) {
  // Track if form submission has been attempted
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Prepare account options for select menu
  const accountOptions = accounts.map(account => ({
    value: account.id,
    label: account.name
  }));

  // Lead status options
  const leadStatusOptions = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Customer', label: 'Customer' },
  ];

  // Lead source options
  const leadSourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Conference', label: 'Conference' },
    { value: 'Outbound', label: 'Outbound' },
    { value: 'Partner', label: 'Partner' },
  ];

  const isCreating = contactsCrud.state.mode === CrudMode.CREATE;
  const isEditing = contactsCrud.state.mode === CrudMode.UPDATE;
  const isDeleting = contactsCrud.state.mode === CrudMode.DELETE;

  return (
    <>
      {/* Create/Edit Contact Dialog */}
      <Dialog
        isOpen={contactsCrud.state.isDialogOpen && (isCreating || isEditing)}
        onClose={() => {
          contactsCrud.closeDialog();
          setSubmitAttempted(false); // Reset validation state when dialog is closed
        }}
        title={contactsCrud.getDialogTitle()}
        maxWidth="lg"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          setSubmitAttempted(true);
          contactsCrud.handleSubmit();
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              name="first_name"
              value={contactsCrud.form.values.first_name}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
              error={submitAttempted && contactsCrud.form.errors.first_name ? contactsCrud.form.errors.first_name : ''}
              required
            />

            <FormField
              label="Last Name"
              name="last_name"
              value={contactsCrud.form.values.last_name}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
              error={submitAttempted && contactsCrud.form.errors.last_name ? contactsCrud.form.errors.last_name : ''}
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={contactsCrud.form.values.email}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
              error={submitAttempted && contactsCrud.form.errors.email ? contactsCrud.form.errors.email : ''}
              required
            />

            <FormField
              label="Phone"
              name="phone"
              value={contactsCrud.form.values.phone || ''}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
            />

            <FormField
              label="Job Title"
              name="job_title"
              value={contactsCrud.form.values.job_title || ''}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
            />

            <FormField
              label="Account"
              name="account_id"
              type="select"
              value={contactsCrud.form.values.account_id || ''}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
              selectOptions={[
                { value: '', label: 'No Account' },
                ...accountOptions
              ]}
            />

            <FormField
              label="Lead Status"
              name="lead_status"
              type="select"
              value={contactsCrud.form.values.lead_status || 'Lead'}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
              selectOptions={leadStatusOptions}
            />

            <FormField
              label="Lead Source"
              name="lead_source"
              type="select"
              value={contactsCrud.form.values.lead_source || ''}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
              selectOptions={[
                { value: '', label: 'Unknown' },
                ...leadSourceOptions
              ]}
            />

            <div className="col-span-1 md:col-span-2">
              <h3 className="font-medium text-gray-700 mb-2">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Street Address"
                  name="address"
                  value={contactsCrud.form.values.address || ''}
                  onChange={contactsCrud.form.handleChange}
                  onBlur={contactsCrud.form.handleBlur}
                />

                <FormField
                  label="City"
                  name="city"
                  value={contactsCrud.form.values.city || ''}
                  onChange={contactsCrud.form.handleChange}
                  onBlur={contactsCrud.form.handleBlur}
                />

                <FormField
                  label="State/Province"
                  name="state"
                  value={contactsCrud.form.values.state || ''}
                  onChange={contactsCrud.form.handleChange}
                  onBlur={contactsCrud.form.handleBlur}
                />

                <FormField
                  label="Country"
                  name="country"
                  value={contactsCrud.form.values.country || ''}
                  onChange={contactsCrud.form.handleChange}
                  onBlur={contactsCrud.form.handleBlur}
                />

                <FormField
                  label="Postal Code"
                  name="postal_code"
                  value={contactsCrud.form.values.postal_code || ''}
                  onChange={contactsCrud.form.handleChange}
                  onBlur={contactsCrud.form.handleBlur}
                />
              </div>
            </div>

            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              value={contactsCrud.form.values.notes || ''}
              onChange={contactsCrud.form.handleChange}
              onBlur={contactsCrud.form.handleBlur}
              className="col-span-1 md:col-span-2"
            />
          </div>

          <div className="mt-6 flex justify-between space-x-3">
            {isEditing && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  contactsCrud.closeDialog();
                  setTimeout(() => contactsCrud.confirmDelete(contactsCrud.state.currentEntity), 200);
                }}
              >
                Delete
              </Button>
            )}
            <div className="ml-auto flex space-x-3">
              <Button
                variant="outline"
                onClick={contactsCrud.closeDialog}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={contactsCrud.state.isLoading}
              >
                {contactsCrud.state.isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={contactsCrud.state.isDialogOpen && isDeleting}
        onClose={contactsCrud.closeDialog}
        onConfirm={contactsCrud.handleSubmit}
        title="Delete Contact"
        message={
          `Are you sure you want to delete ${contactsCrud.state.currentEntity?.first_name} ${contactsCrud.state.currentEntity?.last_name}? 
          This action cannot be undone.`
        }
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

export default function Contacts() {
  return (
    <AppProvider>
      <ContactsContent />
    </AppProvider>
  );
}

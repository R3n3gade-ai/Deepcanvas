import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useCurrentUser } from "app";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";
import { useAccountsStore } from "../utils/accountsStore";
import { Account } from "../utils/types";
import {
  useCrudManager,
  CrudMode,
  validateRequired
} from "../utils/crudManager";
import { Dialog, ConfirmDialog } from "../components/Dialog";
import { FormField } from "../components/FormField";
import { useToast } from "../utils/AppProvider";
import { useActivitiesStore } from "../utils/activitiesStore";
import { AppProvider } from "../utils/AppProvider";

function AccountsContent() {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Access Zustand stores
  const { accounts, fetchAccounts, createAccount, updateAccount, deleteAccount } = useAccountsStore();
  const { setupRealtimeSync: setupActivitiesSync } = useActivitiesStore();

  // Toast notifications
  const { showToast } = useToast();

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
        await fetchAccounts();
      } catch (error) {
        console.error("Error loading accounts data:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, fetchAccounts]);

  // Default empty account for new records
  const defaultAccount: Omit<Account, 'id' | 'created_at' | 'updated_at'> = {
    name: '',
    industry: '',
    website: '',
    employees: null,
    annual_revenue: null,
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    country: ''
  };

  // Validate account form
  const validateAccount = (values: Partial<Account>) => {
    const errors: Record<string, string> = validateRequired(values, [
      'name', 'industry'
    ]);

    // Additional validations if needed
    if (values.website && !/^https?:\/\/.+/.test(values.website)) {
      errors.website = 'Website must start with http:// or https://';
    }

    if (values.phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-s\.]?[0-9]{4,6}$/.test(values.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Validate numeric fields
    if (values.employees !== null && values.employees !== undefined && (isNaN(Number(values.employees)) || Number(values.employees) < 0)) {
      errors.employees = isNaN(Number(values.employees)) ? 'Please enter a valid number' : 'Number of employees cannot be negative';
    }

    if (values.annual_revenue !== null && values.annual_revenue !== undefined && (isNaN(Number(values.annual_revenue)) || Number(values.annual_revenue) < 0)) {
      errors.annual_revenue = isNaN(Number(values.annual_revenue)) ? 'Please enter a valid number' : 'Annual revenue cannot be negative';
    }

    return errors;
  };

  // CRUD Manager for accounts
  const accountsCrud = useCrudManager<Account>({
    entityName: 'Account',
    defaultEntity: defaultAccount,
    fetchEntities: fetchAccounts,
    createEntity: (accountData) => createAccount(accountData, user),
    updateEntity: (id, updates) => updateAccount(id, updates, user),
    deleteEntity: (id) => deleteAccount(id, user),
    validateEntity: validateAccount,
    onCreateSuccess: () => showToast('Account created successfully', 'success'),
    onUpdateSuccess: () => showToast('Account updated successfully', 'success'),
    onDeleteSuccess: () => showToast('Account deleted successfully', 'success'),
    onError: (error) => showToast(error.message, 'error')
  });

  // Filter accounts based on search and region
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === "" ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.industry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = !selectedRegion || account.country === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  // Get unique regions for filter
  const regions = [...new Set(accounts.map(account => account.country).filter(Boolean))];

  // Format currency
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
            <Button onClick={() => accountsCrud.createNew()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              Add Account
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">Total Accounts</p>
                    <p className="text-2xl font-semibold text-gray-900 truncate">{accounts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-50 text-green-600 mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M1.5 9.832v1.793c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V9.832a3 3 0 0 0-.722-1.952l-3.285-3.832A3 3 0 0 0 16.215 3h-8.43a3 3 0 0 0-2.278 1.048L2.222 7.88A3 3 0 0 0 1.5 9.832ZM14.25 18V16.5h-4.5V18h4.5Zm-2.25-12.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" clipRule="evenodd" />
                      <path d="M3.375 18.75h17.25c1.035 0 1.875-.84 1.875-1.875v-4.5c0-1.036-.84-1.875-1.875-1.875h-17.25c-1.035 0-1.875.84-1.875 1.875v4.5c0 1.035.84 1.875 1.875 1.875Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">By Industry</p>
                    <p className="text-2xl font-semibold text-gray-900 truncate">
                      {new Set(accounts.map(account => account.industry)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-50 text-purple-600 mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M16.881 4.345A23.112 23.112 0 0 0 8.92 2.088a.75.75 0 0 0-.822.515L6.91 6.157a.75.75 0 0 0 .212.736l3.154 2.489a.75.75 0 0 0 .233.511l3.777 2.194a.75.75 0 0 0 1.052-.356l2.112-4.591a.75.75 0 0 0-.187-.79l-.011-.01a.75.75 0 0 0-.371-.235Z" />
                      <path d="M15.161 15.296a.75.75 0 0 0-.92.217l-2.47 3.915a.75.75 0 0 0 .486 1.108l4.266.97a.75.75 0 0 0 .934-.717l.067-4.991a.75.75 0 0 0-1.272-.503l-1.091 1.001Z" />
                      <path fillRule="evenodd" d="M1.982 6.79a9.75 9.75 0 0 1 17.953-.453c.02.075.042.151.064.228 1.297.096 2.367 1.128 2.431 2.49l.046 1.042c.001.022 0 .043-.002.064 2.511 2.197 3.106 5.83.945 8.576a9.75 9.75 0 0 1-13.687 1.8.75.75 0 0 1-.188-1.125l1.953-2.45a.75.75 0 0 1 1.074-.12l2.926 2.3a.75.75 0 0 0 .914-.003l3.114-2.422a.75.75 0 0 0 .218-1.017l-3.645-5.903a.75.75 0 0 0-1.137-.169l-2.553 2.327a.75.75 0 0 1-1.14-.093l-1.263-1.9a.75.75 0 0 1 .072-1.016l3.04-2.428c.089-.08.164-.173.227-.272A8.25 8.25 0 0 0 1.982 6.789Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900 truncate">
                      {formatCurrency(accounts.reduce((sum, account) => sum + (account.annual_revenue || 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-amber-50 text-amber-600 mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">By Region</p>
                    <p className="text-2xl font-semibold text-gray-900 truncate">{regions.length} Regions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Search accounts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedRegion || ""}
                onChange={(e) => setSelectedRegion(e.target.value || null)}
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Accounts Table */}
          <Card className="mb-8">
            <CardHeader className="bg-gray-50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-lg">Account List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Industry</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Website</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Employees</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Revenue</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                          No accounts found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((account, index) => (
                        <tr
                          key={`account-row-${account.id}-${index}`}
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => accountsCrud.edit(account)}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{account.name}</div>
                          </td>
                          <td className="py-3 px-4">{account.industry}</td>
                          <td className="py-3 px-4">
                            {account.website ? (
                              <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                {account.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">{account.employees?.toLocaleString() || '-'}</td>
                          <td className="py-3 px-4">
                            {account.annual_revenue ? formatCurrency(account.annual_revenue) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  accountsCrud.edit(account);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  accountsCrud.confirmDelete(account);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Account CRUD Dialogs */}
          <AccountFormDialogs accountsCrud={accountsCrud} />
        </div>
      </div>
    </div>
  );
}

// Form dialogs for account CRUD operations
function AccountFormDialogs({ accountsCrud }: { accountsCrud: ReturnType<typeof useCrudManager<Account>> }) {
  // Industry options
  const industryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Education', label: 'Education' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Other', label: 'Other' },
  ].map((option) => ({ ...option, id: `industry-${option.value}` }));

  const isCreating = accountsCrud.state.mode === CrudMode.CREATE;
  const isEditing = accountsCrud.state.mode === CrudMode.UPDATE;
  const isDeleting = accountsCrud.state.mode === CrudMode.DELETE;

  // Form validation errors display
  const hasErrors = Object.keys(accountsCrud.form.errors).length > 0;

  return (
    <>
      {/* Create/Edit Account Dialog */}
      <Dialog
        isOpen={accountsCrud.state.isDialogOpen && (isCreating || isEditing)}
        onClose={accountsCrud.closeDialog}
        title={accountsCrud.getDialogTitle()}
        maxWidth="lg"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          accountsCrud.handleSubmit();
        }}>
          {hasErrors && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              Please correct the highlighted fields below.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Account Name"
              name="name"
              value={accountsCrud.form.values.name}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              error={accountsCrud.form.touched.name ? accountsCrud.form.errors.name : ''}
              required
            />

            <FormField
              label="Industry"
              name="industry"
              type="select"
              value={accountsCrud.form.values.industry}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              error={accountsCrud.form.touched.industry ? accountsCrud.form.errors.industry : ''}
              selectOptions={industryOptions}
              required
            />

            <FormField
              label="Website"
              name="website"
              type="url"
              value={accountsCrud.form.values.website || ''}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              error={accountsCrud.form.touched.website ? accountsCrud.form.errors.website : ''}
              className="col-span-1"
            />

            <FormField
              label="Phone"
              name="phone"
              type="tel"
              value={accountsCrud.form.values.phone || ''}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              error={accountsCrud.form.touched.phone ? accountsCrud.form.errors.phone : ''}
              className="col-span-1"
            />

            <FormField
              label="Employees"
              name="employees"
              type="number"
              value={accountsCrud.form.values.employees === null ? '' : accountsCrud.form.values.employees}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              error={accountsCrud.form.touched.employees ? accountsCrud.form.errors.employees : ''}
              min={0}
              className="col-span-1"
            />

            <FormField
              label="Annual Revenue"
              name="annual_revenue"
              type="number"
              value={accountsCrud.form.values.annual_revenue === null ? '' : accountsCrud.form.values.annual_revenue}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              error={accountsCrud.form.touched.annual_revenue ? accountsCrud.form.errors.annual_revenue : ''}
              min={0}
              className="col-span-1"
            />

            <FormField
              label="Address"
              name="address"
              value={accountsCrud.form.values.address || ''}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              className="col-span-2"
            />

            <FormField
              label="City"
              name="city"
              value={accountsCrud.form.values.city || ''}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              className="col-span-1"
            />

            <FormField
              label="State/Province"
              name="state"
              value={accountsCrud.form.values.state || ''}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              className="col-span-1"
            />

            <FormField
              label="Country"
              name="country"
              value={accountsCrud.form.values.country || ''}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              className="col-span-1"
            />

            <FormField
              label="Postal Code"
              name="postal_code"
              value={accountsCrud.form.values.postal_code || ''}
              onChange={accountsCrud.form.handleChange}
              onBlur={accountsCrud.form.handleBlur}
              className="col-span-1"
            />
          </div>

          <div className="mt-6 flex justify-between space-x-3">
            {isEditing && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  accountsCrud.closeDialog();
                  setTimeout(() => accountsCrud.confirmDelete(accountsCrud.state.currentEntity), 200);
                }}
              >
                Delete
              </Button>
            )}
            <div className="ml-auto flex space-x-3">
              <Button
                variant="outline"
                onClick={accountsCrud.closeDialog}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
              >
                {accountsCrud.state.isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={accountsCrud.state.isDialogOpen && isDeleting}
        onClose={accountsCrud.closeDialog}
        onConfirm={accountsCrud.handleSubmit}
        title="Delete Account"
        message={
          `Are you sure you want to delete the account "${accountsCrud.state.currentEntity?.name}"? 
          This action cannot be undone.`
        }
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

export default function Accounts() {
  return (
    <AppProvider>
      <AccountsContent />
    </AppProvider>
  );
}

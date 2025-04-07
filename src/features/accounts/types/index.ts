// Accounts feature types

export interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  status?: 'active' | 'inactive' | 'prospect';
  created_at?: string;
  updated_at?: string;
}

export interface AccountsStore {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  
  // Methods
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<Account>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getAccountById: (id: string) => Account | undefined;
}

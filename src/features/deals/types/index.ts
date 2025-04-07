// Deals feature types

export interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  account_id: string;
  owner_id: string;
  close_date?: string;
  probability?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DealsStore {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  
  // Methods
  fetchDeals: () => Promise<void>;
  addDeal: (deal: Omit<Deal, 'id'>) => Promise<Deal>;
  updateDeal: (id: string, data: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  getDealById: (id: string) => Deal | undefined;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  token?: string;
}

export interface Transaction {
  _id: string;
  creatorId: string | { _id: string; username: string; email: string };
  counterpartyId: string | { _id: string; username: string; email: string };
  counterpartyName: string;
  type: 'lend' | 'borrow';
  displayType?: 'lend' | 'borrow';  // Type from current user's perspective
  amount: number;
  paymentStatus: 'pending' | 'paid';
  approvalStatus: 'pending' | 'accepted' | 'rejected';
  date: string;
  notes?: string;
  isCreator?: boolean;  // Added by API response
}

export interface Contact {
  _id: string;
  userId: string;
  name: string;
  phone?: string;
}

export interface DashboardStats {
  stats: { _id: 'lend' | 'borrow'; totalAmount: number; count: number }[];
  recent: Transaction[];
  pendingCount?: number;
}

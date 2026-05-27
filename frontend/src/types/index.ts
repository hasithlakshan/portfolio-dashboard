export type InvestmentCategory = 'STOCK' | 'BOND' | 'MUTUAL_FUND';
export type TransactionType = 'BUY' | 'SELL';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  ticker: string;
  category: InvestmentCategory;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchasedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  investmentId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
  createdAt: string;
  investment: {
    name: string;
    ticker: string;
    category: InvestmentCategory;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

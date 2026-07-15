export type Role = 'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number | null;
  ratingsCount?: number;
  ownedStores?: Array<{
    id: string;
    name: string;
    email: string;
    address: string;
    averageRating?: number | null;
    ratingsCount?: number;
  }>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    sortBy?: string;
    order?: string;
  };
}

export interface StoreRow {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating?: number | null;
  ratingsCount?: number;
  userRating?: number | null;
  userRatingId?: string | null;
  owner?: { id: string; name: string; email: string };
  createdAt?: string;
}

export interface DashboardCounts {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  cached?: boolean;
}

export interface OwnerDashboard {
  stores: Array<{ id: string; name: string; address: string }>;
  averageRating: number | null;
  ratingsCount: number;
  raters: Paginated<{
    id: string;
    value: number;
    createdAt: string;
    user: { id: string; name: string; email: string };
    store: { id: string; name: string };
  }>;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  error?: string;
}

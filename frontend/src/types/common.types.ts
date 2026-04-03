// Common types used across the application

export interface ApiResponse<T> {
  data: T;
  count?: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}


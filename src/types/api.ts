export interface APIResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'custom';
  reminderTime?: string;
  reminderEnabled: boolean;
  color: string;
  icon: string;
}

export interface UpdateHabitRequest extends Partial<CreateHabitRequest> {
  active?: boolean;
}
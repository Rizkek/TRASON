/**
 * Validation Library - Phase 1
 * Centralized form validation for all pages
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// TRANSACTION VALIDATION
// ============================================================================

export interface TransactionForm {
  title: string;
  amount: string;
  type: 'income' | 'expense';
  category_id?: string;
  date: string;
  description?: string;
}

export const validateTransaction = (data: TransactionForm): ValidationResult => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  } else if (data.title.length < 2) {
    errors.title = 'Title must be at least 2 characters';
  }

  // Amount validation
  if (!data.amount) {
    errors.amount = 'Amount is required';
  } else {
    const amount = parseFloat(data.amount);
    if (isNaN(amount)) {
      errors.amount = 'Amount must be a valid number';
    } else if (amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else if (amount > 999999999) {
      errors.amount = 'Amount is too large';
    }
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Date is required';
  } else if (isNaN(new Date(data.date).getTime())) {
    errors.date = 'Invalid date format';
  }

  // Type validation
  if (!['income', 'expense'].includes(data.type)) {
    errors.type = 'Type must be income or expense';
  }

  // Description validation (optional)
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// ACTIVITY VALIDATION
// ============================================================================

export interface ActivityForm {
  title: string;
  description?: string;
  category?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  mood?: string;
  rating?: number;
}

export const validateActivity = (data: ActivityForm): ValidationResult => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Activity title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }

  // Start time validation
  if (!data.start_time) {
    errors.start_time = 'Start time is required';
  } else if (isNaN(new Date(data.start_time).getTime())) {
    errors.start_time = 'Invalid start time format';
  }

  // End time validation (optional but validated if provided)
  if (data.end_time) {
    if (isNaN(new Date(data.end_time).getTime())) {
      errors.end_time = 'Invalid end time format';
    } else if (new Date(data.end_time) <= new Date(data.start_time)) {
      errors.end_time = 'End time must be after start time';
    }
  }

  // Duration validation (optional)
  if (data.duration_minutes !== undefined && data.duration_minutes !== null) {
    const duration = Number(data.duration_minutes);
    if (isNaN(duration) || duration <= 0) {
      errors.duration_minutes = 'Duration must be a positive number';
    } else if (duration > 1440) {
      errors.duration_minutes = 'Duration cannot exceed 24 hours';
    }
  }

  // Rating validation (optional)
  if (data.rating !== undefined && data.rating !== null) {
    const rating = Number(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
  }

  // Description validation
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// REMINDER VALIDATION
// ============================================================================

export interface ReminderForm {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  due_datetime?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'cancelled';
  is_recurring?: boolean;
}

export const validateReminder = (data: ReminderForm): ValidationResult => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Reminder title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }

  // Due datetime validation
  if (!data.due_datetime && !data.due_date) {
    errors.due_date = 'Due date or due datetime is required';
  } else if (data.due_datetime && isNaN(new Date(data.due_datetime).getTime())) {
    errors.due_datetime = 'Invalid due datetime format';
  } else if (data.due_date && isNaN(new Date(data.due_date).getTime())) {
    errors.due_date = 'Invalid due date format';
  }

  // Priority validation
  if (!['low', 'medium', 'high'].includes(data.priority)) {
    errors.priority = 'Priority must be low, medium, or high';
  }

  // Status validation
  if (data.status && !['pending', 'completed', 'cancelled'].includes(data.status)) {
    errors.status = 'Invalid status';
  }

  // Description validation
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// AUTH VALIDATION
// ============================================================================

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number');
  }

  return errors;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email?.trim()) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  if (email.length > 255) {
    return 'Email is too long';
  }

  return null;
};

// ============================================================================
// ERROR SANITIZER
// ============================================================================

export const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    // Don't expose database errors to users
    if (error.message.includes('foreign key')) {
      return 'Invalid reference. Please try again.';
    }
    if (error.message.includes('duplicate')) {
      return 'This item already exists.';
    }
    if (error.message.includes('permission denied') || error.message.includes('permission')) {
      return 'You do not have permission to do this.';
    }
    if (error.message.includes('not found')) {
      return 'Item not found.';
    }
    if (error.message.includes('FATAL')) {
      return 'Database error. Please try again later.';
    }
    // In development or if it's an ApiError with details, show more info
    if (process.env.NODE_ENV === 'development' || (error as any).code) {
      return `${error.message} ${(error as any).details || ''} ${(error as any).hint || ''}`;
    }
    // Safe errors to show
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
};

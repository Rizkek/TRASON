import { ValidationResult } from '@/libs/validation';

// Re-export ValidationResult for module use
export type { ValidationResult };

// ============================================================================
// TRANSACTION VALIDATION
// ============================================================================

export interface TransactionInput {
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  date: string;
  time?: string;
  payment_method?: 'cash' | 'card' | 'transfer' | 'ewallet' | 'other';
  tags?: string[];
}

export const validateTransaction = (data: Partial<TransactionInput>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  // Amount validation
  if (data.amount === undefined || data.amount === null) {
    errors.amount = 'Amount is required';
  } else if (typeof data.amount !== 'number' || isNaN(data.amount)) {
    errors.amount = 'Amount must be a valid number';
  } else if (data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (data.amount > 999999999) {
    errors.amount = 'Amount is too large';
  }

  // Type validation
  if (!data.type) {
    errors.type = 'Type is required';
  } else if (!['income', 'expense'].includes(data.type)) {
    errors.type = 'Type must be income or expense';
  }

  // Category validation
  if (!data.category_id) {
    errors.category_id = 'Category is required';
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.category_id)) {
    errors.category_id = 'Invalid category ID';
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.date = 'Invalid date format (YYYY-MM-DD)';
  }

  // Time validation (optional)
  if (data.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
    errors.time = 'Invalid time format (HH:MM)';
  }

  // Description validation (optional)
  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  // Tags validation (optional)
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.tags = 'Tags must be an array';
    } else if (data.tags.length > 10) {
      errors.tags = 'Maximum 10 tags allowed';
    } else {
      const invalidTag = data.tags.find((tag) => typeof tag !== 'string' || tag.length > 30);
      if (invalidTag) {
        errors.tags = 'Each tag must be less than 30 characters';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// CATEGORY VALIDATION
// ============================================================================

export interface CategoryInput {
  name: string;
  type: 'income' | 'expense' | 'both';
  color?: string;
  icon?: string;
  sort_order?: number;
}

export const validateCategory = (data: Partial<CategoryInput>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.length > 50) {
    errors.name = 'Name must be less than 50 characters';
  }

  // Type validation
  if (!data.type) {
    errors.type = 'Type is required';
  } else if (!['income', 'expense', 'both'].includes(data.type)) {
    errors.type = 'Type must be income, expense, or both';
  }

  // Color validation (optional)
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.color = 'Invalid hex color format (e.g., #4F46E5)';
  }

  // Icon validation (optional)
  if (data.icon && data.icon.length > 30) {
    errors.icon = 'Icon name must be less than 30 characters';
  }

  // Sort order validation (optional)
  if (data.sort_order !== undefined) {
    if (typeof data.sort_order !== 'number' || !Number.isInteger(data.sort_order)) {
      errors.sort_order = 'Sort order must be an integer';
    } else if (data.sort_order < 0) {
      errors.sort_order = 'Sort order must be non-negative';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// DATE RANGE VALIDATION
// ============================================================================

export interface DateRangeInput {
  startDate: string;
  endDate: string;
}

export const validateDateRange = (data: DateRangeInput): ValidationResult => {
  const errors: Record<string, string> = {};

  // Start date validation
  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
    errors.startDate = 'Invalid date format (YYYY-MM-DD)';
  }

  // End date validation
  if (!data.endDate) {
    errors.endDate = 'End date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.endDate)) {
    errors.endDate = 'Invalid date format (YYYY-MM-DD)';
  }

  // Range validation
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start > end) {
      errors.endDate = 'End date must be after or equal to start date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

import { ValidationResult } from '@/libs/validation';

// Re-export ValidationResult for module use
export type { ValidationResult };

// ============================================================================
// ACTIVITY VALIDATION
// ============================================================================

export interface ActivityInput {
  title: string;
  description?: string;
  category?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  rating?: number;
  metadata?: Record<string, unknown>;
}

export const validateActivity = (data: Partial<ActivityInput>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  } else if (data.title.length < 2) {
    errors.title = 'Title must be at least 2 characters';
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
    } else if (data.start_time && new Date(data.end_time) <= new Date(data.start_time)) {
      errors.end_time = 'End time must be after start time';
    }
  }

  // Duration validation (optional)
  if (data.duration_minutes !== undefined && data.duration_minutes !== null) {
    const duration = Number(data.duration_minutes);
    if (isNaN(duration) || duration <= 0) {
      errors.duration_minutes = 'Duration must be a positive number';
    } else if (duration > 1440) {
      errors.duration_minutes = 'Duration cannot exceed 24 hours (1440 minutes)';
    }
  }

  // Rating validation (optional)
  if (data.rating !== undefined && data.rating !== null) {
    const rating = Number(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
  }

  // Description validation (optional)
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  // Category validation (optional)
  if (data.category && data.category.length > 50) {
    errors.category = 'Category must be less than 50 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// TIMELINE VIEW OPTIONS
// ============================================================================

export interface TimelineViewOptions {
  view: 'day' | 'week' | 'month';
  date: string;
}

export const validateTimelineViewOptions = (data: Partial<TimelineViewOptions>): ValidationResult => {
  const errors: Record<string, string> = {};

  // View validation
  if (!data.view) {
    errors.view = 'View type is required';
  } else if (!['day', 'week', 'month'].includes(data.view)) {
    errors.view = 'View must be day, week, or month';
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.date = 'Invalid date format (YYYY-MM-DD)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// ACTIVITY FILTER
// ============================================================================

export interface ActivityFilterInput {
  startDate?: string;
  endDate?: string;
  category?: string;
  minRating?: number;
  search?: string;
}

export const validateActivityFilter = (data: ActivityFilterInput): ValidationResult => {
  const errors: Record<string, string> = {};

  // Date range validation
  if (data.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
    errors.startDate = 'Invalid start date format (YYYY-MM-DD)';
  }

  if (data.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.endDate)) {
    errors.endDate = 'Invalid end date format (YYYY-MM-DD)';
  }

  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      errors.endDate = 'End date must be after or equal to start date';
    }
  }

  // Rating validation
  if (data.minRating !== undefined) {
    if (data.minRating < 1 || data.minRating > 5) {
      errors.minRating = 'Minimum rating must be between 1 and 5';
    }
  }

  // Search validation
  if (data.search && data.search.length > 100) {
    errors.search = 'Search query must be less than 100 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

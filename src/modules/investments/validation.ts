import { ValidationResult } from '@/libs/validation';

// Re-export ValidationResult for module use
export type { ValidationResult };

// ============================================================================
// INVESTMENT POSITION VALIDATION
// ============================================================================

export interface PositionInput {
  symbol: string;
  name?: string;
  asset_type: 'stock' | 'crypto' | 'gold';
  quantity: number;
  avg_price: number;
  currency?: string;
  notes?: string;
}

export const validatePosition = (data: Partial<PositionInput>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Symbol validation
  if (!data.symbol?.trim()) {
    errors.symbol = 'Symbol is required';
  } else if (data.symbol.length > 10) {
    errors.symbol = 'Symbol must be less than 10 characters';
  } else if (!/^[A-Za-z0-9.-]+$/.test(data.symbol)) {
    errors.symbol = 'Symbol can only contain letters, numbers, dots, and hyphens';
  }

  // Asset type validation
  if (!data.asset_type) {
    errors.asset_type = 'Asset type is required';
  } else if (!['stock', 'crypto', 'gold'].includes(data.asset_type)) {
    errors.asset_type = 'Asset type must be stock, crypto, or gold';
  }

  // Quantity validation
  if (data.quantity === undefined || data.quantity === null) {
    errors.quantity = 'Quantity is required';
  } else if (typeof data.quantity !== 'number' || isNaN(data.quantity)) {
    errors.quantity = 'Quantity must be a valid number';
  } else if (data.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  } else if (data.quantity > 999999999) {
    errors.quantity = 'Quantity is too large';
  }

  // Average price validation
  if (data.avg_price === undefined || data.avg_price === null) {
    errors.avg_price = 'Average price is required';
  } else if (typeof data.avg_price !== 'number' || isNaN(data.avg_price)) {
    errors.avg_price = 'Average price must be a valid number';
  } else if (data.avg_price <= 0) {
    errors.avg_price = 'Average price must be greater than 0';
  } else if (data.avg_price > 999999999999) {
    errors.avg_price = 'Average price is too large';
  }

  // Name validation (optional)
  if (data.name && data.name.length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  // Currency validation (optional)
  if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
    errors.currency = 'Currency must be a 3-letter code (e.g., USD, IDR)';
  }

  // Notes validation (optional)
  if (data.notes && data.notes.length > 1000) {
    errors.notes = 'Notes must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// PRICE SNAPSHOT VALIDATION
// ============================================================================

export interface PriceSnapshotInput {
  position_id: string;
  snapshot_date: string;
  price: number;
  change_percent?: number;
  source?: string;
}

export const validatePriceSnapshot = (data: Partial<PriceSnapshotInput>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Position ID validation
  if (!data.position_id) {
    errors.position_id = 'Position ID is required';
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.position_id)) {
    errors.position_id = 'Invalid position ID';
  }

  // Snapshot date validation
  if (!data.snapshot_date) {
    errors.snapshot_date = 'Snapshot date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.snapshot_date)) {
    errors.snapshot_date = 'Invalid date format (YYYY-MM-DD)';
  }

  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.price = 'Price is required';
  } else if (typeof data.price !== 'number' || isNaN(data.price)) {
    errors.price = 'Price must be a valid number';
  } else if (data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  // Change percent validation (optional)
  if (data.change_percent !== undefined && data.change_percent !== null) {
    if (typeof data.change_percent !== 'number' || isNaN(data.change_percent)) {
      errors.change_percent = 'Change percent must be a valid number';
    } else if (data.change_percent < -100 || data.change_percent > 1000) {
      errors.change_percent = 'Change percent seems unreasonable';
    }
  }

  // Source validation (optional)
  if (data.source && data.source.length > 50) {
    errors.source = 'Source must be less than 50 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// PORTFIOLO ALLOCATION VALIDATION
// ============================================================================

export interface AllocationInput {
  targetPercentages: Record<string, number>;
}

export const validateAllocation = (data: AllocationInput): ValidationResult => {
  const errors: Record<string, string> = {};

  // Target percentages validation
  if (!data.targetPercentages || typeof data.targetPercentages !== 'object') {
    errors.targetPercentages = 'Target percentages are required';
  } else {
    const values = Object.values(data.targetPercentages);
    const total = values.reduce((sum, val) => sum + val, 0);

    if (total !== 100) {
      errors.targetPercentages = `Target percentages must sum to 100%, currently ${total}%`;
    }

    const invalidValue = values.find((val) => val < 0 || val > 100);
    if (invalidValue !== undefined) {
      errors.targetPercentages = 'Each percentage must be between 0 and 100';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

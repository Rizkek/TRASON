# Phase 2: Data Fetching & Cache Standardization

**Objective:** Eliminate data fetching inconsistencies, standardize on Queries service layer, ensure proper cache invalidation.

**Status:** Planning → Implementation

---

## Current State Analysis

### Data Fetching Patterns (Inconsistent)

#### Pattern A: Direct SWR in Hooks
```typescript
// useTransaction.ts
const { data, error, mutate } = useSWR(
  isAuthenticated ? `transactions:${start}:${end}` : null,
  async () => transactionsQuery(start, end)
);
```
- **Issue:** Each hook re-fetches independently, no centralized cache
- **Problem:** Race conditions, duplicate requests

#### Pattern B: Queries Service (Recommended)
```typescript
// queries.ts - centralized service layer
export const transactionQueries = {
  list: async (start, end) => { ... },
  create: async (data) => { ... },
  update: async (id, data) => { ... },
  delete: async (id) => { ... },
};
```
- **Advantage:** Single source of truth for data operations
- **Still needed:** Hook wrappers that use SWR + Queries layer

#### Pattern C: Mixed (Some use both)
```typescript
// Some pages call queries directly
const txns = await userQueries.transactions();

// Other pages use hooks
const { transactions } = useTransaction();
```
- **Issue:** Inconsistent, hard to debug, cache conflicts

---

## Phase 2 Implementation Plan

### Step 1: Audit Current Hooks & Services
**Goal:** Map all data fetching endpoints

**Hooks to Review:**
- `useAuth.ts` - Auth operations
- `useTransaction.ts` - Transaction CRUD + filters
- `useActivity.ts` - Activity timeline operations
- `useReminder.ts` - Reminder management + status
- `useInvestment.ts` - Portfolio data + prices
- `usePushNotification.ts` - Notification operations
- `useFetch.ts` - Generic data fetcher (deprecated?)

**Services to Review:**
- `queries.ts` - Query operations layer
- `investmentService.ts` - Investment calculations + API calls
- `investmentQueries.ts` - Investment-specific queries
- `supabaseClient.ts` - Direct client access (should minimize)

---

### Step 2: Standardize Query Service Layer

**Strategy:** Make `queries.ts` the single source of truth for all data operations

**Current `queries.ts` structure:**
```typescript
export const transactionQueries = { list, create, update, delete, ... };
export const activityQueries = { list, create, update, delete, ... };
export const reminderQueries = { list, create, update, delete, ... };
export const userQueries = { profile, settings, ... };
```

**Action Items:**
1. ✅ Consolidate all Supabase calls into `queries.ts`
2. ✅ Add investmentQueries operations to main queries.ts
3. ✅ Ensure consistent error handling (try/catch + typed errors)
4. ✅ Add proper TypeScript types for all responses
5. ⏳ Remove direct supabaseClient usage from components

---

### Step 3: Create Hook Wrapper Pattern

**Goal:** Hooks become thin SWR wrappers around Queries service

**Template:**
```typescript
// hooks/useTransaction.ts
export function useTransaction(start?: string, end?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const { data, error, mutate, isLoading } = useSWR(
    isAuthenticated && start && end ? ['transactions', start, end] : null,
    () => transactionQueries.list(start, end),
    { revalidateOnFocus: false, revalidateOnReconnect: true }
  );

  return {
    transactions: data || [],
    isLoading: !error && !data,
    error,
    
    // Mutations with optimistic updates
    createTransaction: async (tx) => {
      const result = await transactionQueries.create(tx);
      await mutate(); // Revalidate cache
      return result;
    },
    
    updateTransaction: async (id, tx) => {
      const result = await transactionQueries.update(id, tx);
      await mutate();
      return result;
    },
    
    deleteTransaction: async (id) => {
      await transactionQueries.delete(id);
      await mutate();
      return true;
    },
  };
}
```

**Benefits:**
- ✅ Single SWR instance per resource type
- ✅ Centralized cache key management
- ✅ Consistent error handling
- ✅ Optimistic updates supported
- ✅ Manual revalidation via `mutate()`

---

### Step 4: Implement Global SWR Configuration

**Goal:** Shared SWR settings for consistency

**Create `src/config/swr.ts`:**
```typescript
import { SWRConfiguration } from 'swr';

export const SWR_CONFIG: SWRConfiguration = {
  revalidateOnFocus: false,        // Don't spam API on window focus
  revalidateOnReconnect: true,    // Update data when reconnecting
  dedupingInterval: 2000,          // Dedupe requests within 2s
  focusThrottleInterval: 300000,   // 5 min focus revalidation
  errorRetryCount: 2,              // Retry failed requests 2x
  errorRetryInterval: 5000,        // Wait 5s between retries
  shouldRetryOnError: true,        // Retry on network errors
  provider: () => new Map(),       // Cache provider
};
```

---

### Step 5: Implement Cache Invalidation Strategy

**Goal:** Ensure cache updates when data changes

**Pattern: Mutation Cascades**
```typescript
// When transaction created, invalidate related caches:
async function createTransaction(tx: Transaction) {
  const result = await transactionQueries.create(tx);
  
  // Invalidate affected caches
  await mutate(['transactions', '*']); // All transaction lists
  await mutate('financial-summary');    // Dashboard summary
  await mutate(['reports', '*']);       // Any reports
  
  return result;
}
```

**Implementation:**
1. ✅ Add `cacheKeys.ts` - Centralized cache key definitions
2. ✅ Add `mutations.ts` - Mutation operations with cascading invalidation
3. ✅ Update hooks to use cache key patterns

---

### Step 6: Type Safety for API Responses

**Goal:** Ensure all API responses are properly typed

**Create `src/types/queries.ts`:**
```typescript
import { Database } from './database';

// Export Query Response Types
export type TransactionResponse = Database['public']['Tables']['transactions']['Row'];
export type ActivityResponse = Database['public']['Tables']['activities']['Row'];
export type ReminderResponse = Database['public']['Tables']['reminders']['Row'];

// Export Query Request Types
export type CreateTransactionRequest = Omit<TransactionResponse, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTransactionRequest = Partial<CreateTransactionRequest>;

// Query function signatures
export interface QueryFunctions {
  transactions: {
    list: (start: string, end: string) => Promise<TransactionResponse[]>;
    create: (data: CreateTransactionRequest) => Promise<TransactionResponse>;
    update: (id: string, data: UpdateTransactionRequest) => Promise<TransactionResponse>;
    delete: (id: string) => Promise<{ deleted: boolean }>;
  };
  // ... other entities
}
```

---

### Step 7: Error Handling Standardization

**Goal:** Consistent error handling across all data fetching

**Update `src/libs/apiErrors.ts`:**
```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleQueryError(error: any): ApiError {
  if (error instanceof ApiError) return error;
  
  // Supabase PostgresError
  if (error.code) {
    if (error.code === '23505') {
      return new ApiError(409, 'DUPLICATE', 'This record already exists');
    }
    if (error.code === '23503') {
      return new ApiError(400, 'FOREIGN_KEY', 'Invalid reference to related record');
    }
  }
  
  // Network/auth errors
  if (error.message?.includes('Auth')) {
    return new ApiError(401, 'AUTH_ERROR', 'Authentication required');
  }
  
  return new ApiError(500, 'UNKNOWN', error.message || 'Unknown error occurred');
}
```

---

## Implementation Roadmap

| Phase | Task | Timeline | Priority |
|-------|------|----------|----------|
| 2.1 | Audit all hooks & services | 30 min | HIGH |
| 2.2 | Consolidate queries.ts | 1 hour | HIGH |
| 2.3 | Create hook wrapper pattern | 1.5 hours | HIGH |
| 2.4 | Implement SWR config | 20 min | MEDIUM |
| 2.5 | Create cache invalidation strategy | 45 min | MEDIUM |
| 2.6 | Implement type safety | 1 hour | HIGH |
| 2.7 | Standardize error handling | 45 min | MEDIUM |
| 2.8 | Update all components | 3 hours | HIGH |
| 2.9 | Test & verify data flows | 1 hour | HIGH |

**Total Estimate:** ~9 hours

---

## Success Criteria

- ✅ All data fetching goes through `queries.ts` service layer
- ✅ All hooks are thin SWR wrappers
- ✅ No direct `supabaseClient` calls in components
- ✅ SWR cache hits are logged/verified
- ✅ Race conditions eliminated (verified in dev tools)
- ✅ Cache invalidation works correctly
- ✅ All API errors properly typed and handled
- ✅ No duplicate requests for same data
- ✅ Performance improves (fewer API calls)
- ✅ Developer experience improves (clear data flow)

---

## Files to Create/Modify

### New Files:
- `src/config/swr.ts` - SWR configuration
- `src/types/queries.ts` - Query response/request types
- `src/libs/cacheKeys.ts` - Cache key definitions
- `src/libs/mutations.ts` - Mutation operations
- `src/libs/apiErrors.ts` - API error handling

### Modified Files:
- `src/services/queries.ts` - Consolidate all queries
- `src/hooks/useTransaction.ts` - Update to wrapper pattern
- `src/hooks/useActivity.ts` - Update to wrapper pattern
- `src/hooks/useReminder.ts` - Update to wrapper pattern
- `src/hooks/useInvestment.ts` - Update to wrapper pattern
- `src/hooks/useAuth.ts` - Update to wrapper pattern
- `src/app/*/page.tsx` - Remove direct service calls (8 pages)

### Deprecated Files (Delete):
- `src/hooks/useFetch.ts` (if unused)
- `src/services/apiClient.ts` (if exists)

---

## Next Steps

1. **Immediate:** Start with 2.1 (audit) to get full picture
2. **Then:** Implement 2.2-2.3 (queries + hooks) - these unlock the others
3. **Then:** Implement 2.4-2.7 (infrastructure)
4. **Finally:** Update all components (2.8) + test (2.9)

---

**Decision Point:** After completing Phase 2, next phases would be:
- Phase 3: Real-time data sync (WebSocket/Supabase Realtime)
- Phase 4: Offline support (IndexedDB + service worker)
- Phase 5: Performance optimizations (code splitting, lazy loading)

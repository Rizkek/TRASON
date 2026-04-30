# Phase 2.1: Audit Results - Hooks & Services Analysis

**Date:** April 29, 2026  
**Status:** AUDIT COMPLETE ✅

---

## Current Architecture Overview

```
Hooks Layer (thin SWR wrappers)
    ↓
Queries Service Layer (data operations)
    ↓
Supabase Client (RLS-protected tables)
```

---

## Hooks Analysis

### 1. **useAuth.ts** - Auth State Management
**Pattern:** Store-based (NOT SWR)
```typescript
- Uses Zustand authStore for persistent state
- Listens to supabase.auth.onAuthStateChange events
- Loads user preferences on sign-in
- No SWR caching - state is in Zustand store
```

**Issues:**
- ⚠️ No SWR deduplication - each auth state change causes re-fetches
- ⚠️ User preferences loaded directly (not cached)
- ✅ Good: Handles auth lifecycle properly

**Action:** Add SWR wrapper for user preferences

---

### 2. **useTransaction.ts** - Transaction CRUD
**Pattern:** SWR + Queries
```typescript
- SWR key: ['transactions', startDate, endDate, type]
- Config: revalidateOnFocus=true, dedupingInterval=5000ms
- Mutations: create, update, delete (all call mutate())
```

**Issues:**
- ⚠️ revalidateOnFocus=true (causes unnecessary API calls on tab switch)
- ✅ Good: Uses cache keys with parameters
- ✅ Good: Mutations call mutate() for cache sync

**Action:** Update config to use global SWR_CONFIG

---

### 3. **useActivity.ts** - Daily Timeline
**Pattern:** SWR + Queries
```typescript
- SWR key: ['activities', date]
- Config: revalidateOnFocus=true, dedupingInterval=5000ms, keepPreviousData=true
- Mutations: create, update, delete
```

**Issues:**
- ⚠️ Same as useTransaction (revalidateOnFocus=true)
- ✅ Good: keepPreviousData=true for UX
- ✅ Good: Day-based cache keys

**Action:** Update config + improve error handling

---

### 4. **useReminder.ts** - Reminder Management
**Pattern:** SWR + Queries
```typescript
- SWR key: ['reminders', startDate, endDate] or ['reminders', 'pending']
- Config: revalidateOnFocus=true, dedupingInterval=5000ms
- Mutations: create, update, delete, markReminderDone
```

**Issues:**
- ⚠️ Same config issues
- ✅ Good: Special 'pending' status handling
- ⚠️ markReminderDone not cascading invalidation

**Action:** Add cascade invalidation for status changes

---

### 5. **useInvestment.ts** - Portfolio Management
**Pattern:** SWR + Queries + Investment Service
```typescript
- SWR key: 'investments' (single key)
- Complex data: positions, calculatedPositions, summary, insights
- refreshPortfolio: manual refresh + external price fetch
- Mutations: create, update, delete (also logs to timeline)
```

**Issues:**
- ⚠️ Single global cache key (no time-based filtering)
- ⚠️ Complex data structure (4 nested objects)
- ⚠️ Side effects: creates timeline activities
- ⚠️ No error handling in mutations
- ✅ Good: Separate refreshPortfolio for price updates

**Action:** Split cache keys + add error handling + cascade updates

---

### 6. **usePushNotification.ts** - Notifications
**Pattern:** Unknown - need to audit
```typescript
- Not yet reviewed
```

---

### 7. **useFetch.ts** - Generic Fetcher
**Pattern:** Unknown - need to audit
```typescript
- Not yet reviewed
- Likely deprecated or rarely used
```

---

## Query Services Analysis

### **queries.ts** - Main Query Service (7 modules)
**Module Breakdown:**

| Module | Functions | Status |
|--------|-----------|--------|
| `userQueries` | ensureUserProfile, getUserWithPreferences, updateUserProfile, getPreferences, savePreferences | ✅ Complete |
| `categoryQueries` | list, create, update, delete, bulkSync | ✅ Complete |
| `transactionQueries` | getTransactions, createTransaction, updateTransaction, deleteTransaction, getSummaryByCategory, bulkUpsert | ✅ Complete |
| `activityQueries` | getActivitiesByDate, createActivity, updateActivity, deleteActivity, bulkUpsert | ✅ Complete |
| `reminderQueries` | getReminders, getPendingReminders, createReminder, updateReminder, deleteReminder, completeReminder, bulkUpsert | ✅ Complete |
| `insightQueries` | list, getByUser, create, bulkUpsert, archive | ✅ Complete |
| `batchQueries` | bulkFetch (general batch operations) | ✅ Complete |

**Observations:**
- ✅ All queries handle auth via getCurrentUser()
- ✅ All queries use RLS policies (eq('user_id', user.id))
- ✅ All queries return typed results
- ⚠️ Error handling: mostly just throw (no ApiError wrapper)
- ⚠️ No cascade invalidation patterns
- ✅ Good: Consistent upsert/bulk patterns

---

### **investmentQueries.ts** - Investment Operations
**Functions:**
- getPositions, createPosition, updatePosition, updatePositionMarketData
- deletePosition, getPositionById
- upsertPriceSnapshot, getPriceHistory
- getPerformanceMetrics

**Observations:**
- ✅ Separate from main queries.ts (specialized domain)
- ✅ Complete market data tracking
- ⚠️ Not integrated with main queries module
- ⚠️ Missing error handling

---

### **investmentService.ts** - Investment Calculations
**Functions:**
- buildInvestmentTimelineText, calculatePortfolioSummary
- fetchInvestmentQuotes, generateInvestmentInsights
- formatters and utilities

**Observations:**
- ✅ Business logic separated from data layer
- ⚠️ External API calls (not cached)
- ⚠️ No rate limiting on fetchInvestmentQuotes

---

## Data Fetching Patterns - Current State

### Pattern A: Direct SWR in Hooks (Currently Used)
**Hooks:** useTransaction, useActivity, useReminder, useInvestment
```typescript
// Problem: Inconsistent SWR configs
// Problem: No error handling
// Problem: No cache invalidation strategy
```

### Pattern B: Store-based (Currently Used)
**Hooks:** useAuth
```typescript
// Problem: No deduplication
// Problem: Manual subscription management
```

### Pattern C: Direct Service Calls (FOUND IN PAGES)
**Pages:** Some pages call queries directly instead of through hooks
```typescript
// Problem: Bypasses SWR caching
// Problem: Race conditions possible
```

---

## Critical Issues Found

### 🔴 HIGH PRIORITY

1. **Inconsistent SWR Configuration**
   - Each hook has custom config
   - revalidateOnFocus=true causes excessive API calls
   - Need global SWR_CONFIG

2. **No Error Handling**
   - Queries just throw raw errors
   - Hooks don't catch/format errors
   - No sanitizeError integration

3. **Missing Cache Invalidation**
   - When transaction created, investment summary not invalidated
   - When investment updated, dashboard not invalidated
   - No cascade pattern

4. **Race Conditions Possible**
   - Some pages call queries directly + hooks
   - Can cause duplicate requests
   - Can cause stale data conflicts

### 🟡 MEDIUM PRIORITY

5. **No Deduplication Outside Hooks**
   - Direct service calls bypass SWR dedup
   - Multiple mutations can run simultaneously

6. **Complex Data Structures**
   - useInvestment returns 4 nested objects
   - Should be split into separate cache keys

7. **Side Effects Mixed with Data Layer**
   - Investment mutations log to timeline
   - No error handling if logging fails

---

## Files Status

### Ready for Phase 2 Implementation
- [x] `src/config/swr.ts` - Created ✅
- [x] `src/libs/cacheKeys.ts` - Created ✅
- [x] `src/libs/apiErrors.ts` - Created ✅

### Need to Update (Phase 2.2+)
- [ ] `src/services/queries.ts` - Add error handling + cache keys
- [ ] `src/services/investmentQueries.ts` - Consolidate + error handling
- [ ] `src/hooks/useTransaction.ts` - Update config
- [ ] `src/hooks/useActivity.ts` - Update config
- [ ] `src/hooks/useReminder.ts` - Update config + cascade
- [ ] `src/hooks/useInvestment.ts` - Split + error handling
- [ ] `src/hooks/useAuth.ts` - Add preferences SWR
- [ ] `src/hooks/usePushNotification.ts` - Review + update
- [ ] `src/hooks/useFetch.ts` - Review + deprecate if unused

---

## Recommendations

### Next Steps (Phase 2.2-2.8)

1. **2.2: Consolidate investmentQueries into main queries.ts**
   - 30 minutes
   - Merge investmentQueries module into queries.ts
   - Keep domain separation with `investmentQueries` export

2. **2.3: Add Error Handling to All Queries**
   - 1 hour
   - Wrap all throws with ApiError
   - Add sanitizeError calls

3. **2.4: Update Hook Configurations**
   - 1 hour
   - Replace custom SWR configs with SWR_CONFIG_*
   - Add error handling in all hooks

4. **2.5: Implement Cache Invalidation**
   - 2 hours
   - Add mutation cascades
   - Use matchesPattern for wildcard invalidation

5. **2.6: Add usePreferences Hook**
   - 30 minutes
   - Separate user preferences from auth store
   - Use SWR for caching

6. **2.7: Type Safety for Query Responses**
   - 1 hour
   - Create `src/types/queries.ts`
   - Export all response types

7. **2.8-2.9: Update Components + Test**
   - 4 hours
   - Review all pages for direct service calls
   - Update to use hooks where applicable
   - Manual testing of cache behavior

---

## Success Criteria

After Phase 2 Complete, verify:
- ✅ All hooks use SWR_CONFIG variants
- ✅ All queries wrap errors with ApiError
- ✅ All mutations trigger cache invalidation
- ✅ No direct service calls in components (except auth)
- ✅ Cache hits visible in Network tab (304s)
- ✅ No duplicate requests for same data
- ✅ All error messages are user-friendly
- ✅ Dashboard reflects transaction/activity changes immediately

---

**Audit completed by:** Agent  
**Files reviewed:** 7 hooks, 3 service files, 50+ lines of code analyzed
**Next phase estimated time:** 8-10 hours total

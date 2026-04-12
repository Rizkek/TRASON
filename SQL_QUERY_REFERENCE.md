# SQL Query Reference - TRASON

## 🚨 Why You Get "there is no parameter $1" Error

**The Problem:**
```sql
-- ❌ WRONG: Using $1 in Supabase SQL Editor
SELECT * FROM transactions 
WHERE user_id = $1 AND deleted_at IS NULL;
-- Error: "there is no parameter $1"
```

**Why?** `$1` is a **placeholder for prepared statements** used in code, not for direct SQL execution.

---

## ✅ Three Ways to Query - When to Use Each

### 1️⃣ From React/TypeScript Code (RECOMMENDED)

```typescript
// ✅ USE THIS - From src/services/queries.ts
import { transactionQueries } from '@/services/queries';

// These handle all the complexity for you
const transactions = await transactionQueries.getTransactions(
  new Date('2024-01-01'),
  new Date('2024-12-31'),
  'expense'
);
```

**Why it's best:**
- ✅ Type-safe
- ✅ RLS automatically enforced
- ✅ No SQL injection risk
- ✅ Error handling built-in

---

### 2️⃣ Direct Supabase Client (Advanced)

```typescript
// For more control, use Supabase client directly
const { data, error } = await supabase
  .from('transactions')
  .select(`
    id, title, amount, date,
    categories:category_id(name, color)
  `)
  .eq('user_id', userId)
  .is('deleted_at', null)
  .gte('date', startDate)
  .lte('date', endDate)
  .order('date', { ascending: false })
  .range(0, 49); // Pagination: limit 50, offset 0

if (error) console.error('Error:', error);
```

**When to use:**
- Need more control over the query
- Want live subscriptions
- Building custom queries

---

### 3️⃣ Supabase SQL Editor (Testing Only)

**✅ FOR TESTING - Copy actual values:**

```sql
-- Test 1: Create a test transaction
INSERT INTO transactions (user_id, category_id, title, amount, type, date, tags)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- Replace with real user_id
  '660e8400-e29b-41d4-a716-446655440001',  -- Replace with real category_id
  'Test Lunch',
  45000.00,
  'expense',
  CURRENT_DATE,
  ARRAY['food', 'testing']
)
RETURNING id, title, amount, created_at;

-- Test 2: Get transactions for a user
SELECT 
  id, title, amount, type, date, 
  category_id, created_at
FROM transactions
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND deleted_at IS NULL
ORDER BY date DESC
LIMIT 50;

-- Test 3: Get categories
SELECT id, name, color, type, icon
FROM categories
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND deleted_at IS NULL
ORDER BY sort_order ASC;

-- Test 4: Get all users (verify signup worked)
SELECT id, email, first_name, created_at FROM users LIMIT 10;

-- Test 5: Analytics - spending by category
SELECT 
  c.name as category,
  t.type,
  COUNT(*) as count,
  SUM(t.amount) as total,
  AVG(t.amount) as average
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND t.deleted_at IS NULL
GROUP BY c.name, t.type
ORDER BY total DESC;
```

---

## 🔴 DON'T DO THIS

### ❌ Don't use $1, $2, $3 in SQL Editor

```sql
-- ❌ WRONG - Causes error
SELECT * FROM transactions 
WHERE user_id = $1 AND deleted_at IS NULL;
```

### ❌ Don't manually run prepared statement syntax

```sql
-- ❌ WRONG - This is for code, not SQL Editor
PREPARE stmt AS
SELECT * FROM transactions 
WHERE user_id = $1;
```

### ❌ Don't mix code and SQL Editor syntaxes

```typescript
// ❌ WRONG - Don't do this
const query = "SELECT * FROM transactions WHERE user_id = $1";
await supabase.query(query); // Supabase doesn't have .query()
```

---

## 📋 Complete CRUD Examples (Copy & Paste)

### CREATE - Insert Transaction

```sql
-- Replace the UUID values with real ones from your database
INSERT INTO transactions (
  user_id, 
  category_id, 
  title, 
  description,
  amount, 
  type, 
  date, 
  payment_method,
  tags
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- Your actual user_id
  '660e8400-e29b-41d4-a716-446655440001',  -- Your actual category_id
  'Grocery Shopping',
  'Weekly groceries at Supermarket ABC',
  125000.00,
  'expense',
  CURRENT_DATE,
  'card',
  ARRAY['groceries', 'food', 'weekly']
)
RETURNING id, title, amount, created_at;
```

### READ - Get User Transactions

```sql
-- Get transactions for a specific user
SELECT 
  t.id,
  t.title,
  t.description,
  t.amount,
  t.type,
  t.date,
  t.time,
  c.name as category_name,
  c.color as category_color,
  c.icon as category_icon
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND t.deleted_at IS NULL
ORDER BY t.date DESC, t.time DESC
LIMIT 50;
```

### UPDATE - Edit Transaction

```sql
-- Update a transaction
UPDATE transactions
SET 
  title = 'Updated Title',
  amount = 150000.00,
  description = 'Updated description',
  updated_at = CURRENT_TIMESTAMP
WHERE id = '770e8400-e29b-41d4-a716-446655440002'
  AND user_id = '550e8400-e29b-41d4-a716-446655440000'
RETURNING *;
```

### DELETE - Soft Delete Transaction

```sql
-- Soft delete (keeps data, hides from queries)
UPDATE transactions
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = '770e8400-e29b-41d4-a716-446655440002'
  AND user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Verify it's deleted
SELECT id, title, deleted_at FROM transactions
WHERE id = '770e8400-e29b-41d4-a716-446655440002';
```

---

## 🔍 Debug Queries

### Check if your user exists

```sql
SELECT id, email, first_name, last_name, created_at 
FROM users 
WHERE email = 'your.email@example.com';
```

### List all categories for a user

```sql
SELECT id, name, color, type, icon, is_default
FROM categories
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND deleted_at IS NULL
ORDER BY sort_order ASC;
```

### Check transaction count

```sql
SELECT 
  COUNT(*) as total_transactions,
  SUM(amount) as total_expenses_amount,
  COUNT(DISTINCT DATE(date)) as days_with_transactions
FROM transactions
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND type = 'expense'
  AND deleted_at IS NULL;
```

### Check all active reminders

```sql
SELECT 
  id,
  title,
  due_datetime,
  priority,
  status,
  category
FROM reminders
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND status = 'pending'
  AND deleted_at IS NULL
ORDER BY due_datetime ASC;
```

### See all activity logs for debugging

```sql
SELECT 
  id,
  action,
  resource_type,
  resource_id,
  changes,
  created_at
FROM activity_logs
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC
LIMIT 50;
```

---

## 💻 How queries.ts Uses These

The `queries.ts` file converts the SQL into easy-to-use TypeScript functions:

```typescript
// From queries.ts
export const transactionQueries = {
  async getTransactions(startDate?: Date, endDate?: Date, type?: 'income' | 'expense') {
    const user = await getCurrentUser();
    
    let query = supabase
      .from('transactions')
      .select(...)
      .eq('user_id', user.id)
      .is('deleted_at', null);
    
    if (startDate) query = query.gte('date', startDate.toISOString().split('T')[0]);
    if (endDate) query = query.lte('date', endDate.toISOString().split('T')[0]);
    if (type) query = query.eq('type', type);
    
    const { data, error } = await query
      .order('date', { ascending: false })
      .range(0, 49);
    
    if (error) throw error;
    return { data, count };
  }
};
```

**How to use it:**
```typescript
// In your React component
const { data: transactions } = await transactionQueries.getTransactions(
  new Date('2024-01-01'),
  new Date('2024-01-31'),
  'expense'
);
```

---

## 🧪 Testing Workflow

### Step 1: Get Your IDs

1. Sign up at `/signup`
2. Go to Supabase Dashboard
3. Table Editor → Users
4. Copy your user `id` (looks like: `550e8400-...`)
5. Table Editor → Categories
6. Copy a category `id`

### Step 2: Run Test Queries

1. SQL Editor → New Query
2. Paste queries from this file with your IDs
3. Click **Run**
4. Check results

### Step 3: Use Functions in Code

```typescript
// In your React component
const handleAddTransaction = async () => {
  const newTx = await transactionQueries.createTransaction({
    category_id: '660e8400-...',
    title: 'Coffee',
    amount: 50000,
    type: 'expense',
    date: '2024-04-12',
  });
  console.log('Created:', newTx);
};
```

---

## 📚 Quick Reference Card

| Task | Location | Syntax |
|------|----------|--------|
| Create | Code | `await queryFn()` |
| Read | Code | `await queryFn()` |
| Update | Code | `await queryFn()` |
| Delete | Code | `await queryFn()` |
| Test | SQL Editor | Replace `{{}}` with values |
| Debug | SQL Editor | Copy test queries, run direct SQL |

---

## 🆘 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "there is no parameter $1" | Using $1 in SQL Editor | Copy queries with actual values |
| "Row-level security violated" | Wrong user_id in WHERE | Verify user is logged in |
| "relation does not exist" | Table name typo | Check table names in Supabase |
| "duplicate key value" | Email/category name already exists | Use different value |
| "null value in column" | Missing required field | Check all required fields filled |

---

## 📌 Important Notes

1. **Always include** `user_id` in WHERE clause (security)
2. **Always include** `deleted_at IS NULL` (soft deletes)
3. **Always use** `queries.ts` functions from code (easier + safer)
4. **Test first** in SQL Editor, then in code
5. **Never** commit real UUIDs - use examples only

---

**Last Updated**: April 12, 2026  
**Version**: 1.0  
**Status**: Ready for Use

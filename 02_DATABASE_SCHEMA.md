# Database Schema - TRASON PWA

## 1. Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌──────────────────┐
│      Users      │         │  UserPreferences │
├─────────────────┤         ├──────────────────┤
│ PK: id          │◄────────│ FK: user_id      │
│ email           │         │ theme            │
│ password_hash   │         │ language         │
│ created_at      │         │ currency         │
│ updated_at      │         │ timezone         │
└─────────────────┘         └──────────────────┘
        │
        │
    ┌───┴────────────────┬──────────────┬─────────────────┐
    │                    │              │                 │
┌───▼──────────────┐  ┌──▼──────────┐ ┌▼────────┐  ┌────▼──────┐
│ Transactions     │  │ Activities   │ │Reminders│  │Insights   │
├──────────────────┤  ├──────────────┤ ├────────┤  ├───────────┤
│ PK: id           │  │ PK: id       │ │PK: id  │  │ PK: id    │
│ FK: user_id      │  │ FK: user_id  │ │FK: u_id│  │ FK: user_id
│ FK: category_id  │  │ title        │ │title   │  │ date      │
│ amount           │  │ description  │ │desc    │  │ type      │
│ type (income/exp)│  │ start_time   │ │due     │  │ data      │
│ date             │  │ end_time     │ │repeat  │  │created_at │
│ created_at       │  │ tags         │ │freq    │  └───────────┘
└──────────────────┘  │ created_at   │ │status  │
                       └──────────────┘ └────────┘

┌──────────────────┐      ┌─────────────────┐
│    Categories    │      │ PushSubscription│
├──────────────────┤      ├─────────────────┤
│ PK: id           │      │ PK: id          │
│ FK: user_id      │      │ FK: user_id     │
│ name             │      │ endpoint        │
│ color            │      │ p256dh          │
│ type (income/exp)│      │ auth            │
│ is_default       │      │ created_at      │
└──────────────────┘      └─────────────────┘
```

## 2. Detailed Table Schemas

### 2.1 Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    phone VARCHAR(20),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

### 2.2 User Preferences
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light', -- light, dark, auto
    language VARCHAR(10) DEFAULT 'en', -- en, id, etc
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    email_digest_enabled BOOLEAN DEFAULT TRUE,
    digest_frequency VARCHAR(50) DEFAULT 'weekly', -- daily, weekly, monthly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Categories
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji or icon name
    color VARCHAR(7), -- hex color
    type VARCHAR(20) NOT NULL, -- income, expense
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(user_id, name),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type)
);
```

### 2.4 Transactions
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- income, expense
    date DATE NOT NULL,
    time TIME,
    payment_method VARCHAR(50), -- cash, card, transfer, etc
    receipt_image_url VARCHAR(500),
    tags TEXT[], -- array of tags for searching
    metadata JSONB, -- flexible for future attributes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_date (date),
    INDEX idx_type (type),
    -- TimescaleDB hypertable for time-series data
    CHECK (amount > 0)
);

-- Optional: Convert to TimescaleDB hypertable
-- SELECT create_hypertable('transactions', 'date');
```

### 2.5 Activities
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- work, health, learning, entertainment, etc
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER, -- calculated from end_time - start_time
    mood VARCHAR(50), -- angry, sad, neutral, happy, excellent
    rating INTEGER, -- 1-5 scale
    location VARCHAR(255),
    participants TEXT[], -- people involved
    tags TEXT[],
    image_urls VARCHAR(500)[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_start_time (start_time),
    INDEX idx_category (category),
    INDEX idx_mood (mood)
);

-- TimescaleDB hypertable
-- SELECT create_hypertable('activities', 'start_time');
```

### 2.6 Reminders
```sql
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    due_time TIME,
    due_datetime TIMESTAMP, -- computed: due_date + due_time
    category VARCHAR(100), -- bill, habit, appointment, task, etc
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- daily, weekly, monthly, yearly, custom
    recurrence_custom_rule VARCHAR(255), -- iCalendar RRULE format
    recurrence_end_date DATE,
    recurrence_occurrences INTEGER, -- limit how many times
    
    -- Notifications
    notify_days_before INTEGER DEFAULT 1,
    notify_hours_before INTEGER,
    notify_times INTEGER[], -- array of minute offsets before due_time
    
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_due_datetime (due_datetime),
    INDEX idx_status (status),
    INDEX idx_is_recurring (is_recurring)
);
```

### 2.7 Reminder Occurrences (for recurring reminders)
```sql
CREATE TABLE reminder_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_datetime TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, skipped
    notified_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reminder_id (reminder_id),
    INDEX idx_user_id (user_id),
    INDEX idx_scheduled_datetime (scheduled_datetime),
    INDEX idx_status (status)
);
```

### 2.8 Insights
```sql
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- the date of insight
    type VARCHAR(50) NOT NULL, -- daily, weekly, monthly
    period_start DATE,
    period_end DATE,
    
    -- Finance Insights
    total_income DECIMAL(15, 2),
    total_expense DECIMAL(15, 2),
    top_expenses JSONB, -- [{"category": "Food", "amount": 150, "percentage": 30}]
    spending_by_category JSONB,
    budget_status JSONB, -- {"exceeded": false, "percentage": 45}
    
    -- Activity Insights
    total_activities INTEGER,
    activities_by_category JSONB,
    mood_summary JSONB, -- {"happy": 10, "neutral": 5, "sad": 2}
    average_activity_rating DECIMAL(3, 2),
    most_active_hour TIME,
    
    -- Habit Insights
    habit_completion_rate DECIMAL(5, 2), -- percentage
    habit_streaks JSONB, -- [{"habit": "Exercise", "days": 7}]
    
    -- General
    summary TEXT, -- AI-generated summary
    recommendations TEXT[], -- array of recommendation strings
    data JSONB, -- flexible for other data
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_type (type)
);
```

### 2.9 Push Subscriptions
```sql
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL UNIQUE, -- browser endpoint
    p256dh VARCHAR(500) NOT NULL, -- public key
    auth VARCHAR(500) NOT NULL, -- authentication token
    device_name VARCHAR(255), -- Chrome on Windows, Safari on iPhone, etc
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);
```

### 2.10 Activity Logs (for auditing)
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, etc
    resource_type VARCHAR(100), -- transaction, reminder, activity, etc
    resource_id UUID,
    changes JSONB, -- what changed: {old: {...}, new: {...}}
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_resource_type (resource_type),
    INDEX idx_action (action)
);
```

## 3. Indexes Strategy

```sql
-- For frequently queried combinations
CREATE INDEX idx_user_transactions_date ON transactions(user_id, date DESC);
CREATE INDEX idx_user_activities_date ON activities(user_id, start_time DESC);
CREATE INDEX idx_user_reminders_due ON reminders(user_id, due_datetime);

-- For full-text search
CREATE INDEX idx_activities_fts ON activities USING GIN(
    to_tsvector('english', title || ' ' || description)
);
CREATE INDEX idx_transactions_fts ON transactions USING GIN(
    to_tsvector('english', title || ' ' || description)
);

-- Partial indexes for active records
CREATE INDEX idx_reminders_active ON reminders(user_id, due_datetime)
WHERE status != 'completed' AND deleted_at IS NULL;

CREATE INDEX idx_activities_recent ON activities(user_id, start_time DESC)
WHERE deleted_at IS NULL;
```

## 4. Data Retention & Archival

```sql
-- Archive old transactions (older than 2 years)
CREATE TABLE transactions_archive (LIKE transactions);

-- Partition by month for better performance
-- CREATE TABLE transactions_2024_01 PARTITION OF transactions
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 5. Migration Strategy (Prisma Example)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email String  @unique
  passwordHash String @map("password_hash")
  
  preferences UserPreference?
  categories  Category[]
  transactions Transaction[]
  activities  Activity[]
  reminders   Reminder[]
  insights    Insight[]
  subscriptions PushSubscription[]
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  
  @@map("users")
}

// ... more Prisma models
```

## 6. Performance Considerations

### Query Optimization
```sql
-- Example: Get this month's spending by category
SELECT 
    c.name,
    c.color,
    SUM(t.amount) as total,
    COUNT(*) as count,
    ROUND(SUM(t.amount) * 100.0 / 
        (SELECT SUM(amount) FROM transactions 
         WHERE user_id = $1 AND date_trunc('month', date) = date_trunc('month', NOW())),
        2) as percentage
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = $1
  AND t.type = 'expense'
  AND date_trunc('month', t.date) = date_trunc('month', NOW())
GROUP BY c.id, c.name, c.color
ORDER BY total DESC;
```

### Caching Strategy
- Cache category list (5 minutes)
- Cache monthly summary (24 hours)
- Cache user preferences (1 hour)
- Invalidate on write


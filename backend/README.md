# TRASON Backend

The backend API for TRASON - a comprehensive self-improvement platform combining personal finance tracking, daily activity logging, smart reminders, and AI-powered insights.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with refresh tokens and bcryptjs hashing
- 💰 **Finance Management** - Track income and expenses with categories and analytics
- 📅 **Activity Logging** - Daily timeline tracking with mood and location support
- 🔔 **Smart Reminders** - Recurring reminder support with RRULE format
- 🔊 **Push Notifications** - Web push notifications with subscription management
- 💡 **AI Insights** - Daily/weekly/monthly summaries with recommendations
- 📊 **Analytics** - Detailed financial and activity analytics
- 🛡️ **Security** - Helmet, CORS, rate limiting, and input validation
- 📝 **Logging** - Structured logging for debugging and monitoring

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Validation**: Custom validators
- **Security**: Helmet, CORS, rate limiting
- **Notifications**: web-push

## Prerequisites

Before running the backend, ensure you have:

- Node.js 18+ installed
- PostgreSQL 12+ database
- npm or yarn package manager
- OpenSSL for VAPID key generation (for push notifications)

## Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `JWT_REFRESH_SECRET` - Secret key for refresh tokens
   - `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` - For push notifications

4. **Initialize database**
   ```bash
   npx prisma db push
   npx prisma db seed  # Optional: seed initial data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001/api/v1`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for JWT tokens | - |
| `JWT_EXPIRE` | JWT token expiration | 15m |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | 7d |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |
| `VAPID_PUBLIC_KEY` | Push notification public key | - |
| `VAPID_PRIVATE_KEY` | Push notification private key | - |
| `LOG_LEVEL` | Logging level | debug |

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check TypeScript
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Sync database schema
- `npx prisma generate` - Generate Prisma client

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema (11 models)
├── src/
│   ├── app.ts             # Express app setup
│   ├── index.ts           # Server entry point
│   ├── config/
│   │   └── database.ts    # Prisma singleton
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication
│   │   └── errorHandler.ts # Error handling
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── transactions.ts # Finance routes
│   │   ├── activities.ts   # Activity routes
│   │   ├── reminders.ts    # Reminder routes
│   │   └── subscriptions.ts # Push subscription routes
│   ├── controllers/
│   │   └── authController.ts # Auth handlers
│   ├── services/
│   │   ├── authService.ts    # Authentication logic
│   │   ├── transactionService.ts (stub)
│   │   ├── activityService.ts (stub)
│   │   └── reminderService.ts (stub)
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   └── utils/
│       ├── logger.ts      # Structured logging
│       ├── errors.ts      # Custom error classes
│       ├── validate.ts    # Input validators
│       └── jwt.ts         # JWT utilities
└── .env.local             # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `PUT /api/v1/auth/profile` - Update profile (protected)
- `POST /api/v1/auth/password` - Change password (protected)
- `POST /api/v1/auth/logout` - Logout (protected)

### Finance
- `GET /api/v1/transactions` - List transactions (protected)
- `POST /api/v1/transactions` - Create transaction (protected)
- `PUT /api/v1/transactions/:id` - Update transaction (protected)
- `DELETE /api/v1/transactions/:id` - Delete transaction (protected)
- `GET /api/v1/transactions/analytics` - Get analytics (protected)

### Activities
- `GET /api/v1/activities` - List activities (protected)
- `POST /api/v1/activities` - Create activity (protected)
- `PUT /api/v1/activities/:id` - Update activity (protected)
- `DELETE /api/v1/activities/:id` - Delete activity (protected)

### Reminders
- `GET /api/v1/reminders` - List reminders (protected)
- `POST /api/v1/reminders` - Create reminder (protected)
- `PUT /api/v1/reminders/:id` - Update reminder (protected)
- `DELETE /api/v1/reminders/:id` - Delete reminder (protected)
- `POST /api/v1/reminders/:id/mark-done` - Mark reminder done (protected)

### Push Subscriptions
- `POST /api/v1/subscriptions` - Subscribe to notifications (protected)
- `POST /api/v1/subscriptions/unsubscribe` - Unsubscribe (protected)
- `GET /api/v1/subscriptions/preferences` - Get preferences (protected)

## Database Schema (11 Models)

1. **User** - User accounts with authentication
2. **UserPreference** - User settings and preferences
3. **Category** - Financial and activity categories
4. **Transaction** - Income and expense records
5. **Activity** - Daily activity logs
6. **Reminder** - Recurring and one-time reminders
7. **ReminderOccurrence** - Individual reminder instances
8. **Insight** - Daily/weekly/monthly insights
9. **PushSubscription** - Push notification subscriptions
10. **ActivityLog** - Audit trail for all user actions
11. **RefreshToken** - JWT refresh tokens for security

## Authentication Flow

1. **Register**: User creates account → Password hashed with bcryptjs → User stored in database
2. **Login**: User provides credentials → Password verified → JWT tokens issued (access + refresh)
3. **Token Refresh**: Client sends refresh token → New access token issued → Old token invalidated
4. **Request**: Client sends request with Bearer token → Middleware verifies token → User data extracted
5. **Logout**: Refresh token revoked → User session ends

## Error Handling

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Custom error classes:
- `AppError` - Generic application error
- `ValidationError` - Input validation failure
- `NotFoundError` - Resource not found
- `UnauthorizedError` - Authentication failure
- `ForbiddenError` - Authorization failure
- `ConflictError` - Resource conflict (e.g., duplicate email)

## Security Features

- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Tokens**: Signed and verified with secrets
- **CORS**: Restricted to frontend origin
- **Rate Limiting**: 100 requests per 15 minutes
- **Helmet**: Sets security HTTP headers
- **Input Validation**: All inputs validated and sanitized
- **Database Queries**: Protected against SQL injection via Prisma
- **Error Messages**: Don't leak sensitive information

## Performance Optimization

- Database connection pooling via Prisma
- Indexed queries on frequently searched fields
- Efficient pagination for large datasets
- Request caching where appropriate
- Structured logging for monitoring

## Development Tips

1. **Use Prisma Studio** for database visualization:
   ```bash
   npx prisma studio
   ```

2. **Generate VAPID Keys** for push notifications:
   ```bash
   npx web-push generate-vapid-keys
   ```

3. **Check Database Migrations**:
   ```bash
   npx prisma migrate status
   ```

4. **Format Code**:
   ```bash
   npm run lint -- --fix
   ```

## Testing

To test API endpoints, use tools like:
- **Postman** - GUI API client
- **curl** - Command-line tool
- **REST Client** - VS Code extension

Example:
```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'
```

## Deployment

### Prerequisites
- PostgreSQL database in the cloud
- Node.js 18+ server or serverless platform
- Environment variables configured

### Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create trason-api

# Set environment variables
heroku config:set DATABASE_URL=...

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Deploy to AWS
```bash
# Use AWS Amplify, Elastic Beanstalk, or Lambda
# See AWS documentation for detailed guides
```

## Troubleshooting

### Database connection fails
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Check PostgreSQL is running
- Verify database exists and user has permissions

### JWT errors
- Regenerate JWT secrets in `.env.local`
- Clear refresh tokens if changed
- Check token expiration

### Push notifications not working
- Generate new VAPID keys: `npx web-push generate-vapid-keys`
- Update both frontend and backend with same keys
- Verify Service Worker is registered on frontend

## Learn More

- [Express.js Documentation](https://expressjs.com/)
- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## License

MIT

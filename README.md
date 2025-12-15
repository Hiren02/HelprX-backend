# HelprX Backend - Local Services Platform

A comprehensive monolithic backend for a local services marketplace with AI-powered worker matching, built with Node.js, Express.js, Sequelize ORM, and PostgreSQL.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 👥 **User Management** - Complete user profile and preference management
- 🛠️ **Worker Management** - Worker profiles, skills, KYC verification, availability tracking
- 📍 **Geo-Location Services** - PostGIS-powered location tracking and nearest worker search
- 🤖 **AI-Powered Matching** - Custom DB queries + Google Gemini AI integration for optimal worker matching
- 💼 **Job/Order Management** - Complete job lifecycle from creation to completion
- 💳 **Payment Processing** - Razorpay integration with wallet and payout management
- ⭐ **Ratings & Reviews** - Immutable rating system with moderation
- 📱 **Multi-Channel Notifications** - Push (FCM), SMS (Twilio/MSG91), Email, In-app
- 💰 **Dynamic Pricing** - Surge pricing engine with demand-based calculations
- 📊 **Analytics & Reporting** - Comprehensive analytics and reporting tools
- 🔧 **Admin Tools** - Manual assignment, dispute resolution, system management

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: PostgreSQL with PostGIS extension
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Logging**: Winston
- **Caching**: Redis
- **Queue**: Bull
- **Payment**: Razorpay, Stripe (optional)
- **AI**: Google Gemini API
- **Notifications**: Firebase (FCM), Twilio, NodeMailer

## Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 14 with PostGIS extension
- Redis (optional, for caching and queues)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd HelprX-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up PostgreSQL with PostGIS**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE helprx_db;

-- Connect to the database
\c helprx_db

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

5. **Run database migrations**
```bash
npm run migrate
```

6. **Seed initial data (optional)**
```bash
npm run seed
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in .env)

## Project Structure

```
helprx-backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.js
│   ├── modules/             # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── workers/
│   │   ├── jobs/
│   │   ├── addresses/
│   │   ├── matching/
│   │   ├── notifications/
│   │   ├── payments/
│   │   ├── wallet/
│   │   ├── ratings/
│   │   ├── pricing/
│   │   ├── search/
│   │   ├── analytics/
│   │   └── admin/
│   ├── common/              # Shared utilities
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── constants/
│   ├── database/            # Database setup
│   │   ├── models/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── uploads/                 # File uploads directory
├── logs/                    # Application logs
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Module Structure

Each module follows this consistent structure:
```
module-name/
├── module-name.model.js      # Sequelize model
├── module-name.service.js    # Business logic
├── module-name.controller.js # Request handlers
├── module-name.validator.js  # Validation schemas
├── module-name.routes.js     # Route definitions
└── index.js                  # Module exports
```

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints
- `POST /auth/register` - Register new user/worker
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### User Endpoints
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/addresses` - Get user addresses
- `POST /users/addresses` - Add new address
- `PUT /users/addresses/:id` - Update address
- `DELETE /users/addresses/:id` - Delete address

### Worker Endpoints
- `GET /workers/profile` - Get worker profile
- `PUT /workers/profile` - Update worker profile
- `PUT /workers/availability` - Update availability status
- `POST /workers/skills` - Add/update skills
- `POST /workers/kyc` - Upload KYC documents
- `GET /workers/earnings` - Get earnings summary

### Job Endpoints
- `POST /jobs` - Create new job
- `GET /jobs/:id` - Get job details
- `GET /jobs` - List user's jobs
- `PUT /jobs/:id/cancel` - Cancel job
- `PUT /jobs/:id/complete` - Mark job as complete
- `POST /jobs/:id/dispute` - Raise dispute

### Worker Job Endpoints
- `GET /workers/jobs/available` - Get available jobs
- `PUT /workers/jobs/:id/accept` - Accept job
- `PUT /workers/jobs/:id/decline` - Decline job
- `PUT /workers/jobs/:id/start` - Start job
- `PUT /workers/jobs/:id/complete` - Complete job

### Search Endpoints
- `GET /search/workers` - Search nearby workers
- `GET /search/workers/by-skill` - Search workers by skill

### Payment Endpoints
- `POST /payments/create-order` - Create payment order
- `POST /payments/verify` - Verify payment
- `POST /payments/webhook` - Payment webhook handler

### Wallet Endpoints
- `GET /wallet/balance` - Get wallet balance
- `GET /wallet/transactions` - Get transaction history
- `POST /wallet/payout` - Request payout

### Rating Endpoints
- `POST /ratings` - Submit rating
- `GET /ratings/worker/:workerId` - Get worker ratings
- `GET /ratings/job/:jobId` - Get job rating

### Admin Endpoints
- `GET /admin/users` - List all users
- `GET /admin/workers` - List all workers
- `PUT /admin/workers/:id/verify` - Verify worker
- `PUT /admin/jobs/:id/assign` - Manually assign job
- `GET /admin/disputes` - List disputes
- `PUT /admin/disputes/:id/resolve` - Resolve dispute

## Environment Variables

See `.env.example` for all available configuration options.

### Critical Variables
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection
- `JWT_SECRET`, `JWT_REFRESH_SECRET` - Authentication secrets
- `GEMINI_API_KEY` - Google Gemini AI API key (optional)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` - Payment gateway credentials

## Database Schema

### Key Tables
- **users** - User profiles and authentication
- **workers** - Worker profiles with skills and availability
- **addresses** - Geo-located addresses (PostGIS)
- **jobs** - Service requests with lifecycle tracking
- **job_candidates** - Matching results and worker responses
- **ratings** - Immutable rating records
- **wallets** - Worker wallet balances
- **transactions** - Payment and payout records
- **notifications** - In-app notification storage

## Matching Service

The matching service uses a hybrid approach:

1. **Database Query Matching (Default)**
   - Geo-proximity search using PostGIS
   - Skill matching
   - Availability filtering
   - Rating-based ranking

2. **AI Matching (Optional - Gemini)**
   - Advanced ML-based matching
   - Enable by setting `USE_AI_MATCHING=true`
   - Requires `GEMINI_API_KEY`

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

## Deployment

1. Set `NODE_ENV=production` in .env
2. Configure production database
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up process manager (PM2)

```bash
# Using PM2
npm install -g pm2
pm2 start src/server.js --name helprx-backend
pm2 save
pm2 startup
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For support, email support@helprx.com or create an issue in the repository.

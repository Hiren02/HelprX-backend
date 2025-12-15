# HelprX Backend - Quick Setup Guide

This guide will help you set up and run the HelprX backend locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))
- **PostGIS Extension** for PostgreSQL
- **Git** (optional, for version control)

## Step 1: Install PostgreSQL with PostGIS

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
```

### On macOS (using Homebrew):
```bash
brew install postgresql postgis
brew services start postgresql
```

### On Windows:
Download and install PostgreSQL from the official website, then install PostGIS using the Stack Builder.

## Step 2: Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE helprx_db;

# Connect to the database
\c helprx_db

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

# Verify PostGIS installation
SELECT PostGIS_Version();

# Exit PostgreSQL
\q
```

## Step 3: Clone and Install Dependencies

```bash
# Navigate to project directory
cd /home/logicrays/Desktop/demo-project/HelprX-backend

# Install dependencies
npm install
```

## Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use any text editor
```

### Minimum Required Configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=helprx_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secrets (change these!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production

# Application
NODE_ENV=development
PORT=5000
```

## Step 5: Run Database Migrations

```bash
# This will create all tables and indexes
npm run migrate
```

Expected output:
```
✅ PostGIS extension enabled
✅ Database tables created/updated
✅ Spatial indexes created
🎉 Migrations completed successfully
```

## Step 6: Seed Sample Data (Optional)

```bash
# This will create sample users and workers for testing
npm run seed
```

You'll get sample credentials:
- **Admin**: Phone: 9999999999, Password: admin123
- **User**: Phone: 9876543210, Password: user123
- **Worker 1**: Phone: 9876543211, Password: worker123
- **Worker 2**: Phone: 9876543212, Password: worker123

## Step 7: Start the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Expected output:
```
✅ Database connection established successfully.
✅ PostGIS version: 3.x
✅ Database models synchronized
🚀 Server is running on port 5000
📝 Environment: development
🏥 Health check: http://localhost:5000/health
```

## Step 8: Test the API

### Health Check:
```bash
curl http://localhost:5000/health
```

### Register a User:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543213",
    "password": "test123",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "user123"
  }'
```

Save the `accessToken` from the response for authenticated requests.

### Create a Job (requires authentication):
```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "addressId": "ADDRESS_UUID",
    "serviceType": "plumbing",
    "title": "Fix leaking tap",
    "description": "Kitchen tap is leaking, needs urgent repair"
  }'
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running:
```bash
# Ubuntu/Debian
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS
brew services list
brew services start postgresql
```

### PostGIS Extension Not Found
```
Error: type "geography" does not exist
```
**Solution**: Install PostGIS extension:
```bash
sudo apt install postgis  # Ubuntu/Debian
brew install postgis      # macOS
```

Then enable it in your database:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change the PORT in `.env` file or kill the process using port 5000:
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 PID
```

## Project Structure Overview

```
HelprX-backend/
├── src/
│   ├── config/              # Database and app configuration
│   ├── modules/             # Feature modules (auth, jobs, workers, etc.)
│   ├── common/              # Shared utilities and middleware
│   ├── database/            # Models, migrations, seeders
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── uploads/                 # File uploads
├── logs/                    # Application logs
├── .env                     # Environment variables
└── package.json            # Dependencies and scripts
```

## Available NPM Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed sample data
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues

## Next Steps

1. **Enable AI Matching**: Uncomment Gemini AI code in `src/modules/matching/matching.service.js` and add your `GEMINI_API_KEY` to `.env`

2. **Enable Notifications**: Uncomment notification service code and configure:
   - FCM for push notifications
   - Twilio for SMS
   - SMTP for email

3. **Configure Payment Gateway**: Add Razorpay credentials to `.env`

4. **Deploy to Production**: Use PM2 or Docker for production deployment

## Support

For issues or questions, please check the main README.md or create an issue in the repository.

## Security Notes

⚠️ **Important**: 
- Change all default secrets in `.env` before deploying to production
- Never commit `.env` file to version control
- Use strong passwords for database and JWT secrets
- Enable HTTPS in production
- Regularly update dependencies

Happy coding! 🚀

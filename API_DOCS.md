# API Documentation - HelprX Backend

**Base URL:** `http://localhost:5000/api/v1`

**Version:** 1.0.0

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Workers](#workers)
4. [Jobs](#jobs)
5. [Addresses](#addresses)
6. [Ratings](#ratings)
7. [Notifications](#notifications)
8. [Pricing](#pricing)
9. [Wallet](#wallet)
10. [Payments](#payments)
11. [Matching](#matching)
12. [Analytics](#analytics)
13. [Admin Panel](#admin-panel)

---

## Authentication

### Register User
**POST** `/auth/register`

Register a new user or worker account.

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "password123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

**Roles:** `user`, `worker`, `admin`

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "9876543210",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### Logout
**POST** `/auth/logout`

🔒 Requires authentication

### Change Password
**POST** `/auth/change-password`

🔒 Requires authentication

**Request Body:**
```json
{
  "oldPassword": "old_password",
  "newPassword": "new_password"
}
```

### Get Current User
**GET** `/auth/me`

🔒 Requires authentication

---

## Users

### Get User Profile
**GET** `/users/profile`

🔒 Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "role": "user",
    "addresses": [...]
  }
}
```

### Update User Profile
**PUT** `/users/profile`

🔒 Requires authentication

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

### Update Password
**PUT** `/users/password`

🔒 Requires authentication

**Request Body:**
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_password"
}
```

### Deactivate Account
**DELETE** `/users/account`

🔒 Requires authentication

### Get User Statistics
**GET** `/users/stats`

🔒 Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalJobs": 15,
    "completedJobs": 12,
    "activeJobs": 3,
    "ratingsGiven": 10
  }
}
```

---

## Workers

All worker endpoints require **worker role** authentication.

### Get Worker Profile
**GET** `/workers/profile`

🔒 Requires worker authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rajesh Kumar",
    "phone": "9876543211",
    "skills": [
      { "skill": "plumbing", "level": 3 },
      { "skill": "electrical", "level": 2 }
    ],
    "avgRating": 4.5,
    "completedJobs": 30,
    "availabilityStatus": "online",
    "kycStatus": "verified"
  }
}
```

### Update Worker Profile
**PUT** `/workers/profile`

🔒 Requires worker authentication

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "companyName": "RK Services",
  "bio": "Experienced plumber with 5 years",
  "experienceYears": 5,
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### Update Skills
**PUT** `/workers/skills`

🔒 Requires worker authentication

**Request Body:**
```json
{
  "skills": [
    { "skill": "plumbing", "level": 4 },
    { "skill": "electrical", "level": 3 }
  ]
}
```

**Skill Levels:** 1 (Beginner), 2 (Intermediate), 3 (Advanced), 4 (Expert)

### Update Availability
**PUT** `/workers/availability`

🔒 Requires worker authentication

**Request Body:**
```json
{
  "status": "online"
}
```

**Status Values:** `online`, `offline`, `busy`

### Upload KYC Documents
**POST** `/workers/kyc`

🔒 Requires worker authentication

**Request Body:**
```json
{
  "documents": {
    "aadhar": "https://example.com/aadhar.jpg",
    "pan": "https://example.com/pan.jpg",
    "drivingLicense": "https://example.com/dl.jpg",
    "photo": "https://example.com/photo.jpg"
  }
}
```

### Get Worker Statistics
**GET** `/workers/stats`

🔒 Requires worker authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalJobs": 55,
    "completedJobs": 50,
    "activeJobs": 2,
    "totalRatings": 45,
    "avgRating": 4.8,
    "acceptanceRate": 0.92,
    "walletBalance": 5000,
    "totalEarnings": 50000
  }
}
```

### Get Worker Jobs
**GET** `/workers/jobs?status=assigned&page=1&limit=10`

🔒 Requires worker authentication

**Query Parameters:**
- `status` (optional): Filter by job status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

---

## Jobs

### Create Job
**POST** `/jobs`

🔒 Requires authentication (User role)

⚠️ Rate limited: 10 jobs per hour

**Request Body:**
```json
{
  "addressId": "address_uuid",
  "serviceType": "plumbing",
  "title": "Fix leaking tap",
  "description": "Kitchen tap is leaking, needs urgent repair",
  "preferredTimeStart": "2024-01-15T10:00:00Z",
  "preferredTimeEnd": "2024-01-15T14:00:00Z",
  "attachments": ["https://example.com/image1.jpg"]
}
```

**Service Types:** `plumbing`, `electrical`, `tutoring`, `carpentry`, `painting`, `cleaning`, `pet_care`, `handyman`, `ac_repair`, `appliance_repair`, `pest_control`, `gardening`, `other`

**Response (201):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "id": "job_uuid",
    "userId": "user_uuid",
    "serviceType": "plumbing",
    "title": "Fix leaking tap",
    "status": "created",
    "priceEstimate": 250.00,
    "surgeMultiplier": 1.2,
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

### Get User's Jobs
**GET** `/jobs?page=1&limit=10&status=completed`

🔒 Requires authentication

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

### Get Job Details
**GET** `/jobs/:id`

🔒 Requires authentication

### Cancel Job
**PUT** `/jobs/:id/cancel`

🔒 Requires authentication (User role)

**Request Body:**
```json
{
  "cancellationReason": "Found another service provider"
}
```

### Accept Job (Worker)
**POST** `/jobs/:id/accept`

🔒 Requires worker authentication

### Decline Job (Worker)
**POST** `/jobs/:id/decline`

🔒 Requires worker authentication

**Request Body:**
```json
{
  "reason": "Not available at this time"
}
```

### Start Job (Worker)
**POST** `/jobs/:id/start`

🔒 Requires worker authentication

### Complete Job (Worker)
**POST** `/jobs/:id/complete`

🔒 Requires worker authentication

**Request Body:**
```json
{
  "finalPrice": 300.00
}
```

---

## Addresses

### Create Address
**POST** `/addresses`

🔒 Requires authentication

**Request Body:**
```json
{
  "label": "Home",
  "addressLine": "123 Main Street, Sector 15",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### Get User Addresses
**GET** `/addresses?page=1&limit=10`

🔒 Requires authentication

### Get Single Address
**GET** `/addresses/:id`

🔒 Requires authentication

### Update Address
**PUT** `/addresses/:id`

🔒 Requires authentication

**Request Body:** (all fields optional)
```json
{
  "label": "Office",
  "addressLine": "456 New Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400002",
  "latitude": 19.0800,
  "longitude": 72.8800
}
```

### Delete Address
**DELETE** `/addresses/:id`

🔒 Requires authentication

⚠️ Cannot delete if used in active jobs

### Set Default Address
**PUT** `/addresses/:id/set-default`

🔒 Requires authentication

### Search Addresses
**GET** `/addresses/search?q=mumbai`

🔒 Requires authentication

**Query Parameters:**
- `q` (required): Search term (min 2 characters)

### Get Nearby Addresses
**GET** `/addresses/nearby?latitude=19.076&longitude=72.877&radius=10`

🔒 Requires authentication

**Query Parameters:**
- `latitude` (required): Latitude
- `longitude` (required): Longitude
- `radius` (optional): Radius in km (default: 10)

---

## Ratings

### Submit Rating
**POST** `/ratings`

🔒 Requires authentication

**Request Body:**
```json
{
  "jobId": "job_uuid",
  "rating": 5,
  "review": "Excellent service, very professional"
}
```

**Rating:** 1-5 (integer)

### Get Worker Ratings
**GET** `/ratings/worker/:workerId?page=1&limit=20`

🔒 Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "rating_uuid",
      "rating": 5,
      "review": "Excellent service",
      "user": { "id": "uuid", "name": "John" },
      "job": { "id": "uuid", "serviceType": "plumbing" },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45
  }
}
```

### Get Job Rating
**GET** `/ratings/job/:jobId`

🔒 Requires authentication

### Get My Ratings
**GET** `/ratings/my-ratings?page=1&limit=20`

🔒 Requires authentication

Get all ratings submitted by the current user.

---

## Notifications

### Get Notifications
**GET** `/notifications?page=1&limit=20&unreadOnly=false`

🔒 Requires authentication

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `unreadOnly` (optional): Filter unread only

### Mark as Read
**PUT** `/notifications/:id/read`

🔒 Requires authentication

### Mark All as Read
**PUT** `/notifications/read-all`

🔒 Requires authentication

---

## Pricing

### Get Price Estimate
**POST** `/pricing/estimate`

**Request Body:**
```json
{
  "serviceType": "plumbing",
  "addressId": "address_uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "basePrice": 200,
    "surgeMultiplier": 1.2,
    "total": 240
  }
}
```

### Get Surge Info
**GET** `/pricing/surge?serviceType=plumbing&addressId=uuid`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "surgeMultiplier": 1.2,
    "surgeActive": true,
    "message": "Surge pricing active"
  }
}
```

---

## Wallet

All wallet endpoints require **worker role** authentication.

### Get Wallet Balance
**GET** `/wallet/balance`

🔒 Requires worker authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "wallet_uuid",
    "workerId": "worker_uuid",
    "balance": 5000.00,
    "totalEarnings": 50000.00,
    "totalWithdrawn": 45000.00,
    "pendingAmount": 500.00
  }
}
```

### Get Transaction History
**GET** `/wallet/transactions?page=1&limit=20&type=credit`

🔒 Requires worker authentication

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by type (`credit`, `debit`, `payout`)

### Request Payout
**POST** `/wallet/payout`

🔒 Requires worker authentication

**Request Body:**
```json
{
  "amount": 1000
}
```

**Minimum:** ₹100

---

## Payments

### Create Payment Order
**POST** `/payments/create-order`

🔒 Requires authentication

**Request Body:**
```json
{
  "amount": 300,
  "jobId": "job_uuid",
  "currency": "INR"
}
```

**Note:** Razorpay integration pending. Returns placeholder response.

### Verify Payment
**POST** `/payments/verify`

🔒 Requires authentication

**Request Body:**
```json
{
  "orderId": "order_id",
  "paymentId": "payment_id",
  "signature": "razorpay_signature"
}
```

### Payment Webhook
**POST** `/payments/webhook`

No authentication required (verified via signature)

Handles Razorpay webhook events.

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "phone",
      "message": "Phone number is required"
    }
  ],
  "timestamp": "2024-01-15T09:00:00Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Job creation**: 10 jobs per hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Job Status Flow

```
created → matching → assigned → in_progress → completed
                  ↓
              cancelled / disputed
```

---

## Postman Collection Setup

1. Create a new collection named "HelprX API"
2. Add environment variables:
   - `base_url`: `http://localhost:5000/api/v1`
   - `access_token`: (will be set after login)
   - `refresh_token`: (will be set after login)

3. Set up authorization:
   - Type: Bearer Token
   - Token: `{{access_token}}`

4. Create folders for each module:
   - Authentication
   - Users
   - Workers
   - Jobs
   - Addresses
   - Ratings
   - Notifications
   - Pricing
   - Wallet
   - Payments

---

## Example Workflow

### 1. Register as User
```bash
POST /auth/register
{
  "phone": "9876543210",
  "password": "user123",
  "name": "John Doe",
  "role": "user"
}
```

### 2. Add Address
```bash
POST /addresses
{
  "label": "Home",
  "addressLine": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### 3. Create Job
```bash
POST /jobs
{
  "addressId": "address_uuid",
  "serviceType": "plumbing",
  "title": "Fix leaking tap",
  "description": "Kitchen tap leaking"
}
```

### 4. Worker Accepts Job
```bash
POST /jobs/:jobId/accept
```

### 5. Worker Completes Job
```bash
POST /jobs/:jobId/complete
{
  "finalPrice": 300
}
```

### 6. User Submits Rating
```bash
POST /ratings
{
  "jobId": "job_uuid",
  "rating": 5,
  "review": "Excellent work!"
}
```

---

## Matching

### Find Matching Workers
**POST** `/matching/find-workers`

🔒 Requires authentication

**Request Body:**
```json
{
  "jobId": "job_uuid",
  "maxWorkers": 10,
  "radiusKm": 10,
  "useAI": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobId": "job_uuid",
    "totalMatches": 5,
    "matches": [
      {
        "workerId": "worker_uuid",
        "workerName": "Rajesh Kumar",
        "distance": 2.5,
        "rating": 4.8,
        "score": 0.92,
        "reason": "Very close to job location, Highly rated"
      }
    ]
  }
}
```

### Get Job Matches
**GET** `/matching/job/:jobId`

🔒 Requires authentication

Get all matching candidates for a job.

### Get Best Match
**GET** `/matching/job/:jobId/best`

🔒 Requires authentication

Get the highest-scored worker for a job.

---

## Analytics

All analytics endpoints require **admin authentication**.

### Get Platform Overview
**GET** `/analytics/overview`

🔒 Requires admin authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "totalWorkers": 350,
    "totalJobs": 5000,
    "completedJobs": 4200,
    "activeJobs": 150,
    "totalRevenue": 2500000,
    "avgJobValue": 595.24,
    "completionRate": 84.00
  }
}
```

### Get Revenue Analytics
**GET** `/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31&groupBy=month`

🔒 Requires admin authentication

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `groupBy` (optional): `hour`, `day`, `week`, `month`

### Get Job Analytics
**GET** `/analytics/jobs?startDate=2024-01-01&endDate=2024-12-31`

🔒 Requires admin authentication

Returns jobs by status, service type, and average completion time.

### Get Worker Analytics
**GET** `/analytics/workers`

🔒 Requires admin authentication

Returns worker distribution by KYC status, availability, top workers, and average stats.

### Get User Analytics
**GET** `/analytics/users`

🔒 Requires admin authentication

Returns new users by month, active users, retention rate.

### Get Rating Analytics
**GET** `/analytics/ratings`

🔒 Requires admin authentication

Returns rating distribution and average platform rating.

### Get Real-Time Metrics
**GET** `/analytics/realtime`

🔒 Requires admin authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobsLast24h": 45,
    "activeWorkers": 120,
    "ongoingJobs": 23,
    "recentTransactions": 67,
    "timestamp": "2024-12-15T12:00:00Z"
  }
}
```

---

## Admin Panel

All admin endpoints require **admin authentication**.

### User Management

#### Get All Users
**GET** `/admin/users?page=1&limit=20&role=user&search=john`

🔒 Requires admin authentication

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role (`user`, `worker`, `admin`)
- `isActive` (optional): Filter by active status
- `search` (optional): Search by name, email, or phone

#### Get User by ID
**GET** `/admin/users/:id`

🔒 Requires admin authentication

#### Update User Status
**PUT** `/admin/users/:id/status`

🔒 Requires admin authentication

**Request Body:**
```json
{
  "isActive": false
}
```

#### Delete User
**DELETE** `/admin/users/:id`

🔒 Requires admin authentication

Deactivates user account (soft delete).

---

### Worker Management

#### Get All Workers
**GET** `/admin/workers?page=1&limit=20&kycStatus=verified`

🔒 Requires admin authentication

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `kycStatus` (optional): Filter by KYC status
- `availabilityStatus` (optional): Filter by availability
- `search` (optional): Search by name or phone

#### Get Worker by ID
**GET** `/admin/workers/:id`

🔒 Requires admin authentication

Returns detailed worker information including jobs and ratings.

#### Update Worker KYC
**PUT** `/admin/workers/:id/kyc`

🔒 Requires admin authentication

**Request Body:**
```json
{
  "status": "verified",
  "rejectionReason": "Invalid documents"
}
```

**Status:** `verified` or `rejected`

#### Get Pending KYC Approvals
**GET** `/admin/kyc/pending`

🔒 Requires admin authentication

Returns all workers with KYC status `submitted`.

---

### Job Management

#### Get All Jobs
**GET** `/admin/jobs?page=1&limit=20&status=completed&serviceType=plumbing`

🔒 Requires admin authentication

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `serviceType` (optional): Filter by service type
- `search` (optional): Search by title or description

#### Manually Assign Job
**POST** `/admin/jobs/:id/assign`

🔒 Requires admin authentication

**Request Body:**
```json
{
  "workerId": "worker_uuid"
}
```

Manually assign a worker to a job (admin override).

#### Cancel Job
**PUT** `/admin/jobs/:id/cancel`

🔒 Requires admin authentication

**Request Body:**
```json
{
  "reason": "Customer request - admin approved"
}
```

---

### Dispute Management

#### Get Disputed Jobs
**GET** `/admin/disputes`

🔒 Requires admin authentication

Returns all jobs with status `disputed`.

#### Resolve Dispute
**POST** `/admin/disputes/:jobId/resolve`

🔒 Requires admin authentication

**Request Body:**
```json
{
  "resolution": "Refund issued to customer. Worker payment withheld.",
  "refundAmount": 250.00
}
```

---

### Admin Management

#### Create New Admin
**POST** `/admin/create-admin`

🔒 Requires admin authentication

**Request Body:**
```json
{
  "phone": "9999999998",
  "email": "admin2@helprx.com",
  "password": "admin123",
  "name": "Admin User"
}
```

---

## WebSocket Events (Future)

Real-time notifications will be implemented using WebSocket:
- Job status updates
- New job notifications for workers
- Payment confirmations
- Chat messages

---

## API Versioning

Current version: `v1`

Future versions will be accessible via:
- `/api/v2/...`

---

## Support

For API support:
- Email: api-support@helprx.com
- Documentation: http://localhost:5000/api/docs
- GitHub Issues: [repository-url]/issues

---

**Last Updated:** 2024-12-15  
**Total Endpoints:** 78

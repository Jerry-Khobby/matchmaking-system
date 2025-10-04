# 🎮 MatchMaking System

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)](https://github.com/Jerry-Khobby/matchmaking-system)

> A production-ready, intelligent matchmaking system that automatically pairs players based on skill level and region—just like Valorant, CS:GO, and League of Legends.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [User Endpoints](#user-endpoints)
  - [Queue Endpoints](#queue-endpoints)
  - [Matchmaking Endpoints](#matchmaking-endpoints)
  - [Match Endpoints](#match-endpoints)
- [Core Features](#core-features)
  - [Matchmaking Algorithm](#matchmaking-algorithm)
  - [ELO Rating System](#elo-rating-system)
  - [Security Features](#security-features)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**MatchMaking-System** is a backend matchmaking service that intelligently pairs players together for competitive gaming matches. The system runs continuously in the background, analyzing player queues every 10 seconds to create fair, balanced matches based on:

- **Skill Rating (ELO)** - Players are matched with opponents near their skill level (±100 rating points)
- **Geographic Region** - Players are grouped by region to minimize latency
- **Wait Time** - The system becomes more lenient with matchmaking criteria after 30 seconds to prevent long waits
- **Game Mode** - Support for multiple game modes (1v1, 2v2, 5v5)

This isn't just a simple CRUD application—it's a real-world system design challenge involving algorithm development, background job scheduling, database transactions, and state management.

---

## ✨ Features

### Core Functionality
- ✅ **Automatic Matchmaking** - Background service runs every 10 seconds
- ✅ **Skill-Based Pairing** - ELO rating system ensures fair matches
- ✅ **Region Grouping** - Minimizes lag by matching players in the same region
- ✅ **Dynamic Tolerance** - Wait time affects matching strictness
- ✅ **Match Lifecycle Management** - Pending → Active → Finished
- ✅ **Rating Updates** - Automatic ELO calculation after match completion
- ✅ **Match History Tracking** - Complete record of all player matches

### Advanced Features
- 🔐 **Data Encryption** - Sensitive fields (region, status) are encrypted at rest
- 📊 **Queue Statistics** - Real-time monitoring of queue state
- ⚡ **Redis Caching** - Frequently accessed data is cached for performance
- 🔄 **Database Transactions** - ACID compliance for match creation
- 🛡️ **Input Validation** - Comprehensive validation on all endpoints
- 📍 **Region Validation** - ISO country code verification
- 📝 **Comprehensive Logging** - Detailed logs for debugging and monitoring

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client/Game                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      NestJS API Layer                        │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐   │
│  │   User     │ │   Queue    │ │   Match              │   │
│  │ Controller │ │ Controller │ │   Controller         │   │
│  └────────────┘ └────────────┘ └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐   │
│  │   User     │ │   Queue    │ │   Matchmaking        │   │
│  │  Service   │ │  Service   │ │   Service (Cron)     │   │
│  └────────────┘ └────────────┘ └──────────────────────┘   │
│                                  ▲                           │
│                                  │ Runs Every 10s           │
│                                  │                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Match Service                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐   │
│  │   Users    │ │   Queue    │ │   Matches            │   │
│  │ Collection │ │ Collection │ │   Collection         │   │
│  └────────────┘ └────────────┘ └──────────────────────┘   │
│                    MongoDB Database                          │
└─────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Players Join Queue** - Users call `/queue` endpoint to enter matchmaking
2. **Background Scan** - Every 10 seconds, the matchmaking service analyzes the queue
3. **Player Grouping** - Players are grouped by region and game mode
4. **Compatibility Check** - System checks rating difference and wait time
5. **Match Creation** - Compatible players are paired and removed from queue
6. **Match Lifecycle** - Matches progress through pending → active → finished states
7. **Rating Updates** - After match completion, player ratings are updated using ELO

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS** | Backend framework with TypeScript support |
| **MongoDB** | NoSQL database for flexible schema and aggregation |
| **Mongoose** | ODM for MongoDB with schema validation |
| **@nestjs/schedule** | Cron jobs for automatic matchmaking |
| **@nestjs/cache-manager** | Redis caching layer |
| **class-validator** | DTO validation |
| **class-transformer** | DTO transformation |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Redis** (optional, for caching) - [Download](https://redis.io/download)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Jerry-Khobby/matchmaking-system.git
cd matchmaking-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Application
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/matchmaking

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Encryption
ENCRYPTION_KEY=your-32-character-secret-key-here
ENCRYPTION_IV=your-16-character-iv-here

# Matchmaking Settings
MATCHMAKING_INTERVAL_SECONDS=10
RATING_TOLERANCE=100
WAIT_TIME_THRESHOLD_SECONDS=30
EXTENDED_RATING_TOLERANCE=200
```

4. **Generate encryption keys**

```bash
# Generate a random encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate a random IV
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Configuration

Update the MongoDB connection string in `src/app.module.ts`:

```typescript
MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/matchmaking')
```

### Running the Application

**Development mode with hot-reload:**

```bash
npm run start:dev
```

**Production mode:**

```bash
npm run build
npm run start:prod
```

**Debug mode:**

```bash
npm run start:debug
```

The API will be available at `http://localhost:3000`

---

## 📚 API Documentation

API follows **OpenAPI Specification (OAS) 3.0**

### Base URL

```
http://localhost:3000
```

---

## 👤 User Endpoints

### Create a New User

**POST** `/user`

Creates a new player account in the system.

**Request Body:**

```json
{
  "username": "PlayerOne",
  "region": "NA",
  "status": "idle",
  "rating": 1200
}
```

**Response (201 Created):**

```json
{
  "User": "User PlayerOne created successfully"
}
```

**Validations:**
- ✅ Username must be unique
- ✅ Region must be a valid ISO country code
- ✅ Rating defaults to 1200 if not provided
- ✅ Status defaults to "idle"

---

### Get User by ID

**GET** `/user/{id}`

Retrieves detailed information about a specific user.

**Parameters:**
- `id` (path, required) - User's MongoDB ObjectId

**Response (200 OK):**

```json
{
  "_id": "65a1b2c3d4e5f6789",
  "username": "PlayerOne",
  "rating": 1225,
  "region": "NA",
  "status": "idle",
  "matchHistory": ["match_id_1", "match_id_2"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:45:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - User does not exist

---

## 🎯 Queue Endpoints

### Add User to Queue

**POST** `/queue`

Adds a player to the matchmaking queue.

**Request Body:**

```json
{
  "userId": "65a1b2c3d4e5f6789",
  "mode": "1v1"
}
```

**Response (200 OK):**

```json
{
  "Queue": "User added to queue successfully"
}
```

**What Happens:**
1. User status changes from "idle" → "searching"
2. Queue entry is created with user's current rating and region
3. Matchmaking service will check this user in next scan (≤10s)

**Validations:**
- ✅ User must exist
- ✅ User cannot be in queue twice
- ✅ User cannot join queue while in a match

**Error Responses:**
- `404 Not Found` - User does not exist
- `400 Bad Request` - User already in queue
- `400 Bad Request` - User is currently in a match

---

### Remove User from Queue

**POST** `/queue/leave`

Removes a player from the matchmaking queue.

**Request Body:**

```json
{
  "userId": "65a1b2c3d4e5f6789"
}
```

**Response (200 OK):**

```json
{
  "Queue": "User removed from queue successfully"
}
```

**What Happens:**
1. Queue entry is deleted
2. User status changes from "searching" → "idle"
3. User is no longer considered for matching

**Error Responses:**
- `404 Not Found` - User does not exist
- `400 Bad Request` - User not in queue

---

## 🤖 Matchmaking Endpoints

### Manually Trigger Matchmaking Scan

**POST** `/matchmaking/trigger`

Manually triggers the matchmaking algorithm (useful for testing).

**Response (200 OK):**

```json
{
  "message": "Matchmaking scan completed"
}
```

**What Happens:**
- Runs the same logic as the automatic 10-second cron job
- Scans all players in queue
- Creates matches for compatible players

**Use Cases:**
- Testing matchmaking logic
- Forcing a scan without waiting 10 seconds
- Debugging queue issues

---

### Get Current Queue Statistics

**GET** `/matchmaking/queue-stats`

Returns real-time statistics about the queue state.

**Response (200 OK):**

```json
[
  {
    "_id": {
      "region": "NA",
      "mode": "1v1"
    },
    "count": 5,
    "avgRating": 1230,
    "oldestJoinTime": "2024-01-15T10:28:00.000Z"
  },
  {
    "_id": {
      "region": "EU",
      "mode": "1v1"
    },
    "count": 3,
    "avgRating": 1450,
    "oldestJoinTime": "2024-01-15T10:29:15.000Z"
  }
]
```

**Use Cases:**
- Monitoring queue health
- Admin dashboards
- Debugging matchmaking issues
- Analyzing player distribution

---

## 🎮 Match Endpoints

### Get All Matches with Pagination

**GET** `/matches?page=1&limit=10`

Retrieves a paginated list of all matches in the system.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Response (200 OK):**

```json
{
  "matches": [
    {
      "_id": "match123",
      "status": "finished",
      "mode": "1v1",
      "players": [
        {
          "userId": "user1",
          "username": "PlayerOne",
          "rating": 1200
        },
        {
          "userId": "user2",
          "username": "PlayerTwo",
          "rating": 1250
        }
      ],
      "winner": "user1",
      "result": {
        "winnerRating": 1225,
        "loserRating": 1235,
        "ratingChange": 25
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 15
  }
}
```

---

### Get a Specific Match by ID

**GET** `/matches/{id}`

Retrieves detailed information about a single match.

**Parameters:**
- `id` (path, required) - Match's MongoDB ObjectId

**Response (200 OK):**

```json
{
  "_id": "match123",
  "status": "active",
  "mode": "1v1",
  "players": [
    {
      "userId": "user1",
      "username": "PlayerOne",
      "rating": 1200
    },
    {
      "userId": "user2",
      "username": "PlayerTwo",
      "rating": 1250
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "startedAt": "2024-01-15T10:30:15.000Z"
}
```

**Error Responses:**
- `404 Not Found` - Match does not exist

---

### Get All Active Matches

**GET** `/matches/active/all`

Retrieves all matches currently being played.

**Response (200 OK):**

```json
[
  {
    "_id": "match123",
    "status": "active",
    "mode": "1v1",
    "players": [...],
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "match456",
    "status": "active",
    "mode": "2v2",
    "players": [...],
    "createdAt": "2024-01-15T10:31:00.000Z"
  }
]
```

**Use Cases:**
- Admin monitoring
- Spectator systems
- Server health checks

---

### Get a User's Match History

**GET** `/matches/history/{userId}?limit=10`

Retrieves the match history for a specific player.

**Parameters:**
- `userId` (path, required) - User's MongoDB ObjectId
- `limit` (query, optional, default: 10) - Number of recent matches

**Response (200 OK):**

```json
[
  {
    "_id": "match123",
    "status": "finished",
    "mode": "1v1",
    "players": [...],
    "winner": "user1",
    "result": {
      "winnerRating": 1225,
      "loserRating": 1235,
      "ratingChange": 25
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `404 Not Found` - User does not exist

---

### Start a Match

**POST** `/matches/{id}/start`

Changes a match status from "pending" to "active".

**Parameters:**
- `id` (path, required) - Match's MongoDB ObjectId

**Response (200 OK):**

```json
{
  "message": "Match started successfully",
  "matchId": "match123",
  "status": "active"
}
```

**What Happens:**
1. Match status changes to "active"
2. `startedAt` timestamp is recorded
3. (Future) Players are notified via WebSocket

**Error Responses:**
- `404 Not Found` - Match does not exist
- `400 Bad Request` - Match is not in "pending" status

---

### Finish a Match and Update Ratings

**POST** `/matches/{id}/finish`

Ends a match, determines the winner, and updates player ratings using ELO.

**Parameters:**
- `id` (path, required) - Match's MongoDB ObjectId

**Request Body:**

```json
{
  "winnerId": "user1",
  "loserId": "user2"
}
```

**Response (200 OK):**

```json
{
  "message": "Match finished successfully",
  "matchId": "match123",
  "winner": {
    "userId": "user1",
    "oldRating": 1200,
    "newRating": 1225,
    "change": 25
  },
  "loser": {
    "userId": "user2",
    "oldRating": 1250,
    "newRating": 1235,
    "change": -15
  }
}
```

**What Happens (Atomically):**
1. Match status changes to "finished"
2. Winner is recorded
3. ELO ratings are calculated
4. Both player ratings are updated in database
5. Both player statuses change to "idle"
6. Match result is saved

**Error Responses:**
- `404 Not Found` - Match or players do not exist
- `400 Bad Request` - Match already finished
- `400 Bad Request` - Invalid player IDs for this match

---

### Cancel a Match

**POST** `/matches/{id}/cancel`

Cancels a match that hasn't finished (admin action or error recovery).

**Parameters:**
- `id` (path, required) - Match's MongoDB ObjectId

**Response (200 OK):**

```json
{
  "message": "Match cancelled successfully",
  "matchId": "match123"
}
```

**What Happens (Atomically):**
1. Match status changes to "cancelled"
2. All player statuses change back to "idle"
3. No rating changes occur

**Error Responses:**
- `404 Not Found` - Match does not exist
- `400 Bad Request` - Cannot cancel finished match

---

## 🧠 Core Features

### Matchmaking Algorithm

The system uses an intelligent pairing algorithm that runs every 10 seconds:

**Algorithm Steps:**

1. **Fetch Queue Data**
   - Get all players waiting for a specific game mode
   - Group by region (NA, EU, ASIA, etc.)
   - Sort by join time (FIFO)

2. **Region Processing**
   - For each region, check if at least 2 players are waiting
   - Skip regions with insufficient players

3. **Player Pairing**
   - Loop through players in order
   - For each player, find a compatible opponent

4. **Compatibility Criteria**
   ```
   ✅ Same region
   ✅ Rating difference ≤ 100 points (first 30 seconds)
   ✅ Rating difference ≤ 200 points (after 30 seconds)
   ✅ Not already matched in this cycle
   ```

5. **Match Creation**
   - Create match document (status: "pending")
   - Remove both players from queue
   - Update player statuses to "in_match"
   - Add match to player history

6. **Transaction Safety**
   - All operations use MongoDB transactions
   - If any step fails, everything rolls back

**Example:**

```
Queue State:
Region NA:
  - Alice (1200, waiting 15s)
  - Bob (1250, waiting 10s)
  - Charlie (1500, waiting 5s)

Matchmaking Scan:
✅ Alice vs Bob: Rating diff = 50 ≤ 100 → MATCH CREATED
❌ Charlie: No compatible opponent, continues waiting
```

---

### ELO Rating System

Player ratings are updated after each match using the ELO algorithm:

**Formula:**

```
New Rating = Old Rating + K × (Actual Score - Expected Score)

Where:
- K = 32 (K-factor, determines rating volatility)
- Actual Score = 1 for winner, 0 for loser
- Expected Score = 1 / (1 + 10^((opponent rating - player rating) / 400))
```

**Example Calculation:**

```
Player A: 1200
Player B: 1300

Expected Score for A = 1 / (1 + 10^((1300-1200)/400)) = 0.36
Expected Score for B = 1 / (1 + 10^((1200-1300)/400)) = 0.64

If A wins:
A's change = 32 × (1 - 0.36) = +20.5 → 1221
B's change = 32 × (0 - 0.64) = -20.5 → 1279

If B wins:
A's change = 32 × (0 - 0.36) = -11.5 → 1188
B's change = 32 × (1 - 0.64) = +11.5 → 1311
```

**Key Properties:**
- Upset victories earn more points
- Losing to lower-rated players costs more points
- Rating changes are zero-sum (winner gain = loser loss)

---

### Security Features

#### 1. Data Encryption

Sensitive fields are encrypted using AES-256:

```typescript
// Fields that are encrypted:
- user.region
- user.status
```

#### 2. Region Validation

ISO country code validation ensures data integrity:

```typescript
// Valid regions: NA, EU, ASIA, SA, ME, OCE, etc.
```

#### 3. Input Validation

All DTOs use class-validator decorators:

```typescript
@IsString()
@IsNotEmpty()
username: string;

@IsNumber()
@Min(0)
@Max(5000)
rating: number;
```

#### 4. Status Guards

Prevents invalid state transitions:

```typescript
// Cannot join queue while in a match
// Cannot start a finished match
// Cannot finish a pending match
```

---

## 💾 Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  username: string (unique, indexed),
  rating: number (default: 1200),
  region: string (encrypted),
  status: string (encrypted: "idle" | "searching" | "in_match"),
  matchHistory: ObjectId[],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
username: 1 (unique)
region: 1, rating: 1
```

---

### Queue Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  username: string (denormalized),
  rating: number (denormalized),
  region: string,
  status: "searching",
  mode: string ("1v1" | "2v2" | "5v5"),
  joinedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
userId: 1 (unique)
region: 1, mode: 1, joinedAt: 1
```

---

### Matches Collection

```typescript
{
  _id: ObjectId,
  status: string ("pending" | "active" | "finished" | "cancelled"),
  mode: string ("1v1" | "2v2" | "5v5"),
  players: [{
    userId: ObjectId,
    username: string,
    rating: number,
    team: string (optional)
  }],
  winner: ObjectId (optional),
  result: {
    winnerRating: number,
    loserRating: number,
    ratingChange: number
  } (optional),
  createdAt: Date,
  startedAt: Date (optional),
  finishedAt: Date (optional),
  updatedAt: Date
}
```

**Indexes:**
```javascript
status: 1
players.userId: 1
createdAt: -1
```

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Manual Testing with cURL

**Complete Test Flow:**

```bash
# 1. Create two users
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"username":"Alice","region":"NA","status":"idle"}'

curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"username":"Bob","region":"NA","status":"idle"}'

# 2. Both join queue
curl -X POST http://localhost:3000/queue \
  -H "Content-Type: application/json" \
  -d '{"userId":"ALICE_ID","mode":"1v1"}'

curl -X POST http://localhost:3000/queue \
  -H "Content-Type: application/json" \
  -d '{"userId":"BOB_ID","mode":"1v1"}'

# 3. Trigger matchmaking (or wait 10 seconds)
curl -X POST http://localhost:3000/matchmaking/trigger

# 4. Check if match was created
curl http://localhost:3000/matches

# 5. Start the match
curl -X POST http://localhost:3000/matches/MATCH_ID/start

# 6. Finish the match (Alice wins)
curl -X POST http://localhost:3000/matches/MATCH_ID/finish \
  -H "Content-Type: application/json" \
  -d '{"winnerId":"ALICE_ID","loserId":"BOB_ID"}'

# 7. Verify rating changes
curl http://localhost:3000/user/ALICE_ID
curl http://localhost:3000/user/BOB_ID
```

---

## 📁 Project Structure

```
matchmaking-system/
├── src/
│   ├── app.module.ts                 # Root module
│   ├── main.ts                       # Application entry point
│   │
│   ├── user/
│   │   ├── user.controller.ts        # User API endpoints
│   │   ├── user.service.ts           # User business logic
│   │   └── dto/
│   │       └── create-user.dto.ts    # User DTO
│   │
│   ├── queue/
│   │   ├── queue.controller.ts       # Queue API endpoints
│   │   ├── queue.service.ts          # Queue business logic
│   │   └── dto/
│   │       ├── queue.dto.ts          # Queue DTO
│   │       └── leave-queue.dto.ts    # Leave queue DTO
│   │
│   ├── matchmaking/
│   │   ├── matchmaking.controller.ts # Matchmaking endpoints
│   │   └── matchmaking.service.ts    # Matchmaking algorithm
│   │
│   ├── match/
│   │   ├── match.controller.ts       # Match API endpoints
│   │   └── match.service.ts          # Match lifecycle logic
│   │
│   ├── schema/
│   │   ├── user.schema.ts            # User Mongoose schema
│   │   ├── queue.schema.ts           # Queue Mongoose schema
│   │   └── match.schema.ts           # Match Mongoose schema
│   │
│   └── middlewares/
│       ├── encryption/
│       │   └── encrypt.ts            # Encryption utilities
│       └── regions/
│           └── region.validation.ts  # Region validation
│
├── test/                             # Test files
├── .env                              # Environment variables
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Jerry-Khobby](https://github.com/Jerry-Khobby)
- LinkedIn: [Jeremiah Coblah Anku](https://www.linkedin.com/in/jeremiah-coblah-anku-2b3732229/)
- Email: jeremiah.anku.coblah@gmail.com

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- MongoDB for the flexible database
- Chess ELO system for the rating algorithm
- Competitive gaming industry for inspiration

---

## 📞 Support

For questions, issues, or feature requests:

- 📧 Email: support@yourdomain.com
- 🐛 Issues: [GitHub Issues](https://github.com/Jerry-Khobby/matchmaking-system/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Jerry-Khobby/matchmaking-system/discussions)

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Matchmaking not running automatically

**Symptoms:** Players stay in queue indefinitely, no matches created

**Solutions:**
1. Check if `@nestjs/schedule` is installed:
   ```bash
   npm install @nestjs/schedule
   ```
2. Verify `ScheduleModule.forRoot()` is in `app.module.ts`
3. Check server logs for cron job execution
4. Manually trigger: `POST /matchmaking/trigger` to test

---

#### Issue: MongoDB connection failed

**Symptoms:** App crashes on startup with connection error

**Solutions:**
1. Ensure MongoDB is running:
   ```bash
   # Check MongoDB status
   mongosh
   ```
2. Verify connection string in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/matchmaking
   ```
3. Check MongoDB port is not in use
4. Ensure MongoDB user has correct permissions

---

#### Issue: Players matched across different regions

**Symptoms:** High latency matches

**Solutions:**
1. Check queue aggregation pipeline groups by region
2. Verify region data is not corrupted
3. Check encryption/decryption of region field
4. Review `arePlayersCompatible()` method

---

#### Issue: Rating changes seem incorrect

**Symptoms:** Winner loses points or unrealistic rating swings

**Solutions:**
1. Verify ELO calculation in `calculateELO()` method
2. Check K-factor value (should be 32)
3. Ensure winner/loser IDs are passed correctly
4. Review transaction logic in `finishMatch()`

---

#### Issue: Players stuck in "searching" status

**Symptoms:** User status never changes back to "idle"

**Solutions:**
1. Check transaction rollback logic
2. Verify queue cleanup on match creation
3. Manually update user status in MongoDB:
   ```javascript
   db.users.updateOne(
     { username: "PlayerName" },
     { $set: { status: encrypt("idle") } }
   )
   ```
4. Check for failed match creation transactions

---

#### Issue: Encryption errors

**Symptoms:** "Bad decrypt" or encryption-related errors

**Solutions:**
1. Verify `ENCRYPTION_KEY` and `ENCRYPTION_IV` in `.env`
2. Ensure keys are correct length:
   - Key: 32 bytes (64 hex characters)
   - IV: 16 bytes (32 hex characters)
3. Regenerate keys if corrupted:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```
4. Check if existing encrypted data matches current keys

---

## 📊 Monitoring & Logging

### Log Levels

The application uses NestJS Logger with the following levels:

```typescript
- log: General information
- debug: Detailed debugging info
- warn: Warning messages
- error: Error messages
```

### Important Logs to Monitor

**Matchmaking Activity:**
```
🔍 Starting matchmaking scan...
📍 Region NA: 4 players waiting
✅ MATCH FOUND: Alice (1200) vs Bob (1250)
🎮 Match created: 65a1b2c3d4e5f6789
```

**Error Indicators:**
```
❌ Matchmaking error: [error details]
❌ Failed to create match: [error details]
⚠️ PlayerOne has been waiting for 62s in NA
```

### Health Check Endpoint

Monitor system health:

```bash
# Check queue statistics
curl http://localhost:3000/matchmaking/queue-stats

# Check active matches
curl http://localhost:3000/matches/active/all
```

---

## 🚀 Deployment

### Docker Deployment

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/matchmaking
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  mongo-data:
```

**Run with Docker:**

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

### Production Deployment (PM2)

**Install PM2:**

```bash
npm install -g pm2
```

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [{
    name: 'matchmaking-system',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

**Deploy:**

```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs matchmaking-system

# Restart
pm2 restart matchmaking-system

# Stop
pm2 stop matchmaking-system
```

---

### Environment Variables for Production

**Production .env:**

```env
# Application
NODE_ENV=production
PORT=3000

# MongoDB (Use MongoDB Atlas for production)
MONGODB_URI=mongodb://mongo:27017/matchmaking

# Redis (Use Redis Cloud for production)
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Encryption (Generate new keys for production)
ENCRYPTION_KEY=production-32-char-secret-key
ENCRYPTION_IV=production-16-char-iv

# Matchmaking
MATCHMAKING_INTERVAL_SECONDS=10
RATING_TOLERANCE=100
WAIT_TIME_THRESHOLD_SECONDS=30
EXTENDED_RATING_TOLERANCE=200

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=warn
```

---

## 📈 Performance Optimization Tips

### 1. Database Indexing

Ensure proper indexes are created:

```javascript
// MongoDB shell
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ region: 1, rating: 1 })
db.queues.createIndex({ userId: 1 }, { unique: true })
db.queues.createIndex({ region: 1, mode: 1, joinedAt: 1 })
db.matches.createIndex({ status: 1 })
db.matches.createIndex({ 'players.userId': 1 })
db.matches.createIndex({ createdAt: -1 })
```

### 2. Connection Pooling

Configure MongoDB connection pool:

```typescript
MongooseModule.forRoot(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```

### 3. Caching Strategy

Implement Redis caching for hot data:

```typescript
// Cache user data for 1 hour
await this.cacheManager.set(`user:${username}`, userData, 3600);

// Cache queue stats for 30 seconds
await this.cacheManager.set('queue:stats', stats, 30);
```

### 4. Query Optimization

Use MongoDB aggregation instead of multiple queries:

```typescript
// ✅ Good: Single aggregation query
const result = await this.queueModel.aggregate([
  { $match: { mode: '1v1' } },
  { $sort: { joinedAt: 1 } },
  { $group: { _id: '$region', players: { $push: '$ROOT' } } }
]);

// ❌ Bad: Multiple queries
const allPlayers = await this.queueModel.find({ mode: '1v1' });
// Then group in JavaScript
```

### 5. Denormalization

Store frequently accessed data directly in documents:

```typescript
// Queue stores username and rating (denormalized)
// Avoids JOIN during high-frequency matchmaking scans
```

---

## 🔐 Security Best Practices

### 1. Environment Variables

Never commit `.env` files:

```bash
# .gitignore
.env
.env.local
.env.production
```

### 2. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// Install: npm install @nestjs/throttler

import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10, // 10 requests per minute
})
```

### 3. Input Sanitization

Use class-validator for all DTOs:

```typescript
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(['NA', 'EU', 'ASIA', 'SA', 'ME', 'OCE'])
  region: string;
}
```

### 4. CORS Configuration

Configure CORS for production:

```typescript
// main.ts
app.enableCors({
  origin: ['https://yourdomain.com'],
  methods: ['GET', 'POST'],
  credentials: true,
});
```

### 5. Helmet Security Headers

Add security headers:

```bash
npm install helmet
```

```typescript
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

---

## 🎓 Learning Resources

### Understanding the Algorithm

- [ELO Rating System Wikipedia](https://en.wikipedia.org/wiki/Elo_rating_system)
- [Matchmaking Algorithms in Games](https://www.gamedeveloper.com/programming/matchmaking-algorithms)
- [MongoDB Aggregation Tutorial](https://www.mongodb.com/docs/manual/aggregation/)

### NestJS Resources

- [Official NestJS Documentation](https://docs.nestjs.com)
- [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)
- [NestJS MongoDB Integration](https://docs.nestjs.com/techniques/mongodb)

### System Design

- [Designing Data-Intensive Applications](https://dataintensive.net/)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Database Transactions Explained](https://www.mongodb.com/docs/manual/core/transactions/)

---

## 🎯 Roadmap

### Version 1.0 (Current)
- ✅ Basic matchmaking algorithm
- ✅ ELO rating system
- ✅ Queue management
- ✅ Match lifecycle
- ✅ Data encryption
- ✅ Region validation

### Version 1.1 (Planned)
- 🔲 WebSocket real-time notifications
- 🔲 Team-based matchmaking (2v2, 5v5)
- 🔲 Advanced team balancing algorithm
- 🔲 Match replay/history viewer

### Version 2.0 (Future)
- 🔲 Regional fallback matching
- 🔲 Priority queue for VIP users
- 🔲 Anti-cheat detection
- 🔲 Match quality scoring
- 🔲 Seasonal rankings
- 🔲 Tournament bracket system

---

## 📝 Changelog

### [1.0.0] - 2024-01-15

**Added**
- Initial release
- Core matchmaking algorithm
- User management system
- Queue management system
- Match lifecycle management
- ELO rating calculation
- Data encryption
- Region validation
- Automated background matching (10s interval)
- MongoDB transactions for atomicity
- Redis caching layer

---

## ❓ FAQ

**Q: How often does matchmaking run?**  
A: Every 10 seconds automatically via a cron job.

**Q: What happens if only 1 player is in queue?**  
A: They wait until another compatible player joins.

**Q: Can players from different regions match?**  
A: No, players are only matched within the same region to minimize lag.

**Q: How is skill determined?**  
A: Using ELO rating starting at 1200, updated after each match.

**Q: What if matchmaking creates a match but one player disconnects?**  
A: Use `POST /matches/:id/cancel` to cancel the match and reset player states.

**Q: Can I adjust the rating tolerance?**  
A: Yes, modify `RATING_TOLERANCE` in `.env` (default: 100 points).

**Q: How do I add support for team modes (2v2, 5v5)?**  
A: Extend the `find1v1Matches()` logic in `matchmaking.service.ts` to handle team pairing and balancing.

**Q: Is there a limit to how many players can queue?**  
A: No hard limit, but monitor MongoDB performance with high concurrency.

**Q: How do I reset all ratings?**  
A: Run a MongoDB script:
```javascript
db.users.updateMany({}, { $set: { rating: 1200 } })
```

---

## 🌟 Show Your Support

If this project helped you, please give it a ⭐️ on GitHub!

Share with other developers who might find it useful:
- Tweet about it with #NestJS #Matchmaking
- Write a blog post about your implementation
- Create a video tutorial

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## 🔗 Related Projects

- [NestJS Starter](https://github.com/nestjs/nest)
- [MongoDB Examples](https://github.com/mongodb/docs-realm)
- [Game Server Examples](https://github.com/topics/game-server)

---

**Built with ❤️ using NestJS and MongoDB**

*Last updated: 4th October 2025*

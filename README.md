🚀 URL Shortener – Scalable Backend System
  A production-style URL shortening service built with Node.js, PostgreSQL, and Redis, designed with scalability, performance, and system design principles in mind.

🧠 Overview
  This project demonstrates how to design a read-heavy backend system similar to services like TinyURL or Bitly.

It focuses on:
  efficient URL mapping
  low-latency redirects
  handling concurrent requests
  optimizing database load using caching
🏗️ Architecture
  Client
     ↓
  API Layer (Express)
     ↓
  Service Layer
     ↓
  Cache (Redis) → Database (PostgreSQL)
⚙️ Features
  🔗 URL Shortening
      Generates unique short codes using Base62 encoding
  Ensures idempotency (same URL → same short link)
    ⚡ Fast Redirects
  Cache-first lookup using Redis
    Falls back to DB on cache miss
  🧠 Caching Strategy
    Cache-aside pattern (GET requests)
  Write-through caching (POST requests)
    TTL-based expiration (1 hour)
 🚦 Rate Limiting
    Implemented using Redis
    Prevents abuse by limiting requests per IP
 🛡️ Concurrency Handling
    Uses DB-level uniqueness constraints
    Handles race conditions with ON CONFLICT
🧩 Tech Stack
  Backend: Node.js, Express
  Database: PostgreSQL (Neon)
  Cache: Redis (Upstash)
  Language: JavaScript
📁 Project Structure
  src/
    config/        # DB & Redis connections
    controllers/   # API handlers
    routes/        # Route definitions
    services/      # Business logic
    utils/         # Helpers (rate limiter, etc.)
  
  app.js           # Express app setup
  server.js        # Server entry point
🔄 API Endpoints
  ➤ Create Short URL
      POST /api/url/shorten
      
      Body:      
      {
        "url": "https://example.com"
      }
  ➤ Redirect to Original URL
      GET /api/url/:code
⚡ Performance Optimizations
  Reduced DB reads using Redis caching
  Fast O(1) lookups for redirects
  Connection pooling for database
📊 Scalability Considerations
  Potential Bottlenecks
  Database under high read load
  cache eviction strategy
Improvements (Future Work)
  Redis LRU eviction tuning
  DB read replicas
  distributed ID generation (e.g., Snowflake)
  analytics (click tracking)
⚖️ Design Tradeoffs
  Decision	Reason
  Base62 encoding	compact and URL-friendly
  TTL caching	balances freshness vs performance
  Write-through caching	ensures cache consistency
  DB constraints	ensures uniqueness under concurrency
❗ Failure Handling
  Redis failure → fallback to DB
  Duplicate requests → handled via DB constraints
  Cache misses → auto-repopulate
🛠️ Setup & Run
  1. Clone repo
    git clone <repo-url>
    cd <project>
  2. Install dependencies
    npm install
  3. Setup environment variables
    Create .env file:
    DATABASE_URL=
    REDIS_URL=
    REDIS_TOKEN=
    SHORT_URL=http://localhost:3000
  4. Run server
    npm start
🧠 Key Learnings
  Designing cache-first systems
  Handling race conditions in distributed systems
  Optimizing read-heavy workloads
  Understanding tradeoffs in system design

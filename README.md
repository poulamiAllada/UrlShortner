# 🚀 URL Shortener — Scalable Backend System

A production-style URL shortening service built with **Node.js**, **PostgreSQL**, and **Redis**, designed with scalability, performance, and system design principles in mind.

---

## 🧠 Overview

This project demonstrates how to design a read-heavy backend system similar to TinyURL or Bitly. It focuses on:
- Efficient URL mapping with Base62 encoding
- Low-latency redirects via Redis caching
- Handling concurrent requests with atomic DB operations
- Resilient architecture where Redis failures never break core functionality

---

## 🏗️ Architecture

```
Client
  ↓
API Layer (Express)
  ↓
Controller (validation + rate limiting)
  ↓
Service Layer (business logic)
  ↓
Cache (Redis) → Database (PostgreSQL)
```

---

## ⚙️ Features

- 🔗 **URL Shortening** — Base62 encoding over auto-incremented IDs (same approach as TinyURL)
- ✅ **Idempotency** — same long URL always returns the same short code (atomic upsert)
- ⚡ **Fast Redirects** — cache-first lookup via Redis, falls back to PostgreSQL on miss
- 🧠 **Caching Strategy** — cache-aside (GET) + write-through (POST) with 1hr TTL
- 🚦 **Rate Limiting** — Redis-based, 100 req/min per IP, fails open if Redis is down
- 🛡️ **Input Validation** — rejects missing, malformed, or oversized URLs (>2048 chars)
- 🔁 **302 Redirects** — explicit temporary redirect to preserve future analytics capability
- 💥 **Centralized Error Handling** — single Express error middleware, no unhandled rejections
- 🩺 **Health Check** — `GET /health` endpoint for load balancer probes
- 🧪 **Tests** — unit tests (Base62) + integration tests (all routes) with mocked dependencies

---

## 🧩 Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Backend     | Node.js, Express 5          |
| Database    | PostgreSQL (Neon for prod)  |
| Cache       | Redis (Upstash for prod)    |
| Testing     | Jest, Supertest             |

---

## 📁 Project Structure

```
src/
  config/         # DB (pg Pool) & Redis connections
  controllers/    # HTTP handlers — validation, rate limiting, error forwarding
  routes/         # Route definitions
  services/       # Business logic — URL creation, lookup, Base62 encoding
  utils/          # Rate limiter
  tests/          # Unit + integration tests

app.js            # Express setup, middleware, error handler
server.js         # Entry point — dotenv loaded here first
```

---

## 🔄 API Endpoints

### `POST /api/url/shorten`
Create a short URL.

**Request body:**
```json
{ "url": "https://example.com/some/very/long/path" }
```

**Response `201`:**
```json
{ "shortUrl": "http://localhost:3000/api/url/2Bi0j" }
```

**Errors:** `400` (missing/invalid URL), `429` (rate limited), `500` (server error)

---

### `GET /api/url/:code`
Redirect to the original URL.

**Response:** `302` redirect to original URL

**Errors:** `404` (code not found), `500` (server error)

---

### `GET /health`
Health check for load balancers and uptime monitors.

**Response `200`:**
```json
{ "status": "ok", "timestamp": "2026-04-22T10:00:00.000Z" }
```

---

## 🛠️ Setup & Run

```bash
git clone <repo-url>
cd urlshortner
npm install

# Create .env from the example
cp .env.example .env
# Fill in your DATABASE_URL, REDIS_URL, REDIS_TOKEN, SHORT_URL, PORT

npm start
```

### Run tests
```bash
npm test
```

---

## ⚡ Performance Design

| Technique            | Impact                                      |
|----------------------|---------------------------------------------|
| Redis cache-aside    | ~1ms redirect vs ~10ms DB query             |
| Write-through cache  | Cache is warm immediately after creation    |
| Connection pooling   | Reuses up to 10 DB connections (no overhead per request) |
| Atomic upsert        | 1 DB round-trip for create vs. the previous 2–3 |

---

## 📊 Scalability Considerations

**Current bottlenecks:**
- Single DB writer (scale with read replicas for GET-heavy load)
- Redis single node (scale with Redis Cluster)

**Future improvements:**
- Redis LRU eviction tuning (`maxmemory-policy allkeys-lru`)
- DB read replicas for redirect queries
- Distributed ID generation (Snowflake IDs) to avoid sequential ID guessing
- Click analytics (count, referrer, geo, device)
- Custom short codes / vanity URLs
- URL expiry (per-URL TTL)

---

## ⚖️ Design Tradeoffs

| Decision | Reason |
|---|---|
| Base62 over UUID | Shorter, URL-safe codes |
| 302 over 301 | Preserves analytics; 301 is cached by browsers permanently |
| Fail-open rate limiter | Redis outage should not take down the service |
| Atomic upsert (DO UPDATE) | Prevents corrupted rows from a crash between INSERT and UPDATE |
| TTL caching | Balances freshness vs. DB load |

---

## 🧠 Key Learnings

- Designing cache-first systems with graceful Redis fallback
- Preventing race conditions with atomic DB upserts
- Why 302 vs 301 matters for read-heavy redirect services
- Input validation as the first line of defence in API design
- Centralized error handling to prevent unhandled promise rejections

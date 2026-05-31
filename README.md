# 💰 CheckSalary

**Сервис для поиска и сравнения зарплат программистов по городам и технологиям 
с интерактивной картой и AI-нормализацией данных.**

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-MassTransit-FF6600?logo=rabbitmq)](https://www.rabbitmq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 One-Line Pitch

> Find out what developers really earn — submit anonymously, search by location and tech stack, and explore salary data on an interactive map.

---

## ✨ Features

- 🔍 **Geo-Spatial Search** — "Show C# salaries within 50km of Berlin" using PostGIS
- 🤖 **AI Stack Normalization** — C-Sharp → C#, JS → JavaScript via Ollama LLM
- 📡 **Event-Driven Architecture** — Salary submission fires events via RabbitMQ + MassTransit
- ⚡ **Redis Caching** — Pre-calculated city averages with Circuit Breaker resilience
- 🗺️ **Interactive Map** — Leaflet map with radius visualization and result markers
- 📊 **Dashboard** — Charts showing top cities, stack distribution, and submission stats
- 🛡️ **Rate Limiting** — 5 submissions/minute with 429 responses
- 🏥 **Health Checks** — Monitor PostgreSQL, Redis, RabbitMQ, and circuit status
- 🌓 **Dark Theme** — Modern dark UI with Tailwind CSS

---

## 🏗️ Architecture

**Clean Architecture Modular Monolith** with 4 layers and event-driven module communication.

\`\`\`
Presentation (React)
  → API (Controllers)
    → Application (Services)
      → Domain (Entities)
        ↓
Infrastructure (EF Core, Redis, RabbitMQ, AI)
\`\`\`

### Communication Flow

\`\`\`
User Submits Salary
  → POST /api/salary → saves to PostgreSQL
  → Publishes SalarySubmittedEvent to RabbitMQ
  → AnalyticsConsumer recalculates city average
  → Updates PostgreSQL + Redis cache
  → Search reads from Redis (instant) or PostgreSQL (fallback)
\`\`\`

---

## 🚀 Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.com/) (optional — for AI normalization)

### 1. Clone

\`\`\`bash
git clone https://github.com/artemqdh/CheckSalary.git
cd CheckSalary
\`\`\`

### 2. Start Infrastructure

\`\`\`bash
docker compose up -d
\`\`\`

Starts PostgreSQL (with PostGIS), Redis, RabbitMQ, and Jaeger.

### 3. Start Backend

\`\`\`bash
cd CheckSalary
dotnet run
\`\`\`

API runs at `http://localhost:5067`. Swagger at `http://localhost:5067/swagger`.

### 4. Start Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Open `http://localhost:5173`.

### 5. (Optional) Start Ollama for AI

\`\`\`bash
ollama pull llama3.2:1b
ollama serve
\`\`\`

The app works without Ollama — uncheck "Use AI" to use exact stack names.

---

## 📁 Project Structure

\`\`\`
CheckSalary/
├── CheckSalary.Domain/          # Entities, Interfaces, Domain Events
├── CheckSalary.Application/     # DTOs, Service Interfaces, Use Cases
├── CheckSalary.Infrastructure/  # EF Core, Redis, RabbitMQ, Ollama AI, GIS
├── CheckSalary.Api/             # Controllers, Middleware, Program.cs
├── CheckSalary.Tests/           # xUnit Unit Tests
├── frontend/                    # React + TypeScript + Tailwind + Leaflet
└── docker-compose.yml           # PostgreSQL, Redis, RabbitMQ, Jaeger
\`\`\`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/salary` | Submit anonymous salary |
| `POST` | `/api/salary/normalize` | Normalize stack name via AI |
| `GET` | `/api/geosearch/radius` | Search salaries within radius |
| `GET` | `/api/search/average` | Get cached average salary |
| `GET` | `/api/search/cities` | City autocomplete |
| `GET` | `/api/stats/overview` | Dashboard statistics |
| `GET` | `/api/stats/top-cities` | Top paying cities |
| `GET` | `/api/stats/top-stacks` | Top stacks distribution |
| `GET` | `/health` | System health check |

---

## 🧪 Tests

\`\`\`bash
dotnet test
\`\`\`

Unit tests for AnalyticsConsumer (average calculation logic) using xUnit + Moq + InMemory database.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Leaflet, Recharts |
| **Backend** | .NET 8, ASP.NET Core Web API |
| **Database** | PostgreSQL 16 + PostGIS (spatial queries) |
| **Cache** | Redis 7 with Polly Circuit Breaker |
| **Message Bus** | RabbitMQ + MassTransit |
| **AI** | Ollama (Llama 3.2 1B) with dictionary fallback |
| **Observability** | OpenTelemetry, Jaeger, Health Checks |
| **Infrastructure** | Docker, Docker Compose |

---

## 📄 License

MIT — feel free to use, modify, and share.

---

## 👤 Author

**Artem** — [github.com/artemqdh](https://github.com/artemqdh)

---

*Built as a student project demonstrating Clean Architecture, event-driven systems, spatial data, AI integration, and modern frontend development.*
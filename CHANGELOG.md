# Changelog

All notable changes to the CheckSalary project.

---

## v0.8.1 - 04.06.2026

### Added
- CHANGELOG.md with full project history

---

## v0.8.0 - 02.06.2026

### Added
- OpenTelemetry distributed tracing with Jaeger
- Project README with architecture documentation
- GitHub repository setup

---

## v0.7.0 - 31.05.2026

### Added
- Simple tests for Salary API
- Polly Circuit Breaker for Redis resilience (Отказоустойчивость)
- Health check endpoint showing circuit breaker status
- "Use AI" check in frontend
- Loading states and empty state handling for search

---

## v0.6.0 - 28.05.2026

### Added
- Interactive Leaflet map for search results
- Dashboard page with Recharts (bar chart + pie chart)
- Tab navigation (Submit / Search / Dashboard)
- City autocomplete endpoint and UI
- Improved Ollama prompt accuracy with temperature change

### Fixed
- CORS configuration for frontend-backend communication
- Frontend port mismatch (Rider and Visual Studio)

---

## v0.5.0 - ~21.05.2026

### Added
- AI stack normalization using Ollama (Llama 3.2 1B)
- Geo-spatial search with PostGIS ST_DWithin
- Distance calculation in search results
- Redis caching for city average salaries
- Rate limiting (5 requests/minute) on salary submission

---

## v0.4.0 - 18.05.2026 and 19.05.2026

### Added
- MassTransit + RabbitMQ event-driven architecture
- SalarySubmittedEvent published on submission
- AnalyticsConsumer recalculates city averages
- Health check endpoints (PostgreSQL, Redis, RabbitMQ)
- React frontend with Vite + TypeScript + Tailwind CSS
- Salary submission form

---

## v0.3.0 - 15.05.2026 and 16.05.2026

### Added
- First API endpoint: POST /api/salary
- Salary repository with Entity Framework Core
- SubmitSalaryRequest DTO
- PostgreSQL database with PostGIS extension
- Initial EF Core migration (SalaryEntries, CityAverages tables)

### Fixed
- Docker port conflict (PostgreSQL port 5432 → 5433)
- EF Core version error (9.0 → 8.0 for .NET 8)

---

## v0.2.0 - 11.05.2026

### Added
- Docker Compose file with PostgreSQL, Redis, RabbitMQ
- Clean Architecture folder structure
- Domain entities: SalaryEntry, CityAverage
- Domain event: SalarySubmittedEvent
- Repository interfaces (ISalaryRepository, IGeoSearchService)

---

## v0.1.0 - 06.05.2026

### Added
- Initial solution structure
- .NET 8 project
- Clean Architecture project references (Domain, Application, Infrastructure, Api)
- NuGet package dependencies

---

## v0.0.1 - 04.05.2026

### Added
- Project initialization
- Technology stack planning
- Modular Monolith architecture decision
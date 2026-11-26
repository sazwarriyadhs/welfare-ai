# WELFARE AI

## Animal Welfare Intelligence Platform

WELFARE AI is a modular intelligence platform for animal welfare,
livestock operations, farm monitoring, and evidence-based decision support.

The platform combines animal records, farm and land information,
welfare workflows, geospatial capabilities, IoT integration, and
drone telemetry in one operational workspace.

## Platform Architecture

| Layer | Technology |
|---|---|
| Web application | Next.js 16, React 19, TypeScript |
| Backend API | Go 1.25 |
| Database | PostgreSQL 17 |
| ORM / data access | Prisma 7, pgx |
| Cache and messaging infrastructure | Redis, MQTT |
| Drone integration | MAVLink, PX4 SITL, Gazebo |
| Mapping | Leaflet / React Leaflet |
| Internationalization | English, Bahasa Indonesia, Arabic |

## Core Modules

### 1. Animal Management
- Animal registry and identification
- Species, breed, sex, and status information
- Farm site association
- Animal data API integration

### 2. Farm & Land Intelligence
- Farm site overview
- Livestock distribution
- Farm and land information
- Geospatial capability foundation

### 3. Smart Livestock Intelligence
- Smart Ear Tag management foundation
- GPS tracking workspace
- Geofence management foundation
- Drone intelligence
- Herd intelligence

Note: GPS, ear-tag, and geofence pages provide the application
foundation. Live device telemetry requires connected field devices
and configured data sources.

### 4. Drone Intelligence
- MAVLink telemetry integration
- Drone status and position monitoring
- PX4 / Gazebo simulation integration
- Read-only telemetry visualization

Simulation telemetry must not be interpreted as actual livestock
monitoring data.

### 5. Welfare Operations
- Welfare inspections
- Incident management
- Corrective actions
- Evidence-oriented operational workflows

### 6. Analytics
- Operational analytics workspace
- Reporting and export API foundations

## Repository Structure

```text
WELFARE-AI/
├── apps/
│   └── web/                 # Next.js web application
│       ├── prisma/          # Prisma schema and migrations
│       └── src/
│           ├── app/         # Dashboard pages and API routes
│           ├── components/ # Shared UI components
│           ├── features/   # Feature-specific components
│           ├── i18n/       # Localization
│           └── lib/         # Shared libraries
├── infrastructure/
│   └── docker/
│       └── px4-gazebo/      # Drone simulation infrastructure
└── services/
    └── api/                 # Go API and SQL migrations
```

## Local Development

### Prerequisites

- Node.js and npm
- Go 1.25+
- Docker Desktop
- PostgreSQL 17
- Redis

### Web application

```powershell
cd apps/web
npm install
npm run dev
```

The development web server uses port `3000` by default.

### Go API

```powershell
cd services/api
go run ./cmd/server
```

The API uses `HTTP_ADDR` when configured. Its current default
development address is `127.0.0.1:8097`.

Configure `DATABASE_URL` in the API environment before starting it.

### Database

The application uses PostgreSQL. Configure the database connection
through the local environment files.

Do not commit `.env` files, passwords, tokens, or production credentials.

Review SQL migrations before applying them to any existing database.
Development seed data must not be treated as production farm data.

## Environment Configuration

Web application:
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`

Go API:
- `DATABASE_URL`
- `HTTP_ADDR`
- `MAVLINK_LISTEN_ADDR`

Use local `.env` files for development and a secure secrets manager
for production deployments.

## Development Status

WELFARE AI is under active development.

The repository contains working application foundations and selected
API integrations. Some modules are still being scaffolded and require
additional backend workflows, authentication, authorization,
device connectivity, and production validation.

In particular:

- Authentication and session management are not yet implemented.
- Multi-tenant identity tables exist, but user and membership
  provisioning remains pending.
- Smart Ear Tag and GPS telemetry require actual device integration.
- Geofence workflows require operational data integration.
- Drone simulation data is distinct from real field telemetry.
- AI decision support must remain human-verifiable.

## Security and Operational Principles

- Organisation-scoped data access
- Secure authentication and session management
- Least-privilege authorization
- Evidence-based welfare workflows
- Human oversight of AI-generated recommendations
- Separation of development, simulation, and production data
- Vendor-neutral integration where practical

## License

All rights reserved unless a separate license is provided.

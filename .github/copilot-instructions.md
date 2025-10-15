# OnSite360 Construction Management System

OnSite360 is a full-stack web application for construction project management. It consists of a React frontend with Vite and a NestJS backend using PostgreSQL with Prisma ORM.

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Initial Environment Setup
- Install Node.js v20+ from [nodejs.org](https://nodejs.org/) or use package manager:
  - Windows: Download from website or use `winget install OpenJS.NodeJS`
  - macOS: `brew install node`
  - Linux: `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`
- Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
- Verify installations: `node --version && npm --version && docker --version`

### Repository Setup and Build Process

**CRITICAL: Dependencies installation takes 2-3 minutes for each directory (backend/frontend). Build processes take 5-10 minutes. NEVER CANCEL these operations.**

#### 1. Environment Configuration
Create environment files from examples:
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your database URL: DATABASE_URL="postgresql://username:password@localhost:5432/onsite360_dev?schema=public"
```

```bash
# Frontend environment  
cd ../frontend
cp .env.example .env.local
# Default VITE_API_URL=http://localhost:3000/v1 should work for local development
```

#### 2. Database Setup
Start PostgreSQL using Docker (recommended for development):
```bash
docker run --name onsite360-postgres \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=onsite360_dev \
  -p 5432:5432 -d postgres:15
```

Wait for PostgreSQL to be ready:
```bash
sleep 10 && docker exec onsite360-postgres pg_isready -U testuser -d onsite360_dev
```

#### 3. Backend Setup
Install dependencies and setup database:
```bash
cd backend
npm install  # Takes 2-3 minutes. NEVER CANCEL.
npx prisma generate  # Generates TypeScript client from schema
npx prisma migrate dev --name init  # Runs database migrations
npx prisma db seed  # Optional: Seeds database with initial data
```

Start backend development server:
```bash
npm run start:dev  # Runs on http://localhost:3000 (note: port 3000, not 3001)
```

#### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install  # Takes 2-3 minutes. NEVER CANCEL.
npm run dev  # Runs on http://localhost:5173
```

**Build Time Expectations:**
- `npm install` (backend): 2-3 minutes. NEVER CANCEL. Set timeout to 300+ seconds.
- `npm install` (frontend): 1-2 minutes. NEVER CANCEL. Set timeout to 180+ seconds.
- `npm run build` (frontend): 8-10 seconds
- Backend compilation: 10-20 seconds in development mode

### Validation and Testing

#### Manual Validation Requirements
After making changes, ALWAYS perform these validation steps:

1. **Build Validation:**
   ```bash
   # Frontend build test
   cd frontend && npm run build  # Should complete in ~10 seconds
   
   # Backend compilation test (only works if Prisma client is generated)
   cd ../backend && npm run build
   ```

2. **Linting:**
   ```bash
   # Frontend linting (should pass)
   cd frontend && npm run lint
   
   # Backend linting (may have TypeScript errors if Prisma client not generated)
   cd ../backend && npm run lint
   ```

3. **Application Testing:**
   - Start both servers (backend on :3000, frontend on :5173)
   - Open `http://localhost:5173` in browser
   - Verify the application loads without console errors
   - Test basic functionality like navigation and API connectivity

#### Test Commands
```bash
# Frontend tests (if available)
cd frontend && npm test

# Backend tests (requires Prisma client to be generated)
cd backend && npm run test        # Unit tests
cd backend && npm run test:e2e    # Integration tests
```

**Note:** Backend tests will fail if Prisma client is not generated due to network restrictions in sandboxed environments.

### Docker Setup (Alternative)

If you prefer Docker for the full stack:
```bash
# Start with Docker Compose
docker compose up --build  # NEVER CANCEL. Takes 10-15 minutes for initial build.

# Stop services
docker compose down
```

**Docker Build Time:** Initial build takes 10-15 minutes. NEVER CANCEL. Set timeout to 1200+ seconds.

### Pre-commit Validation
Before committing changes, ALWAYS run:
```bash
# In frontend directory
npm run lint

# Format code if needed
npm run format  # (if available)
```

The backend may have linting errors due to Prisma dependency issues in restricted environments, but focus on functional validation instead.

## Troubleshooting Common Issues

### Prisma Issues
- **"Cannot find module '@prisma/client'"**: Run `npx prisma generate` in backend directory
- **Network errors during `prisma generate`**: Common in sandboxed environments. Use Docker approach or pre-built environments
- **Database connection errors**: Ensure PostgreSQL is running and DATABASE_URL is correct

### Port Conflicts
- Backend runs on port 3000 (not 3001 as some docs might suggest)
- Frontend runs on port 5173 (Vite default)
- PostgreSQL runs on port 5432

### Node.js Issues
- Use Node.js v20+ for best compatibility
- Clear npm cache if dependency issues: `npm cache clean --force`

## Key Project Structure

```
OnSite360/
├── backend/           # NestJS backend API
│   ├── src/
│   │   ├── auth/      # Authentication module
│   │   ├── users/     # User management
│   │   ├── projects/  # Project management
│   │   ├── documents/ # Document handling
│   │   ├── tasks/     # Task management
│   │   └── main.ts    # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── seed.ts        # Database seeding
│   │   └── migrations/    # Database migrations
│   └── package.json
├── frontend/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.tsx
│   └── package.json
├── docs/              # Documentation
├── docker-compose.yml # Docker services
└── run_dev.bat       # Windows development script
```

## API Documentation
- Backend API documentation available at `http://localhost:3000/debug` (Swagger UI)
- Health check endpoint: `http://localhost:3000/health`

## Database Management
- Use Prisma Studio for visual database management: `npx prisma studio`
- Database schema defined in `backend/prisma/schema.prisma`
- Comprehensive schema includes: Users, Projects, Tasks, Documents, RFIs, Materials, Attendance, etc.

## Development Workflow

### Daily Development Process
1. Pull latest changes: `git pull origin main`
2. Install any new dependencies: `npm install` (in both frontend and backend if needed)
3. Run database migrations if there are new ones: `npx prisma migrate dev`
4. Generate Prisma client if schema changed: `npx prisma generate`
5. Start both servers (frontend and backend)

### Making Changes
1. Make your code changes
2. Test locally by running the application
3. Run linting: `npm run lint`
4. Ensure builds succeed
5. Commit and push changes

## Common Tasks Reference

### Repository Root Files
Key files in root directory:
- `README.md` - Docker setup guide
- `docker-compose.yml` - Docker services configuration
- `run_dev.bat` - Windows development startup script
- `docs/` - Comprehensive documentation including setup guides

### Backend package.json Scripts
```json
{
  "build": "nest build",
  "start": "nest start", 
  "start:dev": "nest start --watch",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "seed": "prisma db seed",
  "prisma:generate": "prisma generate"
}
```

### Frontend package.json Scripts
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build", 
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Environment-Specific Notes

### Development
- Hot reload enabled for both frontend and backend
- Detailed error messages and logging
- Database migrations run automatically
- CORS configured for localhost:5173

### Network Restrictions
In sandboxed environments:
- Prisma binary downloads may fail due to network restrictions
- Use Docker approach or pre-configured environments
- Focus on frontend development if backend setup fails due to Prisma issues

## Need Help?

- Check the comprehensive documentation in `/docs` folder
- Review Prisma documentation at `docs/prisma.md`
- Backend uses Swagger API docs at `/debug` endpoint
- The architecture is documented in `docs/architecture.md`
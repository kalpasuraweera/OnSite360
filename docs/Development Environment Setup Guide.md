# Development Environment Setup Guide

This guide will walk you through setting up the OnSite360 development environment from scratch.

## Prerequisites

### Node.js Installation

Before starting, you need to install Node.js on your system.

#### Windows
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (recommended)
3. Run the installer and follow the prompts
4. Verify installation by opening Command Prompt and running:
   ```bash
   node --version
   npm --version
   ```

#### macOS
Using Homebrew (recommended):
```bash
brew install node
```

Or download from [nodejs.org](https://nodejs.org/)

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Git Installation
Make sure Git is installed on your system:
- **Windows**: Download from [git-scm.com](https://git-scm.com/)
- **macOS**: `brew install git` or use Xcode Command Line Tools
- **Linux**: `sudo apt install git`

## Project Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd OnSite360
```

### 2. Environment Configuration

#### Backend Environment Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   # Windows
   copy .env.example .env
   
   # macOS/Linux
   cp .env.example .env
   ```

3. Edit the `.env` file and add your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/onsite360_dev?schema=public"
   
   # JWT
   JWT_SECRET="your-jwt-secret-key"
   JWT_EXPIRES_IN="7d"
   
   # App Configuration
   PORT=3001
   NODE_ENV=development
   
   # Add other required environment variables...
   ```

#### Frontend Environment Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Copy the example environment file:
   ```bash
   # Windows
   copy .env.example .env.local
   
   # macOS/Linux
   cp .env.example .env.local
   ```

3. Edit the `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Add other frontend environment variables...
   ```

### 3. Database Setup

Before running the backend, ensure you have PostgreSQL installed and running. Refer to the [Prisma Setup Guide](./prisma.md) for detailed database setup instructions.

1. Create your database:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE onsite360_dev;
   
   # Exit
   \q
   ```

2. Verify your `DATABASE_URL` in the backend `.env` file matches your database configuration.

### 4. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

The backend should now be running at `http://localhost:3001`

### 5. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend should now be running at `http://localhost:3000`

## Verification

### Check if everything is working:

1. **Backend Health Check**: Visit `http://localhost:3001/health` (or your configured health endpoint)
2. **Frontend**: Visit `http://localhost:3000`
3. **Database Connection**: Check the backend logs for successful database connection
4. **API Communication**: Test API calls from the frontend to ensure proper communication

## Additional Development Tools

### Recommended VS Code Extensions
- Prisma
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Auto Rename Tag (for React/Next.js)
- GitLens

### Database Management Tools
- **Prisma Studio**: `npx prisma studio` (built-in browser-based viewer)
- **pgAdmin**: GUI for PostgreSQL
- **DBeaver**: Universal database tool

## Troubleshooting

### Common Issues

#### Port Already in Use
If you get a "port already in use" error:
```bash
# Find process using the port (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Find process using the port (macOS/Linux)
lsof -ti:3000
kill -9 <PID>
```

#### Prisma Client Not Generated
If you get Prisma client errors:
```bash
cd backend
npx prisma generate
```

#### Database Connection Issues
- Verify PostgreSQL is running
- Check your `DATABASE_URL` in the `.env` file
- Ensure the database exists
- Verify username/password credentials

#### Node Modules Issues
If you encounter dependency issues:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Daily Development Process
1. Pull latest changes: `git pull origin main`
2. Install any new dependencies: `npm install` (in both frontend and backend if needed)
3. Run database migrations if there are new ones: `npx prisma migrate dev`
4. Generate Prisma client if schema changed: `npx prisma generate`
5. Start both servers (frontend and backend)

### Before Committing
1. Run tests: `npm test`
2. Check linting: `npm run lint`
3. Format code: `npm run format`
4. Ensure both frontend and backend build successfully

## Environment-Specific Notes

### Development
- Hot reload is enabled for both frontend and backend
- Detailed error messages and logging
- Database migrations run automatically

### Production Considerations
- Use production-ready database (not local PostgreSQL)
- Set appropriate environment variables
- Use process managers (PM2, Docker, etc.)
- Enable proper logging and monitoring

## Next Steps

After successful setup:
1. Explore the codebase structure
2. Read the API documentation
3. Review the database schema in Prisma Studio
4. Check out the project's contributing guidelines
5. Start developing! 🚀

## Need Help?

- Check the [Prisma documentation](./prisma.md) for database-related issues
- Review project-specific documentation in the `/docs` folder
- Ask team members for help with project-specific configurations
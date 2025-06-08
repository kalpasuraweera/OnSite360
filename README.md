# Docker Setup Guide

This guide will help you set up Docker and run the OnSite360 application.

## Prerequisites

1. Install Docker:
    - For Windows/Mac: Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)
    - For Linux: Install [Docker Engine](https://docs.docker.com/engine/install/)

2. Install Docker Compose (if not included with your Docker installation):
    - Follow the [official installation guide](https://docs.docker.com/compose/install/)

## Getting Started

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/OnSite360.git
    cd OnSite360
    ```

2. Make sure Docker is running on your system.

3. Build and start the containers:
    ```bash
    docker-compose up --build
    ```
    This command builds the Docker images if they don't exist and starts the containers as defined in the docker-compose.yml file.

4. To run the application in detached mode (background):
    ```bash
    docker-compose up -d --build
    ```

5. To stop the containers:
    ```bash
    docker-compose down
    ```

## Useful Docker Commands

- View running containers:
  ```bash
  docker ps
  ```

- View logs for a specific container:
  ```bash
  docker logs [container_name]
  ```

- Enter a running container:
  ```bash
  docker exec -it [container_name] bash
  ```

- Rebuild a specific service:
  ```bash
  docker-compose build [service_name]
  ```

  ## Running PostgreSQL with Docker (Development Mode)

  For development, you might want to run only the PostgreSQL database in Docker while running the frontend and backend applications directly on your machine:

  1. Start only the PostgreSQL container:
    ```bash
    docker-compose up -d postgres
    ```

  2. Run the frontend application:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

  3. Run the backend application:
    ```bash
    cd backend
    npm install
    npm run start:dev
    ```

  4. Access the applications:
    - Frontend: http://localhost:5173 (or the port configured in your frontend application)
    - Backend API: http://localhost:3000 (or the port configured in your backend application)
    
  5. To stop the PostgreSQL container when done:
    ```bash
    docker-compose stop postgres
    ```

## Database Seeding

The project includes a database seeding mechanism to populate the database with initial data for development and testing purposes.

### Seed Data
The seed script creates:
- An admin user with email `admin@onsite360.com`
- A sample construction project

### How to Run Seeds
You can seed the database using the following command:

```bash
npx prisma db seed
```

This command is configured in package.json to run the seed script located at `backend/prisma/seed.ts`.

### When to Use
- During local development setup
- After resetting the development database
- When setting up a new testing environment

Team members should run the seed command after initial database setup to ensure everyone has the same baseline data.
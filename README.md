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

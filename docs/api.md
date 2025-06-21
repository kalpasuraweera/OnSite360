# Version-specific API Configuration for NestJS

This module demonstrates how to implement API versioning in NestJS using the
URI path approach with the 'v1' format. API versioning helps maintain
backward compatibility while allowing the API to evolve over time.

## Key Features

- Uses URI path versioning strategy (e.g., `/v1/resource`)
- Allows version-specific controller routing
- Supports accessing version information in request handlers

## Example

```typescript
// Configuring versioning in main.ts
app.enableVersioning({
    type: VersioningType.URI
});
```

## References

[NestJS Documentation - Versioning](https://docs.nestjs.com/techniques/versioning)

## Backend Structure

The project follows a modular architecture to maintain clean separation of concerns:

```
backend/
├── src/
│   ├── app.module.ts         # Main application module
│   ├── auth/                 # Authentication functionality
│   ├── users/                # User management
│   ├── roles/                # Role management
│   ├── permissions/          # Permission management
│   ├── projects/             # Project management
│   │   ├── tasks/            # Project-related tasks (as sub-module)
│   │   ├── documents/        # Project-related documents (as sub-module)
│   │   ├── threads/          # Communication threads (as sub-module)
│   │   │   └── messages/     # Messages within threads (as sub-module)
│   ├── common/               # Shared utilities, pipes, filters, guards
│   └── prisma/               # Database connectivity
```

Each module follows NestJS conventions with controllers, services, DTOs, and entities as appropriate. The structure supports versioned API endpoints across all resource types.


## Creating NestJS Modules via CLI

The NestJS CLI provides convenient commands to generate modules and related components. Use these commands to maintain consistency with the project structure.

### Basic Module Generation

```bash
# Generate a new module
nest g module users

# Generate a controller for an existing module
nest g controller users

# Generate a service for an existing module
nest g service users
```

### Creating Complete Resources

Generate a complete CRUD resource with all necessary files:

```bash
# Generate a complete resource (controller, service, module, DTOs)
nest g resource projects

# With API versioning options
nest g resource projects --no-spec
```

### Generating Nested Modules

For hierarchical modules (like the structure shown above):

```bash
# Generate a sub-module within a parent module
nest g module projects/tasks

# Generate controllers and services for sub-modules
nest g controller projects/tasks
nest g service projects/tasks
```

### Additional Components

```bash
# Generate DTOs (create manually in the appropriate directory)
mkdir -p src/projects/dto
touch src/projects/dto/create-project.dto.ts
touch src/projects/dto/update-project.dto.ts

# Generate guards, pipes, or filters
nest g guard auth/jwt
nest g pipe common/validation
nest g filter common/http-exception
```

All generated components will follow NestJS best practices and integrate seamlessly with the versioned API structure.
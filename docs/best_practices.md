# Development Best Practices

## Environment Setup & Dependencies

- Always install new dependencies with `--save` or `--save-dev` flags to update package.json:
    ```bash
    npm install --save package-name      # For runtime dependencies
    npm install --save-dev package-name  # For development dependencies
    ```

- Use package lock files (package-lock.json, yarn.lock) to ensure consistent installations across environments.

- Consider using a consistent Node.js version with `.nvmrc` file.

## Version Control

- Use descriptive commit messages with a scope prefix:
    ```bash
    git commit -m "frontend: fix navbar responsiveness"
    git commit -m "backend: add authentication middleware"
    git commit -m "docs: update API documentation"
    git commit -m "ci: configure GitHub Actions workflow"
    ```

- Create feature branches for new work and use pull requests for code reviews.

- Regularly rebase or merge from the main branch to reduce merge conflicts.

## TypeScript Best Practices

- Always use TypeScript instead of JavaScript for better type safety and developer experience.

- Define proper interfaces and types for all data structures:
    ```typescript
    // Instead of
    const user = { name: 'John', age: 30 };

    // Use
    interface User {
        name: string;
        age: number;
        email?: string; // Optional properties with ?
    }
    
    const user: User = { name: 'John', age: 30 };
    ```

- Avoid using `any` type when possible, use `unknown` for truly unknown types.

- Use TypeScript's utility types like `Partial<T>`, `Pick<T>`, and `Omit<T>` when appropriate.

## React + Vite Best Practices

- Use functional components with hooks instead of class components:
    ```typescript
    import { useState, useEffect } from 'react';
    
    function UserProfile({ userId }: { userId: string }) {
        const [user, setUser] = useState<User | null>(null);
        
        useEffect(() => {
            // Fetch user data
        }, [userId]);
        
        return (/* JSX */);
    }
    ```

- Use React.memo(), useMemo(), and useCallback() to optimize performance when needed.

- Create custom hooks to reuse stateful logic.

- Use environment variables with `import.meta.env` in Vite projects.

## NestJS Best Practices

- Use proper decorators for dependency injection and request handling:
    ```typescript
    @Controller('users')
    export class UsersController {
        constructor(private readonly usersService: UsersService) {}
        
        @Get(':id')
        findOne(@Param('id') id: string): Promise<User> {
            return this.usersService.findOne(id);
        }
    }
    ```

- Implement proper DTO (Data Transfer Object) classes with validation:
    ```typescript
    import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
    
    export class CreateUserDto {
        @IsNotEmpty()
        name: string;
        
        @IsEmail()
        email: string;
        
        @MinLength(8)
        password: string;
    }
    ```

- Use guards, interceptors, and pipes for cross-cutting concerns.

## Clean Code Principles

- Follow the Single Responsibility Principle: each function or class should have only one reason to change.

- Keep functions small and focused on a single task.

- Use meaningful variable and function names.

- Add comments only when necessary to explain "why" not "what" the code does.

- Maintain consistent code formatting using tools like Prettier and ESLint.

## Testing

- Write unit tests for all business logic.

- Implement integration tests for API endpoints.

- Use testing libraries appropriate for your stack (Jest, React Testing Library, etc.).

- Aim for high test coverage but prioritize critical paths.
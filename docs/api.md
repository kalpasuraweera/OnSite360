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

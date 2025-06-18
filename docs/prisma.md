# Prisma Setup, Configuration, and Database Management Guide

## Setting Up Prisma in Your Project

### Initial Setup

Install Prisma CLI and client:

```bash
npm install prisma --save-dev
npm install @prisma/client
```

Initialize Prisma in your project:

```bash
npx prisma init
```

### Database Connection

Configure your database connection in the `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

Set the database provider in `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql" // or "mysql", "sqlite", "sqlserver", "mongodb", "cockroachdb"
  url      = env("DATABASE_URL")
}
```

## Prisma Studio - Browser-Based Database Viewer

To open Prisma Studio, the browser-based database viewer for Prisma, use this command:

```bash
npx prisma studio
```

## Viewing Database Tables

To view all tables in your PostgreSQL database, you can use several methods:

### Option 1: Use psql inside the container

Connect to your PostgreSQL database using psql:

```bash
psql -U username -h localhost -d mydb
```

Once connected, use the `\dt` command to list all tables:

```bash
\dt
```

For more detailed information, use:

```bash
\dt+
```

To exit psql, type:

```bash
\q
```

## Working with Existing Databases

To connect to an existing database:

1. Set up your DATABASE_URL to point to your existing database
2. Run database introspection to generate Prisma models:
   ```bash
   npx prisma db pull
   ```
3. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```

## Creating and Managing Database Schemas

### Creating Models

Define your models in `schema.prisma`:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### Creating and Applying Migrations

Create a migration:

```bash
npx prisma migrate dev --name init
```

Apply migrations to production:

```bash
npx prisma migrate deploy
```

## Database Backup and Restore

### Exporting Your Database

#### Option 1: SQL Dump (Recommended)

For PostgreSQL:

```bash
pg_dump -U username -h localhost -d mydb > backup.sql
```

For MySQL:

```bash
mysqldump -u username -p mydb > backup.sql
```

#### Option 2: Export Prisma Schema

```bash
npx prisma db pull > schema.prisma
```

### Importing Your Database

#### Option 1: Import SQL Dump

For PostgreSQL:

```bash
psql -U username -h localhost -d mydb < backup.sql
```

For MySQL:

```bash
mysql -u username -p mydb < backup.sql
```

#### Option 2: Using Prisma Migrations

If you want to recreate the database from your Prisma schema:

```bash
npx prisma migrate reset
```
sometimes we need to run migrate dev to run this

## Seeding Your Database

Create a seed file at `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create seed data
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      posts: {
        create: {
          title: 'My first post',
          content: 'This is my first post content',
          published: true,
        },
      },
    },
  })
  console.log({ user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Configure the seed script in `package.json`:

```json
{
  "scripts": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run the seed:

```bash
npx prisma db seed
```

## NestJS Integration

For NestJS projects:

Create a Prisma service:

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Create a Prisma module:

```typescript
// src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Import the Prisma module in your app module:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
})
export class AppModule {}
```

## Automatic Prisma Client Generation

You can add a `postinstall` script to your `package.json` to automatically generate the Prisma client after package installation:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```
## Understanding `prisma generate`

The `npx prisma generate` command generates the Prisma Client code based on your Prisma schema.

### What it does:
- **Reads your schema:** Analyzes your `schema.prisma` file
- **Generates type-safe client:** Creates TypeScript types and query methods based on your models
- **Updates the client library:** Ensures your code can interact with your database according to your schema

### When to run it:
- After changing your Prisma schema
- After pulling schema changes from an existing database (`prisma db pull`)
- After running migrations (`prisma migrate dev`)
- When setting up a project for the first time

### Important note:
`prisma generate` does NOT modify your database. It only updates the client code to match your schema definition.

You can add a `postinstall` script to your `package.json` to automatically generate the Prisma client after package installation:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**Note:** In our project, we're not implementing this approach because we use a centralized database for development. Automatic generation on each developer's machine could lead to inconsistencies when multiple developers work with different schema versions.

## Best Practices

- **Version Control**: Keep your Prisma schema and migrations in version control
- **Regular Backups**: Schedule regular database backups
- **Environment Separation**: Use different databases for development and production
- **Data Security**: Never commit sensitive database credentials to version control
- **Migration Testing**: Test migrations on a staging environment before production

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NestJS with Prisma](https://docs.nestjs.com/recipes/prisma)
- [Prisma Data Platform](https://www.prisma.io/data-platform)
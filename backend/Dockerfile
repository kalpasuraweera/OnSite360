FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate


EXPOSE 3000

# Run migrations and seed at container startup, then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start:dev"]
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate


EXPOSE 3000

# This is when database is new or empty
# Run migrations and seed the database, then start the application
# CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start:dev"]

# This is when database already has data
CMD ["npm", "run", "start:dev"]
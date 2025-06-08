FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Generate Prisma client and run database migrations
RUN npx prisma generate
RUN npx prisma migrate deploy

# Seed the database with initial data
RUN npx prisma db seed

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
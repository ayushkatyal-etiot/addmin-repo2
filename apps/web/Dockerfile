FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.33.3

# Copy root package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy workspace packages
COPY packages ./packages
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "--filter", "@addmin/web", "dev"]

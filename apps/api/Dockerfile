FROM node:20

WORKDIR /app

# Prisma's schema/query engines need OpenSSL at runtime to produce output at all —
# without it they fail before emitting JSON, surfacing as a confusing parse error.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@10.33.3

# Copy root package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy workspace packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies (includes prisma)
RUN pnpm install --frozen-lockfile

EXPOSE 3001

CMD ["pnpm", "--filter", "@addmin/api", "dev"]

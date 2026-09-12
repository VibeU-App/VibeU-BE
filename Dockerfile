# ------------------------------------------------------------------------------
# 1. Base Image
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install system dependencies:
# - libc6-compat: Compatibility layer for musl/glibc native binaries (argon2, prisma)
# - openssl: Required by Prisma engines
# - dumb-init: Lightweight process supervisor to handle PID 1 and signal forwarding
RUN apk add --no-cache libc6-compat openssl dumb-init

# Enable corepack and configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

# ------------------------------------------------------------------------------
# 2. Dependencies Stage
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy dependency specifications and Prisma schema
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install all dependencies (development + production) with BuildKit cache
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma generate

# ------------------------------------------------------------------------------
# 3. Builder Stage
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy dependencies and config
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/prisma.config.ts ./

# Copy source code, build configuration, and scripts
COPY tsconfig*.json nest-cli.json ./
COPY scripts ./scripts
COPY src ./src

# Compile NestJS application and execute post-build prisma CJS script
RUN pnpm run build

# ------------------------------------------------------------------------------
# 4. Production Dependencies Stage
# ------------------------------------------------------------------------------
FROM base AS prod-deps
WORKDIR /app

# Copy full dependencies from deps stage
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=deps /app/node_modules ./node_modules

# Remove prepare hook (husky) and prune devDependencies for production runtime
RUN npm pkg delete scripts.prepare && pnpm prune --prod --ignore-scripts

# ------------------------------------------------------------------------------
# 5. Production Runner Stage
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy pruned production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./

# Copy compiled application code and Prisma artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Use non-root node user for container security
USER node

EXPOSE 3000

# Use dumb-init as entrypoint to properly handle POSIX signals (SIGINT/SIGTERM)
ENTRYPOINT ["dumb-init", "--"]

# Start NestJS production server
CMD ["node", "dist/src/main.js"]
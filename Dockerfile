# FocusFlow web service production Dockerfile (rewritten 2026-05-17 for AWS)
# Debian bookworm-slim (Prisma needs glibc; Alpine fails libssl.so.1.1).
# Builds services/web (Next.js standalone) from monorepo root.

FROM public.ecr.aws/docker/library/node:20-bookworm-slim AS base
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN npm install -g pnpm@9

# ---- builder stage (single-pass install + build to keep pnpm workspace symlinks intact) ----
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN cd packages/types && pnpm run build || true
RUN cd services/web && pnpm prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN cd services/web && pnpm run build

# ---- runner stage ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs --create-home nextjs
COPY --from=builder --chown=nextjs:nodejs /app/services/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/services/web/.next/static ./services/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/services/web/public ./services/web/public
USER nextjs
EXPOSE 3000
WORKDIR /app/services/web
CMD ["node", "server.js"]

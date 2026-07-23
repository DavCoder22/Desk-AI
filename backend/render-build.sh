#!/bin/bash
# render-build.sh — Build script for Render deployment
# Este script NO se usa directamente. El render.yaml maneja el build.
# Mantenido como referencia.

set -e

echo "=== DeskAI Render Build ==="

# Swap to PostgreSQL schema
cp prisma/render-schema.prisma prisma/schema.prisma

# Install dependencies
npm install --include=dev

# Generate Prisma client
npx prisma generate

# Build NestJS
npx nest build

echo "=== Build complete ==="

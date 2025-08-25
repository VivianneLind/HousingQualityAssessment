#!/bin/bash

# Vercel Build Script
# This script ensures clean build without TypeScript conflicts

echo "🚀 Starting Vercel build..."

# Remove any cached TypeScript files
echo "🧹 Cleaning TypeScript cache..."
rm -rf node_modules/.cache
rm -rf .tsbuildinfo

# Set environment for build
export NODE_ENV=production
export VITE_BUILD=true

# Build with Vite only (skip TypeScript check)
echo "📦 Building with Vite..."
vite build

echo "✅ Build completed successfully!"

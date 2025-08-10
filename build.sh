#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building application..."
node_modules/.bin/vite build

echo "Build completed successfully!"
#!/bin/bash
# Starts services required for testing by CI tools
set -e

# Start local DynamoDB instance (port 8000)
node backend/dynamodb-local.js &

# Build and serve web app (port 5000)
rm -rf build
npm run build
node_modules/.bin/serve -s build &

#!/bin/bash
# Starts services required for testing by CI tools
set -e

# Build and serve web app (port 5000)
rm -rf build
npm run build
node_modules/.bin/serve -s build &

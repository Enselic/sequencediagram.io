#!/bin/bash
# Starts services required for testing by CI tools
set -e

source localhost-ports.sh

# Serve backend
node backend/api-server/api-server-localhost.js &

# Build and serve web app
rm -rf build
REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT npm run build
node_modules/.bin/serve -p $WEB_APP_PORT -s build &

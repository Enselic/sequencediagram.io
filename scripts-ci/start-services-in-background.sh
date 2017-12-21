#!/bin/bash
# Starts services required for testing by CI tools
set -e

source local.env.sh

# Build and serve backend
node_modules/.bin/webpack --config backend/api-server/webpack.config.js
node $BACKEND_BUILD_DIR/$BACKEND_BUILD_FILENAME &

# Build and serve web app
rm -rf build
CODE_COVERAGE=true REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT npm run build
node_modules/.bin/serve -p $WEB_APP_PORT -s build &

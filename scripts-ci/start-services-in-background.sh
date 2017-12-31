#!/bin/bash
# Starts services required for testing by CI tools
set -e

source local.env.sh
export CODE_COVERAGE=true
export REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT
export NODE_ENV=production
export BABEL_ENV=production

# Build and serve backend
node_modules/.bin/webpack --config backend/webpack.config.js
node $BACKEND_BUILD_DIR/$BACKEND_BUILD_FILENAME &

# Build two variants of the web app
# First a version that can be used to test service worker code
rm -rf build
REACT_APP_VERSION=$(git describe)-prime npm run build
mv -v build build-prime
# Then the "real" version that we also serve
REACT_APP_VERSION=$(git describe)       npm run build
node_modules/.bin/serve -p $WEB_APP_PORT -s build &

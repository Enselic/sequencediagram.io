#!/usr/bin/env bash

# Starts services required for testing by CI tools

set -o errexit
set -o nounset
set -o pipefail

source local.env.sh
export NODE_ENV=production
export BABEL_ENV=production

# Serve backend
node src-backend-mock/api-server-localhost.js &


# Build three variants of the web app

# First a version that can be used to test service worker code
rm -rf build
REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT \
  CODE_COVERAGE=true \
  REACT_APP_VERSION=$(git describe)-prime \
  npm run build
mv -v build build-prime

# Then the versions that can be deployed to AWS S3
REACT_APP_API_SERVER=https://api.sequencediagram.io/git-master \
  CODE_COVERAGE=false \
  REACT_APP_VERSION=$(git describe) \
  npm run build
mv -v build build-deploy

REACT_APP_API_SERVER=https://api.sequencediagram.io/v1 \
  CODE_COVERAGE=false \
  REACT_APP_VERSION=$(git describe) \
  npm run build
mv -v build build-deploy-prod

# Then the version that we serve for tests
REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT \
  CODE_COVERAGE=true \
  REACT_APP_VERSION=$(git describe) \
  npm run build

# But remove .map files first since we don't use them and they are
# big and annoying to accidentally deploy...
rm build*/static/js/*.map

npx serve -p $WEB_APP_PORT -s build &

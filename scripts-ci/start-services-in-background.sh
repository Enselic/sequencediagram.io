#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# Starts services required for testing by CI tools

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
mv -v build build-git-master

REACT_APP_API_SERVER=https://api.sequencediagram.io/v1 \
  CODE_COVERAGE=false \
  REACT_APP_VERSION=$(git describe) \
  npm run build
mv -v build build-prod

# Then the version that we serve for tests
REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT \
  CODE_COVERAGE=true \
  REACT_APP_VERSION=$(git describe) \
  npm run build

npx serve -p $WEB_APP_PORT -s build &

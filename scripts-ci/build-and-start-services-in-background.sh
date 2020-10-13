#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# Starts services required for testing by CI tools

source local.env.sh
export NODE_ENV=production
export BABEL_ENV=production
export REACT_APP_VERSION=$(git describe)

perform_build() {
  REACT_APP_API_SERVER=$1 CODE_COVERAGE=$2 npm run build

  # We don't use the service worker
  rm build/precache-manifest.*.js build/service-worker.js

  # We (or rather; react-scripts) inline the runtime in index.html
  # so no need to keep separate file around
  rm build/static/js/runtime-main.*.js

  mv -v build $3
}

# Startup localhost backend api server while we build the front end
node src-backend-mock/api-server-localhost.js &

# Build the production version we deploy to https://sequencediagram.io when 
# we feel we are in a good state
perform_build https://api.sequencediagram.io/v1 false build-prod

# Build the version we deploy directly to https://git-master.sequencediagram.io
# via Travis CI deploy scripts
perform_build https://api.sequencediagram.io/git-master false build-git-master

# Build the version we run purely on localhost and use for automated testing
perform_build http://localhost:$API_SERVER_PORT true build-localhost

# Serve the localhost build used for testing
npx serve -p $WEB_APP_PORT -s build-localhost &

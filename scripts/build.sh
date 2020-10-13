#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

source local.env.sh

# Perfom the build
GENERATE_SOURCEMAP=false react-scripts build

# We don't use the service worker
rm build/precache-manifest.*.js build/service-worker.js
cp src/self-destroying-service-worker.js build/service-worker.js

# We (or rather; react-scripts) inline the runtime in index.html
# so no need to keep separate file around
rm build/static/js/runtime-main.*.js

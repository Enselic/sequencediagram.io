#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

export CI=true
source local.env.sh

trap kill_running_services exit

kill_running_services() {
  for port in $WEB_APP_DEV_SERVER_PORT $WEB_APP_PORT $API_SERVER_PORT $API_SERVER_CONTROL_PORT $DYNAMODB_LOCAL_PORT; do
    lsof -i tcp:$port | grep LISTEN | awk '{print $2}' | xargs kill && 
    echo "Killing process using TCP port $port" ||  
    echo "(No process was using TCP port $port)"
  done
}

# Make sure it's a fresh start
rm -rf build* coverage*
kill_running_services

scripts-ci/prepare-for-code-coverage.sh
scripts-ci/start-services-in-background.sh &
scripts-ci/wait-for-ports.sh
scripts-ci/run-tests.sh
scripts-ci/collect-code-coverage.sh

# Cleanup
kill_running_services

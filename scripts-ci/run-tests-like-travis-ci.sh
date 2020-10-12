#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

export CI=true
source local.env.sh

notify_travis_fail() {
  notify-send -u critical 'Travis CI will fail' || true
  kill_running_services
  exit 1
}

kill_running_services() {
  for port in $WEB_APP_DEV_SERVER_PORT $WEB_APP_PORT $API_SERVER_PORT $API_SERVER_CONTROL_PORT $DYNAMODB_LOCAL_PORT; do
    lsof -i tcp:$port | grep LISTEN | awk '{print $2}' | xargs kill || true
  done
}

# Make sure it's a fresh start
rm -rf build* coverage*
kill_running_services

scripts-ci/prepare-for-code-coverage.sh || notify_travis_fail
scripts-ci/start-services-in-background.sh &
scripts-ci/wait-for-ports.sh || notify_travis_fail
scripts-ci/run-tests.sh || notify_travis_fail
scripts-ci/collect-code-coverage.sh || notify_travis_fail

# Cleanup
kill_running_services

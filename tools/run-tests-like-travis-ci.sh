#!/bin/bash

export CI=true
source local.env.sh

notify_travis_fail() {
  notify-send -u critical 'Travis CI will fail'
  exit 1
}

kill_running_services() {
  fuser -k \
    $WEB_APP_DEV_SERVER_PORT/tcp \
    $WEB_APP_PORT/tcp \
    $API_SERVER_PORT/tcp \
    $API_SERVER_CONTROL_PORT/tcp \
    $DYNAMODB_LOCAL_PORT/tcp
}

# Make sure it's a fresh start
kill_running_services

scripts-ci/prepare-for-code-coverage.sh || notify_travis_fail
scripts-ci/start-services-in-background.sh &
scripts-ci/wait-for-ports.sh || notify_travis_fail
scripts-ci/run-tests.sh || notify_travis_fail
scripts-ci/collect-code-coverage.sh || notify_travis_fail

# Cleanup
kill_running_services

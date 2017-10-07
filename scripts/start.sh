#!/bin/bash -e

trap 'kill -TERM 0' EXIT

export REACT_APP_VERSION=$(git describe)

if [ "$1" = "build" ]; then
  node_modules/.bin/react-scripts build
else
  # By default, start what is needed for npm test to pass all tests
  node backend/dynamodb-local.js &
  node_modules/.bin/react-scripts start &

  # If an argument is given, also start the local API server
  # This will make some tests fail (since they need to be able)
  # to start and stop the server manually), but it allows you
  # to develop against local services only
  [ -z "$1"] || node backend/api-server-local.js &

  # Wait for Ctrl-C
  cat
fi

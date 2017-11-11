#!/bin/bash -e

export REACT_APP_VERSION=$(git describe)

if [ "$1" = "build" ]; then
  react-scripts build
else
  trap 'kill -TERM 0' EXIT

  # By default, start what is needed for npm test to pass all tests
  nodemon --watch backend/dynamodb backend/dynamodb/dynamodb-localhost.js &
  react-scripts start &

  # If an argument is given, also start the local API server
  # This will make some tests fail (since they need to be able)
  # to start and stop the server manually), but it allows you
  # to develop against local services only
  [ -z "$1" ] ||
      nodemon --watch backend/api-server backend/api-server/api-server-localhost.js &

  # Wait for Ctrl-C
  cat
fi

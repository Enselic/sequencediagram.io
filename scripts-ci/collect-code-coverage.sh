#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# NOTE: Currently not functional.
# We need to eject react-scripts again first, or find some other clever way.
# Keeping this script around though to make it easy to enable later.

if [ "$(ls coverage-data)" ]; then
  node_modules/.bin/istanbul report --root coverage-data lcov

  if [ "$TRAVIS" ]; then
    cat coverage/lcov.info | node_modules/.bin/coveralls
  fi

  # This is annoying to keep around
  rm -rf coverage-data
fi

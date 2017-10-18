#!/bin/bash
set -e

if [ "$(ls coverage-data)" ]; then
  node_modules/.bin/istanbul report --root coverage-data lcov

  if [ "$TRAVIS" ]; then
    cat coverage/lcov.info | node_modules/.bin/coveralls
  fi

  # This is annoying to keep around
  rm -rf coverage-data
fi

#!/bin/bash
set -e

if [ "$TRAVIS" ]; then
  # Travis CI runs out of memory if we run all tests at once, so
  # run them in band
  npm test -- --runInBand
else
  npm test
fi

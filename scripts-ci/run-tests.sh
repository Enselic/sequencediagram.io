#!/bin/bash
set -e

# Travis CI runs out of memory if we run all tests at once, so
# run them in band
npm test -- --runInBand

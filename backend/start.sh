#!/bin/bash

trap 'kill -TERM 0' EXIT

node backend/dynamodb-local.js &
node backend/api-server-local.js &

# Wait for Ctrl-C
cat

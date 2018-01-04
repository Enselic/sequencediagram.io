#!/bin/bash -e

trap 'kill -TERM 0' EXIT

source local.env.sh

# Start backend dev server
nodemon --watch backend backend/api-server-localhost.js &

# Start front end dev server
PORT=$WEB_APP_DEV_SERVER_PORT REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT react-scripts start &

# Wait for Ctrl-C
cat

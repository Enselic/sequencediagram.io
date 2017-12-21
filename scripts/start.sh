#!/bin/bash -e

trap 'kill -TERM 0' EXIT

source local.env.sh

# Start backend dev server
mkdir -p $BACKEND_BUILD_DIR && touch $BACKEND_BUILD_DIR/$BACKEND_BUILD_FILENAME
webpack --watch --config backend/webpack.config.js &
nodemon --watch $BACKEND_BUILD_FILENAME $BACKEND_BUILD_DIR/$BACKEND_BUILD_FILENAME &

# Start front end dev server
PORT=$WEB_APP_DEV_SERVER_PORT REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT react-scripts start &

# Wait for Ctrl-C
cat

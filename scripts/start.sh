#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# Kill all child processes when this script exists
trap 'kill -TERM 0' EXIT

source local.env.sh

# Start backend dev server
nodemon --watch src-backend --watch src-backend-localhost src-backend-mock/api-server-localhost.js &

# Start front end dev server and block for Ctrl-C
PORT=$WEB_APP_DEV_SERVER_PORT REACT_APP_API_SERVER=http://localhost:$API_SERVER_PORT react-scripts start

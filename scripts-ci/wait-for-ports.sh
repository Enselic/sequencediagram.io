#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# Wait for HTTP ports that tests depend on

source local.env.sh
set -- $API_SERVER_PORT $API_SERVER_CONTROL_PORT $WEB_APP_PORT

readonly TIMEOUT_IN_SECONDS=$((60 * 2))

seconds=0
while [ $# -gt 0 -a $seconds -lt $TIMEOUT_IN_SECONDS ]; do

  port=$1
  if curl --noproxy localhost localhost:$port >/dev/null 2>&1; then
     echo "Port $port is up (waited for $seconds seconds)"
     shift
     continue
  fi

  sleep 1;
  seconds=$((seconds + 1))
done

if [ $seconds -lt $TIMEOUT_IN_SECONDS ]; then
  echo "All ports are up!"
else
  echo "Timed out waiting for port $port"
  exit 1
fi

#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

builddir=build-git-master

if [ ! -d "$builddir" ]; then
  echo "Missing $builddir"
  exit 1
fi

# First upload content with regular cache control needs
aws s3 cp --cache-control max-age=1800,public --acl public-read --recursive "$builddir" s3://git-master.sequencediagram.io/

# Then upload things that will never (in theory) change
aws s3 cp --cache-control max-age=604800,public --acl public-read --recursive "$builddir/static" s3://git-master.sequencediagram.io/static

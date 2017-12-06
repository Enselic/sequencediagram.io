#!/bin/bash

alias notify_travis_fail="notify-send -u critical 'Travis CI will fail'"
export CI=true

fuser -k 8000/tcp 5000/tcp 4000/tcp # Make sure it's a fresh start

scripts-ci/prepare-for-code-coverage.sh || notify_travis_fail
scripts-ci/start-services-in-background.sh &
scripts-ci/wait-for-ports.sh 8000 5000 || notify_travis_fail
scripts-ci/run-tests.sh || notify_travis_fail
scripts-ci/collect-code-coverage.sh || notify_travis_fail

fuser -k 8000/tcp 5000/tcp # Cleanup

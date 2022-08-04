#!/bin/bash

set -e

SCRIPT_DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
FILE_NAME=Config.js
RELATIVE_TARGET_DIRS="frontend/src controller/src"
RELATIVE_LINK_DIR=../..

echo -e "[...]\t Temporarily dereferencing symlinks to build containers"
for target in $RELATIVE_TARGET_DIRS; do
    rm -vf "$SCRIPT_DIR"/"$target"/"$FILE_NAME"
    cp -va "$SCRIPT_DIR"/"$FILE_NAME" "$SCRIPT_DIR"/"$target"/
done

echo -e "[OK]"
echo -e "[...]\t Docker build..."
(docker-compose build  && echo -e "[OK]" ) || echo -e "\n[ERR]\t error in docker-compose build. See above."

echo -e "[...]\t Restoring symlinks..."
for target in $RELATIVE_TARGET_DIRS; do
    cd "$SCRIPT_DIR"/"$target"
    rm -vf "$FILE_NAME"
    ln -vs "$RELATIVE_LINK_DIR"/"$FILE_NAME" ./
done

echo -e "[OK]"
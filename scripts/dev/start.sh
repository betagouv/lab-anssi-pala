#!/usr/bin/env sh

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
NODE_VERSION=$(tr -d '[:space:]' < "$SCRIPT_DIR/../../.nvmrc")

NODE_VERSION="$NODE_VERSION" docker-compose up --build --force-recreate -d
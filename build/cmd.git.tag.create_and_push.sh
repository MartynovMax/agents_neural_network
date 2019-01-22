#!/bin/bash

DIR_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_VERSION=$(node -e "console.log(require('$DIR_PATH/../package.json').version)")

echo "App version: $APP_VERSION"

git tag -a v$APP_VERSION -m 'v$APP_VERSION'
git push origin --tags

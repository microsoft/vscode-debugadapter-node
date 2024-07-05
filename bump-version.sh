#!/bin/sh

npm version --workspaces "$@" --workspaces-update

VERSION=$(cat adapter/package.json | jq -r .version)
npm --workspace adapter pkg set "dependencies.@vscode/debugprotocol=$VERSION"
npm --workspace testSupport pkg set "dependencies.@vscode/debugprotocol=$VERSION"
sleep 5 # npm may have some disk cache that keeps it from seeing the new version?
npm i

git checkout -b bump-v$VERSION

git add .
git commit -m v$VERSION
git push -u origin bump-v$VERSION

git tag v$VERSION
git push origin v$VERSION

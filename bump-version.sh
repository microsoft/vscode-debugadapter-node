#!/bin/sh

npm version --workspaces "$@" --workspaces-update

VERSION=v$(cat adapter/package.json | jq -r .version)
npm --workspace adapter pkg set "dependencies.@vscode/debugprotocol=$VERSION"
npm --workspace testSupport pkg set "dependencies.@vscode/debugprotocol=$VERSION"
npm i

git checkout -b release/$VERSION

git add .
git commit -m $VERSION
git push -u origin release/$VERSION

git tag $VERSION
git push origin $VERSION

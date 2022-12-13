#!/bin/sh

npm version --workspaces "$@"

VERSION=v$(cat adapter/package.json | jq -r .version)
git checkout -b release/$VERSION

git add .
git commit -m $VERSION
git push -u origin release/$VERSION

git tag $VERSION
git push origin $VERSION

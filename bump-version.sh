#!/bin/sh

npm version --workspaces "$@"
git add .

VERSION=v$(cat adapter/package.json | jq -r .version)
git commit -m $VERSION
git tag $VERSION
git push origin release/$VERSION
git push origin $VERSION

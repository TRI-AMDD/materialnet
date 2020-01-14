#!/bin/bash

if [ -z "$S3_BUCKET" ]
then
  echo "Please set \$S3_BUCKET"
  exit 1
fi

S3_URL="s3://$S3_BUCKET/materialnet/"

echo "Uploading to $S3_URL"

aws s3 sync --delete build/ $S3_URL

#!/bin/bash
aws s3 sync --delete build/ s3://materialsnet/

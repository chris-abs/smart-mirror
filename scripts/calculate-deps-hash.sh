#!/bin/bash
# Calculate a hash of package.json and yarn.lock files
# This is used to invalidate Docker cache when dependencies change

DIR=$1
if [ -z "$DIR" ]; then
  echo "Usage: $0 <directory>"
  exit 1
fi

if [ -f "$DIR/package.json" ] && [ -f "$DIR/yarn.lock" ]; then
  # Calculate hash of both files
  cat "$DIR/package.json" "$DIR/yarn.lock" | sha256sum | cut -d' ' -f1
else
  echo "default"
fi

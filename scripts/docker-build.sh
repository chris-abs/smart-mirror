#!/bin/bash
# Smart Docker build script that automatically calculates dependency hashes
# and rebuilds when package.json or yarn.lock changes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Calculate dependency hashes
API_DEPS_HASH=$(bash "$SCRIPT_DIR/calculate-deps-hash.sh" "$PROJECT_DIR/api")
CLIENT_DEPS_HASH=$(bash "$SCRIPT_DIR/calculate-deps-hash.sh" "$PROJECT_DIR/client")

echo "🔍 Dependency hashes:"
echo "   API:    $API_DEPS_HASH"
echo "   Client: $CLIENT_DEPS_HASH"
echo ""

# Export as environment variables for docker-compose
export API_DEPS_HASH
export CLIENT_DEPS_HASH

# Build with docker-compose
cd "$PROJECT_DIR"
echo "🔨 Building Docker images..."
docker compose build "$@"

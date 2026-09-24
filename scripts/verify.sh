#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

npm run typecheck
npm test
npm run build
node scripts/check-no-external-urls.mjs dist
echo "verify: all checks passed"

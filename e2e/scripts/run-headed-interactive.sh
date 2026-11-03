#!/usr/bin/env bash
# Run interactive E2E in a single visible Chromium window with delays.
set -euo pipefail
cd "$(dirname "$0")/.."
export HEADED=1
export E2E_SLOW_MO_MS="${E2E_SLOW_MO_MS:-400}"
export E2E_PAUSE_AFTER_TEST_MS="${E2E_PAUSE_AFTER_TEST_MS:-3000}"
export E2E_WORKERS=1
export E2E_BASE_URL="${E2E_BASE_URL:-http://127.0.0.1:3000}"

echo "Headed interactive E2E @ $E2E_BASE_URL"
echo "slowMo=${E2E_SLOW_MO_MS}ms pauseAfterTest=${E2E_PAUSE_AFTER_TEST_MS}ms"

npx playwright test \
  --project=chromium \
  --headed \
  --workers=1 \
  tests/journeys/interactive-full-e2e.spec.ts

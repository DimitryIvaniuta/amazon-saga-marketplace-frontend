#!/bin/sh
set -eu

escape_json() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\r/\\r/g; s/\n/\\n/g'
}

require_integer_range() {
  name="$1"
  value="$2"
  minimum="$3"
  maximum="$4"
  case "$value" in
    ''|*[!0-9]*) echo "$name must be an integer" >&2; exit 1 ;;
  esac
  if [ "$value" -lt "$minimum" ] || [ "$value" -gt "$maximum" ]; then
    echo "$name must be between $minimum and $maximum" >&2
    exit 1
  fi
}

require_same_origin_path() {
  name="$1"
  value="$2"
  case "$value" in
    '') return ;;
    /*) ;;
    *) echo "$name must be empty or a root-relative path" >&2; exit 1 ;;
  esac
  case "$value" in
    //*) echo "$name cannot be protocol-relative" >&2; exit 1 ;;
  esac
}

ORDER_POLLING_MS="${ORDER_POLLING_MS:-2000}"
TELEMETRY_SAMPLE_RATE="${TELEMETRY_SAMPLE_RATE:-0}"
API_BASE_URL="${API_BASE_URL:-}"
TELEMETRY_ENDPOINT="${TELEMETRY_ENDPOINT:-}"

require_integer_range ORDER_POLLING_MS "$ORDER_POLLING_MS" 1000 60000
require_same_origin_path API_BASE_URL "$API_BASE_URL"
require_same_origin_path TELEMETRY_ENDPOINT "$TELEMETRY_ENDPOINT"

if ! printf '%s' "$TELEMETRY_SAMPLE_RATE" | awk '
  /^[0-9]+([.][0-9]+)?$/ { if ($1 >= 0 && $1 <= 1) valid=1 }
  END { exit(valid ? 0 : 1) }
'; then
  echo "TELEMETRY_SAMPLE_RATE must be a number between 0 and 1" >&2
  exit 1
fi

cat > /tmp/config.js <<CONFIG
window.__APP_CONFIG__ = {
  apiBaseUrl: "$(escape_json "$API_BASE_URL")",
  appName: "$(escape_json "${APP_NAME:-Atlas Marketplace}")",
  orderPollingMs: $ORDER_POLLING_MS,
  release: "$(escape_json "${APP_RELEASE:-development}")",
  telemetryEndpoint: "$(escape_json "$TELEMETRY_ENDPOINT")",
  telemetrySampleRate: $TELEMETRY_SAMPLE_RATE
};
CONFIG

#!/usr/bin/env bash
# Rebuild LNY 2026 applicant seed from Zeffy xlsx + Kenrick CSV.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PY="$("$ROOT/scripts/ensure_venv.sh")"
exec "$PY" "$ROOT/scripts/build_lny_2026_seed.py" "$@"

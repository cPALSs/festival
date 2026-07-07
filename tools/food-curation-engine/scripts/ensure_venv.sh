#!/usr/bin/env bash
# Ensure food-curation-engine .venv exists with requirements.txt installed.
# Prints the venv python path on stdout (for use in other scripts).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV_PY="$ROOT/.venv/bin/python"
REQ="$ROOT/requirements.txt"

if [[ ! -f "$REQ" ]]; then
  echo "Missing requirements.txt: $REQ" >&2
  exit 1
fi

if [[ ! -x "$VENV_PY" ]]; then
  echo "Creating Python venv in $ROOT ..." >&2
  python3 -m venv "$ROOT/.venv"
  "$VENV_PY" -m pip install -q --upgrade pip
  "$VENV_PY" -m pip install -q -r "$REQ"
elif ! "$VENV_PY" -c "import openpyxl" 2>/dev/null; then
  echo "Installing dependencies in $ROOT/.venv ..." >&2
  "$VENV_PY" -m pip install -q -r "$REQ"
fi

echo "$VENV_PY"

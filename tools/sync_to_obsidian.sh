#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

DEFAULT_VAULT_ROOT="/Users/weiran/knowledge-hub/wiki"
VAULT_ROOT="${OBSIDIAN_VAULT_ROOT:-$DEFAULT_VAULT_ROOT}"
SCRM_ROOT="${VAULT_ROOT}/项目/scrm产品"
PRD_DIR="${SCRM_ROOT}/prd"
UI_DIR="${SCRM_ROOT}/ui-design"
INDEX_FILE="${SCRM_ROOT}/index.md"

DRY_RUN=0
SYNC_ALL=0
declare -a INPUTS=()

usage() {
  cat <<EOF
Usage:
  $(basename "$0") --all [--dry-run]
  $(basename "$0") <file> [<file> ...] [--dry-run]

Examples:
  $(basename "$0") --all
  $(basename "$0") PRD_销售触达一期.md
  $(basename "$0") UI_Design_销售运营过程监控与预警.md --dry-run

Environment:
  OBSIDIAN_VAULT_ROOT   Override vault root. Default: ${DEFAULT_VAULT_ROOT}

Supported files:
  - PRD.md
  - PRD_*.md
  - CDP_*.md
  - UI_Design_*.md
EOF
}

log() {
  printf '%s\n' "$*"
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

resolve_source() {
  local input="$1"
  if [[ "$input" = /* ]]; then
    printf '%s\n' "$input"
  else
    printf '%s\n' "${REPO_ROOT}/${input}"
  fi
}

classify_target_dir() {
  local base="$1"
  case "$base" in
    PRD.md|PRD_*.md|CDP_*.md)
      printf '%s\n' "$PRD_DIR"
      ;;
    UI_Design_*.md)
      printf '%s\n' "$UI_DIR"
      ;;
    *)
      return 1
      ;;
  esac
}

section_start_line() {
  local section="$1"
  awk -v target="$section" '
    $0 == target { print NR; exit }
  ' "$INDEX_FILE"
}

next_section_line() {
  local start="$1"
  awk -v start="$start" '
    NR > start && /^## / { print NR; exit }
  ' "$INDEX_FILE"
}

ensure_index_entry() {
  local base="$1"
  local rel_path label section entry start next insert_line tmp

  case "$base" in
    PRD.md)
      rel_path="prd/PRD"
      label="项目总 PRD"
      section="## 产品需求文档"
      ;;
    PRD_*.md)
      rel_path="prd/${base%.md}"
      label="${base%.md}"
      section="## 产品需求文档"
      ;;
    CDP_*.md)
      rel_path="prd/${base%.md}"
      label="${base%.md}"
      section="## 技术文档"
      ;;
    UI_Design_*.md)
      rel_path="ui-design/${base%.md}"
      label="${base%.md}"
      section="## UI 设计文档"
      ;;
    *)
      return 0
      ;;
  esac

  entry="- [[${rel_path}|${label}]]"
  if grep -Fqx -- "$entry" "$INDEX_FILE"; then
    return 0
  fi

  start="$(section_start_line "$section")"
  [[ -n "$start" ]] || fail "Missing section '${section}' in ${INDEX_FILE}"
  next="$(next_section_line "$start")"
  if [[ -n "$next" ]]; then
    insert_line=$((next - 1))
  else
    insert_line="$(wc -l < "$INDEX_FILE")"
  fi

  tmp="$(mktemp)"
  awk -v insert_line="$insert_line" -v entry="$entry" '
    { print }
    NR == insert_line { print entry }
  ' "$INDEX_FILE" > "$tmp"

  if (( DRY_RUN )); then
    log "[dry-run] update index: ${entry}"
    rm -f "$tmp"
  else
    mv "$tmp" "$INDEX_FILE"
    log "updated index: ${entry}"
  fi
}

sync_one() {
  local input="$1" source base target_dir target

  source="$(resolve_source "$input")"
  [[ -f "$source" ]] || fail "Source file not found: ${source}"

  base="$(basename "$source")"
  target_dir="$(classify_target_dir "$base")" || fail "Unsupported file: ${base}"
  target="${target_dir}/${base}"

  if (( DRY_RUN )); then
    log "[dry-run] copy ${source} -> ${target}"
  else
    mkdir -p "$target_dir"
    cp "$source" "$target"
    log "synced ${base} -> ${target_dir}"
  fi

  ensure_index_entry "$base"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)
      SYNC_ALL=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      INPUTS+=("$1")
      shift
      ;;
  esac
done

[[ -d "$VAULT_ROOT" ]] || fail "Vault root not found: ${VAULT_ROOT}"

if (( SYNC_ALL )); then
  while IFS= read -r file; do
    INPUTS+=("$file")
  done < <(
    find "$REPO_ROOT" -maxdepth 1 -type f \
      \( -name 'PRD.md' -o -name 'PRD_*.md' -o -name 'CDP_*.md' -o -name 'UI_Design_*.md' \) \
      -print | sort
  )
fi

(( ${#INPUTS[@]} > 0 )) || fail "No input files provided. Use --all or pass file paths."

for input in "${INPUTS[@]}"; do
  sync_one "$input"
done

log "done"

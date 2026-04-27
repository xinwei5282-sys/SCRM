#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/Users/weiran/SCRM"
CLAUDE_DIR="${HOME}/.claude/commands"
MARKER='- 项目角色映射表：`/Users/weiran/SCRM/.claude/role-registry.md`'
ROLE_FILES=(
  "${CLAUDE_DIR}/arch.md"
  "${CLAUDE_DIR}/ba.md"
  "${CLAUDE_DIR}/content.md"
  "${CLAUDE_DIR}/dev.md"
  "${CLAUDE_DIR}/finance.md"
  "${CLAUDE_DIR}/growth.md"
  "${CLAUDE_DIR}/legal.md"
  "${CLAUDE_DIR}/lobster.md"
  "${CLAUDE_DIR}/main.md"
  "${CLAUDE_DIR}/ops.md"
  "${CLAUDE_DIR}/pm.md"
  "${CLAUDE_DIR}/sm.md"
  "${CLAUDE_DIR}/support.md"
  "${CLAUDE_DIR}/trader.md"
  "${CLAUDE_DIR}/ui.md"
)

ensure_bridge_block() {
  local file="$1"
  local marker="$2"

  if grep -Fq -- "$marker" "$file"; then
    echo "[skip] bridge already present: $file"
    return 0
  fi

  tmp="$(mktemp)"
  awk -v marker="$marker" '
    function print_bridge() {
      print ""
      print "## Claude / Codex 共享角色真源"
      print ""
      print "- 角色真源：`~/.openclaw/agents/*/agent/`"
      print "- 项目角色映射表：`/Users/weiran/SCRM/.claude/role-registry.md`"
      print "- 如果当前任务来自 SCRM 项目，优先遵循项目内 `role-router` 的角色映射和主导规则"
    }
    {
      print
      if ($0 ~ /~\/\.claude\/skills\/hermes-loop\/SKILL\.md/) {
        print_bridge()
      } else if ($0 ~ /~\/\.openclaw\/workspace\/USER\.md/) {
        print_bridge()
      }
    }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
  echo "[ok] updated: $file"
}

for file in "${ROLE_FILES[@]}"; do
  ensure_bridge_block "$file" "$MARKER"
done

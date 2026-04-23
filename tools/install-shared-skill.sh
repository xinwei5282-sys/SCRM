#!/usr/bin/env bash
set -euo pipefail

SHARED_ROOT="${HOME}/.shared-ai-skills"
CODEX_ROOT="${HOME}/.codex/skills"
CLAUDE_ROOT="${HOME}/.claude/skills"
INSTALLER="${HOME}/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py"

usage() {
  cat <<'EOF'
Usage:
  install-shared-skill.sh (--repo OWNER/REPO --path REPO_PATH | --url GITHUB_URL | --local-path PATH)
                          [--name SKILL_NAME]
                          [--description TEXT]
                          [--ref REF]
                          [--method auto|download|git]

Examples:
  install-shared-skill.sh --repo product-on-purpose/pm-skills --path skills/deliver-prd --name prd-writer
  install-shared-skill.sh --url https://github.com/coleam00/excalidraw-diagram-skill --name excalidraw-diagram
  install-shared-skill.sh --local-path ~/.claude/skills/solo-toolkit/data/impeccable/frontend-design --name frontend-design
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

require_arg() {
  local value="$1"
  local flag="$2"
  [[ -n "${value}" ]] || die "missing required ${flag}"
}

rewrite_frontmatter() {
  local skill_dir="$1"
  local new_name="$2"
  local new_description="$3"

  [[ -n "${new_name}${new_description}" ]] || return 0

  local skill_file="${skill_dir}/SKILL.md"
  [[ -f "${skill_file}" ]] || die "missing ${skill_file}"

  python3 - "$skill_file" "$new_name" "$new_description" <<'PY'
from pathlib import Path
import json
import re
import sys

skill_file = Path(sys.argv[1])
new_name = sys.argv[2]
new_description = sys.argv[3]
text = skill_file.read_text()

if not text.startswith("---\n"):
    raise SystemExit(f"{skill_file} does not start with YAML frontmatter")

parts = text.split("---\n", 2)
if len(parts) < 3:
    raise SystemExit(f"{skill_file} has malformed YAML frontmatter")

frontmatter = parts[1]
body = parts[2]

if new_name:
    if re.search(r"^name:\s*.*$", frontmatter, flags=re.MULTILINE):
        frontmatter = re.sub(r"^name:\s*.*$", f"name: {new_name}", frontmatter, count=1, flags=re.MULTILINE)
    else:
        frontmatter = f"name: {new_name}\n{frontmatter}"

if new_description:
    replacement = f"description: {json.dumps(new_description, ensure_ascii=False)}"
    if re.search(r"^description:\s*.*$", frontmatter, flags=re.MULTILINE):
        frontmatter = re.sub(r"^description:\s*.*$", replacement, frontmatter, count=1, flags=re.MULTILINE)
    else:
        frontmatter = f"{frontmatter}{replacement}\n"

skill_file.write_text(f"---\n{frontmatter}---\n{body}")
PY
}

link_skill() {
  local skill_name="$1"
  mkdir -p "${CODEX_ROOT}" "${CLAUDE_ROOT}"

  rm -f "${CODEX_ROOT}/${skill_name}"
  ln -s "${SHARED_ROOT}/${skill_name}" "${CODEX_ROOT}/${skill_name}"

  rm -f "${CLAUDE_ROOT}/${skill_name}"
  ln -s "${SHARED_ROOT}/${skill_name}" "${CLAUDE_ROOT}/${skill_name}"
}

repo=""
repo_path=""
url=""
local_path=""
skill_name=""
description=""
ref="main"
method="auto"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      repo="${2:-}"
      shift 2
      ;;
    --path)
      repo_path="${2:-}"
      shift 2
      ;;
    --url)
      url="${2:-}"
      shift 2
      ;;
    --local-path)
      local_path="${2:-}"
      shift 2
      ;;
    --name)
      skill_name="${2:-}"
      shift 2
      ;;
    --description)
      description="${2:-}"
      shift 2
      ;;
    --ref)
      ref="${2:-}"
      shift 2
      ;;
    --method)
      method="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

source_count=0
[[ -n "${repo}" || -n "${repo_path}" ]] && source_count=$((source_count + 1))
[[ -n "${url}" ]] && source_count=$((source_count + 1))
[[ -n "${local_path}" ]] && source_count=$((source_count + 1))
[[ "${source_count}" -eq 1 ]] || die "choose exactly one source: (--repo + --path) or --url or --local-path"

mkdir -p "${SHARED_ROOT}"

if [[ -n "${local_path}" ]]; then
  require_arg "${skill_name}" "--name when using --local-path"
  rm -f "${SHARED_ROOT}/${skill_name}"
  ln -s "${local_path}" "${SHARED_ROOT}/${skill_name}"
else
  if [[ -n "${repo}" || -n "${repo_path}" ]]; then
    require_arg "${repo}" "--repo"
    require_arg "${repo_path}" "--path"
  fi

  if [[ -n "${url}" ]]; then
    if [[ -n "${skill_name}" ]]; then
      python3 "${INSTALLER}" --url "${url}" --name "${skill_name}" --dest "${SHARED_ROOT}" --ref "${ref}" --method "${method}"
    else
      python3 "${INSTALLER}" --url "${url}" --dest "${SHARED_ROOT}" --ref "${ref}" --method "${method}"
    fi
  else
    if [[ -n "${skill_name}" ]]; then
      python3 "${INSTALLER}" --repo "${repo}" --path "${repo_path}" --name "${skill_name}" --dest "${SHARED_ROOT}" --ref "${ref}" --method "${method}"
    else
      python3 "${INSTALLER}" --repo "${repo}" --path "${repo_path}" --dest "${SHARED_ROOT}" --ref "${ref}" --method "${method}"
    fi
  fi
fi

if [[ -z "${skill_name}" ]]; then
  if [[ -n "${repo_path}" ]]; then
    skill_name="$(basename "${repo_path}")"
  elif [[ -n "${local_path}" ]]; then
    skill_name="$(basename "${local_path}")"
  else
    skill_name="$(basename "${url}")"
  fi
fi

rewrite_frontmatter "${SHARED_ROOT}/${skill_name}" "${skill_name}" "${description}"
link_skill "${skill_name}"

echo "Shared skill ready: ${skill_name}"
echo "  shared: ${SHARED_ROOT}/${skill_name}"
echo "  codex:  ${CODEX_ROOT}/${skill_name}"
echo "  claude: ${CLAUDE_ROOT}/${skill_name}"

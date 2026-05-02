#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
hooks_dir="$repo_root/.git/hooks"

install_hook() {
  local name="$1"
  cp "$repo_root/scripts/hooks/$name" "$hooks_dir/$name"
  chmod +x "$hooks_dir/$name"
}

install_hook post-commit
install_hook post-merge

echo "Installed Pandorha maintenance hooks: post-commit, post-merge"

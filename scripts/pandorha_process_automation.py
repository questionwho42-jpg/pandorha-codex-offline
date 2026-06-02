#!/usr/bin/env python3
"""Zero-token maintenance automation for Pandorha Engine."""

from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import subprocess
from pathlib import Path


ROOT = Path(os.environ.get("PANDORHA_PROCESS_ROOT", Path(__file__).resolve().parents[1])).resolve()
LEDGER = ROOT / "docs" / "process" / "task-ledger.md"
INBOX = ROOT / "docs" / "process" / "change-inbox.md"
CHANGELOG = ROOT / "docs" / "changelog.md"

DEFAULT_MODEL = os.environ.get(
    "PANDORHA_REVIEW_MODEL",
    "gpt-5.5 high-reasoning final review; local automation zero-token",
)

LEDGER_MARKERS = {
    "in-progress": "pandorha-ledger:in-progress",
    "completed": "pandorha-ledger:completed",
    "unfinished": "pandorha-ledger:unfinished",
    "snapshots": "pandorha-ledger:snapshots",
}


def now() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def run_git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    return result.stdout.strip()


def git_state() -> dict[str, object]:
    status_lines = run_git("status", "--short").splitlines()
    changed_files = [parse_status_path(line) for line in status_lines]
    return {
        "branch": run_git("branch", "--show-current") or "detached",
        "commit": run_git("log", "-1", "--pretty=format:%h %s") or "no commits",
        "changed_files": changed_files,
        "changed_count": len(changed_files),
    }


def parse_status_path(line: str) -> str:
    if len(line) >= 4 and line[2] == " ":
        return line[3:]
    parts = line.split(maxsplit=1)
    return parts[1] if len(parts) == 2 else line


def read_file(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def ensure_files() -> None:
    if not LEDGER.exists():
        write_file(
            LEDGER,
            "# Task Ledger\n\n## In Progress\n<!-- pandorha-ledger:in-progress -->\n<!-- /pandorha-ledger:in-progress -->\n\n"
            "## Completed\n<!-- pandorha-ledger:completed -->\n<!-- /pandorha-ledger:completed -->\n\n"
            "## Unfinished\n<!-- pandorha-ledger:unfinished -->\n<!-- /pandorha-ledger:unfinished -->\n\n"
            "## Snapshots\n<!-- pandorha-ledger:snapshots -->\n<!-- /pandorha-ledger:snapshots -->\n",
        )
    if not INBOX.exists():
        write_file(
            INBOX,
            "# Change Inbox\n\n## Open\n<!-- pandorha-inbox:open -->\n<!-- /pandorha-inbox:open -->\n\n"
            "## Promoted\n<!-- pandorha-inbox:promoted -->\n<!-- /pandorha-inbox:promoted -->\n",
        )
    if not CHANGELOG.exists():
        write_file(
            CHANGELOG,
            "# Changelog\n\n<!-- pandorha-changelog:main -->\n<!-- /pandorha-changelog:main -->\n",
        )


def marker_bounds(content: str, marker: str) -> tuple[int, int]:
    start = f"<!-- {marker} -->"
    end = f"<!-- /{marker} -->"
    start_pos = content.find(start)
    end_pos = content.find(end)
    if start_pos == -1 or end_pos == -1 or end_pos < start_pos:
        raise ValueError(f"Missing marker pair: {marker}")
    return start_pos + len(start), end_pos


def insert_under_marker(path: Path, marker: str, block: str) -> None:
    content = read_file(path)
    start, end = marker_bounds(content, marker)
    before = content[:start]
    inside = content[start:end]
    after = content[end:]
    new_inside = "\n" + block.strip() + "\n" + inside.strip("\n")
    write_file(path, before + new_inside + "\n" + after.lstrip("\n"))


def task_pattern(task_id: str) -> re.Pattern[str]:
    escaped = re.escape(task_id)
    return re.compile(
        rf"\n?<!-- pandorha-task:{escaped} -->.*?<!-- /pandorha-task:{escaped} -->\n?",
        re.DOTALL,
    )


def find_task(task_id: str) -> str | None:
    match = task_pattern(task_id).search(read_file(LEDGER))
    return match.group(0).strip() if match else None


def remove_task(task_id: str) -> None:
    content = task_pattern(task_id).sub("\n", read_file(LEDGER))
    write_file(LEDGER, re.sub(r"\n{3,}", "\n\n", content))


def set_field(block: str, field: str, value: str) -> str:
    pattern = re.compile(rf"^- {re.escape(field)}: .*$", re.MULTILINE)
    line = f"- {field}: {value}"
    if pattern.search(block):
        return pattern.sub(line, block)
    return block.replace("\n#### Checkpoints", f"\n{line}\n#### Checkpoints")


def append_checkpoint(block: str, args: argparse.Namespace) -> str:
    entry = (
        f"\n#### Checkpoint {now()}\n"
        f"- Done: {args.done}\n"
        f"- Next: {args.next}\n"
        f"- Risks: {args.risks}\n"
        f"- Improvements: {args.improvements}\n"
        f"- Model/config: {args.model}\n"
    )
    return block.replace(f"<!-- /pandorha-task:{args.id} -->", entry + f"<!-- /pandorha-task:{args.id} -->")


def slug(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return cleaned[:48] or "task"


def limited_files(files: list[str], limit: int = 40) -> str:
    if not files:
        return "- none"
    shown = files[:limit]
    extra = len(files) - len(shown)
    lines = [f"- {item}" for item in shown]
    if extra > 0:
        lines.append(f"- ... {extra} more")
    return "\n".join(lines)


def command_init(_: argparse.Namespace) -> None:
    ensure_files()


def command_start(args: argparse.Namespace) -> None:
    ensure_files()
    state = git_state()
    task_id = args.id or f"{dt.datetime.now().strftime('%Y%m%d-%H%M%S')}-{slug(args.title)}"
    timestamp = now()
    block = f"""<!-- pandorha-task:{task_id} -->
### {args.title}
- id: {task_id}
- status: in-progress
- kind: {args.kind}
- planned: {"no" if args.unplanned else "yes"}
- started_at: {timestamp}
- finished_at: pending
- model_started: {args.model}
- model_finished: pending
- last_modified_at: {timestamp}
- branch: {state["branch"]}
- commit_at_start: {state["commit"]}
- summary: {args.summary}
- last_change: created task record
#### Files At Start
{limited_files(state["changed_files"])}
#### Checkpoints
#### Checkpoint {timestamp}
- Done: task record created
- Next: {args.next}
- Risks: {args.risks}
- Improvements: {args.improvements}
- Model/config: {args.model}
<!-- /pandorha-task:{task_id} -->"""
    insert_under_marker(LEDGER, LEDGER_MARKERS["in-progress"], block)
    if args.unplanned:
        inbox_block = f"""<!-- pandorha-inbox:{task_id} -->
### {args.title}
- id: {task_id}
- status: open
- created_at: {timestamp}
- source: task-ledger
- summary: {args.summary}
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:{task_id} -->"""
        insert_under_marker(INBOX, "pandorha-inbox:open", inbox_block)
    print(task_id)


def command_checkpoint(args: argparse.Namespace) -> None:
    ensure_files()
    block = find_task(args.id)
    if block is None:
        raise SystemExit(f"Task id not found: {args.id}")
    block = set_field(block, "last_modified_at", now())
    block = set_field(block, "last_change", args.done)
    block = append_checkpoint(block, args)
    remove_task(args.id)
    insert_under_marker(LEDGER, LEDGER_MARKERS[args.status], block)


def move_task(args: argparse.Namespace, target: str) -> None:
    ensure_files()
    block = find_task(args.id)
    if block is None:
        raise SystemExit(f"Task id not found: {args.id}")
    timestamp = now()
    block = set_field(block, "status", target)
    block = set_field(block, "last_modified_at", timestamp)
    block = set_field(block, "last_change", args.summary)
    if target == "completed":
        block = set_field(block, "finished_at", timestamp)
        block = set_field(block, "model_finished", args.model)
    block = append_checkpoint(
        block,
        argparse.Namespace(
            id=args.id,
            done=args.summary,
            next=args.next,
            risks=args.risks,
            improvements=args.improvements,
            model=args.model,
        ),
    )
    remove_task(args.id)
    insert_under_marker(LEDGER, LEDGER_MARKERS[target], block)


def command_complete(args: argparse.Namespace) -> None:
    move_task(args, "completed")


def command_unfinished(args: argparse.Namespace) -> None:
    move_task(args, "unfinished")


def command_snapshot(args: argparse.Namespace) -> None:
    ensure_files()
    state = git_state()
    if args.skip_clean and state["changed_count"] == 0:
        return
    timestamp = now()
    block = f"""### {timestamp} - {args.reason}
- branch: {state["branch"]}
- commit: {state["commit"]}
- changed_files_count: {state["changed_count"]}
#### Changed Files
{limited_files(state["changed_files"])}
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
"""
    insert_under_marker(LEDGER, LEDGER_MARKERS["snapshots"], block)


def command_validate(_: argparse.Namespace) -> None:
    ensure_files()
    errors, warnings = validate_records()
    for warning in warnings:
        print(f"warning: {warning}")
    if errors:
        raise SystemExit("\n".join(errors))
    print("maintenance records are valid")


def validate_records() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    for path, markers in (
        (LEDGER, LEDGER_MARKERS.values()),
        (INBOX, ("pandorha-inbox:open", "pandorha-inbox:promoted")),
        (CHANGELOG, ("pandorha-changelog:main",)),
    ):
        content = read_file(path)
        for marker in markers:
            try:
                marker_bounds(content, marker)
            except ValueError as error:
                errors.append(str(error))

    ledger_content = read_file(LEDGER)
    inbox_content = read_file(INBOX)
    errors.extend(find_duplicate_markers(ledger_content, "pandorha-task", "Duplicate task id"))
    errors.extend(find_duplicate_markers(inbox_content, "pandorha-inbox", "Duplicate inbox id"))
    errors.extend(find_incomplete_completed_tasks(ledger_content))
    warnings.extend(find_empty_snapshots(ledger_content))
    return errors, warnings


def find_duplicate_markers(content: str, prefix: str, label: str) -> list[str]:
    ids = re.findall(rf"<!-- {re.escape(prefix)}:([^ ]+?) -->", content)
    seen: set[str] = set()
    duplicates: list[str] = []
    for item in ids:
        if item in seen and item not in duplicates:
            duplicates.append(item)
        seen.add(item)
    return [f"{label}: {item}" for item in duplicates]


def find_incomplete_completed_tasks(content: str) -> list[str]:
    errors: list[str] = []
    completed_match = re.search(
        r"<!-- pandorha-ledger:completed -->(.*?)<!-- /pandorha-ledger:completed -->",
        content,
        re.DOTALL,
    )
    if not completed_match:
        return errors

    for match in re.finditer(
        r"<!-- pandorha-task:([^ ]+?) -->(.*?)<!-- /pandorha-task:\1 -->",
        completed_match.group(1),
        re.DOTALL,
    ):
        task_id = match.group(1)
        block = match.group(2)
        if "- finished_at: pending" in block:
            errors.append(f"Completed task has pending finished_at: {task_id}")
        if "- model_finished: pending" in block:
            errors.append(f"Completed task has pending model_finished: {task_id}")
        if "- status: completed" not in block:
            errors.append(f"Completed task has non-completed status field: {task_id}")
    return errors


def find_empty_snapshots(content: str) -> list[str]:
    warnings: list[str] = []
    snapshot_match = re.search(
        r"<!-- pandorha-ledger:snapshots -->(.*?)<!-- /pandorha-ledger:snapshots -->",
        content,
        re.DOTALL,
    )
    if not snapshot_match:
        return warnings

    current_title = ""
    for line in snapshot_match.group(1).splitlines():
        if line.startswith("### "):
            current_title = line.removeprefix("### ").strip()
        if line.strip() == "- changed_files_count: 0":
            warnings.append(f"Empty snapshot found: {current_title}")
    return warnings


def command_post_merge(_: argparse.Namespace) -> None:
    ensure_files()
    state = git_state()
    if state["branch"] != "main":
        return
    timestamp = now()
    block = f"""## {timestamp} - main merge promotion candidate
- branch: {state["branch"]}
- commit: {state["commit"]}
- changed_files_count: {state["changed_count"]}
- review_model: {DEFAULT_MODEL}
#### Changed Files
{limited_files(state["changed_files"])}
#### Promotion Review
- Done: merge detected on main and changelog promotion candidate created
- Next: model final review should decide whether ADR, system docs, conventions, or llms.txt need updates
- Risks: semantic promotion still requires human/model judgment
- Improvements: include task ids in commit messages for tighter traceability
"""
    insert_under_marker(CHANGELOG, "pandorha-changelog:main", block)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    init_parser = sub.add_parser("init", help="Ensure maintenance files exist.")
    init_parser.set_defaults(func=command_init)

    start = sub.add_parser("start", help="Start a tracked task.")
    start.add_argument("--title", required=True)
    start.add_argument("--summary", required=True)
    start.add_argument("--kind", default="task")
    start.add_argument("--id")
    start.add_argument("--model", default=DEFAULT_MODEL)
    start.add_argument("--unplanned", action="store_true")
    start.add_argument("--next", default="implement the requested change")
    start.add_argument("--risks", default="unknown until implementation begins")
    start.add_argument("--improvements", default="automate repeated manual steps where practical")
    start.set_defaults(func=command_start)

    checkpoint = sub.add_parser("checkpoint", help="Append a task checkpoint.")
    checkpoint.add_argument("--id", required=True)
    checkpoint.add_argument("--done", required=True)
    checkpoint.add_argument("--next", required=True)
    checkpoint.add_argument("--risks", default="none recorded")
    checkpoint.add_argument("--improvements", default="none recorded")
    checkpoint.add_argument("--model", default=DEFAULT_MODEL)
    checkpoint.add_argument("--status", choices=["in-progress", "completed", "unfinished"], default="in-progress")
    checkpoint.set_defaults(func=command_checkpoint)

    for name, func in (("complete", command_complete), ("unfinished", command_unfinished)):
        item = sub.add_parser(name, help=f"Move a task to {name}.")
        item.add_argument("--id", required=True)
        item.add_argument("--summary", required=True)
        item.add_argument("--next", default="none")
        item.add_argument("--risks", default="none recorded")
        item.add_argument("--improvements", default="none recorded")
        item.add_argument("--model", default=DEFAULT_MODEL)
        item.set_defaults(func=func)

    snapshot = sub.add_parser("snapshot", help="Record current git state.")
    snapshot.add_argument("--reason", default="manual")
    snapshot.add_argument("--skip-clean", action="store_true", help="Do not write a snapshot when git status is clean.")
    snapshot.set_defaults(func=command_snapshot)

    post_merge = sub.add_parser("post-merge", help="Create main-branch promotion candidate after merge.")
    post_merge.set_defaults(func=command_post_merge)

    validate = sub.add_parser("validate", help="Validate maintenance markers and records.")
    validate.set_defaults(func=command_validate)

    doctor = sub.add_parser("doctor", help="Alias for validate.")
    doctor.set_defaults(func=command_validate)

    return parser


def main() -> None:
    args = build_parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

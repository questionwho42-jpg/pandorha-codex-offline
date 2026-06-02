import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = REPO_ROOT / "scripts" / "pandorha_process_automation.py"


class ProcessAutomationTests(unittest.TestCase):
    def test_validate_accepts_fresh_files(self) -> None:
        with temporary_project() as root_path:
            root = Path(root_path)
            run_script(root, "init")

            result = run_script(root, "validate")

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("maintenance records are valid", result.stdout)

    def test_validate_rejects_broken_markers(self) -> None:
        with temporary_project() as root_path:
            root = Path(root_path)
            run_script(root, "init")
            ledger = root / "docs" / "process" / "task-ledger.md"
            ledger.write_text("# broken\n<!-- pandorha-ledger:completed -->\n", encoding="utf-8")

            result = run_script(root, "validate")

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Missing marker pair", result.stderr)

    def test_validate_rejects_duplicate_inbox_ids(self) -> None:
        with temporary_project() as root_path:
            root = Path(root_path)
            run_script(root, "init")
            inbox = root / "docs" / "process" / "change-inbox.md"
            content = inbox.read_text(encoding="utf-8")
            duplicate = """<!-- pandorha-inbox:duplicate -->
### Duplicate
- id: duplicate
<!-- /pandorha-inbox:duplicate -->
<!-- pandorha-inbox:duplicate -->
### Duplicate Again
- id: duplicate
<!-- /pandorha-inbox:duplicate -->
"""
            inbox.write_text(
                content.replace("<!-- pandorha-inbox:open -->", f"<!-- pandorha-inbox:open -->\n{duplicate}"),
                encoding="utf-8",
            )

            result = run_script(root, "validate")

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Duplicate inbox id", result.stderr)

    def test_snapshot_skip_clean_does_not_write_empty_snapshot(self) -> None:
        with temporary_project() as root_path:
            root = Path(root_path)
            run_script(root, "init")
            run_git(root, "add", ".")
            run_git(root, "commit", "-m", "init")
            ledger = root / "docs" / "process" / "task-ledger.md"
            before = ledger.read_text(encoding="utf-8")

            result = run_script(root, "snapshot", "--reason", "post-commit", "--skip-clean")

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(before, ledger.read_text(encoding="utf-8"))


def temporary_project():
    return tempfile.TemporaryDirectory(dir=Path(os.environ.get("TMP", "C:/tmp")))


def run_script(root_context, *args: str) -> subprocess.CompletedProcess[str]:
    root = Path(root_context)
    environment = os.environ.copy()
    environment["PANDORHA_PROCESS_ROOT"] = str(root)
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        cwd=root,
        env=environment,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def run_git(root_context, *args: str) -> None:
    root = Path(root_context)
    subprocess.run(["git", "init"], cwd=root, check=True, stdout=subprocess.PIPE)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=root, check=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=root, check=True)
    subprocess.run(["git", *args], cwd=root, check=True, stdout=subprocess.PIPE)


if __name__ == "__main__":
    unittest.main()

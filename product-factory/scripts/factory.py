#!/usr/bin/env python3
"""Small, dependency-free helper for the Kalipeiro Product Factory.

It only creates local workspace folders and audits artifact presence. It does
not call external APIs, publish infrastructure, send messages, spend money,
or modify an existing product workspace unless explicitly asked to initialize
that workspace.
"""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

FACTORY_ROOT = Path(__file__).resolve().parents[1]
STATE_TEMPLATE = FACTORY_ROOT / "orchestrator" / "factory-state.example.yml"
DECISION_TEMPLATE = FACTORY_ROOT / "templates" / "DECISION-LOG.md"

STAGES = [
    ("00-idea", ["idea-brief.md"]),
    ("01-research", ["market-intelligence-report.md"]),
    ("02-validation", ["validation-report.md"]),
    ("03-product", ["product-brief.md", "prd.md"]),
    ("04-architecture", ["technical-specification.md"]),
    ("05-development", ["development-report.md"]),
    ("06-qa", ["qa-report.md"]),
    ("07-security", ["security-report.md"]),
    ("08-deployment", ["deployment-report.md"]),
    ("09-conversion", ["landing-page-brief.md"]),
    ("10-seo", ["seo-strategy.md"]),
    ("11-acquisition", ["acquisition-plan.md"]),
    ("12-monetization", ["pricing-experiment.md"]),
    ("13-analytics", ["analytics-plan.md"]),
    ("14-iteration", ["post-launch-report.md"]),
]


def stage_status(workspace: Path) -> list[dict[str, object]]:
    result = []
    for stage, artifacts in STAGES:
        stage_dir = workspace / stage
        present = [name for name in artifacts if (stage_dir / name).is_file()]
        missing = [name for name in artifacts if name not in present]
        result.append(
            {
                "stage": stage,
                "required": artifacts,
                "present": present,
                "missing": missing,
                "ready_by_artifact_presence": not missing,
            }
        )
    return result


def cmd_init(args: argparse.Namespace) -> int:
    workspace = Path(args.workspace).expanduser().resolve()
    if workspace.exists() and any(workspace.iterdir()):
        raise SystemExit(f"Refusing to initialize non-empty workspace: {workspace}; choose an empty or new directory.")
    workspace.mkdir(parents=True, exist_ok=True)
    for stage, _ in STAGES:
        (workspace / stage).mkdir(exist_ok=True)
    state_path = workspace / "factory-state.yml"
    decision_path = workspace / "DECISION-LOG.md"
    if not state_path.exists():
        shutil.copyfile(STATE_TEMPLATE, state_path)
    if not decision_path.exists():
        shutil.copyfile(DECISION_TEMPLATE, decision_path)
    readme = workspace / "README.md"
    if not readme.exists():
        readme.write_text(
            "# Product workspace\n\n"
            "Criado pela Kalipeiro Product Factory. Preencha `00-idea/idea-brief.md` "
            "e use o Master Orchestrator da Factory. Artefatos devem ser versionados "
            "com o produto; não coloque secrets neste workspace.\n",
            encoding="utf-8",
        )
    print(f"Initialized workspace: {workspace}")
    print("Next action: fill 00-idea/idea-brief.md and run status.")
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    workspace = Path(args.workspace).expanduser().resolve()
    if not workspace.is_dir():
        raise SystemExit(f"Workspace does not exist: {workspace}")
    statuses = stage_status(workspace)
    first_incomplete = next((item["stage"] for item in statuses if not item["ready_by_artifact_presence"]), "14-iteration")
    payload = {
        "workspace": str(workspace),
        "first_incomplete_stage_by_artifact_presence": first_incomplete,
        "stages": statuses,
        "warning": "Artifact presence is not a gate by itself; the Orchestrator must verify evidence and decision fields.",
    }
    if args.json:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return 0
    print(f"Workspace: {workspace}")
    print(f"First incomplete by artifact presence: {first_incomplete}")
    for item in statuses:
        status = "READY*" if item["ready_by_artifact_presence"] else "MISSING"
        missing = ", ".join(item["missing"]) or "-"
        print(f"{status:7} {item['stage']:18} missing: {missing}")
    print("* READY means files exist only; evidence and human gates still require review.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Kalipeiro Product Factory local workspace helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    init_parser = subparsers.add_parser("init", help="create a new empty product workspace")
    init_parser.add_argument("--workspace", required=True, help="destination directory")
    init_parser.set_defaults(func=cmd_init)

    status_parser = subparsers.add_parser("status", help="audit artifact presence in a workspace")
    status_parser.add_argument("--workspace", required=True, help="workspace directory")
    status_parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    status_parser.set_defaults(func=cmd_status)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""
Recursively searches a folder for HTML files whose names begin with '0'
and checks whether each file contains an em dash (— or &#8212; or &mdash;).
"""

import os
import sys
import argparse

EM_DASH_VARIANTS = [
    "\u2014",  # Unicode em dash character: —
    "&#8212;",  # HTML decimal entity
    "&mdash;",  # HTML named entity
]


def check_file_for_em_dash(filepath: str) -> tuple[bool, list[str]]:
    """Return (found, list_of_matched_variants) for a given file."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except OSError as e:
        print(f"  [ERROR] Could not read {filepath}: {e}")
        return False, []

    found_variants = [v for v in EM_DASH_VARIANTS if v in content]
    return bool(found_variants), found_variants


def scan_directory(root_dir: str) -> None:
    if not os.path.isdir(root_dir):
        print(f"Error: '{root_dir}' is not a valid directory.")
        sys.exit(1)

    print(f"Scanning: {os.path.abspath(root_dir)}\n")
    print(f"{'File':<70} {'Em Dash?':<10} {'Variants Found'}")
    print("-" * 110)

    total = 0
    hits = 0

    for dirpath, _dirnames, filenames in os.walk(root_dir):
        for filename in sorted(filenames):
            # Must be an HTML file whose name starts with '0'
            if not filename.startswith("0"):
                continue
            if not filename.lower().endswith((".html", ".htm")):
                continue

            total += 1
            filepath = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(filepath, root_dir)

            found, variants = check_file_for_em_dash(filepath)
            if found:
                hits += 1
                variant_display = ", ".join(
                    v.replace("\u2014", "U+2014 (—)") for v in variants
                )
                print(f"{rel_path:<70} {'YES':<10} {variant_display}")
            else:
                print(f"{rel_path:<70} {'no':<10}")

    print("-" * 110)
    print(f"\nResults: {hits}/{total} file(s) contain an em dash.\n")


def main():
    parser = argparse.ArgumentParser(
        description="Check HTML files starting with '0' for em dashes."
    )
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        help="Root directory to scan (default: current directory)",
    )
    args = parser.parse_args()
    scan_directory(args.directory)


if __name__ == "__main__":
    main()

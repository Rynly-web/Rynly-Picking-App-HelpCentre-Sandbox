#!/usr/bin/env python3
"""Report image sizes and optionally reduce existing files without changing paths.

Examples (run in the website repository root):
    python3 tools/optimise-images.py
    python3 tools/optimise-images.py --apply
    python3 tools/optimise-images.py --apply --jpeg

PNG optimisation is lossless at the pixel level; JPEG recompression is opt-in.
The script never renames images or edits CMS JSON references.
"""
from __future__ import annotations

import argparse
import os
import tempfile
from pathlib import Path

MEDIA_FOLDERS = (
    "assets/uploads",
    "assets/images/faq",
    "assets/images/slides",
    "assets/images/posters",
    "images/FAQ",
    "images/Picking",
)
SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


def readable(number: int) -> str:
    if number >= 1024 * 1024:
        return f"{number / (1024 * 1024):.2f} MB"
    return f"{number / 1024:.0f} KB"


def images(root: Path) -> list[Path]:
    output: list[Path] = []
    for folder in MEDIA_FOLDERS:
        directory = root / folder
        if directory.is_dir():
            output.extend(p for p in directory.rglob("*")
                          if p.is_file() and p.suffix.lower() in SUFFIXES)
    return sorted(output, key=lambda p: p.stat().st_size, reverse=True)


def optimise_image(path: Path, jpeg: bool) -> tuple[int, int, str]:
    """Write smaller bytes atomically, or leave the original completely intact."""
    before = path.stat().st_size
    suffix = path.suffix.lower()
    if suffix == ".webp":
        return before, before, "already WebP"
    if suffix in (".jpg", ".jpeg") and not jpeg:
        return before, before, "JPEG unchanged (use --jpeg to recompress)"
    from PIL import Image
    handle, tmp_name = tempfile.mkstemp(prefix="rynly-image-", suffix=".tmp", dir=path.parent)
    os.close(handle)
    tmp = Path(tmp_name)
    try:
        with Image.open(path) as original:
            if getattr(original, "is_animated", False):
                return before, before, "animated image skipped"
            if suffix == ".png":
                # Lossless PNG recompression; maintains all pixels and dimensions.
                original.save(tmp, format="PNG", optimize=True, compress_level=9)
            else:
                # JPEG is already lossy, so recompression is opt-in only.
                original.save(tmp, format="JPEG", quality=88, optimize=True,
                              progressive=True, icc_profile=original.info.get("icc_profile"))
        after = tmp.stat().st_size
        if after >= before * 0.98:
            return before, before, "no meaningful saving"
        os.replace(tmp, path)
        return before, after, "compressed"
    finally:
        tmp.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Recompress PNGs in place (never rename files)")
    parser.add_argument("--jpeg", action="store_true", help="Also recompress JPEGs at quality 88 (lossy)")
    args = parser.parse_args()
    # This script is installed under <repository>/tools/.
    root = Path(__file__).resolve().parent.parent
    found = images(root)
    total = sum(p.stat().st_size for p in found)
    print(f"Found {len(found)} images, total {readable(total)}")
    print("Largest files:")
    for p in found[:15]:
        print(f"  {readable(p.stat().st_size):>9}  {p.relative_to(root)}")
    if not args.apply:
        print("\nReport only: no files changed.")
        print("To optimise PNGs without changing paths: python3 tools/optimise-images.py --apply")
        print("This requires Pillow: python3 -m pip install Pillow")
        return
    try:
        from PIL import Image  # noqa: F401
    except ImportError as error:
        raise SystemExit("Install Pillow before applying: python3 -m pip install Pillow") from error
    saved = 0
    changed = 0
    for p in found:
        before, after, note = optimise_image(p, jpeg=args.jpeg)
        if before > after:
            changed += 1
            saved += before - after
            print(f"  saved {readable(before - after):>9}  {p.relative_to(root)}")
    print(f"\nOptimised {changed} files; saved {readable(saved)}. Paths and CMS links unchanged.")
    print("For larger savings, upload WebP versions of oversized screenshots through Pages CMS.")


if __name__ == "__main__":
    main()

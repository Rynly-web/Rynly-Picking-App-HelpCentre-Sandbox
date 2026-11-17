#!/usr/bin/env python3
"""Generate small WebP previews without replacing original CMS images.

The website displays WebP when a sidecar is listed in assets/image-variants.json,
while the zoom viewer retains the full-resolution PNG/JPEG. No source assets,
CMS links, JSON content or existing media files are rewritten.

  python3 tools/optimise-webp-previews.py
  python3 -m pip install Pillow
  python3 tools/optimise-webp-previews.py --apply
"""
from __future__ import annotations
import argparse
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = ['assets/images', 'assets/uploads', 'images']
MANIFEST = ROOT / 'assets/image-variants.json'
EXT = {'.png', '.jpg', '.jpeg'}
MIN_ORIGINAL = 75 * 1024


def images():
    for folder in FOLDERS:
        base = ROOT / folder
        if base.exists():
            for file in base.rglob('*'):
                if file.is_file() and file.suffix.lower() in EXT:
                    yield file


def pretty(n):
    return f'{n/1024:.0f} KB' if n < 1024*1024 else f'{n/(1024*1024):.2f} MB'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Generate and use WebP previews')
    parser.add_argument('--quality', type=int, default=82, help='WebP quality (default 82)')
    parser.add_argument('--max-width', type=int, default=1600, help='Max preview width (default 1600 px)')
    args = parser.parse_args()
    if not (65 <= args.quality <= 95) or not (640 <= args.max_width <= 3200):
        parser.error('Quality must be 65–95; max-width 640–3200')
    files = sorted(images(), key=lambda p:p.stat().st_size, reverse=True)
    print(f'Found {len(files)} PNG/JPEG images. Top 12 originals:')
    for f in files[:12]:
        print(f'  {pretty(f.stat().st_size):>8}  {f.relative_to(ROOT)}')
    if not args.apply:
        print('\nReport only. To create WebP previews (preserving originals):')
        print('  python3 -m pip install Pillow')
        print('  python3 tools/optimise-webp-previews.py --apply')
        return
    try:
        from PIL import Image, ImageOps
    except ImportError:
        parser.error('Pillow is required. Install with: python3 -m pip install Pillow')
    manifest = {}
    saved = 0
    total_original = 0
    total_optimised = 0
    for f in files:
        n = f.stat().st_size
        if n < MIN_ORIGINAL:  # Small originals are already fast enough
            continue
        try:
            with Image.open(f) as im:
                if getattr(im, 'is_animated', False):
                    continue
                im=ImageOps.exif_transpose(im)
                if im.mode not in ('RGB','RGBA'):
                    im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
                # Limit previews only. Original resolution remains available for zoom.
                if im.width > args.max_width:
                    nh = max(1, round(im.height * args.max_width / im.width))
                    im = im.resize((args.max_width, nh), Image.Resampling.LANCZOS)
                buffer=io.BytesIO()
                im.save(buffer, format='WEBP', quality=args.quality, method=5)
                data=buffer.getvalue()
            if len(data) > n * .85:  # Keep original when saving is not meaningful
                continue
            target=f.with_suffix('.webp')
            if not target.exists() or target.read_bytes() != data:
                target.write_bytes(data)
            original_path=f.relative_to(ROOT).as_posix()
            variant_path=target.relative_to(ROOT).as_posix()
            manifest[original_path]=variant_path
            saved+=1
            total_original+=n
            total_optimised+=len(data)
        except Exception as exc:
            print(f'  SKIP {f.relative_to(ROOT)}: {exc}')
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False)+'\n')
    print(f'\nCreated {saved} optimized previews: {pretty(total_original)} -> {pretty(total_optimised)}')
    print(f'Saved {pretty(total_original-total_optimised)} for those images ({(100*(total_original-total_optimised)/total_original):.1f}%).' if total_original else 'No eligible files found.')
    print('Original images are untouched. Review git status and commit the .webp files + manifest.')


if __name__=='__main__': main()

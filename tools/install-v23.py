#!/usr/bin/env python3
"""Add global video playback guidance to the current V22 project."""
import argparse
import json
from pathlib import Path

DEFAULT = 'If playback is blocked on your device, open the video directly.'
parser = argparse.ArgumentParser(description=__doc__)
mode = parser.add_mutually_exclusive_group(required=True)
mode.add_argument('--check', action='store_true')
mode.add_argument('--apply', action='store_true')
args = parser.parse_args()
root = Path.cwd()
files = ['.pages.yml', 'assets/js/app.js', 'assets/js/content-loader.js', 'index.html', 'content/site.json', 'tools/restore-uat-content.cjs']
try:
    original = {name: (root/name).read_text(encoding='utf-8') for name in files}
    out = dict(original)
    def replace(name, before, after):
        if after in out[name]:
            return
        if out[name].count(before) != 1:
            raise ValueError(f'Unexpected or missing anchor in {name}; no changes made.')
        out[name] = out[name].replace(before, after, 1)

    anchor = '  - name: siteName\n    label: Site name\n    type: string\n'
    field = '''  - name: videoPlaybackGuidance
    label: Video playback guidance (all videos)
    type: text
    description: "Shared note below every video, not individual tutorial instructions. Edit once to update all videos. Use the words 'open the video directly' to insert the clickable link; otherwise a direct link is added automatically. Blank leaves only the link."
'''
    replace('.pages.yml', anchor, anchor + field)
    before = '''      const fallback = n("p", "video-fallback", "If playback is blocked on your device, ");
      const link = n("a", "", "open the video directly");
      link.href = openUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      append(fallback, link, ".");
      card.append(fallback);'''
    after = '''      // V23: one shared, plain-text playback note for all video players.
      const guidance = typeof site.videoPlaybackGuidance === "string"
        ? site.videoPlaybackGuidance.trim()
        : "If playback is blocked on your device, open the video directly.";
      const fallback = n("p", "video-fallback");
      fallback.style.whiteSpace = "pre-line";
      const match = /open the video directly/i.exec(guidance);
      const link = n("a", "", match ? match[0] : "Open the video directly");
      link.href = openUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (match) {
        append(fallback, guidance.slice(0, match.index), link,
          guidance.slice(match.index + match[0].length));
      } else {
        if (guidance) append(fallback, guidance, "\\n");
        append(fallback, link, ".");
      }
      card.append(fallback);'''
    replace('assets/js/app.js', before, after)
    replace('assets/js/content-loader.js', 'assets/js/app.js?v=22', 'assets/js/app.js?v=23')
    replace('index.html', 'assets/js/content-loader.js?v=22', 'assets/js/content-loader.js?v=23')
    site = json.loads(original['content/site.json'])
    if not isinstance(site, dict) or not isinstance(site.get('home'), dict):
        raise ValueError('Unexpected site settings structure; no changes made.')
    if 'videoPlaybackGuidance' not in site:
        site['videoPlaybackGuidance'] = DEFAULT
        out['content/site.json'] = json.dumps(site, indent=2, ensure_ascii=False) + '\n'
    elif not isinstance(site['videoPlaybackGuidance'], str):
        raise ValueError('Existing videoPlaybackGuidance is not text; no changes made.')
    restore_anchor = "if (Object.hasOwn(uatSite,'searchTermsGuides')) prodSite.searchTermsGuides=uatSite.searchTermsGuides;"
    replace('tools/restore-uat-content.cjs', restore_anchor, restore_anchor + "\n// V23: keep the shared playback note with the UAT video drafts.\nif (Object.hasOwn(uatSite,'videoPlaybackGuidance')) prodSite.videoPlaybackGuidance=uatSite.videoPlaybackGuidance;")
    changed = [name for name in files if original[name] != out[name]]
    print('V23 changes: ' + (', '.join(changed) if changed else 'Already installed; nothing to change.'))
    print('Existing video records, FAQs, media, IDs and CMS action definitions are preserved.')
    if args.apply:
        for name in changed:
            (root/name).write_text(out[name], encoding='utf-8')
        print('V23 applied. Run validation before committing.')
    else:
        print('Preview only. No files changed.')
except (OSError, ValueError) as error:
    raise SystemExit(str(error))

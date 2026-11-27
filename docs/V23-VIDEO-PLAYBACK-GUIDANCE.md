# V23 — Shared video playback guidance

In Pages CMS, open **Homepage & search settings → Video playback guidance (all videos)**. This is a global note beneath every rendered video player, not a description of an individual tutorial. Save to UAT and review before any production release.

Suggested text:

We recommend turning on captions for additional guidance.
If playback is blocked on your device, open the video directly.

The words “open the video directly” become a clickable link to the current video. If omitted, a separate direct link is appended automatically. A blank note keeps the link only. Line breaks are preserved and all text is rendered safely as text, not HTML. The original note is retained as the initial value.

Install from the V22 Sandbox project root: copy `tools/install-v23.py` and this document, run `python3 tools/install-v23.py --check`, then `python3 tools/install-v23.py --apply`. The installer adds one setting and patches the shared renderer, cache versions and restore script. It preserves the UAT video guidance on restore, matching other UAT video settings. No production changes are made by installation or a Sandbox push. Review the diff, run `node tools/check-content.cjs` and JS syntax checks, then test a single and grouped video. The CMS changes still need an authenticated save test.

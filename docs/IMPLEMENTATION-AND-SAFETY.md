# Rynly Help Centre - V18 single CMS publishing controls

## Purpose

Pages CMS remains connected to the **Sandbox** repository only. Saving a field updates UAT. Two optional root actions let an invited editor:

1. Publish the *current UAT commit* to the existing production repository (Guided videos hidden).
2. Restore *published content only* from production into UAT, preserving unfinished Guided videos.

**No production change occurs merely by installing V18.** The publishing action refuses to run until the redesigned site is manually launched into the production repository, with `content/site.json` containing `home.showGuides: false`, `content/guides.json` containing an empty `items` array, and `CNAME` equal to `helpcentre.rynly.com`.

## What to copy

- `.github/workflows/pages-cms-publish-production.yml` (new)
- `.github/workflows/pages-cms-restore-uat.yml` (new)
- `tools/install-cms-actions.cjs` (new)
- `tools/validate-cms-action.cjs` (new)
- `tools/check-production-ready.cjs` (new)
- `tools/restore-uat-content.cjs` (new)

**Do not replace `.pages.yml`**. Run `node tools/install-cms-actions.cjs` from the Sandbox project root instead. It only inserts the action definitions, retaining all existing FAQ/video field definitions, list titles, file paths, and media configuration. The installer deliberately refuses to modify the file if root actions already exist.

## Security credentials

Create two **fine-grained GitHub Personal Access Tokens** (or deploy a GitHub App with equivalent narrow permissions) for the `Rynly-web` organization:

- Production token: repository `Rynly-Picking-App-HelpCentre` only; repository Contents **Read and write**.
- UAT token: repository `Rynly-Picking-App-HelpCentre-Sandbox` only; repository Contents **Read and write**.

Store them **as repository secrets on the Sandbox repository**, under Settings -> Secrets and variables -> Actions -> New repository secret:

- `HC_PROD_WRITE_TOKEN`
- `HC_UAT_WRITE_TOKEN`

Organization policy may require token approval or block fine-grained tokens. Tokens expire and need renewal. Never put tokens in `.pages.yml`, terminal commands, source files, screenshots or Confluence.

Invited editors able to trigger the Publish action can release **all eligible UAT content**. Restrict CMS access to trusted team members. The action confirmation checkbox is a caution prompt, not approval enforcement.

## Safety

- The action checks that the triggering UAT branch is `main` and uses the exact SHA shown in the CMS event. It stops if UAT changes between opening the action and running the workflow.
- Production publishing continues to use the pre-existing `tools/prepare-production.sh` script. It preserves the live `CNAME`, removes the Guide drafts from production data, and forces the whole Guide section hidden.
- The initial launch **must** be performed manually from the prepared production checkout. Until that happens, both workflows refuse to modify GitHub repositories beyond reading.
- Restore creates a backup branch `backup/uat-before-restore-<GitHub run ID>`, then copies `content/faqs.json`, `content/sections.json`, `content/support.json` and homepage/search settings (`content/site.json`) from production into UAT.
- Restore retains `content/guides.json`, `home.showGuides`, video title/subtitle fields and video search terms. It also leaves media uploads and application code untouched. This means it is **not** a restore of changed/deleted image bytes or CSS/JS.
- No automated deployment edits the local `Rynly-Picking-App-HelpCentre-PROD` folder: each workflow checks out fresh repositories in the GitHub runner.
- Neither action publishes just one editor's field changes. Publish sends the current shared UAT snapshot, except the production video restrictions.
- The media and content in the public Sandbox GitHub repository are public; hiding a page is not access control.

## Go-live order

1. Keep the prepared local production checkout **unpushed** while reviewing the initial redesign.
2. Install V18 in Sandbox/UAT; validate; commit and push **Sandbox only**. This makes the two actions visible in Pages CMS, but they cannot publish until the redesigned production baseline exists.
3. Set the two repository secrets on Sandbox.
4. Verify both actions appear in Pages CMS; optionally confirm they fail safely on the old production baseline (this creates a failed Actions run but no production commit).
5. When ready for initial launch: verify the prepared production checkout is still up to date with approved UAT content, test it locally, review the staged diff, manually commit and push **production main**.
6. After confirming production GitHub Pages deployed successfully, the new CMS actions become useful for subsequent routine releases and restores.

## Operating workflow for editors

Save -> review the Sandbox website -> Publish to production -> confirm UAT checked -> monitor the GitHub Action -> verify helpcentre.rynly.com.

If undesirable UAT content needs rollback -> Restore UAT content from production -> acknowledge shared changes will be lost for the defined sections -> monitor Action -> recheck the Sandbox website. Draft videos are retained.

## Links

- Pages CMS: https://app.pagescms.org/
- Sandbox preview: https://rynly-web.github.io/Rynly-Picking-App-HelpCentre-Sandbox/
- UAT repository: https://github.com/Rynly-web/Rynly-Picking-App-HelpCentre-Sandbox
- Prod repository: https://github.com/Rynly-web/Rynly-Picking-App-HelpCentre
- Production website: https://helpcentre.rynly.com/

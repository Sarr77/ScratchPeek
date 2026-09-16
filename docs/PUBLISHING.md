# Publishing checklist

ScratchPeek is backed up in the private repository
[Sarr77/ScratchPeek](https://github.com/Sarr77/ScratchPeek). Nothing in this
checkout automatically makes it public or submits a listing.

1. The chosen name is **ScratchPeek**, ID **sarr.scratchpeek**, author **Sarr**.
   The GitHub repository owner is **Sarr77**.
2. Run `node --test tests/model.test.cjs` and `omarchy plugin validate .`.
3. Complete the live checks in [TESTING.md](TESTING.md).
4. Review the README, MIT license (author: Sarr), preview, and repository contents.
5. Push the reviewed source and make the repository public. Remove the private
   repository notice from both READMEs; their installation URL is already set.
6. Tag the release `v0.6.0` and attach the source archive if desired.
7. Submit the repository URL to the directory. Directory review is separate
   from publishing the source and is controlled by its maintainers.

## Directories

- [Omarchy Plugins](https://plugins.omarchy.org/publish.html), linked by the
  official Omarchy manual. It requests a public repository, root manifest,
  README, license, safe installation/removal, and an optional preview.
  Submit through its [GitHub issue form](https://github.com/omacom/omarchy-plugin-marketplace/issues/new?template=submit-plugin.yml).
- [Omahub](https://omahub.dev/submit), another community directory. Sign in with
  GitHub and submit the public repository URL; maintainers approve listings.

Requirements checked on 2026-09-16. Recheck before submission.

Generate the source archive with `python3 tools/package.py`. The archive uses an
explicit list of source/documentation files and excludes local runtime data,
desktop configuration, and Git metadata. `docs/preview.svg` is an illustrated
preview with example data, not a screenshot of a user's desktop.

## Suggested listing

- **Name:** ScratchPeek
- **Author:** Sarr
- **Category:** Compositor / Productivity
- **Tags:** scratchpad, hyprland, workspaces, multi-monitor, bar-widget
- **Summary:** Know what is in your scratchpad and where it is open. Live window
  count, per-monitor state, and a window picker for Omarchy.
- **Permissions/behavior:** Reads local compositor window metadata, the local theme identity and desktop
  application icons/names. Only sends focus/toggle requests on explicit user
  actions. Saves language, appearance and label preferences through the scoped Omarchy settings API.
  No network, telemetry, storage of window titles, additional processes or privileges.
- **Languages:** 30 catalogs, automatic detection, manual language picker and Arabic RTL.
- **Compatibility:** Omarchy Quattro, built-in omarchy-shell bar.

Screenshots used in a public listing must not expose personal window titles.

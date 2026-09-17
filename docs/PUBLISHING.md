# Publishing ScratchPeek

Name **ScratchPeek** · ID **sarr.scratchpeek** · Author **Sarr**
Repository: [Sarr77/ScratchPeek](https://github.com/Sarr77/ScratchPeek)

## Listing

- Category: **Productivity**
- Tags: **bar, hyprland, workspaces**
- Summary: Know what’s in your scratchpad — and where it’s open. See your windows,
  focus a tab, or move one in or out from the Omarchy bar.
- Preview: `preview.png` in the repository root. The editable illustration is
  `docs/preview.svg`; all window names are examples and all artwork is original.

## Release checklist

1. Run the portable tests and Omarchy manifest validation.
2. Run the isolated lifecycle and preference tests, plus the relevant Qt and
   native checks listed in [TESTING.md](TESTING.md).
3. Review the root README, licenses, preview and source archive.
4. Prepare the commit and archive locally with `python3 tools/package.py`.
   Show Sarr the complete diff, exact commit, release title, text, assets and
   destinations. Get explicit approval of those exact details before any push,
   tag, release or listing change. Do not add generated release notes.
5. Confirm the repository is public and test an unauthenticated installation
   with `python3 tools/test_lifecycle.py --remote https://github.com/Sarr77/ScratchPeek`.
6. Publish only the approved GitHub release, with a matching `vX.Y.Z` tag and
   manifest version. Stable releases become eligible for automatic installation;
   drafts and prereleases do not. Submit the approved repository through the
   [marketplace form](https://github.com/omacom/omarchy-plugin-marketplace/issues/new?template=submit-plugin.yml)
   or its [CLI submission format](https://github.com/omacom/omarchy-plugin-marketplace/blob/main/SUBMISSION.md).
7. Check the bot’s validation and baseline reports. Listing requires a maintainer’s
   approval of the exact submitted commit; a GitHub release alone does not list it.

Requirements checked on 2026-09-17 against the current publication guide and
submission format. There must be one category and **one to three** allowed tags.

## Notes for reviewers

ScratchPeek is a native Quickshell bar widget, tested on Omarchy 4.0.4 and
Hyprland 0.56.2. Window transfers require the Lua configuration available in
Hyprland 0.56+. It has no persistent service or separate installer.

It reads local window/monitor metadata, application icons, theme identity and
scratchpad keybindings. Explicit user actions focus windows, show/hide the
scratchpad, or move an individually selected window. It uses short-lived
`hyprctl` commands and creates its own preference directory with `mkdir`.
No elevated privileges or additional runtime packages are required.

Preferences, including hint progress, are stored atomically in
`$XDG_STATE_HOME/scratchpeek/preferences.json` (default: `~/.local/state`).
The scoped Omarchy widget entry mirrors those settings. The durable file remains
after disable/removal so reinstall can restore it; the README explains how to
remove it. No window titles are written to disk, and unrelated settings are not
rewritten by the plugin. Automatic updates are enabled by default, can be
disabled in the panel, and contact GitHub's public release API and this
repository once per day while the widget runs. A short-lived Python/Git worker
stages a stable release, validates it and atomically exchanges the installed
directory. Update timestamps/results are local. There is no telemetry.

MIT, by Sarr. Adapted Omarchy dropdown controls retain their upstream MIT notice.
The preview contains fictional examples and no personal desktop information.

Review known limits in [TESTING.md](TESTING.md). Automated catalog checks and
approval are not a security audit or a guarantee of compatibility with every setup.

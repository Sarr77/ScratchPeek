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
4. Commit, tag the release, push and wait for CI. Generate its archive with
   `python3 tools/package.py`.
5. Confirm the repository is public and test an unauthenticated installation
   with `python3 tools/test_lifecycle.py --remote https://github.com/Sarr77/ScratchPeek`.
6. Publish the GitHub release. Submit the reviewed repository through the
   [marketplace form](https://github.com/omacom/omarchy-plugin-marketplace/issues/new?template=submit-plugin.yml)
   or its [CLI submission format](https://github.com/omacom/omarchy-plugin-marketplace/blob/main/SUBMISSION.md).
7. Check the bot’s validation and baseline reports. Listing requires a maintainer’s
   approval of the exact submitted commit; a GitHub release alone does not list it.

Requirements checked on 2026-09-17 against the current publication guide and
submission format. There must be one category and **one to three** allowed tags.

## Notes for reviewers

ScratchPeek is a native Quickshell bar widget, tested on Omarchy 4.0.4 and
Hyprland 0.56.2. Window transfers require the Lua configuration available in
Hyprland 0.56+. It has no separate service or installer.

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
rewritten by the plugin. The author link opens Sarr’s GitHub profile only when
activated. There is no telemetry or background network access.

MIT, by Sarr. Adapted Omarchy dropdown controls retain their upstream MIT notice.
The preview contains fictional examples and no personal desktop information.

Review known limits in [TESTING.md](TESTING.md). Automated catalog checks and
approval are not a security audit or a guarantee of compatibility with every setup.

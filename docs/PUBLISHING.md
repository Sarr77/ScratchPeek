# Publishing

ScratchPeek’s plugin ID is `sarr.scratchpeek`. The author is **Sarr**, and the
repository is [Sarr77/ScratchPeek](https://github.com/Sarr77/ScratchPeek).

## Marketplace description

- Category: **Productivity**
- Tags: **bar, hyprland, workspaces**
- Description: Window list and controls for Omarchy's scratchpad. Switch to a window,
  choose its workspace, or add another window. Keep Omarchy's look and workflow,
  without adding a macOS-style dock, Launchpad, Mission Control, or a Windows-style desktop.
- Preview: [preview.png](../preview.png), with its source in
  [docs/preview.svg](preview.svg) and the [panel image](preview-panel.png).
  The graphic uses example windows. The previous PNG and SVG are kept for
  [comparison](previews/README.md).

## Release steps

1. Run the checks in [Testing](TESTING.md), including Omarchy’s manifest
   validator and the install/update/reinstall test.
2. Check the version, changelog, README, preview and licenses. Review
   `tools/package-files.txt`, then build the archive with `python3 -B tools/package.py`.
3. Push the release commit and check its GitHub CI results. Test the public
   source with `python3 -B tools/test_lifecycle.py --remote https://github.com/Sarr77/ScratchPeek`.
4. Submit that exact commit for marketplace verification. For an initial listing,
   use the [submission form](https://github.com/omacom/omarchy-plugin-marketplace/issues/new?template=submit-plugin.yml)
   or [CLI submission format](https://github.com/omacom/omarchy-plugin-marketplace/blob/main/SUBMISSION.md).
   Update an existing pending submission instead of opening another.
   For a listed plugin, use **Verify and publish a newer upstream commit**.
5. Wait until the exact commit is approved and appears as verified in the catalog.
6. Enable GitHub release immutability before publishing the release. Its
   `vX.Y.Z` tag must point to the verified commit and match the manifest version.
   Add the archive to a draft release before publishing it.
7. Check that the release API reports `immutable: true` and that the tag resolves
   to the catalog’s verified SHA.

This order matters for users still on 0.11.0: their updater follows GitHub
releases without checking the marketplace. Publish the corrective release only
after its marketplace review. Later versions also need a verified catalog
snapshot before automatic updates can install them. See [Updates](UPDATES.md).

## Runtime details

ScratchPeek runs inside Omarchy’s Quickshell process. It reads local window and
monitor state, app icons, the theme and scratchpad keybindings. It uses `hyprctl`
for state checks and window actions, and `mkdir` for its settings directory.
It needs no administrator access or additional runtime packages.

Settings are saved outside the plugin directory and kept after removal.
The [README](../README.md#removal) explains where they are and how to delete them.
Window titles are not saved. There is no telemetry or persistent background service.

Automatic updates are enabled by default and can be disabled in the panel.
They use Python and Git, contact GitHub and the official Omarchy catalog, and
store check times and results locally. [Updates](UPDATES.md) documents the
verification and installation steps.

The plugin is MIT licensed. Adapted Omarchy controls retain their
[upstream MIT notice](../vendor/omarchy/LICENSE). Tested versions and known
limits are listed in [Testing](TESTING.md).

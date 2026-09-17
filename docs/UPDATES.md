# Updates

ScratchPeek checks for a stable release once every 24 hours while the widget is
running. **Automatic updates** is enabled by default and can be switched off in
the panel footer, beside **?**. Turning it off requires confirmation. Cancel,
Escape and the default Enter keep updates enabled. Turning it back on takes
one click. The choice survives restarts and reinstalls.

The first check runs about a minute after startup. An open panel or a window
transfer postpones starting the check. Both monitors share one schedule, saved
in `$XDG_STATE_HOME/scratchpeek/updates.json` (default: `~/.local/state`). A local
lock prevents concurrent workers. Restarting does not reset the daily interval.
There is no persistent service and no check while ScratchPeek is disabled.

## What gets installed

The updater requests GitHub's latest published stable release for
`Sarr77/ScratchPeek`. The tag must be `vX.Y.Z`, newer than the installed version.
Drafts, prereleases and ordinary commits on `main` are not automatic updates.
No GitHub account, token or extra package installation is needed.

A standard Git installation made by `omarchy plugin add` can update. Linked
development copies, non-Git installs, forks and dirty working trees are skipped.
Local commits must be ancestors of the release; divergent work is never reset.

The worker copies the current checkout into a temporary directory outside the
plugin discovery directory, fetches the release tag and fast-forwards that copy.
It verifies the plugin ID and version and runs Omarchy's manifest validator.
Only then does a Linux atomic directory exchange install the complete version.
There is no partial tree for the shell to load during a normal update. Before
the exchange, the worker rechecks that updates are enabled and the original
checkout is still present and unmodified.

The worker survives shell reloads, removes the old staging directory and asks
Omarchy to rescan plugins. If rescan fails, the new files are installed and load
on the next shell restart; `updates.json` records `restart-pending`. Download,
validation or exchange failures keep the installed version. Another attempt
is due the next day. Manifest validation does not prove runtime compatibility;
release testing still matters.

Preferences are outside the plugin directory and are never changed by the
updater. Turning updates off prevents new checks; it also cancels an in-progress
download's installation if the change is saved before the final check.

## Existing installations

Automatic updates were added in 0.11.0. Users of 0.10.0 need one manual update
to get this feature:

```sh
omarchy plugin update sarr.scratchpeek
```

Omarchy 4.0.4's manual command fetches the repository's default branch. The
automatic updater described here follows published releases instead. Keep the
public default branch suitable for installation too.

## Publishing and the marketplace

Only a stable release whose exact code and publication details Sarr has approved
may be published. A push alone does not trigger ScratchPeek's daily updater.

A GitHub release and marketplace verification are separate. The updater obtains
the author's published release, not a marketplace-approved snapshot. Updating
the verified listing requires the marketplace's **Verify and publish a newer
upstream commit** process. An upstream update may be shown as **Update unverified**
until that process finishes.

References: [GitHub releases API](https://docs.github.com/en/rest/releases/releases#get-the-latest-release),
[marketplace update process](https://github.com/omacom/omarchy-plugin-marketplace/blob/main/SUBMISSION.md#update-an-existing-listing).

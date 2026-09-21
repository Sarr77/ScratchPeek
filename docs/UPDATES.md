# Automatic updates

Automatic updates are enabled by default. The switch is beside **?** in the
panel footer. Turning it off asks for confirmation; Cancel, Escape and the
default Enter leave it on. The choice is saved between sessions.

## Schedule

The widget checks about a minute after its first start of the day if no check
has run that day, using the computer's local date. Further checks are due
every 6 hours while the widget is running. An open panel, a window transfer
or a show/hide operation postpones starting a check.

Logging in normally starts the widget. Reloading the shell or enabling the
widget also counts as a start, but does not cause an extra check if one has
already run that day. Staying logged in past midnight keeps the 6-hour schedule.

All monitors share one schedule. It is stored in
`$XDG_STATE_HOME/scratchpeek/updates.json`, defaulting to
`~/.local/state/scratchpeek/updates.json`. Restarting the shell does not reset
it. A file lock prevents two workers from updating at the same time.
There is no separate service running between checks.

When upgrading from the daily schedule, the next regular check is due 6 hours
after the last attempt. If that time has already passed, it runs at the next
idle timer tick. Missed checks do not accumulate while the widget is stopped.

## Which versions can be installed

Starting with 0.11.1, an automatic update needs both:

- A newer stable `vX.Y.Z` release from `Sarr77/ScratchPeek`, marked immutable
  by GitHub. Its tag and attached files cannot be replaced after publication.
- A verified record for that exact commit in the official Omarchy marketplace.

The updater reads GitHub’s
[latest-release endpoint](https://api.github.com/repos/Sarr77/ScratchPeek/releases/latest).
If it finds a newer immutable release, it checks the
[Omarchy catalog](https://plugins.omarchy.org/catalog.json).
The catalog must use schema 2 and contain one matching entry with:

| Field | Required value |
| --- | --- |
| `id` | `sarr.scratchpeek` |
| `repo` | `https://github.com/Sarr77/ScratchPeek` |
| `sourceType` | `community` |
| `repositoryLayout` | `root-plugin` |
| `manifestPath` | `manifest.json` |
| `installAvailable` | `true` |
| `verificationSnapshotStatus` | `verified` |
| `listingValidatedCommit`, `verificationCommit` | The same full 40-character commit SHA |

Built-in and placeholder entries are rejected. The release tag must resolve
to the catalog’s SHA. A newer unverified commit on the repository’s main branch
does not replace the separately verified release commit.

Drafts, prereleases, mutable releases and unverified commits are skipped.
A missing, ambiguous or unsupported response stops installation. There is no
fallback to `main`, an unverified tag or an earlier cached approval. Metadata
requests use HTTPS, reject redirects, and have size limits and timeouts.

The installed copy must also be a clean Git checkout from the original
repository. Linked development copies, non-Git installations, forks and local
changes are left alone. The current commit must be an ancestor of the release.
Checkouts with `assume-unchanged` or `skip-worktree` index flags are skipped,
because those flags can hide local changes.

## Installation

The updater works in a temporary directory outside Omarchy’s plugin directory:

1. Create a fresh Git checkout and fetch the release tag. Require its commit
   to match the catalog’s verified SHA before checking out files.
2. Check Git objects and commit ancestry. Reject symlinks and submodules.
3. Check the manifest’s plugin ID and version, then run Omarchy’s validator.
4. Read the release and catalog again. Stop if the release identity,
   immutability flag or verified SHA has changed, or either request fails.
5. Check that updates are still enabled and that the installed checkout has
   not been removed, replaced or edited during the download.
6. Compare every staged file’s bytes and executable mode with its Git object.
   This catches changes that `git status` can miss, including checkout conversions.
7. Swap the complete directories using Linux’s atomic directory exchange,
   remove the old copy and ask Omarchy to reload the plugin.

Git hooks, credential helpers, global configuration and inherited Git
environment overrides are disabled. The installed copy’s local Git
configuration is not copied into the temporary checkout. A timed-out command
and its child processes are stopped before cleanup.

The worker can finish if the shell reloads during a download. Settings stay
outside the plugin directory and are not modified by the updater. Disabling
updates also stops an in-progress download from being installed if the choice
is saved before the final check.

## Results and failures

The latest result is stored in `updates.json`:

| Status | Meaning |
| --- | --- |
| `current` | No newer stable version |
| `updated` | Installed and requested a plugin reload |
| `restart-pending` | Installed, but the reload failed; it will load after a shell restart |
| `unverified` | The release did not meet the immutability or marketplace checks |
| `local-changes` | The installed copy was not eligible, or changed during the download |
| `disabled` | Updates were switched off before installation |
| `failed` | A download, validation or installation step failed |

Download, verification and exchange failures leave the installed version in
place. Another check is due 6 hours after the last attempt, or at the first
start of a new day. The directory exchange exposes one complete version at a time.

These checks rely on GitHub and the official marketplace’s HTTPS responses
at installation time. Later changes to marketplace approval do not uninstall
an existing copy. Manifest validation checks structure; it does not establish
runtime compatibility. Release tests are still needed.

## Older installations and manual updates

Version 0.10.0 needs one manual update to get automatic updates. Version 0.11.0
has the earlier updater, which follows GitHub releases without marketplace
verification. That behavior changes only when the installed copy is updated.

```sh
omarchy plugin update sarr.scratchpeek
```

In Omarchy 4.0.4 this manual command uses the repository’s default branch.
Automatic updates from 0.11.1 use the verified release instead.

For a new release, follow [Publishing](PUBLISHING.md): the release commit must
appear as verified in the catalog before its immutable GitHub release is
published. A push alone does not trigger automatic installation. Eligible
users receive the release on their next scheduled check while the widget runs.

References: [GitHub releases API](https://docs.github.com/en/rest/releases/releases#get-the-latest-release),
[immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases),
[marketplace verification](https://github.com/omacom/omarchy-plugin-marketplace/blob/main/VERIFICATION.md).

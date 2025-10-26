# Automated Issues - Information

## Background

This repository previously had a GitHub Actions workflow (`create-issue.yaml`) that automatically created an issue for every commit pushed to the repository. This workflow was used for testing/demonstration purposes.

## Status

The `create-issue.yaml` workflow has been **disabled** by renaming it to `create-issue.yaml.bak` on October 26, 2025.

## Historical Issues

Issues that were automatically created by this workflow before it was disabled may still be present in the issue tracker. These issues typically have titles like:

```
Automated issue for commit: [commit-hash]
```

And bodies containing:

```
This issue was automatically created by the GitHub Action workflow **Create issue on commit**. 

The commit hash was: _[commit-hash]_.
```

## Resolution

These automated issues can generally be closed as they were created for tracking/testing purposes and do not represent actual bugs or feature requests. Each commit referenced in these issues should be individually verified to ensure it doesn't contain actual issues, but the automated creation itself does not indicate a problem.

## Example: Commit 5777cb0

The commit `5777cb0352cde017da63c46e8fe86ec6cdc63a83` added a valid workflow file (`.github/workflows/no-response.yml`) for automatically closing inactive issues. The automated issue created for this commit does not indicate any bug or problem with the commit itself.

## Current Issue Management Workflows

The repository currently uses the following workflows for issue management:

- `no-response.yml` - Automatically closes issues labeled 'more-info-needed' after 7 days of inactivity
- `stale-issues.yml` - Manages stale issues
- `close-single-word-issues.yml` - Automatically closes low-quality single-word issues
- `triage-issues.yml` - Manages issue triage
- `on-issue-close.yml` - Actions to take when issues are closed

These workflows are active and serve legitimate purposes in managing the repository's issues.

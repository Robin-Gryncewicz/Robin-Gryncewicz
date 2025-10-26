# GitHub Workflows

## Disabled Workflows

### create-issue.yaml (Disabled)

**File**: `create-issue.yaml.disabled`

**Reason for Disabling**: This workflow was creating an automated issue for every single push to the repository, which resulted in excessive issue spam. This is not a sustainable practice for issue tracking.

**Original Behavior**: 
- Triggered on every push to any branch
- Created a new GitHub issue with the commit SHA
- No filtering or conditions applied

**To Re-enable**: 
If you need to re-enable this workflow with proper conditions:
1. Rename `create-issue.yaml.disabled` back to `create-issue.yaml`
2. Add appropriate conditions such as:
   - Only trigger on specific branches (e.g., `main`)
   - Only trigger on specific commit message patterns
   - Only trigger for specific events (e.g., releases)
   - Add rate limiting or deduplication logic

**Example of a Better Approach**:
```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'src/**'  # Only trigger for source code changes
```

Or use commit message prefixes like `[create-issue]` to opt-in to issue creation.

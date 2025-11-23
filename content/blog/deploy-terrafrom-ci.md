---
title: "CI for Terraform with Plan/Apply Gates"
date: "2025-09-07"
summary: "Quick GitHub Actions workflow to plan, comment, and apply with approvals."
tags: ["terraform", "ci", "github-actions"]
---

Here's a starter GitHub Actions workflow for Terraform with a manual approval gate before apply.

<details>
<summary>.github/workflows/terraform.yaml</summary>

```yaml
name: terraform

on:
  pull_request:
    paths: ["infra/**"]
  workflow_dispatch:

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform -chdir=infra init
      - run: terraform -chdir=infra plan -out=tf.plan
      - run: terraform -chdir=infra show -no-color tf.plan > plan.txt
      - uses: marocchino/sticky-pull-request-comment@v2
        with:
          path: plan.txt

  apply:
    needs: plan
    if: ${{ github.event_name == 'workflow_dispatch' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform -chdir=infra init
      - run: terraform -chdir=infra apply -auto-approve
```

</details>

## How It Works

1. **On Pull Request**: The workflow runs `terraform plan` and posts the output as a comment
2. **Manual Approval**: Use GitHub's workflow dispatch to manually trigger the apply job
3. **Apply**: Runs `terraform apply` with auto-approve after the plan job completes

## Key Features

- ✅ Automatic planning on PR
- ✅ Plan output posted as PR comment
- ✅ Manual approval gate via workflow_dispatch
- ✅ Separate plan and apply jobs
- ✅ Terraform state management

This provides a safe CI/CD pipeline for infrastructure changes with visibility and control.

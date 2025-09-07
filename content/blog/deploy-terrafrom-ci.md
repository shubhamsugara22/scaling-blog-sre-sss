---
title: "CI for Terraform with Plan/Apply Gates"
date: "2025-09-07"
summary: "Quick GitHub Actions workflow to plan, comment, and apply with
approvals."
tags: ["terraform", "ci", "github-actions"]
---
Here’s a starter GitHub Actions workflow for Terraform with a manual approval
gate before apply.
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
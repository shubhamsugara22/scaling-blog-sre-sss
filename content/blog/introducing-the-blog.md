---
title: "Launching a DevOps & SRE Blog (with TIL stream)"
date: "2025-09-07"
summary: "Why another infra blog? Focus on practical snippets, TILs, and
production-ready patterns."
tags: ["devops", "sre", "infra"]
---
Welcome! Expect practical posts, IaC patterns, and short TILs you can apply in
minutes.
### A unique twist: Collapsible Infra-as-Code snippet
Use HTML `<details>` in markdown to tuck away longer snippets:
<details>
<summary>Terraform: Minimal S3 backend</summary>
```hcl
terraform {
backend "s3" {
bucket = "my-terraform-state"
key = "global/s3/terraform.tfstate"
region = "ap-south-1"
}
}
```
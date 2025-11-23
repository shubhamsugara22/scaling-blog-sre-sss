---
title: "Launching a DevOps & SRE Blog (with TIL stream)"
date: "2025-09-07"
summary: "Why another infra blog? Focus on practical snippets, TILs, and production-ready patterns."
tags: ["devops", "sre", "infra"]
---

Welcome! Expect practical posts, IaC patterns, and short TILs you can apply in minutes.

## What to Expect

This blog focuses on:

- **Practical DevOps patterns** - Real-world solutions you can implement today
- **Infrastructure as Code** - Terraform, CloudFormation, and other IaC tools
- **SRE practices** - Monitoring, alerting, incident response, and reliability
- **Today I Learned (TIL)** - Quick tips and discoveries worth sharing

## A Unique Twist: Collapsible Code Snippets

Use HTML `<details>` in markdown to tuck away longer snippets:

<details>
<summary>Terraform: Minimal S3 backend</summary>

```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "global/s3/terraform.tfstate"
    region = "ap-south-1"
  }
}
```

</details>

This keeps posts scannable while providing full code when needed.

## Why Another DevOps Blog?

There are plenty of DevOps blogs out there, but this one aims to be different:

1. **Concise and actionable** - No fluff, just practical solutions
2. **Production-tested** - Patterns that work in real environments
3. **Quick TILs** - Short discoveries that save time
4. **Modern tooling** - Focus on current best practices and tools

## What's Next?

Stay tuned for posts on:

- CI/CD pipelines for infrastructure
- Kubernetes deployment patterns
- Monitoring and observability strategies
- Cost optimization techniques
- Security best practices

Let's build reliable systems together!

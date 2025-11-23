---
title: "kubectl dry-run=server to validate manifests"
date: "2025-09-07"
summary: "Use the API server to validate without storing the object."
tags: ["kubernetes", "til"]
---

Use `--dry-run=server` to validate Kubernetes manifests against the API server without actually creating the resources.

```bash
kubectl apply -f deployment.yaml --dry-run=server -o yaml
```

## Why This Matters

- **Server-side validation**: Checks against admission controllers, webhooks, and API server rules
- **Catches real issues**: Unlike `--dry-run=client`, this validates against actual cluster policies
- **Safe testing**: Preview changes without affecting running resources
- **Output inspection**: Use `-o yaml` to see what would be created

## Example Use Cases

### Validate a deployment before applying

```bash
kubectl apply -f deployment.yaml --dry-run=server
```

### Check if a manifest would be accepted

```bash
kubectl create -f pod.yaml --dry-run=server -o yaml
```

### Test with different namespaces

```bash
kubectl apply -f service.yaml -n production --dry-run=server
```

## Client vs Server Dry Run

- `--dry-run=client`: Only validates syntax locally
- `--dry-run=server`: Validates against the actual API server (recommended)

Always use `server` mode for production validation!

---
title: "kubectl dry-run=server to validate manifests"
date: "2025-09-07"
summary: "Use the API server to validate without storing the object."
tags: ["kubernetes", "til"]
---
```bash
kubectl apply -f deployment.yaml --dry-run=server -o yaml
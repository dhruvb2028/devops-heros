# Session 15 - Helm

Dhruv Bansal - 24BCS10114

I packaged a small NGINX page as a Helm chart. The chart contains a Deployment, Service, and ConfigMap. `values.yaml` runs one development Pod; `values-prod.yaml` runs three Pods and changes the page text.

From this folder:

```bash
helm lint notes-chart
helm template notes-dev notes-chart
helm template notes-prod notes-chart -f notes-chart/values-prod.yaml
```

With a running Kubernetes cluster, the release workflow is:

```bash
helm install notes-dev notes-chart
helm upgrade notes-dev notes-chart -f notes-chart/values-prod.yaml
helm history notes-dev
helm upgrade notes-dev notes-chart --set image.tag=does-not-exist --wait --timeout 30s
helm rollback notes-dev 1
helm uninstall notes-dev
```

`helm template` lets me inspect the generated resources before installing them. The deliberately bad image tag should make the upgrade fail; `helm history` shows the revisions and `helm rollback` restores revision 1. The page is served from the ConfigMap mounted into NGINX, so the development and production values produce visibly different content. A pod-template checksum restarts Pods when the page values change.

# Two failures to investigate

These files create separate demo resources; they do not replace the working app.

1. `kubectl apply -f troubleshooting/broken-image.yaml` and inspect `kubectl describe pod -l app=labgear-broken-image -n labgear`. The image tag does not exist, so the pod should report a pull error. Delete the demo Deployment when finished.
2. `kubectl apply -f troubleshooting/broken-service.yaml` and compare `kubectl get endpoints labgear-broken-service -n labgear` with `kubectl get pods -n labgear --show-labels`. The Service selector has a typo, so it should have no endpoints. Delete the demo Service when finished.

Use `kubectl delete -f <same-file>` for each demo resource. These outcomes are expected from the manifests, not recorded results from a running cluster.

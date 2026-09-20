# Session 10 - Kubernetes Core Objects

Dhruv Bansal - 24BCS10114

This folder contains examples of a Pod, ReplicaSet, Deployment, and DaemonSet.

`deployment-v1.yaml` uses Nginx 1.27. `deployment-v2.yaml` changes the image to 1.28 and uses the default rolling update strategy. A rolling update replaces pods gradually, while blue-green keeps two versions running and switches the Service selector. Canary releases send a small portion of traffic to a second version. Recreate deletes the previous version before starting the next one.

```bash
kubectl apply -f pod.yaml
kubectl apply -f replicaset.yaml
kubectl apply -f deployment-v1.yaml
kubectl rollout status deployment/web-deployment -n session10-demo
kubectl apply -f deployment-v2.yaml
kubectl rollout history deployment/web-deployment -n session10-demo
kubectl apply -f daemonset.yaml
```

Useful lifecycle checks are `kubectl get pods`, `kubectl describe pod <name>`, and `kubectl logs <name> -p` for a previous container instance.

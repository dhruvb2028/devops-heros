# Session 10 - Kubernetes Core Objects

Dhruv Bansal - 24BCS10114

For this session I created a Pod, ReplicaSet, Deployment, and DaemonSet. I also added separate examples for the four deployment strategies discussed in class.

## Core objects

```bash
kubectl apply -f namespace.yaml
kubectl apply -f pod.yaml
kubectl apply -f replicaset.yaml
kubectl apply -f deployment-v1.yaml
kubectl apply -f daemonset.yaml
kubectl get pods,rs,deploy,ds -n session10-demo
```

The ReplicaSet keeps the requested number of pods running. The Deployment manages ReplicaSets and makes updates easier. The DaemonSet places one pod on every available node.

## Rolling update

```bash
kubectl apply -f rolling/service.yaml
kubectl rollout status deployment/web-deployment -n session10-demo
kubectl apply -f deployment-v2.yaml
kubectl rollout history deployment/web-deployment -n session10-demo
kubectl get pods -n session10-demo -l app=deployment-web --show-labels
```

This changes NGINX from 1.27 to 1.28 gradually. `maxUnavailable: 0` keeps the old pods available until the new pods are ready.

## Blue-green

```bash
kubectl apply -f blue-green/deployment-blue.yaml
kubectl apply -f blue-green/deployment-green.yaml
kubectl apply -f blue-green/service-blue.yaml
kubectl get endpoints blue-green-service -n session10-demo
kubectl apply -f blue-green/service-green.yaml
kubectl get endpoints blue-green-service -n session10-demo
```

Both versions run together. Applying the green Service changes its selector from `slot: blue` to `slot: green`, so switching and rollback are quick.

## Canary

```bash
kubectl apply -f canary/deployment-stable.yaml
kubectl apply -f canary/deployment-canary.yaml
kubectl apply -f canary/service.yaml
kubectl get pods -n session10-demo -l app=canary-demo --show-labels
```

The Service selects four stable pods and one canary pod. This gives the new version a smaller share of requests while it is being checked.

## Recreate

```bash
kubectl apply -f recreate/deployment-v1.yaml
kubectl apply -f recreate/service.yaml
kubectl apply -f recreate/deployment-v2.yaml
kubectl get pods -n session10-demo -l app=recreate-demo -w
```

The `Recreate` strategy removes the old pods before starting the new version, so a short period of downtime is expected.

For troubleshooting I used `kubectl describe pod`, `kubectl logs`, and `kubectl rollout status`. To remove everything from this session, run `kubectl delete namespace session10-demo`.

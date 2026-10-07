# Session 14 - Kubernetes Troubleshooting

Dhruv Bansal - 24BCS10114

This session is a small troubleshooting lab. I start with a healthy Deployment and Service, then apply one broken example at a time, inspect it, and replace it with the fixed version.

## Start with the healthy application

```bash
kubectl apply -f namespace.yaml
kubectl apply -f healthy-deployment.yaml
kubectl apply -f healthy-service.yaml
kubectl apply -f dns-client.yaml
kubectl get pods,svc,endpoints -n session14-demo
kubectl exec -n session14-demo dns-client -- nslookup troubleshooting-web
kubectl exec -n session14-demo dns-client -- wget -qO- http://troubleshooting-web
```

## Broken cases

For every issue, I use this order: `get`, `describe`, events, logs, then fix and verify.

```bash
# CrashLoopBackOff
kubectl apply -f crashloop-broken.yaml
kubectl get pod crash-demo -n session14-demo
kubectl describe pod crash-demo -n session14-demo
kubectl logs crash-demo -n session14-demo --previous
kubectl delete pod crash-demo -n session14-demo
kubectl apply -f crashloop-fixed.yaml

# ImagePullBackOff
kubectl apply -f imagepull-broken.yaml
kubectl describe pod image-demo -n session14-demo
kubectl delete pod image-demo -n session14-demo
kubectl apply -f imagepull-fixed.yaml

# Pending Pod
kubectl apply -f pending-broken.yaml
kubectl describe pod pending-demo -n session14-demo
kubectl delete pod pending-demo -n session14-demo
kubectl apply -f pending-fixed.yaml

# Service selector mismatch
kubectl apply -f service-selector-broken.yaml
kubectl get endpoints broken-web-service -n session14-demo
```

`troubleshooting-notes.md` contains the expected observation, root cause, and fix for each case. The Service check is important: a healthy Pod still receives no traffic if its label does not match the Service selector.

## Clean up

```bash
kubectl delete namespace session14-demo
```

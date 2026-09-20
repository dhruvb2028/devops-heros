# Session 9 - Kubernetes Fundamentals

Dhruv Bansal - 24BCS10114

In this session I checked the cluster components and ran my first NGINX Pod. The control plane has the API server, scheduler, controller manager, and etcd. A worker node runs kubelet, kube-proxy, and the container runtime.

## Run the Pod

```bash
kubectl cluster-info
kubectl get nodes -o wide
kubectl apply -f namespace.yaml
kubectl apply -f nginx-pod.yaml
kubectl get pods -n session9-demo -o wide
```

I used these commands to inspect the container:

```bash
kubectl describe pod nginx-basics -n session9-demo
kubectl logs nginx-basics -n session9-demo
kubectl exec -n session9-demo nginx-basics -- nginx -v
kubectl get pod nginx-basics -n session9-demo --show-labels
```

The label `app=nginx-basics` identifies the Pod. I kept the example in its own namespace so it does not mix with other practice workloads.

## Clean up

```bash
kubectl delete namespace session9-demo
```

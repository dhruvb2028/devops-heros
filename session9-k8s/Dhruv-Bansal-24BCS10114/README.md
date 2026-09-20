# Session 9 - Kubernetes Fundamentals

Dhruv Bansal - 24BCS10114

This session covers the basic Kubernetes cluster components and a simple Pod.

The control plane contains the API server, scheduler, controller manager, and etcd. Worker nodes run kubelet, kube-proxy, and the container runtime. The Pod manifest in this folder runs a small Nginx container.

```bash
kubectl cluster-info
kubectl get nodes -o wide
kubectl apply -f nginx-pod.yaml
kubectl get pods -n session9-demo -o wide
kubectl logs nginx-basics -n session9-demo
kubectl exec -n session9-demo nginx-basics -- nginx -v
kubectl delete -f nginx-pod.yaml
```

Labels help Services and controllers select related objects. Namespaces keep workloads separated inside the same cluster.

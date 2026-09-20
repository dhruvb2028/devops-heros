# Session 11 - Kubernetes Services

Dhruv Bansal - 24BCS10114

This folder demonstrates the five Service types.

| Type | Main use |
| --- | --- |
| ClusterIP | Internal communication inside the cluster |
| NodePort | Access through a port on each node |
| LoadBalancer | Cloud-managed external load balancer |
| ExternalName | DNS alias for an external service |
| Headless | Direct pod DNS records for StatefulSets |

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f clusterip.yaml
kubectl apply -f nodeport.yaml
kubectl apply -f loadbalancer.yaml
kubectl apply -f externalname.yaml
kubectl apply -f headless.yaml
kubectl get svc -n session11-demo
kubectl get endpoints -n session11-demo
```

`LoadBalancer` can remain pending on a local cluster because it needs a cloud provider integration. A headless Service uses `clusterIP: None`, so DNS returns pod addresses instead of a single virtual IP.

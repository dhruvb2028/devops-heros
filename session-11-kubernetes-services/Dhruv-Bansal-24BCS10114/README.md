# Session 11 - Kubernetes Services

Dhruv Bansal - 24BCS10114

I used one NGINX deployment to try the main Service types. I also added a small StatefulSet for the headless Service so its stable pod DNS names can be checked properly.

| Service | What I used it for |
| --- | --- |
| ClusterIP | Reaching the backend only from inside the cluster |
| NodePort | Opening the backend on port `30080` of a node |
| LoadBalancer | Showing how a cloud load balancer would expose it |
| ExternalName | Creating a DNS alias for `kubernetes.io` |
| Headless | Getting direct DNS records for StatefulSet pods |

## Run the examples

```bash
kubectl apply -f namespace.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f clusterip.yaml
kubectl apply -f nodeport.yaml
kubectl apply -f loadbalancer.yaml
kubectl apply -f externalname.yaml
kubectl apply -f headless.yaml
kubectl apply -f headless-statefulset.yaml
kubectl apply -f client-pod.yaml
kubectl get pods,svc,endpoints -n session11-demo
```

The client pod can check the internal Service and DNS records:

```bash
kubectl exec -n session11-demo dns-client -- wget -qO- http://backend-clusterip
kubectl exec -n session11-demo dns-client -- nslookup backend-headless
kubectl exec -n session11-demo dns-client -- nslookup web-0.backend-headless
kubectl exec -n session11-demo dns-client -- nslookup external-docs
```

On a local cluster, the LoadBalancer external IP may stay `pending` because no cloud provider is available. The NodePort can be tested with `minikube service backend-nodeport -n session11-demo --url`.

## Clean up

```bash
kubectl delete namespace session11-demo
```

# Session 12 - Ingress, ConfigMaps and Secrets

Dhruv Bansal - 24BCS10114

I made a small frontend and backend setup for this session. The ConfigMap stores the normal settings and the two demo pages. The Secret stores the database username and password. Both applications use ClusterIP Services, and the Ingress sends `/` to the frontend and `/api` to the backend.

## Run it

```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f frontend.yaml
kubectl apply -f backend.yaml
kubectl apply -f ingress.yaml
kubectl get pods,svc,ingress -n session12-demo
```

With the NGINX Ingress controller running, I can test both routes by sending the host header:

```bash
curl -H "Host: session12.local" http://$(minikube ip)/
curl -H "Host: session12.local" http://$(minikube ip)/api
```

The first command returns the frontend HTML page. The second returns the backend JSON response. I can also check that the configuration reached the backend pod:

```bash
kubectl exec -n session12-demo deployment/backend -- printenv ENVIRONMENT
kubectl get secret database-config -n session12-demo -o jsonpath='{.data.DB_USER}' | base64 --decode
```

Base64 is only encoding, not encryption. I used `echo -n` while preparing the values so an extra newline was not added. If an environment value in the ConfigMap changes, the Deployment needs a restart before the container receives the new value.

## Clean up

```bash
kubectl delete namespace session12-demo
```

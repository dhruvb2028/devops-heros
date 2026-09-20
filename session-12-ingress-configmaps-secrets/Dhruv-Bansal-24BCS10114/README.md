# Session 12 - Ingress, ConfigMaps and Secrets

Dhruv Bansal - 24BCS10114

This example keeps normal configuration in a ConfigMap and database settings in a Secret. The frontend and backend are exposed as internal ClusterIP Services. One NGINX Ingress sends `/` to the frontend and `/api` to the backend.

```bash
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f frontend.yaml
kubectl apply -f backend.yaml
kubectl apply -f ingress.yaml
kubectl get configmap,secret,svc,ingress -n session12-demo
```

Secrets are base64 encoded, not encrypted. Use `echo -n` before `base64` so a newline is not included in a password value. When a ConfigMap is injected as environment variables, restart the Deployment after changing it.

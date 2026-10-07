# Session 13 - Storage, HPA and Probes

Dhruv Bansal - 24BCS10114

This folder contains small examples for temporary volumes, persistent storage, dynamic claims, autoscaling, and health probes.

## 1. Volumes

`emptydir-pod.yaml` has two containers sharing `/data`. The writer creates a file and the reader can view it:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f emptydir-pod.yaml
kubectl exec -n session13-demo emptydir-demo -c reader -- cat /data/message.txt
```

Deleting the Pod removes its `emptyDir` data. It is useful for temporary files shared by containers in the same Pod.

## 2. PersistentVolume and PersistentVolumeClaim

```bash
kubectl apply -f persistent-volume.yaml
kubectl apply -f persistent-claim.yaml
kubectl apply -f storage-pod.yaml
kubectl get pv,pvc -n session13-demo
kubectl exec -n session13-demo persistent-storage-demo -- sh -c 'echo session13 > /data/message.txt'
kubectl exec -n session13-demo persistent-storage-demo -- cat /data/message.txt
```

After deleting and recreating `persistent-storage-demo`, the file should still be present because the PVC is separate from the Pod.

`dynamic-claim.yaml` is the StorageClass example. Before applying it, I check the storage classes available on the cluster:

```bash
kubectl get storageclass
kubectl apply -f dynamic-claim.yaml
kubectl get pvc -n session13-demo
```

The manifest uses `standard`, which is the normal Minikube default. A different cluster may use a different StorageClass name.

## 3. HPA and probes

```bash
kubectl apply -f web-deployment.yaml
kubectl apply -f web-service.yaml
kubectl apply -f web-hpa.yaml
kubectl apply -f probe-pod.yaml
kubectl get deploy,pods,hpa -n session13-demo
kubectl describe hpa storage-web -n session13-demo
```

The HPA scales from two to five Pods when average CPU passes 50%. It needs Metrics Server, so I check `kubectl top pods -n session13-demo` before testing load.

The Startup probe allows time for startup. The Readiness probe decides if traffic should reach a Pod. The Liveness probe restarts a container that remains unhealthy.

To generate load after Metrics Server is available:

```bash
kubectl run load-generator -n session13-demo --image=busybox:1.36 --restart=Never -- sh -c 'while true; do wget -qO- http://storage-web; done'
kubectl get hpa -n session13-demo -w
```

## Clean up

```bash
kubectl delete namespace session13-demo
kubectl delete pv session13-pv
```

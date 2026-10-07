# Session 20 - Observability and GitOps

Dhruv Bansal (24BCS10114)

For the mini-project, the `app/` folder contains a namespace, a two-replica Nginx Deployment and a Service. `argocd-application.yaml` is outside `app/`: Argo CD watches the workload files, not its own Application definition. The Application points to my repository's `main` branch and enables automatic sync, pruning and self-healing.

I would check the deployment with `kubectl get deployment,pods,service -n dhruv-session20` and inspect its logs with `kubectl logs deployment/notes-web -n dhruv-session20`. With Argo CD running, `kubectl apply -f argocd-application.yaml` would register the app. Changing `replicas` in Git from 2 to 3 should cause Argo CD to reconcile the cluster; changing it directly in the cluster should be corrected by self-healing.

The observability distinction from this session: metrics are measurements such as request count or CPU use; logs record individual events; traces follow a request between services. Prometheus collects metrics and Grafana displays them. The pod logs above are useful for debugging, but this Nginx demo does not yet export application-specific Prometheus metrics or traces.

These files are only local for review right now. Since they have not been committed or pushed, Argo CD cannot find this path in Git yet, and no sync/self-heal result is claimed.

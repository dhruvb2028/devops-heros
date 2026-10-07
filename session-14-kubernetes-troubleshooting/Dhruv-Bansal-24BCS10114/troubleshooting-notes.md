# Troubleshooting notes

## Flow I followed

1. Run `kubectl get` to see the status.
2. Run `kubectl describe` and read the Events section.
3. Read `kubectl logs`; use `--previous` after a restart.
4. Use `kubectl exec` only when the container stays running.
5. For a Service problem, compare Pod labels, the Service selector, and endpoints.

## Findings from the broken examples

| Problem | What I would see | Root cause | Fix |
| --- | --- | --- | --- |
| CrashLoopBackOff | Restart count grows and logs show `application failed` | The command ends with `exit 1` | Delete the broken Pod and apply `crashloop-fixed.yaml` |
| ImagePullBackOff | Pull errors in `kubectl describe pod image-demo` | The image tag does not exist | Apply `imagepull-fixed.yaml` with a valid NGINX tag |
| Pending | `NODE` stays empty and Events show FailedScheduling | The node selector matches no node | Apply `pending-fixed.yaml` without that selector |
| No Service endpoints | `kubectl get endpoints broken-web-service` shows none | `app: does-not-match` does not match the Deployment label | Use the healthy Service selector `app: troubleshooting-web` |

## Short answers

`kubectl get` gives a quick status list. `kubectl describe` includes details and events that explain the status. `kubectl logs` shows what the application wrote to standard output and error. `kubectl exec` is for checking a running container from inside.

`CrashLoopBackOff` means a container starts and repeatedly exits. `ImagePullBackOff` means Kubernetes cannot download the requested image. A Pod can stay Pending when it cannot be scheduled, for example because of a node selector or missing resources.

A Service creates endpoints only for Pods whose labels match its selector. Kubernetes DNS lets a Pod reach a Service by name, such as `troubleshooting-web` or `troubleshooting-web.session14-demo.svc.cluster.local`.

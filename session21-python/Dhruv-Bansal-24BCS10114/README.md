# LabGear — Session 21 capstone

Dhruv Bansal · 24BCS10114

LabGear tracks shared equipment in college labs. Staff can add items, search the catalog, mark an item for maintenance, check it out to a student with a due date, and record its return. I chose an equipment checkout workflow so the application is different from the TaskBoard example while using the same DevOps ideas.

## What's here

| Part | Where | Purpose |
| --- | --- | --- |
| React UI | `frontend/` | Equipment list, filters, counts and forms |
| FastAPI | `backend/app/` | REST API, health checks and metrics |
| PostgreSQL + Alembic | `backend/alembic/` | Persistent equipment records and schema migration |
| Docker Compose | `docker-compose.yml` | Local three-service stack |
| GitHub Actions | `.github/workflows/dhruv-session21.yml` at repository root | Tests, image scans, publication and temporary Kubernetes smoke test |
| Terraform | `terraform/` | VPC, public/private subnets, NAT, EKS and worker nodes |
| Helm | `helm/labgear/` | Two app Deployments, Services, Ingress, HPA and PostgreSQL PVC |
| Monitoring | `monitoring/` | Prometheus/Grafana settings and dashboard |
| Failure lab | `troubleshooting/` | Image pull and Service selector examples |

## Run on a laptop

Docker Desktop must be running. Copy `.env.example` to `.env` and replace the local database password with your own alphanumeric value. From this folder:

```bash
docker compose up --build
```

Open `http://localhost:3000`. The API docs are at `http://localhost:8000/docs`; `/health`, `/ready` and `/metrics` are on the same backend port. Compose waits for PostgreSQL before starting the API, and the API applies the Alembic migration at startup. `docker compose down` stops the stack; it keeps the database volume.

The main routes are `GET/POST /api/equipment`, `GET/PUT/DELETE /api/equipment/{id}`, `POST /api/equipment/{id}/checkout`, `POST /api/equipment/{id}/return` and `GET /api/equipment/stats`. A checked-out item cannot be checked out twice or deleted until it is returned.

## Tests

The API tests use a temporary SQLite database rather than the local PostgreSQL instance. The migration test upgrades an empty temporary database. The frontend has API/state tests and three UI tests.

```bash
cd backend
python -m pip install -r requirements-dev.txt
python -m pytest -v

cd ../frontend
npm ci
npm test
npm run build
```

## Images and pipeline

The repository-root workflow runs on pushes to `main` and on pull requests. It tests Python and the frontend first. On a push to `main`, it builds both images, fails on HIGH or CRITICAL findings from Trivy, then publishes SHA-tagged images as `ghcr.io/dhruvb2028/labgear-backend:<commit-sha>` and `ghcr.io/dhruvb2028/labgear-frontend:<commit-sha>`. Trivy checks operating-system packages and application dependencies in each image; a clean scan would mean no matching findings in that scan, not that the application is guaranteed secure. The GHCR packages must be made public, or the cluster needs an image-pull secret.

On each push to `main`, the workflow also starts a temporary kind cluster on a standard GitHub-hosted runner. It loads locally built images, installs the Helm chart, and checks the frontend, equipment checkout/return and metrics through the running Pods. This costs no AWS resources and the cluster is removed when the job ends. It is not a permanent public deployment or an EKS deployment.

The [demo run](https://github.com/dhruvb2028/devops-heros/actions/runs/38798265768) passed on commit `9da8c61`. The API and frontend tests passed, both images built and passed their Trivy scans, and both were published to GHCR. In the kind job, PostgreSQL, two backend Pods and two frontend Pods were all `1/1 Running`; the database PVC was `Bound`. The job then created an equipment item, checked it out and returned it through the frontend Service, checked the counts, and read `/metrics` from the backend. Its final output was `Kubernetes smoke test passed`.

The workflow file belongs at the repository root, so it is included separately from this folder. Its separate production deployment job is manual and expects `KUBECONFIG_B64` and `LABGEAR_DB_PASSWORD` GitHub environment secrets. Do not run that job unless you have a cluster you intend to use and pay for.

## AWS and Kubernetes

Terraform describes an EKS cluster in `ap-south-1`, two public and two private subnets, NAT access for private nodes, an EBS CSI add-on and a two-node managed node group. These resources cost money while running. Do not apply the configuration unless you intend to pay for them; destroy the stack after the demonstration. Keep AWS credentials out of Git.

```bash
cd terraform
terraform init
terraform plan
terraform apply
aws eks update-kubeconfig --region ap-south-1 --name labgear-dhruv
```

Before deploying, publish images and replace `set-a-commit-sha` in the Helm command with the actual SHA. Supply a private values file with a unique alphanumeric `database.password`; do not commit it. Install an NGINX Ingress controller, Metrics Server and kube-prometheus-stack in the cluster first. For an AWS cluster, the ingress controller needs a reachable external LoadBalancer. The hostname in `values-prod.yaml` is an example; point your real DNS name at that LoadBalancer.

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  -n ingress-nginx --create-namespace
helm upgrade --install metrics-server metrics-server/metrics-server \
  -n kube-system
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace -f monitoring/values.yaml
```

```bash
kubectl apply -f k8s/namespace.yaml
helm upgrade --install labgear ./helm/labgear -n labgear \
  -f helm/labgear/values-prod.yaml -f private-values.yaml \
  --set backend.tag=<commit-sha> --set frontend.tag=<commit-sha>
kubectl get pods,svc,ingress,hpa -n labgear
```

The chart requests two frontend and two backend replicas. PostgreSQL uses a PVC; the production values use the EBS CSI `gp3` StorageClass. This single in-cluster database is for the course demo, not a high-availability production database. HPA needs Metrics Server and enough traffic to move CPU above its target.

After the AWS demonstration, remove the Helm releases and run `terraform destroy` from `terraform/`. Confirm the destroy output and check the AWS console so no EKS, NAT or load balancer keeps billing.

## Monitoring

FastAPI exports Prometheus metrics at `/metrics`. Deploy LabGear with `monitoring.serviceMonitor=true` (already set by `values-prod.yaml`). The ServiceMonitor carries the `release: monitoring` label expected by the Prometheus release installed above.

```bash
kubectl create configmap labgear-dashboard -n monitoring \
  --from-file=monitoring/grafana-dashboard.json
kubectl label configmap labgear-dashboard grafana_dashboard=1 -n monitoring
```

Check Prometheus Targets for an `UP` LabGear endpoint, then open the Grafana dashboard after sending requests through the app. Grafana's generated admin password is stored in its Kubernetes Secret. The dashboard includes request rate and target availability; it cannot show live data until scraping is running.

## Remaining live-demo evidence

- Browser screenshots of the app and a local `docker compose up --build` run, if required for submission.
- An AWS plan, EKS deployment and `terraform destroy` only if a paid AWS demonstration is approved.
- A Prometheus target marked `UP` and a populated Grafana panel on a cluster with monitoring installed.
- The two investigations in `troubleshooting/README.md`.

The Actions link above is evidence of a temporary Kubernetes deployment, not of AWS EKS, a permanent public site, or Grafana. No screenshots are attached here.

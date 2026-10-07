# Session 17 - DevSecOps

Dhruv Bansal (24BCS10114)

I used a small Flask API so the security pipeline has a real application to test. `/health` returns a health response; `/sum` adds a JSON list of numbers and rejects non-numeric input.

```powershell
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
python run.py
```

The repository-root workflow `.github/workflows/dhruv-session17.yml` runs unit tests, CodeQL and `pip-audit`. Docker build and Trivy image scan depend on all three passing. A failed scan exits non-zero, so it blocks publication. The `publish` and `deploy` jobs only run when selected in a manual workflow run. Deployment also needs a `KUBECONFIG` GitHub secret containing the cluster config. The image name in `k8s/deployment.yaml` is a proposed GHCR location, not a claim that an image has already been published.

To try it locally with Docker: `docker build -t dhruv-devsecops .` then `docker run --rm -p 5000:5000 dhruv-devsecops`. With a published image and a configured cluster, apply `k8s/deployment.yaml` and `k8s/service.yaml`, set the image to the published SHA tag, then check `kubectl rollout status deployment/dhruv-devsecops`. No registry publication or cluster deployment is part of this local draft.

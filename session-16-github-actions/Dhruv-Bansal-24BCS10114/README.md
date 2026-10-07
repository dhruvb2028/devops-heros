# Session 16 - GitHub Actions

Dhruv Bansal - 24BCS10114

I used a small calculator to practise a CI pipeline. The workflow checks the code, runs three tests, checks for accidentally committed private key and environment files, and packages the application as a downloadable artifact. The build waits for tests and the file check to pass.

Run the same tests locally from this folder:

```bash
python -m unittest discover -s tests -v
python -m app.calculator
```

The workflow is at the repository root in `.github/workflows/dhruv-session16.yml`, because GitHub Actions does not run workflow files nested inside a session folder. It uses only the files in this folder and does not deploy anything.

I can intentionally change `add` to return `a + b + 1` to see the test fail. The build job then stays blocked. Restoring the correct addition makes all jobs pass again.

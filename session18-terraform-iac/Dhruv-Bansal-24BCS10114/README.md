# Session 18 - Terraform basics

Dhruv Bansal (24BCS10114)

I used Terraform's local provider for this first exercise so `apply` and `destroy` can be tried without an AWS account or cloud charges. The managed resource is `lab-output.txt`. The variables set its contents; the output shows where it was created.

Run these from this folder:

```text
terraform init
terraform fmt -check
terraform validate
terraform plan -out=lab.tfplan
terraform apply lab.tfplan
terraform output generated_file
terraform state list
terraform plan -destroy
terraform destroy
```

After apply, `terraform state list` should include `local_file.lab_note`. After destroy, the generated file is removed and state no longer lists it. `.gitignore` keeps the downloaded provider, local state and generated output out of the submission. Session 19 uses the AWS provider for the cloud networking part.

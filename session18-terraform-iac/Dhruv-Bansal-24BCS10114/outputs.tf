output "generated_file" {
  value       = local_file.lab_note.filename
  description = "The file Terraform created"
}

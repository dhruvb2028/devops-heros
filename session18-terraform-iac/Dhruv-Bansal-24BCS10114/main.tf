resource "local_file" "lab_note" {
  filename = "${path.module}/lab-output.txt"
  content  = "Student: ${var.student_name}\nRoll number: ${var.roll_number}\nManaged with Terraform.\n"
}

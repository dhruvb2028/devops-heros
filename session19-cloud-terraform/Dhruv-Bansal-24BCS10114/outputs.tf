output "vpc_id" { value = aws_vpc.lab.id }
output "vpc_cidr" { value = aws_vpc.lab.cidr_block }
output "subnet_id" { value = aws_subnet.public.id }
output "security_group_id" { value = aws_security_group.web.id }

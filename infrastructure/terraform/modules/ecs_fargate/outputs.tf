output "ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "service_name" {
  value = aws_ecs_service.backend.name
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "task_role_arn" {
  value = aws_iam_role.ecs_task_role.arn
}

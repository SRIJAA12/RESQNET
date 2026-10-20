output "endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "address" {
  value = aws_db_instance.postgres.address
}

output "db_name" {
  value = aws_db_instance.postgres.db_name
}

output "secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}

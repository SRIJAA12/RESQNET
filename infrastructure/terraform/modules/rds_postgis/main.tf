resource "aws_db_subnet_group" "rds" {
  name       = "resqnet-db-subnet-group-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "resqnet-db-subnet-group-${var.environment}"
    Environment = var.environment
  }
}

# Generate random secure master password
resource "random_password" "db_password" {
  length  = 32
  special = false
}

# Store credentials safely in AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "resqnet/rds/${var.environment}/credentials"
  description = "RDS PostgreSQL master credentials for RESQNET backend"

  tags = {
    Environment = var.environment
    Project     = "RESQNET"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "resqnet_admin"
    password = random_password.db_password.result
    dbname   = "resqnet_db"
    port     = 5432
  })
}

# RDS PostgreSQL Instance with PostGIS Compatibility
resource "aws_db_instance" "postgres" {
  identifier                  = "resqnet-postgres-${var.environment}"
  engine                      = "postgres"
  engine_version              = "16.3"
  instance_class              = var.instance_class
  allocated_storage           = var.allocated_storage
  max_allocated_storage       = var.max_allocated_storage
  storage_type                = "gp3"
  storage_encrypted           = true
  multi_az                    = var.multi_az
  publicly_accessible         = false # Private networking only!
  db_subnet_group_name        = aws_db_subnet_group.rds.name
  vpc_security_group_ids      = [var.rds_security_group_id]

  db_name  = "resqnet_db"
  username = "resqnet_admin"
  password = random_password.db_password.result

  backup_retention_period   = var.environment == "prod" ? 30 : 7
  backup_window             = "03:00-04:00"
  maintenance_window        = "Mon:04:30-Mon:05:30"
  auto_minor_version_upgrade = true
  deletion_protection       = var.environment == "prod" ? true : false
  skip_final_snapshot       = var.environment == "prod" ? false : true
  final_snapshot_identifier = "resqnet-postgres-final-snapshot-${var.environment}"

  tags = {
    Name        = "resqnet-rds-${var.environment}"
    Environment = var.environment
    Project     = "RESQNET"
  }
}

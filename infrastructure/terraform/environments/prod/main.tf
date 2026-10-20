terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # In production, configure an S3 remote backend with DynamoDB state locking:
  # backend "s3" {
  #   bucket         = "resqnet-tf-state-prod"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "resqnet-tf-locks-prod"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "RESQNET"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# 1. Networking Module
module "networking" {
  source      = "../../modules/networking"
  environment = var.environment
}

# 2. RDS PostGIS Module (Multi-AZ with Automated Backups)
module "rds" {
  source                = "../../modules/rds_postgis"
  environment           = var.environment
  private_subnet_ids    = module.networking.private_subnet_ids
  rds_security_group_id = module.networking.rds_security_group_id
  instance_class        = "db.r6g.large"
  allocated_storage     = 50
  max_allocated_storage = 500
  multi_az              = true
}

# 3. ECS Fargate Module
module "ecs" {
  source                      = "../../modules/ecs_fargate"
  environment                 = var.environment
  vpc_id                      = module.networking.vpc_id
  public_subnet_ids           = module.networking.public_subnet_ids
  private_subnet_ids          = module.networking.private_subnet_ids
  alb_security_group_id       = module.networking.alb_security_group_id
  ecs_tasks_security_group_id = module.networking.ecs_tasks_security_group_id
  db_secret_arn               = module.rds.secret_arn
  cpu                         = 1024
  memory                      = 2048
  desired_count               = 4
}

# 4. S3 & CloudFront Frontend Module
module "s3_cloudfront" {
  source      = "../../modules/s3_cloudfront"
  environment = var.environment
}

# 5. Amazon Cognito Authentication Module
module "cognito" {
  source      = "../../modules/cognito"
  environment = var.environment
}

# 6. Amazon SNS Emergency Alerts Module
module "sns" {
  source      = "../../modules/sns"
  environment = var.environment
}

# 7. GitHub Actions OIDC CI/CD Module
module "iam_oidc" {
  source                     = "../../modules/iam_oidc"
  environment                = var.environment
  github_repository          = var.github_repository
  ecr_repository_arn         = "arn:aws:ecr:${var.aws_region}:*:repository/resqnet-backend-${var.environment}"
  ecs_service_arn            = "arn:aws:ecs:${var.aws_region}:*:service/${module.ecs.cluster_name}/${module.ecs.service_name}"
  frontend_bucket_arn        = "arn:aws:s3:::resqnet-frontend-${var.environment}"
  cloudfront_distribution_arn = "arn:aws:cloudfront::*:distribution/${module.s3_cloudfront.cloudfront_distribution_id}"
}

# 8. CloudWatch Alarms Module
module "cloudwatch" {
  source              = "../../modules/cloudwatch"
  environment         = var.environment
  cluster_name        = module.ecs.cluster_name
  service_name        = module.ecs.service_name
  alarm_sns_topic_arn = module.sns.topic_arn
}

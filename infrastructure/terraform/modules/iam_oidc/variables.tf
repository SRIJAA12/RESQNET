variable "environment" {
  type        = string
  description = "Environment name (dev/prod)"
}

variable "github_repository" {
  type        = string
  default     = "organization/resqnet"
  description = "GitHub repository in format 'owner/repo' for OIDC trust restriction"
}

variable "ecr_repository_arn" {
  type        = string
  description = "ECR repository ARN"
}

variable "ecs_service_arn" {
  type        = string
  description = "ECS Service ARN"
}

variable "frontend_bucket_arn" {
  type        = string
  description = "Frontend S3 bucket ARN"
}

variable "cloudfront_distribution_arn" {
  type        = string
  description = "CloudFront distribution ARN"
}

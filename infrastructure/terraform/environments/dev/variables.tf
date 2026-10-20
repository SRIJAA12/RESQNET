variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Target AWS Region"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Deployment environment name"
}

variable "github_repository" {
  type        = string
  default     = "organization/resqnet"
  description = "GitHub repository for OIDC trust (owner/repo)"
}

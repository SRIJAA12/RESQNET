variable "environment" {
  type        = string
  description = "Environment name (dev/prod)"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnets for ALB"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnets for ECS Fargate tasks"
}

variable "alb_security_group_id" {
  type        = string
  description = "ALB security group ID"
}

variable "ecs_tasks_security_group_id" {
  type        = string
  description = "ECS tasks security group ID"
}

variable "db_secret_arn" {
  type        = string
  description = "ARN of Secrets Manager secret containing DB credentials"
}

variable "cpu" {
  type        = number
  default     = 512
  description = "Task CPU units (512 = 0.5 vCPU)"
}

variable "memory" {
  type        = number
  default     = 1024
  description = "Task memory in MB (1024 = 1 GB)"
}

variable "desired_count" {
  type        = number
  default     = 2
  description = "Desired number of Fargate tasks"
}

variable "environment" {
  type        = string
  description = "Environment name (dev/prod)"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs for DB subnet group"
}

variable "rds_security_group_id" {
  type        = string
  description = "Security group ID allowing ECS task access to port 5432"
}

variable "instance_class" {
  type        = string
  default     = "db.t4g.medium"
  description = "RDS instance class"
}

variable "allocated_storage" {
  type        = number
  default     = 20
  description = "Storage in GB"
}

variable "max_allocated_storage" {
  type        = number
  default     = 100
  description = "Autoscaling max storage limit in GB"
}

variable "multi_az" {
  type        = bool
  default     = false
  description = "Enable Multi-AZ for high availability in prod"
}

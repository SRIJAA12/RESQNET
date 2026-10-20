variable "environment" {
  type        = string
  description = "Environment name (dev/prod)"
}

variable "cluster_name" {
  type        = string
  description = "ECS Cluster Name"
}

variable "service_name" {
  type        = string
  description = "ECS Service Name"
}

variable "alarm_sns_topic_arn" {
  type        = string
  default     = ""
  description = "SNS Topic ARN for alerting"
}

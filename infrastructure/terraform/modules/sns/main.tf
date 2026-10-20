resource "aws_sns_topic" "dispatch_alerts" {
  name              = "resqnet-dispatch-alerts-${var.environment}"
  kms_master_key_id = "alias/aws/sns"

  tags = {
    Name        = "resqnet-dispatch-alerts-${var.environment}"
    Environment = var.environment
    Project     = "RESQNET"
  }
}

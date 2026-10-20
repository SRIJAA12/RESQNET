output "ecs_cpu_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.ecs_cpu_high.arn
}

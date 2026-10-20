output "alb_dns_name" {
  value       = module.ecs.alb_dns_name
  description = "Public ALB DNS for the FastAPI backend"
}

output "cloudfront_domain_name" {
  value       = module.s3_cloudfront.cloudfront_domain_name
  description = "CloudFront CDN domain URL for the React SPA frontend"
}

output "ecr_repository_url" {
  value       = module.ecs.ecr_repository_url
  description = "ECR repository URL for backend container image pushes"
}

output "cognito_user_pool_id" {
  value       = module.cognito.user_pool_id
  description = "Cognito User Pool ID"
}

output "cognito_client_id" {
  value       = module.cognito.user_pool_client_id
  description = "Cognito User Pool App Client ID"
}

output "github_deploy_role_arn" {
  value       = module.iam_oidc.deploy_role_arn
  description = "IAM Role ARN for GitHub Actions OIDC federation"
}

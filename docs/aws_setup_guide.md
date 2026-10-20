# RESQNET — AWS Setup & Infrastructure Guide

This guide details the exact sequence for deploying RESQNET to AWS.

> [!IMPORTANT]
> Do NOT run `terraform apply` or provision live cloud infrastructure until you have verified your AWS account limits, budgeted costs, and configured domain/repository identifiers.

---

## 1. Prerequisites Checklist

Before executing Terraform, ensure you have:
1. An AWS Account with Administrator access.
2. AWS CLI v2 installed and configured (`aws configure`).
3. Terraform v1.5.0+ installed (`terraform version`).
4. A GitHub repository hosting this codebase (e.g. `your-org/resqnet`).

---

## 2. Manual Pre-Requisites (Must be created in this order)

### Step 1: Create Terraform Remote State S3 Bucket & DynamoDB Lock Table
Terraform requires a persistent storage location for remote state locking. Create these manually via AWS CLI:

```bash
# Set your preferred region and environment
export AWS_REGION="us-east-1"
export ENVIRONMENT="dev" # or prod

# 1. Create S3 Bucket for Terraform State
aws s3api create-bucket \
  --bucket "resqnet-tf-state-${ENVIRONMENT}" \
  --region $AWS_REGION

# Enable Versioning on the State Bucket
aws s3api put-bucket-versioning \
  --bucket "resqnet-tf-state-${ENVIRONMENT}" \
  --versioning-configuration Status=Enabled

# Block Public Access to State Bucket
aws s3api put-public-access-block \
  --bucket "resqnet-tf-state-${ENVIRONMENT}" \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 2. Create DynamoDB Table for State Locking
aws dynamodb create-table \
  --table-name "resqnet-tf-locks-${ENVIRONMENT}" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

---

## 3. Infrastructure as Code (Terraform Provisioning)

Navigate to the target environment directory:

```bash
cd infrastructure/terraform/environments/dev
```

### Step 2: Configure Environment Variables
Copy `terraform.tfvars.example` to `terraform.tfvars` and customize:

```hcl
aws_region        = "us-east-1"
environment       = "dev"
github_repository = "your-github-username/resqnet"
```

### Step 3: Initialize and Validate Terraform
```bash
terraform init
terraform fmt -check
terraform validate
```

### Step 4: Preview Plan
```bash
terraform plan -out=tfplan
```
Review the proposed resources. Verify:
* RDS PostgreSQL is configured in **private subnets** with `publicly_accessible = false`.
* Application Load Balancer has ingress on ports 80/443 only.
* S3 frontend bucket has `block_public_access = true` with CloudFront OAC.

### Step 5: Apply Infrastructure
```bash
terraform apply tfplan
```

Take note of the generated outputs:
* `alb_dns_name`
* `cloudfront_domain_name`
* `ecr_repository_url`
* `github_deploy_role_arn`

---

## 4. Post-Provisioning Database Initialization

Once RDS PostgreSQL is provisioned:

1. **Verify PostGIS Extension**:
   Connect to the database via an ECS bastion task or within the VPC:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   SELECT postgis_full_version();
   ```

2. **Run Alembic Migrations**:
   Run the migration task inside AWS ECS Fargate or using a one-off task runner:
   ```bash
   alembic upgrade head
   ```

3. **Seed Synthetic Demonstration Flood Data (Optional for Demo)**:
   ```bash
   python -m app.db.seed
   ```

---

## 5. GitHub Actions OIDC Configuration

In your GitHub repository settings (**Settings &rarr; Secrets and variables &rarr; Actions**):

Add the following Repository Secrets:
* `AWS_OIDC_DEPLOY_ROLE_ARN`: The ARN output by `module.iam_oidc.deploy_role_arn`.
* `CLOUDFRONT_DISTRIBUTION_ID`: The CloudFront distribution ID from `module.s3_cloudfront`.
* `BACKEND_ALB_URL`: `http://<alb_dns_name>` for smoke testing.

Run the Continuous Deployment workflow manually via the **Actions** tab in GitHub to build the backend Docker container, deploy the ECS Fargate service, and sync the frontend to S3.

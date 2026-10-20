resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "resqnet-vpc-${var.environment}"
    Environment = var.environment
    Project     = "RESQNET"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "resqnet-igw-${var.environment}"
    Environment = var.environment
  }
}

# Public Subnets (For ALB and NAT Gateway)
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "resqnet-public-subnet-${var.availability_zones[count.index]}-${var.environment}"
    Environment = var.environment
    Type        = "public"
  }
}

# Private Subnets (For ECS Tasks & RDS Database)
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 4)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "resqnet-private-subnet-${var.availability_zones[count.index]}-${var.environment}"
    Environment = var.environment
    Type        = "private"
  }
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name        = "resqnet-nat-eip-${var.environment}"
    Environment = var.environment
  }
}

# Single NAT Gateway for cost-efficiency in dev (expandable to multi-AZ in prod)
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name        = "resqnet-nat-${var.environment}"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.gw]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name        = "resqnet-public-rt-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name        = "resqnet-private-rt-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "private" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# Security Groups
resource "aws_security_group" "alb" {
  name        = "resqnet-alb-sg-${var.environment}"
  description = "Controls HTTP/HTTPS ingress to Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP ingress"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS ingress"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "resqnet-alb-sg-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "resqnet-ecs-tasks-sg-${var.environment}"
  description = "Allows ingress only from ALB to ECS backend tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Ingress from ALB only"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "resqnet-ecs-tasks-sg-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name        = "resqnet-rds-sg-${var.environment}"
  description = "Private PostgreSQL access from ECS tasks only. No public access permitted."
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL port from ECS backend tasks only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "resqnet-rds-sg-${var.environment}"
    Environment = var.environment
  }
}

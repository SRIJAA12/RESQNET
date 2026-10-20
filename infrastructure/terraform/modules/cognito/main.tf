resource "aws_cognito_user_pool" "pool" {
  name = "resqnet-user-pool-${var.environment}"

  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]

  password_policy {
    minimum_length    = 10
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    attribute_data_type      = "String"
    name                     = "org_id"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
    string_attribute_constraints {
      min_length = "1"
      max_length = "64"
    }
  }

  tags = {
    Environment = var.environment
    Project     = "RESQNET"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "resqnet-spa-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret                      = false # Public SPA client
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  supported_identity_providers         = ["COGNITO"]
  callback_urls                        = ["http://localhost:5173", "https://resqnet.local"]
  logout_urls                          = ["http://localhost:5173", "https://resqnet.local"]
}

# Role Groups
resource "aws_cognito_user_group" "dispatcher" {
  name         = "dispatcher"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Authorized Control Room Dispatchers"
  precedence   = 10
}

resource "aws_cognito_user_group" "responder" {
  name         = "responder"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Field rescue units and medical teams"
  precedence   = 20
}

resource "aws_cognito_user_group" "citizen" {
  name         = "citizen"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Citizens and reporting community members"
  precedence   = 50
}

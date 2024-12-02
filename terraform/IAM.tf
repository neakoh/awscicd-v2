//===========================================================
//====================   IAM Roles   ========================
//===========================================================

// ECS Task Roles
resource "aws_iam_role" "ecs_task_role" {
  name = "ecs_task_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  // Preventing Terraform error
  lifecycle {
    create_before_destroy = true
  }
}

// ECS Execution Role
resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  // Preventing Terraform errors
  lifecycle {
    create_before_destroy = true
  }
}

//===========================================================
//==================   IAM Policies   =======================
//===========================================================

// Secrets Manager read secret policy
resource "aws_iam_policy" "secrets_manager_policy" {
  name        = "ecs_secrets_manager_policy"
  description = "Provides access to RDS database credentials"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "secretsmanager:GetSecretValue"
        ],
        Resource = module.db.db_instance_master_user_secret_arn
      }
    ]
  })

  // Preventing Terraform errors
  lifecycle {
    create_before_destroy = true
  }
}

// AWS managed ECR read only policy 
data "aws_iam_policy" "ecr_read_only" {
  arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

// AWS managed ECS task execution policy
data "aws_iam_policy" "ecs_task_execution_role_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


// Attaching AWS managed ECS task execution policy to ecs execution role
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  policy_arn = data.aws_iam_policy.ecs_task_execution_role_policy.arn
  role       = aws_iam_role.ecs_execution_role.name

  depends_on = [aws_iam_role.ecs_execution_role]
}

// Attaching AWS managed ECR read policy to ecs execution role
resource "aws_iam_role_policy_attachment" "ecs_ecr_policy" {
  policy_arn = data.aws_iam_policy.ecr_read_only.arn
  role       = aws_iam_role.ecs_execution_role.name

  depends_on = [aws_iam_role.ecs_execution_role]
}

// Attaching Secrets Manager read secret policy to task role
resource "aws_iam_role_policy_attachment" "task_secrets_policy" {
  policy_arn = aws_iam_policy.secrets_manager_policy.arn
  role       = aws_iam_role.ecs_task_role.name

  depends_on = [
    aws_iam_role.ecs_task_role,
    aws_iam_policy.secrets_manager_policy
  ]
}

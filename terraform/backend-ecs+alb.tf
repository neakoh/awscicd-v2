//===========================================================
//=====================   Backend ECS   =====================
//===========================================================
// Separating RDS endpoint url from port 
locals {
  split_host_port = split(":", module.db.db_instance_endpoint)
  host            = local.split_host_port[0]
}

// ECS Cluster
resource "aws_ecs_cluster" "backend" {
  name = "directory-backend-cluster"
}
// ECS Service
resource "aws_ecs_service" "example" {
  name            = "directory-backend-service"
  cluster         = aws_ecs_cluster.backend.id
  task_definition = aws_ecs_task_definition.express_app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [module.directory_vpc.private_subnets[0], module.directory_vpc.private_subnets[1]]
    security_groups  = [module.backend_sg.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "express-app"
    container_port   = 4000
  }
}

// Defining CloudWatch log location
resource "aws_cloudwatch_log_group" "backend_logs" {
  name = "/ecs/backend-containers"
}

// Task definition 
resource "aws_ecs_task_definition" "express_app" {
  family                   = "express-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "express-app"
      image     = var.backend_image_uri
      essential = true
      portMappings = [
        {
          containerPort = 4000
          hostPort      = 4000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend_logs.name
          "awslogs-region"        = "eu-west-2"
          "awslogs-stream-prefix" = "ecs"
        }
      }

      environment = [
        {
          name  = "DATABASE_HOST"
          value = local.host
        },
        {
          name  = "DATABASE_NAME"
          value = module.db.db_instance_name
        },
        {
          name  = "DB_SECRET_ARN"
          value = module.db.db_instance_master_user_secret_arn
        },
      ]
    }
  ])
}

//===========================================================
//===========================ALB=============================
//===========================================================

// Internal ALB
resource "aws_lb" "backend_internal" {
  name               = "backend-internal-alb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [module.backend_alb_sg.security_group_id]
  subnets            = [module.directory_vpc.private_subnets[0], module.directory_vpc.private_subnets[1]]

  tags = {
    Name = "backend-internal-alb"
  }
}

// Target Group
resource "aws_lb_target_group" "backend" {
  name_prefix = "be-alb"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = module.directory_vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  lifecycle {
    create_before_destroy = true
  }
}

// ALB Listener
resource "aws_lb_listener" "backend_listener" {
  load_balancer_arn = aws_lb.backend_internal.arn
  port              = "4000"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.backend.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  depends_on = [aws_acm_certificate.backend]

}

//===========================================================
//========================  ACM   ===========================
//===========================================================

# Generate private key
resource "tls_private_key" "backend" {
  algorithm = "RSA"
}

# Create self-signed certificate
resource "tls_self_signed_cert" "backend" {
  private_key_pem = tls_private_key.backend.private_key_pem

  subject {
    common_name  = "backend.internal"
  }

  validity_period_hours = 8760 # 1 year

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

# Import the certificate to ACM
resource "aws_acm_certificate" "backend" {
  private_key      = tls_private_key.backend.private_key_pem
  certificate_body = tls_self_signed_cert.backend.cert_pem
}
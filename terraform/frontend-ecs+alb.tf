//===========================================================
//=====================  Frontend ECS   =====================
//===========================================================
// ECS Cluster
resource "aws_ecs_cluster" "frontend" {
  name = "directory-frontend-cluster"
}

// ECS Service
resource "aws_ecs_service" "frontend" {
  name                   = "directory-frontend-service"
  cluster                = aws_ecs_cluster.frontend.id
  task_definition        = aws_ecs_task_definition.frontend_app.arn
  desired_count          = 2
  launch_type            = "FARGATE"
  enable_execute_command = true

  network_configuration {
    subnets          = [module.directory_vpc.public_subnets[0], module.directory_vpc.public_subnets[1]]
    security_groups  = [module.frontend_sg.security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend-app"
    container_port   = 3000
  }
}

// Defining CloudWatch log location
resource "aws_cloudwatch_log_group" "frontend_logs" {
  name = "/ecs/frontend-containers"
}

// Task Definition
resource "aws_ecs_task_definition" "frontend_app" {
  family                   = "frontend-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  container_definitions = jsonencode([
    {
      name      = "frontend-app"
      image     = var.frontend_image_uri
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend_logs.name
          "awslogs-region"        = "eu-west-2"
          "awslogs-stream-prefix" = "ecs"
        }
      }

      environment = [
        {
          name  = "BACKEND_URL"
          value = "https://${aws_lb.backend_internal.dns_name}:4000"
        },
        {
          name  = "PORT"
          value = "3000"
        }
      ]
    }
  ])
}

//===========================================================
//===========================ALB=============================
//===========================================================

// External ALB
resource "aws_lb" "frontend" {
  name               = "frontend-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [module.frontend_alb_sg.security_group_id]
  subnets            = [module.directory_vpc.public_subnets[0], module.directory_vpc.public_subnets[1]]

  tags = {
    Name = "frontend-alb"
  }
}

// Target Group
resource "aws_lb_target_group" "frontend" {
  name_prefix = "fe-alb"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.directory_vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  lifecycle {
    create_before_destroy = true
  }
}

# HTTPS Listener
resource "aws_lb_listener" "frontend_https" {
  load_balancer_arn = aws_lb.frontend.arn
  port              = 443  # Changed from 3000 to standard HTTPS port
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.frontend.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# HTTP Listener (for redirect)
resource "aws_lb_listener" "frontend_http" {
  load_balancer_arn = aws_lb.frontend.arn
  port              = 80  # Standard HTTP port
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

//===========================================================
//========================  ACM   ===========================
//===========================================================

resource "aws_acm_certificate" "frontend" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = ["www.${var.domain_name}"]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "frontend" {
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
//======================================================================================
//                                       ALB 
//======================================================================================
module "frontend_alb_sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "frontend-alb-sg"
  description = "Frontend Application Load Balancer Security Rules"
  vpc_id      = module.directory_vpc.vpc_id

  // Ingress - Allowing HTTPS & 3000 from my IP into the Frontend ALB
  ingress_with_cidr_blocks = [
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "Recieve HTTPS traffic from my IP"
      cidr_blocks = "86.181.209.251/32"
    },
    {
      from_port   = 3000
      to_port     = 3000
      protocol    = "tcp"
      description = "Recieve traffic over port 3000 from my IP"
      cidr_blocks = "86.181.209.251/32"
    },
  ]
  // Egress - Allowing all traffic into the VPC 
  egress_with_cidr_blocks = [
    {
      from_port   = -1
      to_port     = -1
      protocol    = "-1"
      description = "Allow all egress within VPC"
      cidr_blocks = module.directory_vpc.vpc_cidr_block
    },
  ]
}

resource "aws_security_group_rule" "traffic_from_frontend_containers" {
  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = module.frontend_sg.security_group_id
  security_group_id        = module.frontend_alb_sg.security_group_id
  description              = "Ingress 3000 from frontend containers"
}

//======================================================================================
//                               Frontend ECS
//======================================================================================
module "frontend_sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "frontend-sg"
  description = "Frontend Container Security Rules"
  vpc_id      = module.directory_vpc.vpc_id

  // Egress - Allow all traffic within VPC
  egress_with_cidr_blocks = [
    {
      from_port   = -1
      to_port     = -1
      protocol    = "-1"
      description = "Egress within everywhere"
      cidr_blocks = "0.0.0.0/0"
    },

  ]
}

// Ingress - Allowing frontend traffic over port 3000 from frontend ALB
resource "aws_security_group_rule" "frontend_traffic_from_frontend_alb" {
  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = module.frontend_alb_sg.security_group_id
  security_group_id        = module.frontend_sg.security_group_id
  description              = "Ingress 3000 from frontend ALB"
}
// Ingress - Allow backend traffic over port 4000 from backend ALB
resource "aws_security_group_rule" "backend_traffic_from_backend_alb" {
  type                     = "ingress"
  from_port                = 4000
  to_port                  = 4000
  protocol                 = "tcp"
  source_security_group_id = module.backend_alb_sg.security_group_id
  security_group_id        = module.frontend_sg.security_group_id
  description              = "Ingress 4000 from backend ALB"
}
//=================
//  Backend ALB
//=================
module "backend_alb_sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "backend-alb-sg"
  description = "Backend Application Load Balancer Security Rules"
  vpc_id      = module.directory_vpc.vpc_id

  ingress_with_source_security_group_id = [
    {
      rule                     = "https-443-tcp"
      source_security_group_id = module.frontend_sg.security_group_id
      description              = "Allow ingress postgresql traffic from backend containers"
    },
  ]

  // Egress - All traffic within the VPC
  egress_with_cidr_blocks = [
    {
      from_port   = -1
      to_port     = -1
      protocol    = "-1"
      description = "Egress all traffic within the VPC"
      cidr_blocks = module.directory_vpc.vpc_cidr_block
    },
  ]
}
// Ingress - Allow traffic over port 4000 from frontend containers
resource "aws_security_group_rule" "backend_traffic_from_frontend_container" {
  type                     = "ingress"
  from_port                = 4000
  to_port                  = 4000
  protocol                 = "tcp"
  source_security_group_id = module.frontend_sg.security_group_id
  security_group_id        = module.backend_alb_sg.security_group_id
  description              = "Ingress 4000 from frontend containers"
}
// Ingress - Allow traffic over port 4000 from backend containers 
resource "aws_security_group_rule" "backend_traffic_from_backend_container" {
  type                     = "ingress"
  from_port                = 4000
  to_port                  = 4000
  protocol                 = "tcp"
  source_security_group_id = module.backend_sg.security_group_id
  security_group_id        = module.backend_alb_sg.security_group_id
  description              = "Ingress 4000 from backend containers"
}
//=================
//   Backend ECS
//=================
module "backend_sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "backend-sg"
  description = "Backend Container Security Rules"
  vpc_id      = module.directory_vpc.vpc_id

  // Egress - All traffic within VPC
  egress_with_cidr_blocks = [
    {
      from_port   = -1
      to_port     = -1
      protocol    = "-1"
      description = "Egress all traffic within VPC"
      cidr_blocks = "0.0.0.0/0"
    },
  ]
}
// Ingress - Allow traffic over port 4000 from backend containers 
resource "aws_security_group_rule" "backend_containers_from_backend_alb" {
  type                     = "ingress"
  from_port                = 4000
  to_port                  = 4000
  protocol                 = "tcp"
  source_security_group_id = module.backend_alb_sg.security_group_id
  security_group_id        = module.backend_sg.security_group_id
  description              = "Ingress 4000 from backend ALB"
}
//=================
//    Endpoints
//=================
module "endpoints_sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "endpoints-sg"
  description = "Endpoints Security Rules"
  vpc_id      = module.directory_vpc.vpc_id

  // Ingress - Allow HTTPS from within the subnet
  ingress_with_cidr_blocks = [
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "Ingress HTTPS traffic from within the VPC"
      cidr_blocks = module.directory_vpc.vpc_cidr_block
    },
  ]

  // Egress - Allowing endpoint to access API (0.0.0.0/0)
  egress_with_cidr_blocks = [
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "Egress traffic to everywhere"
      cidr_blocks = "0.0.0.0/0"
    },
  ]
}

//======================================================================================
//                                      RDS
//======================================================================================

module "rds_sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "rds-sg"
  description = "RDS (PostgreSQL) Security Rules"
  vpc_id      = module.directory_vpc.vpc_id

  // Ingress - Allow PostgreSQL traffic from backend containers 
  ingress_with_source_security_group_id = [
    {
      rule                     = "postgresql-tcp"
      source_security_group_id = module.backend_sg.security_group_id
      description              = "Allow ingress postgresql traffic from backend containers"
    },
  ]
}
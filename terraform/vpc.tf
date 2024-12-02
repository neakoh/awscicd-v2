module "directory_vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "directory-vpc"
  cidr = "192.168.0.0/16"

  azs             = ["eu-west-2a", "eu-west-2b"]
  private_subnets = ["192.168.8.0/24", "192.168.9.0/24"]
  public_subnets  = ["192.168.0.0/24", "192.168.1.0/24"]

  tags = {
    Terraform   = "true"
    Environment = "dev"
  }
}

module "endpoints" {
  source = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"

  vpc_id = module.directory_vpc.vpc_id

  endpoints = {
    s3 = {
      service            = "s3"
      service_type       = "Gateway"
      route_table_ids    = flatten([module.directory_vpc.private_route_table_ids])
      security_group_ids = [module.endpoints_sg.security_group_id]
      policy             = data.aws_iam_policy_document.generic_endpoint_policy.json
      tags               = { Name = "s3-gateway-endpoint" }
    },
    secrets_manager = {
      service             = "secretsmanager"
      private_dns_enabled = true
      security_group_ids  = [module.endpoints_sg.security_group_id]
      subnet_ids          = [module.directory_vpc.private_subnets[0], module.directory_vpc.private_subnets[1]]
      policy              = data.aws_iam_policy_document.generic_endpoint_policy.json
      tags                = { Name = "secrets-manager-endpoint" }
    },
    logs = {
      service             = "logs"
      private_dns_enabled = true
      security_group_ids  = [module.endpoints_sg.security_group_id]
      subnet_ids          = [module.directory_vpc.private_subnets[0], module.directory_vpc.private_subnets[1]]
      policy              = data.aws_iam_policy_document.generic_endpoint_policy.json
      tags                = { Name = "cloudwatch-logs-endpoint" }
    },
    dkr = {
      service             = "ecr.dkr"
      private_dns_enabled = true
      security_group_ids  = [module.endpoints_sg.security_group_id]
      subnet_ids          = [module.directory_vpc.private_subnets[0], module.directory_vpc.private_subnets[1]]
      policy              = data.aws_iam_policy_document.generic_endpoint_policy.json
      tags                = { Name = "dkr-endpoint" }
    },
    ecr = {
      service             = "ecr.api"
      private_dns_enabled = true
      security_group_ids  = [module.endpoints_sg.security_group_id]
      subnet_ids          = [module.directory_vpc.private_subnets[0], module.directory_vpc.private_subnets[1]]
      policy              = data.aws_iam_policy_document.generic_endpoint_policy.json
      tags                = { Name = "ecr-endpoint" }
    },
  }
}

data "aws_iam_policy_document" "generic_endpoint_policy" {
  statement {
    effect    = "Allow"
    actions   = ["*"]
    resources = ["*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}
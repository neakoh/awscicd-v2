module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "directorydb"

  engine                  = "postgres"
  engine_version          = "14"
  family                  = "postgres14"
  major_engine_version    = "14" 
  instance_class          = "db.t3.micro"
  allocated_storage       = 10

  db_name  = "directorydatabase"
  username = "myusername"
  port     = 5432

  snapshot_identifier = length(data.aws_db_snapshot.existing_snapshots.id) > 0 ? data.aws_db_snapshot.existing_snapshots.id : null
  skip_final_snapshot = false
  db_subnet_group_name = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [module.rds_sg.security_group_id]
  ca_cert_identifier = "rds-ca-rsa2048-g1"

  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"


  tags = {
    Owner       = "user"
    Environment = "dev"
  }

}
resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "rds-subnet-group"
  subnet_ids = [module.directory_vpc.private_subnets[0], module.directory_vpc.private_subnets[1]] 

  tags = {
    Name = "rds-subnet-group"
  }
}

data "aws_db_snapshot" "existing_snapshots" {
  db_instance_identifier = "directorydb"
  most_recent            = true
}
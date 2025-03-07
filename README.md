# Revisiting & Refining An Old Project
This project began as a simple rework but quickly evolved into a challenging and rewarding journey. As I tackled unexpected issues related mainly to application design rather than infrastructure, I gained invaluable insights into React rendering behavior, internal proxy configuration, and effective internal load balancer routing. The process was more complex than initially anticipated, but the learnings made every bit of the effort worthwhile.

**Key points include:**

- Use of AWS services such as ECS on Fargate, ALBs for load balancing, and RDS with SSL encryption.
- Deployment is managed via Terraform with state stored in S3 and locking via DynamoDB.
- A focus on security with HTTPS implemented across all layers.

## Overview
The application architecture is built on AWS with a strong focus on securing communications between services. The overall flow is:

`User > Route 53 > Frontend ALB > Frontend Containers > Backend ALB > Backend Containers > RDS`

1. Route 53 redirects user to frontend ALB.
2. Frontend ALB routes traffic to the frontend containers.
3. Frontend Containers (running a React app) forward requests to the backend ALB via proxy.
4. Backend ALB sends requests to backend containers.
5. Backend containers querys RDS hosting a PostgreSQL database.

## AWS Infrastructure Components
- **VPC**: A custom VPC with public and private subnets & several endpoints to remove the need for NAT gateways, Ultimately reducing costs: ECR, DKR, Logs, Secrets Manager & an S3 gateway endpoint.
- **Route53**: Creates alias records for the frontend ALB within your hosted zone. 
- **RDS**: A PostgreSQL instance deployed in private subnets with SSL encryption enabled. Each deployment is built using the latest snapshot to ensure persistence.
#### Frontend ECS & ALB
- **ALB**: Deployed in public subnets, listens on port 443, and forwards traffic to port 3000. A TLS certificate is provisioned via ACM.
- **ECS**: Runs on Fargate, serving a React static application on port 3000. Hosts an internal proxy to pass requests to the internal ALB over port 4000.
#### Backend ECS & ALB
- **ALB**: Deployed in private subnets and forwards traffic to port 4000. A self-signed certificate is imported into ACM for internal use.
- **ECS**: Also on Fargate, queries RDS.



## Terraform Configuration Improvements
Key improvements in the Terraform setup include:

- **State Management**: Utilizing S3 for state storage and DynamoDB for locking, as opposed to Terraform cloud, offering a cheaper & more secure solution.
- **Modular Design**: Adoption of modules (e.g. for VPC, endpoints, ECS) drastically reduced the codebase size and increased maintainability.
- **Final Snapshots on RDS**: Final snapshots are enabled to ensure stateful persistence between infrastructure rebuilds.

## Application Enhancements
### Frontend
- Initially, environment variables were attempted directly within the React app, but as a static application, it required embedding these values during build time which proved unnecessary.
- Instead, The frontend contains a proxy (an Express server) that not only forwards requests but is also required to provide TLS between the frontend containers and the backend ALB.
### Backend
- Environment variables for the backend are injected into the containers from the Terraform configuration.
- Database connections are secured using an AWS CA certificate, retrieved during container build time.
## Docker Enhancements
- A non-root user (appuser) is created to run the application, helping to enhance container security by removing default root permissions.
## CI/CD Pipeline
- The deployment pipeline was streamlined by consolidating the repository for both front and backend components.
- Utilized GitHub Actions with matrix jobs for simultaneous builds.
- Security scans are integrated into the pipeline, and vulnerabilities are reported back using the SARIF format.
## Monitoring
Experimented with Grafana Cloud for monitoring, integrating with AWS CloudWatch for metrics collection across ALBs, RDS, and ECS.
Collected key metrics include:
- Load balancer target group response times.
- RDS active connections and IOPS.
- ECS CPU, memory usage, and container failure metrics.
- Application-level metrics such as HTTP error codes and response times.

## Key Learnings:
- Understanding React's static deployment limitations and the need for a dedicated proxy for internal routing and HTTPS enforcement.
- Gaining deeper insight into internal load balancers, and the secure communication mechanisms between AWS services.

## Future Enhancements:
- Improve unit and integration testing as part of the CI/CD pipeline.
- Expand Grafana dashboards to cover additional metrics.
- Consider switching backend deployments to API Gateway and Lambda to optimize costs for production-scale applications.
## Conclusion
This project represents a significant improvement over previous iterations with better code modularity, enhanced security through end-to-end encryption, and streamlined deployment pipelines. While some challenges remain—such as improving test coverage and monitoring—the consolidation of infrastructure into a single managed repository has greatly increased overall efficiency and maintainability.

# AI Coding Agent Instructions

## Repository Overview
This workspace contains multiple AutoScout24 repositories for listing creation and management services:

1. **as24-belgium-delta2api-ftpserver**: AWS CDK project for Transfer Family FTP/SFTP server with password authentication.
2. **as24-lca-ng-api**: Listing Creation API (LCA-NG) - The core service for creating and managing vehicle listings.
3. **as24-belgium-leadservice**: Service for Belgium market leads.
4. **as24-lca-ng-shared**: Shared libraries and utilities for the LCA ecosystem.
5. **as24-project-template**: Template repository for creating new AS24 projects.

## Architecture Overview

### LCA-NG Architecture
The Listing Creation API (LCA-NG) follows a three-phase approach to listing management:

1. **Storage Phase**: Synchronous saving of listings in DynamoDB, providing immediate response to users.
2. **Propagation Phase**: Asynchronous breaking down of listings and sending to downstream services.
3. **Consumption Phase**: Asynchronous processing of changes from other services (fraud detection, seals, etc.).

The API layer uses an OpenAPI-first approach, with specs acting as the source of truth for contracts.

### Data Flow
- **Entry Points**: Public API (`/customers/*`), Private API (`/sellers/*`)
- **Authentication**: OAuth2/JWT for private API, Basic Auth with Identity service for public API
- **Storage**: Primary storage in DynamoDB, with a multiplexer pattern to support VLS (Vehicle Listing Service)
- **Messaging**: SQS and Kafka for asynchronous communication

## Key Components

### Belgium Delta2API FTP Server
- AWS Transfer Family FTP/SFTP service with password authentication
- Credentials stored in AWS Secrets Manager
- Home directories managed in S3

### LCA-NG API (Core Listing Service)
- Controllers (`app/listing/ListingController.scala`)
- Services (`app/listing/ListingService.scala`)
- Repositories (`app/listing/ListingRepo.scala`)
- Validation (`app/validation/`)
- Authentication/Authorization (`app/auth/`)

## Development Workflow

### Building & Running

```bash
# For Belgium Delta2API FTP Server
npm ci
npx cdk deploy --require-approval never

# For LCA-NG API
# First assume role
scloud account login as24-listing-creation ReadOnlyAccess

# Then run application
./scripts/run.sh run  # Normal mode
./scripts/run.sh debug run  # Debug mode
```

### Testing

```bash
# Unit tests
./scripts/test.sh

# Specific unit test
sbt "testOnly com.autoscout24.SomeTest"

# Functional tests
./scripts/test-functional.sh

# Specific functional test
./scripts/test-functional.sh "com.autoscout24.SomeSpecificSpec"

# VLS functional tests
TEST_DATASOURCE=vls ./scripts/test-functional.sh "* -- -n com.autoscout24.Vls"
```

## Project Conventions

### OpenAPI-First Development
When updating API endpoints:
1. Update OpenAPI spec files in `app/assets/openapi/`
2. Generate client code: `./scripts/update-generated-code-from-open-api-spec.sh`
3. Update tests to match new endpoints

### Error Handling
- Use `Either[Error, T]` pattern for functional error handling
- Define domain-specific error hierarchies per component
- Use exhaustive pattern matching to handle all error cases

### Testing Strategy
- **Unit Tests** (`/test/`, `*Test.scala`): Test components in isolation
- **Integration Tests** (`*Integration.scala`): Test component interactions
- **Functional Tests** (`/functionalTests/`, `*Spec.scala`): Black-box testing

### Multiplexer Pattern
Used to support multiple data sources (DynamoDB/VLS) with the same interface but different implementations.

## Important Files & Directories

### LCA-NG API
- `app/listing/` - Core listing functionality
- `app/validation/` - Validation rules
- `app/assets/openapi/` - API specifications
- `app/auth/` - Authentication mechanisms
- `conf/` - Configuration files

### Belgium Delta2API FTP Server
- `lib/ftp/` - Core FTP server constructs
- `lib/password-authenticated-ftp-stack.ts` - Main CDK stack
- `bin/password-authenticated-ftp.ts` - Entry point

## Data Handling Best Practices

### Listing Deletion
1. **Always soft-delete first** before hard-deletion
2. Use proper API endpoints: `seller-deleted` or `private-seller-deleted`
3. Hard-deleting directly in the database causes data lake inconsistencies

## AWS Integration
- DynamoDB for primary storage (tables: `LcaNgListing`, `LcaNgAuthorization`)
- SQS for asynchronous processing
- Firehose for data lake integration
- Secrets Manager for storing credentials
- Transfer Family for FTP services

## User Types
1. **Data Providers**: Companies managing listings for multiple dealers (public API)
2. **Internal Services**: AS24 internal consumers (private API)
3. **Private Sellers**: Individual sellers (private API)

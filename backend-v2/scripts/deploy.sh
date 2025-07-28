#!/bin/bash

# Quizito Backend v2 Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if stage is provided
STAGE=${1:-dev}
print_status "Deploying to stage: $STAGE"

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Check if required environment variables are set
print_status "Checking environment variables..."

required_vars=(
    "DATABASE_URL"
    "JWT_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "ANTHROPIC_API_KEY"
    "GOOGLE_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Environment variable $var is not set"
        exit 1
    fi
done

print_success "Environment variables validated"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Build the project
print_status "Building TypeScript..."
npm run build

# Deploy using serverless
print_status "Deploying to AWS..."
if [ "$STAGE" = "production" ]; then
    npm run deploy:prod
else
    npm run deploy
fi

print_success "Deployment completed successfully!"

# Get the API Gateway URL
print_status "Retrieving API Gateway URL..."
API_URL=$(aws apigatewayv2 get-apis --region us-east-1 --query "Items[?Name=='quizito-backend-v2-$STAGE'].ApiEndpoint" --output text)

if [ -n "$API_URL" ]; then
    print_success "API Gateway URL: https://$API_URL"
    print_status "Update your frontend environment variables with this URL"
else
    print_warning "Could not retrieve API Gateway URL. Please check the AWS console."
fi

print_status "Deployment script completed!" 
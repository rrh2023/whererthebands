#!/bin/bash
# backend/deploy.sh
# Usage: ./deploy.sh [dev|staging|prod]
# Requires: aws cli, sam cli, and your API keys ready

set -e  # Exit on any error

ENV="${1:-dev}"
STACK_NAME="whereRTheBands-${ENV}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
S3_BUCKET="whereRTheBands-sam-artifacts-${ENV}"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  WhereRTheBands Deploy — ${ENV}        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Store secrets in SSM (only if not already set) ─────────────────────
echo "▶ Checking SSM secrets..."

store_secret() {
  local NAME=$1
  local PROMPT=$2
  if aws ssm get-parameter --name "$NAME" --region "$REGION" &>/dev/null; then
    echo "  ✓ $NAME already set"
  else
    echo -n "  Enter $PROMPT: "
    read -rs SECRET
    echo ""
    aws ssm put-parameter \
      --name "$NAME" \
      --value "$SECRET" \
      --type "SecureString" \
      --region "$REGION"
    echo "  ✓ $NAME stored"
  fi
}

store_secret "/whereRTheBands/ticketmaster_api_key" "Ticketmaster API Key"
store_secret "/whereRTheBands/anthropic_api_key"    "Anthropic API Key"

# ── 2. Get Cognito User Pool ID ───────────────────────────────────────────
echo ""
echo -n "▶ Enter your Cognito User Pool ID (e.g. us-east-1_XXXXXXX): "
read COGNITO_POOL_ID
echo ""

# ── 3. Create S3 bucket for SAM artifacts (if needed) ────────────────────
echo "▶ Ensuring S3 artifact bucket..."
aws s3api create-bucket \
  --bucket "$S3_BUCKET" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION" \
  2>/dev/null || echo "  Bucket already exists"

# ── 4. Build the Lambda layer ─────────────────────────────────────────────
echo ""
echo "▶ Building dependency layer..."
mkdir -p layer/python
pip install \
  requests==2.31.0 \
  anthropic==0.40.0 \
  --target layer/python \
  --quiet

# ── 5. Build with SAM ─────────────────────────────────────────────────────
echo ""
echo "▶ Running sam build..."
sam build \
  --template-file template.yaml \
  --use-container

# ── 6. Deploy ─────────────────────────────────────────────────────────────
echo ""
echo "▶ Deploying stack: $STACK_NAME..."
sam deploy \
  --stack-name "$STACK_NAME" \
  --s3-bucket "$S3_BUCKET" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    "Environment=${ENV}" \
    "CognitoUserPoolId=${COGNITO_POOL_ID}" \
  --no-confirm-changeset

# ── 7. Print the API URL ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════╗"
echo "║           DEPLOY COMPLETE ✓          ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Your API URL:"
aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text

echo ""
echo "Add the above URL to your frontend .env.local as:"
echo "  VITE_API_BASE_URL=<url above>"
echo ""
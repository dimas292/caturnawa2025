#!/bin/bash

# Caturnawa 2025 Deployment Script
# This script automates the deployment process for the Next.js application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="caturnawa-tes"
APP_DIR="/root/work/caturnawa2025"
BRANCH="dev-tama"
LOG_FILE="/var/log/caturnawa-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# Start deployment
log "========================================="
log "Starting deployment for $APP_NAME"
log "========================================="

# Check if we're in the correct directory
if [ ! -d "$APP_DIR" ]; then
    error "Application directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR" || exit 1
success "Changed to application directory: $APP_DIR"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
log "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    warning "Not on $BRANCH branch. Switching..."
    git checkout "$BRANCH" || {
        error "Failed to checkout $BRANCH branch"
        exit 1
    }
    success "Switched to $BRANCH branch"
fi

# Stash any local changes
if ! git diff-index --quiet HEAD --; then
    warning "Local changes detected. Stashing..."
    git stash || {
        error "Failed to stash changes"
        exit 1
    }
    success "Local changes stashed"
fi

# Pull latest changes
log "Pulling latest changes from origin/$BRANCH..."
git pull origin "$BRANCH" || {
    error "Failed to pull latest changes"
    exit 1
}
success "Latest changes pulled successfully"

# Show latest commit
LATEST_COMMIT=$(git log -1 --oneline)
log "Latest commit: $LATEST_COMMIT"

# Check if package.json changed
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    warning "package.json changed. Installing dependencies..."
    npm install || {
        error "Failed to install dependencies"
        exit 1
    }
    success "Dependencies installed successfully"
else
    log "No changes to package.json. Skipping npm install."
fi

# Build application
log "Building application..."
npm run build || {
    error "Build failed"
    exit 1
}
success "Build completed successfully"

# Check build output
if [ ! -d ".next" ]; then
    error "Build output directory (.next) not found"
    exit 1
fi

BUILD_SIZE=$(du -sh .next | cut -f1)
success "Build size: $BUILD_SIZE"

# Restart PM2
log "Restarting PM2 application: $APP_NAME..."
pm2 reload "$APP_NAME" || {
    error "Failed to reload PM2 application"
    exit 1
}
success "PM2 application reloaded successfully"

# Wait for application to start
log "Waiting for application to start..."
sleep 5

# Check PM2 status
PM2_STATUS=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.status")
if [ "$PM2_STATUS" != "online" ]; then
    error "Application is not online. Status: $PM2_STATUS"
    pm2 logs "$APP_NAME" --lines 50 --nostream
    exit 1
fi
success "Application is online"

# Show PM2 info
log "PM2 Application Info:"
pm2 info "$APP_NAME" | grep -E "status|uptime|restarts|memory"

# Test application endpoint
log "Testing application endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8008/)
if [ "$HTTP_CODE" = "200" ]; then
    success "Application responding with HTTP $HTTP_CODE"
else
    error "Application responding with HTTP $HTTP_CODE (expected 200)"
    exit 1
fi

# Save PM2 configuration
log "Saving PM2 configuration..."
pm2 save || warning "Failed to save PM2 configuration"

# Deployment summary
log "========================================="
success "Deployment completed successfully!"
log "========================================="
log "Branch: $BRANCH"
log "Commit: $LATEST_COMMIT"
log "Build Size: $BUILD_SIZE"
log "PM2 Status: $PM2_STATUS"
log "Website: https://tes.caturnawa.tams.my.id/"
log "========================================="

# Show recent logs
log "Recent application logs:"
pm2 logs "$APP_NAME" --lines 20 --nostream

exit 0


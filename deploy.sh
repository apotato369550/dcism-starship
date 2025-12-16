#!/bin/bash

# DCISM Starship Deployment Script
# This script deploys the game to your production server
#
# Usage:
#   ./deploy.sh
#
# Requirements:
#   - SSH key-based authentication configured for your server
#   - Bash shell
#   - sed command available

set -e  # Exit on any error

# Configuration
SSH_USER="s21103565"
SSH_HOST="web.dcism.org"
SSH_PORT="22077"
SERVER_FOLDER="starship.dcism.org"
REPO_URL="https://github.com/apotato369550/dcism-starship.git"
PORT="20145"
APP_NAME="starship"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DCISM Starship Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Target:${NC} $SSH_USER@$SSH_HOST:$SSH_PORT"
echo -e "${YELLOW}Folder:${NC} $SERVER_FOLDER"
echo -e "${YELLOW}Port:${NC} $PORT"
echo -e "${YELLOW}App Name:${NC} $APP_NAME"
echo ""

# Confirm before proceeding
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 1: Connecting to server...${NC}"

# SSH into server and execute deployment commands
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" bash << 'REMOTE_SCRIPT'
set -e

# Configuration (must match local values)
SERVER_FOLDER="starship.dcism.org"
REPO_URL="https://github.com/apotato369550/dcism-starship.git"
PORT="20145"
APP_NAME="starship"

echo ""
echo "Connected to remote server"
echo ""

# Navigate to home directory
cd ~

echo "Current directory: $(pwd)"
echo ""

# Check if folder exists
if [ -d "$SERVER_FOLDER" ]; then
    echo -e "Folder $SERVER_FOLDER already exists, updating..."
    cd "$SERVER_FOLDER"

    # Pull latest changes
    echo "Pulling latest changes from repository..."
    git pull origin main
else
    echo "Creating new deployment folder..."
    mkdir -p "$SERVER_FOLDER"
    cd "$SERVER_FOLDER"

    # Clone repository
    echo "Cloning repository..."
    git clone "$REPO_URL" .
fi

echo ""
echo "Current directory: $(pwd)"
echo ""

# Install/update dependencies
echo "Installing dependencies..."
npm install --production

# Update .env file with production port
echo ""
echo "Configuring environment variables..."
if [ -f .env ]; then
    # Update existing PORT or add new one
    if grep -q "^PORT=" .env; then
        sed -i "s/^PORT=.*/PORT=$PORT/" .env
    else
        echo "PORT=$PORT" >> .env
    fi
else
    # Create .env if it doesn't exist
    cat > .env << EOF
# Game Configuration

# Map Settings
MAP_WIDTH=20
MAP_HEIGHT=20

# Player Starting Values
STARTING_ENERGY=10
STARTING_ENERGY_PER_SEC=0

# Timing (in milliseconds)
COOLDOWN_MS=3000
ECONOMY_TICK_MS=1000

# Tile Defaults
BASE_TILE_DEFENSE=1
BASE_TILE_MAX_DEFENSE=1

# Server
PORT=$PORT
EOF
fi

echo ".env configured with PORT=$PORT"
echo ""

# Stop existing PM2 process if it exists
echo "Stopping any existing PM2 processes..."
pm2 stop "$APP_NAME" 2>/dev/null || true
pm2 delete "$APP_NAME" 2>/dev/null || true

# Start application with PM2
echo "Starting application with PM2..."
pm2 start "npm start" --name "$APP_NAME" --port "$PORT"

# Save PM2 configuration for startup
echo "Saving PM2 configuration..."
pm2 save

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Application Name: $APP_NAME"
echo "Port: $PORT"
echo "URL: http://$(hostname):$PORT"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 list                    # View all processes"
echo "  pm2 logs $APP_NAME          # View live logs"
echo "  pm2 stop $APP_NAME          # Stop the app"
echo "  pm2 restart $APP_NAME       # Restart the app"
echo "  pm2 delete $APP_NAME        # Delete from PM2"
echo ""

REMOTE_SCRIPT

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Your game is now running on:${NC}"
echo -e "${BLUE}http://starship.dcism.org:${PORT}${NC}"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo -e "ssh -p $SSH_PORT $SSH_USER@$SSH_HOST"
echo "pm2 logs $APP_NAME"
echo ""

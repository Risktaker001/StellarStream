#!/bin/bash

# PM2 Setup Script for StellarStream Backend
# Installs PM2, configures cluster mode, and sets up log rotation

set -e

echo "🚀 Setting up PM2 for StellarStream Backend..."

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install pm2-logrotate module
echo "📦 Installing pm2-logrotate..."
pm2 install pm2-logrotate

# Configure pm2-logrotate
echo "⚙️  Configuring log rotation..."
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss

# Create logs directory
mkdir -p logs

# Build the project
echo "🔨 Building project..."
npm run build

# Start with PM2
echo "🎯 Starting services with PM2..."
pm2 start ecosystem.config.cjs

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on system boot
echo "🔄 Setting up PM2 auto-start on boot..."
pm2 startup

echo "✅ PM2 setup complete!"
echo ""
echo "📊 Useful commands:"
echo "  pm2 status              - Show all processes"
echo "  pm2 logs                - View logs"
echo "  pm2 logs stellarstream-api --lines 100 --follow"
echo "  pm2 monit               - Monitor CPU/Memory"
echo "  pm2 restart all         - Restart all processes"
echo "  pm2 stop all            - Stop all processes"
echo "  pm2 delete all          - Delete all processes"
echo ""

#!/bin/bash
# Hyltén Invest Auto-Publish Script

echo "🚀 Starting Auto-Publish process for Hyltén Invest..."

# 1. Build the project
npm run build

# 2. Add changes
git add .

# 3. Commit
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Auto-publish: Project Insight Update [$TIMESTAMP]"

# 4. Push
echo "📦 Pushing to GitHub..."
git push origin main

# 5. Sitemap Status
echo "🔍 Checking sitemap status..."
node scripts/ping-google.js

echo ""
echo "✅ Hyltén Invest Publish complete!"

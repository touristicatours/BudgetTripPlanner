#!/bin/bash

# Create .env file for the server
cat > .env << EOF
# Server Configuration
PORT=4000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000

# OpenAI Configuration
OPENAI_API_KEY=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

# RapidAPI Configuration
RAPIDAPI_KEY=96d9b0dd5emsh5f6f78f433f3277p11936ejsn6688f0b06157

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_WEBHOOKS=false
EOF

echo "Environment file created successfully!"
echo "You can now run: npm run dev"

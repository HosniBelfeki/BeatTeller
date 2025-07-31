# BeatTeller Deployment Guide

## 🚀 Deployment Options

### 1. Local Development Deployment

#### Prerequisites
- Python 3.11+
- Node.js 20+
- pnpm
- Qloo and Gemini API Keys

#### Steps
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd beatteller_project

# 2. Backend Configuration
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# 3. Environment Variables Configuration
cp .env.example .env
# Edit .env with your API keys

# 4. Start the Backend
python src/main.py

# 5. Frontend Configuration (new terminal)
cd ../frontend
pnpm install
pnpm run dev
```

### 2. Production Deployment

#### Option A: Traditional Servers

**Backend with Gunicorn:**
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 src.main:app
```

**Frontend Static Build:**
```bash
cd frontend
pnpm run build
# Serve the dist/ folder with nginx
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/harmony_ai_project/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Option B: Docker

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5001

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "src.main:app"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN pnpm install

COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - QLOO_API_KEY=${QLOO_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./backend/src/database:/app/src/database

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### 3. Cloud Deployment

#### Heroku
```bash
# Backend
heroku create harmony-ai-backend
heroku config:set QLOO_API_KEY=your_key
heroku config:set GEMINI_API_KEY=your_key
git subtree push --prefix backend heroku main

# Frontend
heroku create harmony-ai-frontend
heroku buildpacks:set heroku/nodejs
git subtree push --prefix frontend heroku main
```

#### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

#### DigitalOcean App Platform
```yaml
name: harmony-ai
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/harmony-ai
    branch: main
  run_command: gunicorn -w 4 -b 0.0.0.0:8080 src.main:app
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: QLOO_API_KEY
    value: your_key
    type: SECRET
  - key: GEMINI_API_KEY
    value: your_key
    type: SECRET

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/harmony-ai
    branch: main
  build_command: pnpm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

## 🔧 Production Configuration

### Environment Variables

**Backend (.env):**
```env
# API Keys
QLOO_API_KEY=your_qloo_api_key
GEMINI_API_KEY=your_gemini_api_key

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
SECRET_KEY=your_very_secure_secret_key

# Database
DATABASE_URL=postgresql://user:pass@localhost/harmony_ai

# Security
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT=100 per hour

# Monitoring
LOG_LEVEL=INFO
SENTRY_DSN=your_sentry_dsn
```

**Frontend (.env.production):**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=Harmony AI
VITE_APP_VERSION=1.0.0
```

### Production Optimizations

#### Backend
```python
# src/main.py - Production configuration
import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Secure configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['DEBUG'] = False

# Secure CORS
CORS(app, origins=os.environ.get('CORS_ORIGINS', '').split(','))

# Logging
import logging
logging.basicConfig(level=logging.INFO)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))
```

#### Frontend
```javascript
// vite.config.js - Production configuration
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
```

## 🔒 Security

### Security Checklist

- [ ] Secure environment variables
- [ ] HTTPS enabled
- [ ] CORS correctly configured
- [ ] Rate limiting implemented
- [ ] Input validation
- [ ] Security headers
- [ ] Security logs
- [ ] Error monitoring

### HTTPS Configuration

**Nginx with Let's Encrypt:**
```bash
# Certbot installation
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers

```nginx
# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📊 Monitoring and Maintenance

### Performance Monitoring

**Backend with Prometheus:**
```python
from prometheus_flask_exporter import PrometheusMetrics

metrics = PrometheusMetrics(app)
metrics.info('app_info', 'Application info', version='1.0.0')
```

**Frontend with Web Vitals:**
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### Logs and Debugging

**Logs Configuration:**
```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/harmony_ai.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### Backup and Recovery

**Backup Script:**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/harmony_ai_$DATE"

# Database backup
mkdir -p $BACKUP_DIR
cp src/database/app.db $BACKUP_DIR/

# Configuration backup
cp .env $BACKUP_DIR/

# Compression
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup created: $BACKUP_DIR.tar.gz"
```

## 🚀 CI/CD

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy Harmony AI

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        python -m pytest
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm install -g pnpm
        pnpm install
    
    - name: Build frontend
      run: |
        cd frontend
        pnpm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        # Your deployment script
        echo "Deploying to production"
```

## 🔧 Troubleshooting

### Common Issues

**CORS Error:**
```python
# Solution: Configure CORS correctly
from flask_cors import CORS
CORS(app, origins=['http://localhost:5173', 'https://yourdomain.com'])
```

**Invalid API Keys Error:**
```bash
# Check environment variables
echo $QLOO_API_KEY
echo $GEMINI_API_KEY
```

**Frontend Build Issue:**
```bash
# Clear cache
cd frontend
rm -rf node_modules package-lock.json
pnpm install
```

### Debugging Logs

**Backend:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
app.logger.debug('Debug message')
```

**Frontend:**
```javascript
// Development mode
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}
```

## 📈 Performance Optimization

### Backend
- Use a Redis cache
- Optimize database queries
- Implement pagination
- Use asynchronous workers

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Service workers for caching
- Lazy loading components

### Database
```sql
-- Index to optimize queries
CREATE INDEX idx_user_preferences ON users(preferences);
CREATE INDEX idx_music_genre ON music(genre);
```

## 🎯 Success Metrics

### Technical KPIs
- API response time < 500ms
- Availability > 99.9%
- Load time < 3s
- Errors < 1%

### Monitoring
```python
# Custom metrics
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('request_duration_seconds', 'Request latency')
```

---

This guide covers all aspects of deploying Harmony AI, from development environment to large-scale production. Follow the appropriate steps for your use case and feel free to adapt configurations to your specific needs.


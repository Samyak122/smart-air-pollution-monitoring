# Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the optimal choice for Next.js apps - it's created by the Next.js team.

#### Setup

1. **Create Vercel Account**
   - Visit https://vercel.com
   - Sign up with GitHub, GitLab, Bitbucket, or email

2. **Deploy from Git**
   - Push project to GitHub
   - Connect Vercel to your repository
   - Vercel auto-deploys on push

3. **Configure Environment Variables**
   ```
   Project Settings → Environment Variables
   
   Add:
   NEXT_PUBLIC_AQICN_API_KEY = your_api_key_here
   NEXT_PUBLIC_ENABLE_GEOLOCATION = true
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Get live URL automatically

#### Advantages
- ✅ Automatic deployments on git push
- ✅ Automatic scaling
- ✅ Built-in analytics
- ✅ Free tier available
- ✅ Fast CDN
- ✅ One-click rollbacks

#### Limitations
- Free tier has limits (~100 deployments/month)
- Paid plan required for production

---

### Option 2: Docker + Cloud Provider

Deploy as Docker container to AWS, Google Cloud, Azure, or DigitalOcean.

#### Step 1: Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
RUN npm ci --only=production

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

#### Step 2: Build Docker Image

```bash
docker build -t airwatch:latest .
```

#### Step 3: Test Locally

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AQICN_API_KEY=your_key \
  airwatch:latest
```

Visit http://localhost:3000

#### Step 4: Push to Registry

```bash
# Docker Hub
docker tag airwatch:latest username/airwatch:latest
docker push username/airwatch:latest

# Or: AWS ECR, Google Container Registry, Azure Container Registry
```

#### Step 5: Deploy to Cloud

**AWS EC2:**
```bash
# SSH into instance
ssh -i key.pem ubuntu@your-instance

# Pull and run image
docker pull username/airwatch:latest
docker run -d -p 80:3000 \
  -e NEXT_PUBLIC_AQICN_API_KEY=key \
  username/airwatch:latest
```

**Google Cloud Run:**
```bash
gcloud run deploy airwatch \
  --image us-docker.pkg.dev/project/airwatch:latest \
  --platform managed \
  --memory 512Mi \
  --timeout 3600
```

**DigitalOcean App Platform:**
1. Connect GitHub repository
2. Configure build: `npm run build`
3. Configure run: `npm start`
4. Add environment variables
5. Deploy

---

### Option 3: Self-Hosted Server

Deploy to your own Ubuntu/Linux server.

#### Prerequisites
- Ubuntu 20.04 or later
- SSH access to server
- Domain name (optional)
- Nginx/Apache (optional, for reverse proxy)

#### Step 1: Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install npm dependencies
npm install -g npm@latest
```

#### Step 2: Setup Application

```bash
# Create app directory
mkdir -p /var/www/airwatch
cd /var/www/airwatch

# Clone repository
git clone https://github.com/yourusername/airwatch.git .

# Install dependencies
npm install --production
npm run build
```

#### Step 3: Configure Environment

```bash
# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_AQICN_API_KEY=your_api_key_here
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
EOF

# Set permissions
chmod 600 .env.local
```

#### Step 4: Setup PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'airwatch',
    script: 'npm start',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 5: Setup Nginx (Reverse Proxy)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx config
cat > /etc/nginx/sites-available/airwatch << EOF
upstream airwatch {
  server 127.0.0.1:3000;
}

server {
  listen 80;
  server_name your-domain.com;

  # Redirect HTTP to HTTPS
  return 301 https://\$server_name\$request_uri;
}

server {
  listen 443 ssl;
  server_name your-domain.com;

  # SSL certificates (use Certbot for free Let's Encrypt)
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;

  location / {
    proxy_pass http://airwatch;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/airwatch /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### Step 6: Setup SSL (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate certificate
certbot certonly --standalone -d your-domain.com

# Auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer
```

#### Step 7: Monitor & Maintain

```bash
# View logs
pm2 logs airwatch

# Monitor processes
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## Environment Variables by Platform

### Vercel
```
Settings → Environment Variables
Add: NEXT_PUBLIC_AQICN_API_KEY
```

### Docker
```bash
docker run -e NEXT_PUBLIC_AQICN_API_KEY=key image-name
```

### Self-Hosted
```bash
# In .env.local
NEXT_PUBLIC_AQICN_API_KEY=your_key_here
```

---

## Database Setup (Optional)

For storing historical data:

```bash
# Install MongoDB
docker run -d -p 27017:27017 mongo

# Or use MongoDB Atlas (cloud)
# https://www.mongodb.com/cloud/atlas
```

Add connection string to .env:
```
MONGODB_URI=mongodb://localhost:27017/airwatch
```

---

## Monitoring & Logging

### Application Monitoring

```bash
# Install New Relic (optional)
npm install newrelic

# Or DataDog, Sentry, etc.
```

### Log Aggregation

```bash
# PM2 Plus for monitoring
pm2 install pm2-auto-pull
pm2 install pm2-logrotate
```

---

## Performance Optimization

### Before Deployment

```bash
# 1. Build optimization
npm run build

# 2. Check bundle size
npm run analyze

# 3. Run tests
npm test

# 4. Linting
npm run lint
```

### CDN Setup (Cloudflare/CloudFront)

1. Set nameservers to Cloudflare/CDN provider
2. Enable caching for static assets
3. Setup purge rules
4. Enable compression

### Database Optimization

- Add indexes for frequently queried fields
- Enable query caching
- Setup read replicas for scaling

---

## Scaling Strategies

### Horizontal Scaling
```
Load Balancer
    ├── Server 1 (App + API)
    ├── Server 2 (App + API)
    └── Server 3 (App + API)
    └── Database (Shared)
```

### Vertical Scaling
- Increase server CPU/RAM
- Upgrade database instance
- Add caching layer (Redis)

### API Optimization
- Add API caching (with TTL)
- Implement rate limiting
- Use API pagination
- Cache API responses in browser

---

## Security Checklist

Before going live:

- [ ] Environment variables are secure
- [ ] API key is never exposed in code
- [ ] HTTPS enabled everywhere
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Web Application Firewall (WAF) setup
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] GDPR/Privacy compliance

---

## Rollback & Disaster Recovery

### Vercel
- One-click rollback in deployment history
- Automatic backups

### Self-Hosted
```bash
# Using git
git log --oneline
git revert <commit-hash>
git push

# Using PM2
pm2 restart all
pm2 save
```

### Database Backups
```bash
# MongoDB local backup
mongodump --out /path/to/backup

# MongoDB Atlas (automatic)
# Configure backup snapshots in UI

# Regular backups
0 2 * * * /usr/bin/mongodump --out /path/to/backup-$(date +\%Y\%m\%d)
```

---

## Cost Estimation

### Vercel
- Free tier: Up to 100 deployments/month
- Pro: $20/month
- Enterprise: Custom pricing

### AWS EC2
- t2.micro (free tier): $0-10/month
- t2.small: $20/month
- t2.medium: $40/month

### DigitalOcean
- Basic: $5/month
- Standard: $12/month
- Premium: $24-48/month

### MongoDB Atlas
- Free tier: 512 MB storage
- Shared: $9/month
- Dedicated: $57+/month

**Total Estimate**: $30-100/month for production setup

---

## Post-Deployment

1. ✅ Monitor error rates
2. ✅ Track API usage
3. ✅ Setup alerts for issues
4. ✅ Regular security updates
5. ✅ Database backups
6. ✅ Performance monitoring
7. ✅ User feedback collection

---

**Choose the deployment option that best fits your needs:**
- **Vercel**: Easiest for Next.js, best DX
- **Docker**: Most flexible, good for CI/CD
- **Self-Hosted**: Full control, potential cost savings

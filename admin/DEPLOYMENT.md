# Admin Module Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the admin module in production environments. The admin module is a secure, scalable administrative interface for managing courses, problems, and users.

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm/pnpm**: Latest stable version
- **Operating System**: Linux, macOS, or Windows Server
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: 10GB minimum (50GB recommended for file uploads)
- **Network**: HTTPS/TLS 1.3 support required

### Environment Setup
1. **Install Node.js**:
   ```bash
   # Using NodeSource (recommended)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Or using nvm (recommended for development)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **Install pnpm** (recommended):
   ```bash
   npm install -g pnpm
   ```

3. **Install PM2** (for process management):
   ```bash
   npm install -g pm2
   ```

## Security Configuration

### Environment Variables
Create a `.env.production` file in the `admin/api` directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Security Keys (Generate strong random keys)
JWT_SECRET=your-256-bit-jwt-secret-key-here-change-this-in-production
SESSION_SECRET=your-256-bit-session-secret-key-here-change-this-in-production

# Database Configuration (if using external database)
DATABASE_URL=postgresql://username:password@localhost:5432/admin_db
REDIS_URL=redis://localhost:6379

# File Storage Configuration
UPLOAD_DIR=/var/uploads/admin
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain

# Audit Logging
AUDIT_LOG_PATH=/var/log/admin/audit.log
ENABLE_AUDIT_LOGGING=true

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5

# SSL/TLS Configuration (if using HTTPS)
SSL_CERT_PATH=/etc/ssl/certs/your-domain.crt
SSL_KEY_PATH=/etc/ssl/private/your-domain.key
```

### Generate Secure Keys
Generate cryptographically secure keys:

```bash
# Generate JWT secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### SSL/TLS Setup
1. **Obtain SSL Certificate** (Let's Encrypt recommended):
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d yourdomain.com -d admin.yourdomain.com
   ```

2. **Configure SSL in Nginx** (see Nginx configuration below)

## Deployment Steps

### 1. Build the Application
```bash
# Navigate to admin directory
cd admin

# Install dependencies
pnpm install

# Build the frontend
pnpm run build

# Navigate to API directory
cd api

# Install API dependencies
pnpm install

# Run tests
pnpm test
```

### 2. Database Setup (Optional)
If using external database:

```bash
# PostgreSQL setup (example)
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb admin_db
sudo -u postgres psql -c "CREATE USER admin_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE admin_db TO admin_user;"
```

### 3. File System Setup
```bash
# Create upload directory
sudo mkdir -p /var/uploads/admin
sudo chown -R $USER:$USER /var/uploads/admin
sudo chmod 755 /var/uploads/admin

# Create log directory
sudo mkdir -p /var/log/admin
sudo chown -R $USER:$USER /var/log/admin
sudo chmod 755 /var/log/admin
```

### 4. Process Management with PM2
```bash
# Navigate to API directory
cd admin/api

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'admin-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/admin/api-error.log',
    out_file: '/var/log/admin/api-out.log',
    log_file: '/var/log/admin/api-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### 5. Nginx Configuration
Create `/etc/nginx/sites-available/admin`:

```nginx
# Admin API upstream
upstream admin_api {
    server 127.0.0.1:3001;
    keepalive 64;
}

# Admin Frontend upstream (if serving from different port)
upstream admin_frontend {
    server 127.0.0.1:5173;
    keepalive 64;
}

# Admin API server
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tiny.cloud https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://cdn.tiny.cloud;";

    # File upload size limit
    client_max_body_size 10M;

    # API routes
    location /api/ {
        proxy_pass http://admin_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend routes (if serving from same domain)
    location / {
        proxy_pass http://admin_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring and Logging

### Application Logs
```bash
# View PM2 logs
pm2 logs admin-api

# View specific log files
tail -f /var/log/admin/api-error.log
tail -f /var/log/admin/api-out.log
tail -f /var/log/admin/audit.log
```

### System Monitoring
```bash
# Monitor system resources
htop

# Monitor disk usage
df -h

# Monitor memory usage
free -h
```

### Health Checks
```bash
# Check API health
curl -f https://admin.yourdomain.com/api/health || echo "API is down"

# Check SSL certificate expiry
echo | openssl s_client -servername admin.yourdomain.com -connect admin.yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Backup and Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump -U admin_user -d admin_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Automate with cron
(crontab -l 2>/dev/null; echo "0 2 * * * pg_dump -U admin_user -d admin_db > /backups/admin_db_\$(date +\%Y\%m\%d_\%H\%M\%S).sql") | crontab -
```

### File Backup
```bash
# Backup uploads
rsync -av /var/uploads/admin /backups/uploads/

# Backup logs
rsync -av /var/log/admin /backups/logs/
```

### Application Backup
```bash
# Backup application code
tar -czf /backups/admin-app-$(date +%Y%m%d_%H%M%S).tar.gz /path/to/admin
```

## Security Hardening

### Firewall Configuration
```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2ban Setup
```bash
# Install fail2ban
sudo apt install fail2ban

# Create admin jail configuration
sudo tee /etc/fail2ban/jail.local << 'EOF'
[admin-api]
enabled = true
port = https,http
filter = admin-api
logpath = /var/log/admin/api-error.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

# Create filter
sudo tee /etc/fail2ban/filter.d/admin-api.conf << 'EOF'
[Definition]
failregex = ^.*login_failed.*ip=<HOST>.*$
ignoreregex =
EOF

sudo systemctl restart fail2ban
```

### Regular Security Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd admin/api
pnpm audit
pnpm update

# Restart application
pm2 restart admin-api
```

## Performance Optimization

### Node.js Optimization
```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable garbage collection logging
export NODE_OPTIONS="$NODE_OPTIONS --trace-gc"
```

### PM2 Optimization
Update `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'admin-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=4096',
    watch: false,
    merge_logs: true,
    log_type: 'json',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3001
   sudo lsof -i :3001
   # Kill process
   sudo kill -9 <PID>
   ```

2. **Permission Denied Errors**
   ```bash
   # Fix upload directory permissions
   sudo chown -R $USER:$USER /var/uploads/admin
   sudo chmod -R 755 /var/uploads/admin
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate validity
   openssl x509 -in /etc/ssl/certs/your-domain.crt -text -noout
   # Renew Let's Encrypt certificate
   sudo certbot renew
   ```

4. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   # Check connection
   psql -U admin_user -d admin_db -c "SELECT 1;"
   ```

### Log Analysis
```bash
# Check for errors
grep -i error /var/log/admin/api-error.log

# Check for security events
grep -i "security\|login_failed\|suspicious" /var/log/admin/audit.log

# Monitor real-time logs
tail -f /var/log/admin/api-error.log | grep -i error
```

## Migration Procedures

### From Development to Production
1. **Backup current production**
2. **Update environment variables**
3. **Run database migrations**
4. **Deploy new code**
5. **Restart services**
6. **Verify deployment**

### Database Migration
```bash
# Create migration script
node scripts/migrate.js

# Backup before migration
pg_dump -U admin_user -d admin_db > pre-migration-backup.sql

# Run migration
node scripts/migrate.js --env production
```

### Rollback Procedure
```bash
# Stop application
pm2 stop admin-api

# Restore from backup
psql -U admin_user -d admin_db < pre-migration-backup.sql

# Restore application code
git checkout <previous-stable-commit>

# Restart application
pm2 restart admin-api
```

## Support and Maintenance

### Regular Maintenance Tasks
- **Daily**: Check logs for errors and security events
- **Weekly**: Review performance metrics and resource usage
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and update security configurations

### Emergency Contacts
- **System Administrator**: [Your contact]
- **Security Team**: [Your contact]
- **Development Team**: [Your contact]

### Documentation Updates
Keep this documentation updated with:
- Configuration changes
- Security updates
- Performance optimizations
- Troubleshooting procedures

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Maintained By**: [Your Team]
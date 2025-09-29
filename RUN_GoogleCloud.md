# 🌅 Deploy Japanese Calendar App to Google Cloud

This guide helps you deploy your Community Event Calendar app (with Japanese localization) to Google Cloud using Cloud Run and Cloud SQL.

## 📋 Prerequisites

- Google Cloud account with billing enabled
- Google Cloud CLI (`gcloud`) installed and authenticated
- Docker installed (for containerized deployment)
- Your current Replit database data exported

## 🏗️ Application Overview

**Your App Architecture:**
- **Frontend**: React + TypeScript (Vite build)
- **Backend**: Express.js + TypeScript with session-based auth
- **Database**: PostgreSQL with Drizzle ORM
- **Features**: Japanese calendar (更新日時), location filtering, admin interface

## 🎯 Deployment Strategy: Cloud Run + Cloud SQL

**Why This Setup:**
- Cloud Run: Perfect for your hybrid frontend/backend Express app
- Cloud SQL: Managed PostgreSQL with automatic backups
- Auto-scaling: Scales to zero when not used (cost-effective)
- HTTPS: Built-in SSL certificates

## 🔧 Required Files (Create These)

### 1. Dockerfile
```dockerfile
# Use Node.js 18 LTS
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies for smaller image
RUN npm prune --production

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
```

### 2. .dockerignore
```
node_modules
dist
.git
*.md
client/src
server/*.ts
*.log
.env
attached_assets
```

### 3. Update package.json Scripts
Add these to your existing scripts:
```json
{
  "scripts": {
    "gcp-build": "npm run build",
    "start": "NODE_ENV=production node dist/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 🗄️ Database Setup (Cloud SQL)

### Step 1: Create PostgreSQL Instance
```bash
# Create Cloud SQL instance
gcloud sql instances create calendar-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB

# Create database
gcloud sql databases create calendar_events --instance=calendar-db

# Create user
gcloud sql users create calendar_user \
  --instance=calendar-db \
  --password=YOUR_SECURE_PASSWORD
```

### Step 2: Export Data from Replit
```bash
# In your Replit console, export current data
pg_dump $DATABASE_URL > calendar_backup.sql
```

### Step 3: Import to Cloud SQL
```bash
# Upload backup to Cloud Storage bucket
gsutil cp calendar_backup.sql gs://YOUR_BUCKET/

# Import to Cloud SQL
gcloud sql import sql calendar-db \
  gs://YOUR_BUCKET/calendar_backup.sql \
  --database=calendar_events
```

## 🔑 Environment Variables & Secrets

### Required Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://calendar_user:PASSWORD@/calendar_events?host=/cloudsql/PROJECT_ID:us-central1:calendar-db

# Session security
SESSION_SECRET=your-super-secure-random-string-here

# Runtime
NODE_ENV=production
PORT=8080
```

### Store Secrets in Secret Manager
```bash
# Create secrets
echo -n "your-database-url" | gcloud secrets create database-url --data-file=-
echo -n "your-session-secret" | gcloud secrets create session-secret --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding session-secret \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 🚀 Deployment Commands

### Option A: Deploy from Source (Recommended)
```bash
# Deploy directly from source code
gcloud run deploy calendar-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest \
  --add-cloudsql-instances PROJECT_ID:us-central1:calendar-db
```

### Option B: Deploy with Docker
```bash
# Build for Cloud Run (linux/amd64)
docker build --platform linux/amd64 -t gcr.io/PROJECT_ID/calendar-app .

# Push to Container Registry
docker push gcr.io/PROJECT_ID/calendar-app

# Deploy to Cloud Run
gcloud run deploy calendar-app \
  --image gcr.io/PROJECT_ID/calendar-app \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --set-secrets DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest \
  --add-cloudsql-instances PROJECT_ID:us-central1:calendar-db
```

## 🔧 Database Migrations

### Run Drizzle Migrations on Cloud SQL
```bash
# From your local machine, connect to Cloud SQL
gcloud sql connect calendar-db --user=calendar_user

# Or set up Cloud SQL Proxy
./cloud_sql_proxy -instances=PROJECT_ID:us-central1:calendar-db=tcp:5432 &

# Run migrations
DATABASE_URL="postgresql://calendar_user:PASSWORD@localhost:5432/calendar_events" npm run db:push
```

## 🎌 Japanese Features Verification

After deployment, verify these features work:
- ✅ **更新日時** (Last Updated) displays in Japanese format: "yyyy年M月d日"
- ✅ Calendar navigation works properly
- ✅ Location filtering with color coding
- ✅ Admin interface accessible at `/admin`
- ✅ Event creation/editing maintains Japanese date formats

## 🔒 Security Configuration

### Enable Required APIs
```bash
gcloud services enable cloudsql.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Cloud SQL Security
- SSL connections enforced
- Private IP recommended for production
- IAM database authentication (optional)

## 📊 Monitoring & Logs

### View Application Logs
```bash
# View Cloud Run logs
gcloud logs read --limit=50 --service=calendar-app

# Real-time logs
gcloud logs tail --service=calendar-app
```

### Performance Monitoring
- Cloud Run provides automatic metrics
- Set up alerting for errors or high latency
- Monitor database connections and performance

## 💰 Cost Estimation

**Monthly costs for moderate usage:**
- **Cloud SQL (db-f1-micro)**: $7-15
- **Cloud Run**: $0-5 (first 2M requests free)
- **Storage**: $1-3
- **Total**: ~$10-25/month

## 🔄 CI/CD Setup (Optional)

### GitHub Actions Deployment
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy calendar-app \
            --source . \
            --region us-central1 \
            --allow-unauthenticated
```

## 🛠️ Production Optimizations

### Session Storage
For production, consider using Cloud Memorystore (Redis):
```bash
# Create Redis instance
gcloud redis instances create calendar-sessions \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_6_x
```

### Database Connection Pooling
Your current setup already uses proper connection pooling with Drizzle ORM.

### Custom Domain
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service calendar-app \
  --domain your-domain.com \
  --region us-central1
```

## 🔍 Troubleshooting

### Common Issues
1. **Port Configuration**: Ensure app listens on `process.env.PORT || 8080`
2. **Database Connection**: Verify Cloud SQL connection string format
3. **Build Failures**: Check Node.js version compatibility
4. **Memory Issues**: Increase memory allocation if needed

### Debug Commands
```bash
# Check Cloud Run service status
gcloud run services describe calendar-app --region=us-central1

# Test database connection
gcloud sql connect calendar-db --user=calendar_user

# View build logs
gcloud builds list
```

## 🎯 Go Live Checklist

- [ ] Cloud SQL instance created and data imported
- [ ] Secrets stored in Secret Manager
- [ ] Dockerfile and .dockerignore created
- [ ] Cloud Run service deployed successfully
- [ ] Database migrations run
- [ ] Japanese calendar features tested
- [ ] Admin interface accessible
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerting set up

Your Japanese Community Event Calendar is now ready for production use on Google Cloud! 🌸
# Deployment Guide - Western Colleges Inc (SchoolHub)

## Overview

This document describes the CI/CD deployment setup for the SchoolHub Laravel application to Hostinger shared hosting.

## Environments

| Environment | Branch | URL | Database |
|-------------|--------|-----|----------|
| **Production** | `master` | https://westerncollegesinc.ph | `u866511543_westerncollege` |
| **Staging** | `SPRINT` | https://test.westerncollegesinc.ph | `u866511543_test_western` |

## Architecture

```
Local Development
      │
      ├── git push to SPRINT ──→ GitHub Actions ──→ test.westerncollegesinc.ph (Staging)
      │
      └── git push to master ──→ GitHub Actions ──→ westerncollegesinc.ph (Production)
```

## Deployment Flow

1. **Developer pushes code** to either `SPRINT` (staging) or `master` (production) branch
2. **GitHub Actions** triggers the `deploy.yml` workflow
3. **CI builds Vite assets** (since Hostinger has no Node.js)
4. **Rsync uploads** all files including `vendor/` and `public/build/` to server
5. **SSH post-deploy** runs Laravel caching commands and migrations

## Server Structure

```
/home/u866511543/
├── westerncollege/                    # Production app
│   ├── public/                        # Laravel public (symlinked to domain)
│   │   └── storage -> ../storage/app/public
│   ├── storage/
│   └── ...
├── test_westerncollege/               # Staging app
│   ├── public/
│   │   └── storage -> ../storage/app/public
│   ├── storage/
│   └── ...
└── domains/
    └── westerncollegesinc.ph/
        └── public_html -> /home/u866511543/westerncollege/public
```

## Workflow for Development

### Testing Changes (Staging)
```bash
# Push to SPRINT branch to deploy to staging
git push origin master:SPRINT

# Or if working on SPRINT branch
git checkout SPRINT
git push origin SPRINT
```

### Production Deployment
```bash
# Only push to master when staging is verified
git checkout master
git push origin master
```

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | Hostinger IP: `72.61.121.165` |
| `SSH_PORT` | SSH Port: `65002` |
| `SSH_USER` | Username: `u866511543` |
| `SSH_PRIVATE_KEY` | Ed25519 private key for deployment |
| `APP_KEY` | Laravel application key |
| `PROD_DEPLOY_PATH` | `/home/u866511543/westerncollege` |
| `PROD_DB_DATABASE` | Production database name |
| `PROD_DB_USERNAME` | Production database username |
| `PROD_DB_PASSWORD` | Production database password |
| `STAGING_DEPLOY_PATH` | `/home/u866511543/test_westerncollege` |
| `STAGING_DB_DATABASE` | Staging database name |
| `STAGING_DB_USERNAME` | Staging database username |
| `STAGING_DB_PASSWORD` | Staging database password |

## Manual Setup (One-time)

### 1. SSH Key Setup
- SSH key added to Hostinger hPanel: `github-deploy`
- Private key stored in GitHub Secrets: `SSH_PRIVATE_KEY`

### 2. Domain Configuration
- Main domain points to: `/home/u866511543/westerncollege/public`
- Subdomain `test.westerncollegesinc.ph` points to: `/home/u866511543/test_westerncollege/public`

### 3. Storage Symlinks (manual, exec() is disabled)
```bash
# Production
ln -sfn ~/westerncollege/storage/app/public ~/westerncollege/public/storage

# Staging
ln -sfn ~/test_westerncollege/storage/app/public ~/test_westerncollege/public/storage
```

### 4. Database Seeding (first-time only)
```bash
# SSH into server
ssh -p 65002 u866511543@72.61.121.165

# Production
cd ~/westerncollege
php artisan db:seed --class=AdminSeeder --force

# Staging
cd ~/test_westerncollege
php artisan db:seed --class=AdminSeeder --force
```

## Troubleshooting

### Check deployment logs
Go to: https://github.com/LeeDev428/uplb_schoolhub/actions

### SSH into server manually
```bash
ssh -i ~/.ssh/hostinger_deploy -p 65002 u866511543@72.61.121.165
```

### Clear Laravel caches
```bash
cd ~/westerncollege  # or ~/test_westerncollege
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

### Check Laravel logs
```bash
tail -f ~/westerncollege/storage/logs/laravel.log
```

## Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions deployment workflow |
| `.env.production.example` | Production environment template |
| `.env.staging.example` | Staging environment template |
| `CREDENTIALS.local` | Local credentials reference (gitignored) |
| `DEPLOYMENT.md` | This documentation |

## Important Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Build assets locally** are committed to Git because Hostinger has no Node.js
3. **Storage symlinks** must be created manually (exec() disabled on Hostinger)
4. **Test on SPRINT first** before pushing to master (production)

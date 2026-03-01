# How to Deploy - Step by Step Guide

## Overview

```
Your Computer (local)
       │
       ├─ push to SPRINT branch ──► test.westerncollegesinc.ph  (staging/testing)
       │
       └─ push to master branch ──► westerncollegesinc.ph       (production/live)
```

**YES** - SPRINT branch is connected to `https://test.westerncollegesinc.ph`
**YES** - master branch is connected to `https://westerncollegesinc.ph`

Pushing code triggers GitHub Actions automatically. You do NOT need to do anything else.

---

## Login Accounts (both environments)

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@gmail.com | password |
| Registrar | registrar@gmail.com | password |
| Accounting | accounting@gmail.com | password |
| Super Accounting | super.accounting@gmail.com | password |
| Teacher | teacher@gmail.com | password |
| Student | student@gmail.com | password |

---

## Step 1: Work Locally

Do your coding on your local machine. Test everything at `http://127.0.0.1:8001`.

```bash
# Start local server
php artisan serve --port=8001

# Start Vite (in separate terminal)
npm run dev
```

---

## Step 2: Push to SPRINT (Test Environment)

When your feature is ready to test on the real server:

```bash
# Save all your work
git add -A
git commit -m "your message here"

# Push to SPRINT branch → deploys to test.westerncollegesinc.ph
git push origin master:SPRINT
```

Wait ~2 minutes, then open: **https://test.westerncollegesinc.ph**

Test everything there. If something breaks, fix it locally and push to SPRINT again.

---

## Step 3: Push to Production (Live Site)

When everything looks good on staging:

```bash
# Push to master branch → deploys to westerncollegesinc.ph
git push origin master
```

Wait ~2 minutes, then open: **https://westerncollegesinc.ph**

---

## Full Example Workflow

```bash
# 1. Make your changes locally, test at localhost:8001

# 2. Commit your changes
git add -A
git commit -m "feat: Add new student feature"

# 3. Test on staging first
git push origin master:SPRINT
# → Visit https://test.westerncollegesinc.ph to verify

# 4. When happy, push to production
git push origin master
# → Visit https://westerncollegesinc.ph to verify
```

---

## Checking Deployment Status

Go to: **https://github.com/LeeDev428/uplb_schoolhub/actions**

Look for **"Deploy to Hostinger"** workflows:
- Green ✅ = deployed successfully
- Red ✗ = something failed (click to see logs)

### About the red linter/tests failures:
The **linter** and **tests** workflows failing in red is **NORMAL and expected**.
Those are pre-existing code quality checks that were already failing before deployment was set up.
They do **NOT** affect the actual deployment at all.

Only care about **"Deploy to Hostinger"** being green.

---

## If Something Goes Wrong

### Check Laravel logs on server

```bash
# SSH into server (from Windows terminal)
ssh -i C:\Users\grafr\.ssh\hostinger_deploy -p 65002 u866511543@72.61.121.165

# Check production logs
tail -50 ~/westerncollege/storage/logs/laravel.log

# Check staging logs
tail -50 ~/test_westerncollege/storage/logs/laravel.log
```

### Clear cache on server

```bash
# Production
cd ~/westerncollege && php artisan config:clear && php artisan cache:clear && php artisan view:clear

# Staging
cd ~/test_westerncollege && php artisan config:clear && php artisan cache:clear && php artisan view:clear
```

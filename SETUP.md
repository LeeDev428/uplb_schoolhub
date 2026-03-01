# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Update database credentials in .env
# DB_DATABASE=schoolhub
# DB_USERNAME=root
# DB_PASSWORD=
```

### 2. Installation
```bash
# Install dependencies
composer install
npm install

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate
```

### 3. Create Test Users
```bash
php artisan tinker
```

Then paste each block:

**Owner Account:**
```php
\App\Models\User::create(['name' => 'System Owner', 'email' => 'owner@test.com', 'password' => bcrypt('password'), 'role' => 'owner', 'email_verified_at' => now()]);
```

**Registrar Account:**
```php
\App\Models\User::create(['name' => 'School Registrar', 'email' => 'registrar@test.com', 'password' => bcrypt('password'), 'role' => 'registrar', 'email_verified_at' => now()]);
```

**Student Account:**
```php
\App\Models\User::create(['name' => 'John Doe', 'email' => 'student@test.com', 'password' => bcrypt('password'), 'role' => 'student', 'student_id' => '2024-001', 'email_verified_at' => now()]);
```

Type `exit` to leave tinker.

### 4. Build & Run
```bash
# Build frontend assets
npm run build

# Start the application
php artisan serve

# Visit http://localhost:8000
```

## 🔑 Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Owner** | owner@test.com | password | Financial Dashboard |
| **Registrar** | registrar@test.com | password | Student Management |
| **Student** | student@test.com | password | Student Dashboard |

## 📱 Features by Role

### Owner Portal
- Financial Dashboard with income tracking
- Revenue distribution by department
- Real-time income metrics
- Expected income projections
- Department analysis
- Export reports

### Registrar Portal
- Student Management (Add/Edit/View/Delete)
- Enrollment tracking (7 status types)
- Requirements monitoring
- Document management
- Class and section management
- Student reports
- Archive system

### Student Portal
- View personal information
- Check enrollment status
- View requirements
- Access profile settings

## 🛠 Development Mode

For better development experience with hot reload:

```bash
composer dev
```

This runs:
- Laravel server (port 8000)
- Vite dev server (HMR)
- Queue worker

## 📚 Next Steps

1. **Customize Branding**
   - Update `config/app.php` - change APP_NAME
   - Modify logo in `resources/js/components/app-logo.tsx`
   - Adjust colors in `resources/css/app.css`

2. **Configure Email**
   - Set up SMTP in `.env` for password resets
   - Test with Mailtrap.io (free)

3. **Add More Students**
   - Login as registrar
   - Use "Add New Student" button
   - Or create via database seeder

4. **Enable SSR (Optional)**
   ```bash
   npm run build:ssr
   composer dev:ssr
   ```

## 🐛 Troubleshooting

### "Class not found" errors
```bash
composer dump-autoload
```

### Frontend not updating
```bash
npm run build
# or for development
npm run dev
```

### Database errors
```bash
php artisan migrate:fresh
# Then recreate test users
```

### Permission errors
```bash
# On Linux/Mac
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## 📖 Documentation

Full documentation in [README.md](README.md)

- Architecture
- Role-based access
- Project structure
- Testing guide
- Deployment instructions

## 💡 Tips

1. **Dark Mode** - Toggle in settings or use system preference
2. **2FA** - Enable in Settings > Two-Factor Auth
3. **Keyboard Navigation** - Tab through forms efficiently
4. **Mobile Responsive** - Works on all devices

## 🔗 Useful Links

- Laravel Docs: https://laravel.com/docs
- React Docs: https://react.dev
- Inertia Docs: https://inertiajs.com
- Tailwind Docs: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com

---

**Need help?** Create an issue on GitHub or check the main README.md

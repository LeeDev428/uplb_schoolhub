# SchoolHub - Modern School Management System

A comprehensive, role-based school management system built with Laravel 12 and React 19, featuring student management, financial tracking, and administrative tools.

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?logo=laravel)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎓 For Registrars
- **Student Management** - Comprehensive student records with enrollment tracking
- **Requirements Monitoring** - Track document submissions and compliance
- **Enrollment Status** - Real-time enrollment and payment status
- **Document Management** - Create, request, and manage student documents
- **Class Management** - Organize classes and sections
- **Reports & Analytics** - Generate comprehensive student reports
- **Archive System** - Maintain historical records

### 💰 For Owners/Administrators
- **Financial Dashboard** - Real-time income and revenue tracking
- **Department Analytics** - Revenue distribution by department
- **Income Projections** - Expected income forecasting
- **Target Monitoring** - Track financial goals and achievements
- **Calendar View** - Visual financial timeline
- **Export Reports** - Generate and export financial reports

### 🔐 For All Users
- **Secure Authentication** - Email/password with remember me
- **Two-Factor Authentication** - TOTP-based 2FA with recovery codes
- **Email Verification** - Ensure valid email addresses
- **Password Reset** - Secure password recovery
- **Profile Management** - Update personal information
- **Dark/Light Mode** - System-wide theme preference
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠 Tech Stack

### Backend
- **Framework:** Laravel 12.x
- **PHP:** 8.2+
- **Database:** MySQL/PostgreSQL/SQLite
- **Authentication:** Laravel Fortify
- **API:** Inertia.js (Server-side rendering)

### Frontend
- **Framework:** React 19.2.0
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 4.0
- **UI Components:** Radix UI + shadcn/ui
- **Build Tool:** Vite 7.0
- **Icons:** Lucide React
- **Routing:** Laravel Wayfinder (Type-safe)
- **Compiler:** React Compiler (babel-plugin-react-compiler)

### Development Tools
- **Code Style:** ESLint + Prettier
- **Testing:** Pest PHP
- **Type Checking:** TypeScript strict mode
- **Version Control:** Git

## 📦 System Requirements

- **PHP:** >= 8.2
- **Node.js:** >= 18.x
- **npm:** >= 9.x
- **Composer:** >= 2.x
- **Database:** MySQL >= 8.0 / PostgreSQL >= 13 / SQLite >= 3.35

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd school-mgmt_lms_pos
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Configuration

Edit `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=schoolhub
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Build Assets

```bash
# Development build
npm run dev

# Production build
npm run build

# With SSR
npm run build:ssr
```

### 7. Start the Application

```bash
# Development mode (runs all services)
composer dev

# Or manually
php artisan serve
npm run dev
```

Visit `http://localhost:8000` in your browser.

## ⚙️ Configuration

### Creating User Accounts

#### Owner Account (Super Admin)
```bash
php artisan tinker
```

```php
use App\Models\User;

User::create([
    'name' => 'System Owner',
    'email' => 'owner@schoolhub.local',
    'password' => bcrypt('password'),
    'role' => 'owner',
    'email_verified_at' => now(),
]);
```

#### Registrar Account
```php
User::create([
    'name' => 'School Registrar',
    'email' => 'registrar@schoolhub.local',
    'password' => bcrypt('password'),
    'role' => 'registrar',
    'email_verified_at' => now(),
]);
```

#### Student Account
```php
User::create([
    'name' => 'John Doe',
    'email' => 'student@schoolhub.local',
    'password' => bcrypt('password'),
    'role' => 'student',
    'student_id' => '2024-001',
    'program' => 'BS Information Technology',
    'year_level' => '3',
    'email_verified_at' => now(),
]);
```

### Mail Configuration

For password resets and email verification, configure your mail settings in `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@schoolhub.local
MAIL_FROM_NAME="${APP_NAME}"
```

## 👥 User Roles

### Owner (Super Administrator)
- Full system access
- Financial dashboard and analytics
- Revenue tracking and projections
- Department management
- Export comprehensive reports
- System-wide settings

### Registrar
- Student management (CRUD)
- Enrollment processing
- Requirements tracking
- Document management
- Class and section management
- Student reports
- Archive access

### Student
- View personal information
- Access enrollment status
- Track requirements
- View class schedule
- Update profile settings

## 📁 Project Structure

```
school-mgmt_lms_pos/
├── app/
│   ├── Actions/Fortify/          # User creation & password reset
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Settings/         # Profile, Password, 2FA
│   │   ├── Middleware/           # Role checking, Inertia
│   │   └── Requests/             # Form validation
│   ├── Models/
│   │   └── User.php              # User model with roles
│   └── Providers/
│
├── database/
│   ├── migrations/               # Database schema
│   ├── seeders/                  # Database seeders
│   └── factories/                # Model factories
│
├── resources/
│   ├── css/
│   │   └── app.css               # Tailwind styles
│   ├── js/
│   │   ├── components/
│   │   │   ├── registrar/        # Registrar-specific components
│   │   │   ├── owner/            # Owner-specific components
│   │   │   └── ui/               # Shared UI components (shadcn)
│   │   ├── layouts/
│   │   │   ├── registrar/        # Registrar layout
│   │   │   ├── owner/            # Owner layout
│   │   │   ├── app/              # App layout
│   │   │   └── auth/             # Auth layout
│   │   ├── pages/
│   │   │   ├── registrar/        # Registrar pages
│   │   │   ├── owner/            # Owner pages
│   │   │   ├── auth/             # Authentication pages
│   │   │   ├── settings/         # Settings pages
│   │   │   └── welcome.tsx       # Landing page
│   │   ├── hooks/                # React hooks
│   │   ├── lib/                  # Utilities
│   │   ├── routes/               # Type-safe routes
│   │   ├── types/                # TypeScript types
│   │   ├── app.tsx               # Main app entry
│   │   └── ssr.tsx               # SSR entry
│   └── views/
│       └── app.blade.php         # Root template
│
├── routes/
│   ├── web.php                   # Web routes
│   └── settings.php              # Settings routes
│
├── tests/
│   ├── Feature/                  # Feature tests
│   └── Unit/                     # Unit tests
│
├── .env.example                  # Environment template
├── composer.json                 # PHP dependencies
├── package.json                  # Node dependencies
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind configuration
└── README.md                     # This file
```

## 💻 Development

### Running Development Server

```bash
# All services (recommended)
composer dev

# Individual services
php artisan serve          # Laravel server
npm run dev                # Vite dev server
php artisan queue:listen   # Queue worker
```

### With Server-Side Rendering (SSR)

```bash
composer dev:ssr
```

This runs:
- Laravel server
- Queue worker
- Laravel Pail (log viewer)
- Inertia SSR server

### Code Quality

```bash
# Format code
npm run format              # Frontend (Prettier)
composer lint               # Backend (Pint)

# Type checking
npm run types               # TypeScript

# Linting
npm run lint                # ESLint with auto-fix
```

## 🧪 Testing

```bash
# Run all tests
composer test

# Run specific test
php artisan test --filter=DashboardTest

# Run with coverage
php artisan test --coverage
```

### Frontend Testing

```bash
# Type checking
npm run types

# Lint checking
npm run lint
```

## 🌐 Deployment

### 1. Optimize for Production

```bash
# Install production dependencies
composer install --optimize-autoloader --no-dev

# Build frontend assets
npm run build

# Or with SSR
npm run build:ssr

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 2. Environment Variables

Ensure production `.env` has:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Strong password rules
# (Automatically enforced in production)
```

### 3. Server Requirements

- PHP 8.2+ with required extensions
- Composer
- Node.js 18+ (for SSR)
- Web server (Nginx/Apache)
- Database server
- Process manager (Supervisor for queues and SSR)

### 4. Queue Worker Setup

Create supervisor configuration `/etc/supervisor/conf.d/schoolhub-worker.conf`:

```ini
[program:schoolhub-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/worker.log
```

### 5. SSR Server Setup

```ini
[program:schoolhub-ssr]
directory=/path/to/project
command=php artisan inertia:start-ssr
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/ssr.log
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow PSR-12 for PHP code
- Use ESLint + Prettier for TypeScript/React
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- Laravel Framework
- React Team
- shadcn/ui for beautiful components
- Tailwind CSS
- Radix UI
- All contributors

---

**Built with ❤️ for educational institutions**

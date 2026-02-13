# 🎓 School Management System (SMS) with Integrated e-LMS

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Inertia](https://img.shields.io/badge/Inertia.js-v2-9553E9?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**A comprehensive digital platform for managing academic, administrative, financial, student support, and online learning operations.**

[Features](#-system-coverage-required-modules) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Progress](#-implementation-progress)

</div>

---

## 📋 Project Description

A **fully functional School Management System (SMS)** with an integrated **Electronic Learning Management System (e-LMS)**.

The system serves as a centralized digital platform that manages the school's **academic, administrative, financial, student support, and online learning operations**.

---

## 🎯 System Coverage (Required Modules)

The Developer shall deliver a complete and operational system including the following modules and user accounts:

### 1. 🏫 **School Management System (SMS) and e-LMS**

#### **1.1 Owner / Administrator Portal** ✅ `IMPLEMENTED`

- [x] Full system dashboard for overall school management
- [x] School-wide analytics and reporting
- [x] Monitoring of enrollment, finances, and operations
- [x] Management of user accounts and system permissions
- [x] Oversight of LMS activity for school-wide tracking
- [x] Department management (K-12 & College classification)
- [x] Year levels and sections management
- [x] Strands management (for Senior High School)
- [x] Programs management (College programs)
- [x] Subject management (CRUD with department/program/year level/semester filters)
- [x] Schedule management (PDF upload with department/program/year level/section/teacher assignment)

#### **1.2 Registrar Account** 🔄 `IN PROGRESS (70%)`

- [x] Student record management
- [x] Enrollment and registration processing
- [x] Class and section creation and management
- [x] Academic record and transcript generation
- [ ] Integration with e-LMS for student academic tracking

#### **1.3 Accounting Account** 🔄 `IN PROGRESS (60%)`

- [x] Student billing and payments management
- [x] Tuition, fees, and other charges processing
- [x] Financial reporting and auditing
- [x] Payment tracking and reconciliation
- [ ] Monitoring and approval of student wallet/load transactions (Integrated with e-LMS)

#### **1.4 Teacher Portal** 🔄 `IN PROGRESS (15%)`

- [x] View assigned class schedules (PDF viewer)
- [x] View subjects by department
- [ ] Class and subject management
- [ ] Encoding of grades
- [ ] Attendance monitoring
- [ ] Uploading of lessons, modules, and learning materials
- [ ] Creation of assignments, quizzes, and exams
- [ ] Grading and feedback on student submissions

#### **1.5 Student Portal** 🔄 `IN PROGRESS (15%)`

- [x] View class schedules (PDF viewer, filtered by department/program)
- [x] View subjects by department/year level
- [ ] Viewing grades and report cards
- [ ] Attendance records using RFID Portal for tap in and out
- [ ] Enrollment Fees
- [ ] Loadable Balance
- [ ] Access to lessons, modules, quizzes, and assignments
- [ ] Submission of academic requirements
- [ ] Viewing of student wallet balance and transaction history
- [ ] Deficiency tracking (Guidance Record, Library, Others)

#### **1.6 Guidance Counselor Account** ❌ `NOT IMPLEMENTED`

- [ ] Student guidance records
- [ ] Counseling notes and reports
- [ ] Behavior and case monitoring
- [ ] Confidential case documentation

#### **1.7 Librarian Account** ❌ `NOT IMPLEMENTED`

- [ ] Library inventory system
- [ ] Book borrowing and return monitoring
- [ ] Due date and penalty tracking
- [ ] Library usage and inventory reports

#### **1.8 Medical / Clinic Account** ❌ `NOT IMPLEMENTED`

- [ ] Student medical records
- [ ] Clinic visit logs
- [ ] Health incident reports
- [ ] Health monitoring summaries

#### **1.9 Canteen POS - e-LMS Integrated** ❌ `NOT IMPLEMENTED`

- [ ] Sales transaction processing
- [ ] Product and price management
- [ ] Daily and monthly sales reports
- [ ] Integration with student accounts
- [ ] Automatic deduction of purchases from student wallet balances

---

### 2. 📱 **Mobile Application Requirement** ❌ `NOT IMPLEMENTED`

The Developer shall deliver fully functional mobile applications for:

- [ ] **Teacher Portal** (Android & iOS)
- [ ] **Student Portal** (Android & iOS)  
- [ ] **Parent's Portal** (Android & iOS)
- [ ] **Owner's Portal** (Android & iOS)

**System Requirements:**
- [ ] Be available on **Android and iOS**
- [ ] Sync in real time with the main system database
- [ ] Include all e-LMS features (lessons, assignments, grades, wallet balance, quizzes, submissions)
- [ ] The Client has the right and responsibility to update data in any of the system features/modules
- [ ] The updates are to ensure all required data is complete and accurate
- [ ] This applies only to features within the School Management System and e-LMS
- [ ] The developer remains responsible for system functionality, but data entry and updates are from the Client as part of content management

---

## 🛠️ Tech Stack

### **Backend**
- **Laravel 12** - PHP Framework
- **MySQL 8** - Database
- **Inertia.js v2** - Server-side rendering adapter

### **Frontend**
- **React 19** - UI Library
- **TypeScript 5** - Type Safety
- **TailwindCSS 4** - Styling
- **shadcn/ui** - Component Library
- **React Hook Form** - Form Management
- **Zod** - Schema Validation

### **Development Tools**
- **Vite** - Build Tool
- **Pest PHP** - Testing Framework
- **Laravel Pint** - PHP Code Style Fixer
- **ESLint** - JavaScript Linter

---

## 📁 Project Structure

This project follows a **Modular Monolithic Architecture** for clean separation of concerns:

```
school-mgmt_lms_pos/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Owner/              # Owner/Admin controllers
│   │   │   ├── Accounting/         # Accounting controllers
│   │   │   ├── Student/            # Student portal controllers
│   │   │   ├── Teacher/            # Teacher portal controllers
│   │   │   ├── Parent/             # Parent portal controllers
│   │   │   ├── Settings/           # Settings controllers
│   │   │   └── ...
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Student.php
│   │   ├── Teacher.php
│   │   ├── Department.php
│   │   ├── YearLevel.php
│   │   ├── Section.php
│   │   ├── Strand.php
│   │   ├── Program.php
│   │   ├── Subject.php
│   │   ├── Schedule.php
│   │   ├── StudentFee.php
│   │   ├── StudentPayment.php
│   │   └── ...
│   └── ...
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── filters/            # Reusable filter components
│   │   │   ├── owner/              # Owner-specific components
│   │   │   ├── registrar/          # Registrar-specific components
│   │   │   ├── accounting/         # Accounting-specific components
│   │   │   ├── student/            # Student-specific components
│   │   │   ├── teacher/            # Teacher-specific components
│   │   │   └── parent/             # Parent-specific components
│   │   ├── layouts/
│   │   │   ├── owner/              # Owner layout
│   │   │   ├── registrar/          # Registrar layout
│   │   │   ├── accounting/         # Accounting layout
│   │   │   ├── student/            # Student layout
│   │   │   ├── teacher/            # Teacher layout
│   │   │   └── parent/             # Parent layout
│   │   ├── pages/
│   │   │   ├── owner/              # Owner portal pages
│   │   │   │   ├── subjects/       # Subject CRUD
│   │   │   │   ├── schedules/      # Schedule CRUD (PDF upload)
│   │   │   │   ├── users/          # User management
│   │   │   │   └── ...
│   │   │   ├── registrar/          # Registrar portal pages
│   │   │   ├── accounting/         # Accounting portal pages
│   │   │   ├── student/            # Student portal pages
│   │   │   │   ├── subjects/       # View subjects
│   │   │   │   └── schedules/      # View schedules
│   │   │   ├── teacher/            # Teacher portal pages
│   │   │   │   ├── subjects/       # View subjects
│   │   │   │   └── schedules/      # View assigned schedules
│   │   │   └── parent/             # Parent portal pages
│   │   │       ├── subjects/       # View subjects
│   │   │       └── schedules/      # View children's schedules
│   │   └── types/
│   └── views/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── web.php
│   └── settings.php
└── tests/
```

### **Benefits of This Structure:**
✅ **Role-Based Separation** - Each user role has its own folder structure  
✅ **Easy Maintainability** - Find and update role-specific code quickly  
✅ **Avoid Confusions** - Clear boundaries between different modules  
✅ **Scalable** - Easy to add new roles or features  
✅ **Team-Friendly** - Multiple developers can work on different roles simultaneously

---

## 🚀 Getting Started

### **Prerequisites**
- PHP >= 8.2
- Composer
- Node.js >= 20
- MySQL >= 8.0

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/LeeDev428/uplb_schoolhub.git
   cd uplb_schoolhub
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   
   Update `.env` with your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=school_management
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. **Run Migrations & Seeders**
   ```bash
   php artisan migrate:fresh --seed
   php artisan db:seed --class=AcademicStructureSeeder
   ```

6. **Build Frontend Assets**
   ```bash
   npm run dev
   ```

7. **Start Development Server**
   ```bash
   php artisan serve
   ```

8. **Access the Application**
   - URL: http://localhost:8000
   - Default Admin: `admin@example.com` / `password`

---

## 📊 Implementation Progress

### **Overall Progress: ~40%**

| Module | Status | Completion | Priority |
|--------|--------|------------|----------|
| 🏫 Owner/Admin Portal | ✅ Done | 95% | - |
| 📝 Registrar Account | 🔄 In Progress | 70% | High |
| 💰 Accounting Account | 🔄 In Progress | 60% | High |
| 👨‍🏫 Teacher Portal | 🔄 In Progress | 15% | **Critical** |
| 👨‍🎓 Student Portal | 🔄 In Progress | 15% | **Critical** |
| 👨‍👩‍👦 Parent Portal | 🔄 In Progress | 10% | **Critical** |
| 🧑‍⚕️ Guidance Counselor | ❌ Not Started | 0% | Medium |
| 📚 Librarian Account | ❌ Not Started | 0% | Medium |
| 🏥 Medical/Clinic | ❌ Not Started | 0% | Low |
| 🍽️ Canteen POS | ❌ Not Started | 0% | Low |
| 📱 Mobile App | ❌ Not Started | 0% | High |

### **Detailed Breakdown**

#### ✅ **Completed Features (40%)**
- [x] Authentication system (Login/Logout/Role-based access)
- [x] Owner/Administrator dashboard
- [x] Department management (K-12 & College)
- [x] Year Levels management
- [x] Sections management
- [x] Strands management (SHS)
- [x] Programs management (College)
- [x] Subject management (CRUD with department/program/year level/semester filters)
- [x] Schedule management (PDF upload with department/program/year level/section/teacher assignment)
- [x] User management (auto default password)
- [x] Student records management
- [x] Student requirements tracking
- [x] Student fees management
- [x] Student payments management
- [x] Financial reports
- [x] Comprehensive filtering system (Search, Dropdowns, Date Range)
- [x] Pagination (25 items per page)
- [x] Registrar dashboard with analytics
- [x] Teacher schedule view (filtered by assigned teacher)
- [x] Student schedule & subject view (filtered by department/program)
- [x] Parent schedule & subject view (filtered by children's departments)

#### 🔄 **In Progress (15%)**
- [ ] E-mail/Username login logic for parents & students
- [ ] Auto account creation for students & parents
- [ ] Complete enrollment workflow
- [ ] Academic transcript generation

#### ❌ **Pending (50%)**
- [ ] Teacher Portal (Remaining features: grades, attendance, lessons, assignments)
- [ ] Student Portal (Remaining features: grades, attendance, enrollment, wallet)
- [ ] Parent Portal (Remaining features: view grades, fees, attendance)
- [ ] Guidance Counselor Portal
- [ ] Librarian Portal
- [ ] Medical/Clinic Portal
- [ ] Canteen POS System
- [ ] RFID Integration for attendance
- [ ] Mobile Applications (Android & iOS)
- [ ] Real-time notifications
- [ ] File upload system for student documents
- [ ] E-LMS features (Lessons, Quizzes, Assignments)

---

## 🔑 User Roles & Permissions

| Role | Access Level | Key Features |
|------|--------------|--------------|
| **Owner/Admin** | Full System | All modules, system settings, user management |
| **Registrar** | Academic Records | Student enrollment, records, transcripts |
| **Accounting** | Financial | Billing, payments, financial reports |
| **Teacher** | Academic Content | Grades, attendance, lessons, assignments |
| **Student** | Personal Records | Grades, schedule, wallet, submissions |
| **Parent** | Student Monitoring | View student records, grades, fees, attendance |
| **Guidance** | Student Welfare | Counseling records, case monitoring |
| **Librarian** | Library System | Book management, borrowing, penalties |
| **Clinic** | Health Records | Medical records, clinic visits, health reports |
| **Canteen** | POS System | Sales, product management, wallet integration |

---

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --filter=DashboardTest

# Run with coverage
php artisan test --coverage
```

---

## 📝 Development Workflow

### **Adding a New Module/Feature**

1. **Create Migration**
   ```bash
   php artisan make:migration create_table_name
   ```

2. **Create Model**
   ```bash
   php artisan make:model ModelName -m
   ```

3. **Create Controller**
   ```bash
   php artisan make:controller Role/ControllerName
   ```

4. **Create React Page**
   ```bash
   # Create in resources/js/pages/{role}/
   ```

5. **Add Route**
   ```php
   // In routes/web.php
   Route::middleware(['auth', 'role:rolename'])->group(function () {
       Route::get('/path', [Controller::class, 'method'])->name('route.name');
   });
   ```

---

## 🐛 Known Issues & Fixes

### Fixed Issues:
✅ **Section Program Relationship Error** *(Fixed: Feb 10, 2026)*
- Issue: `Call to undefined relationship [program] on model [App\Models\Section]`
- Fix: Updated `Section` model to use `department` and `strand` instead of deprecated `program` relationship
- Location: `app/Http/Controllers/StudentController.php:105`

✅ **Schedule Section Relationship Error** *(Fixed: Feb 11, 2026)*
- Issue: `Call to undefined relationship [program] on model [App\Models\Section]` in ScheduleController
- Fix: Changed `Section::with(['program', 'yearLevel'])` to `Section::with(['department', 'yearLevel'])`
- Location: `app/Http/Controllers/Owner/ScheduleController.php`

✅ **Department Filtering for Portals** *(Fixed: Feb 11, 2026)*
- Issue: Student/Teacher/Parent portals showing wrong department data
- Fix: Student uses Program lookup, Teacher uses teacher record, Parent uses children's programs
- Location: `app/Http/Controllers/{Student,Teacher,Parent}/SubjectController.php`

---

## 🗺️ Roadmap

### **Phase 1: Core Academic Management** (Current - 40% Complete)
- [x] Owner/Admin Portal
- [x] Department & Section Management
- [x] Student Records System
- [x] Basic Accounting
- [x] Subject Management (Owner/Registrar CRUD + role-based viewing)
- [x] Schedule Management (PDF upload with teacher assignment)
- [x] Teacher/Student/Parent portals (basic schedule & subject viewing)

### **Phase 2: Academic Operations** (Next - Target: 65%)
- [ ] Teacher Portal (Grades, attendance, lessons, assignments)
- [ ] Parent Portal with Auto-Creation
- [ ] Guidance Counselor Portal
- [ ] Librarian Portal
- [ ] Update login logic (Email-based for students/parents)

### **Phase 3: E-LMS Integration** (Target: 85%)
- [ ] Student Portal with LMS features
- [ ] Lessons & Modules Upload
- [ ] Assignments & Quizzes
- [ ] Student Submissions
- [ ] Grading System

### **Phase 4: Advanced Features** (Target: 100%)
- [ ] RFID Attendance System
- [ ] Medical/Clinic Module
- [ ] Canteen POS Integration
- [ ] Student Wallet System
- [ ] Mobile Applications (Android & iOS)
- [ ] Real-time Notifications
- [ ] Advanced Analytics & Reports

---

## 📄 License

This project is proprietary software developed for UPLB SchoolHub.

---

## 👨‍💻 Developer

**LeeDev428**  
📧 Contact: [GitHub](https://github.com/LeeDev428)  
📦 Repository: [uplb_schoolhub](https://github.com/LeeDev428/uplb_schoolhub)

---

## 📞 Support

For issues, questions, or feature requests:
1. Check existing [Issues](https://github.com/LeeDev428/uplb_schoolhub/issues)
2. Create a new issue with detailed description
3. Tag appropriately (bug, enhancement, question)

---

<div align="center">

**Built with ❤️ using Laravel, React, and TypeScript**

*Project Progress: 40% Complete | Last Updated: February 11, 2026*

</div>

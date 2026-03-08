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

The system includes the following modules and user accounts:

### 1. 🏫 **School Management System (SMS) and e-LMS**

#### **1.1 Owner / Administrator Portal** ✅ `98% COMPLETE`

- [x] Full system dashboard with analytics (enrollment, payments, department stats)
- [x] School-wide calendar with event management
- [x] Department management (K-12 & College classification)
- [x] Year levels management
- [x] Sections management (with room numbers)
- [x] Strands management (for Senior High School)
- [x] Programs management (College programs)
- [x] Subject management (CRUD with department/program/year level/semester filters)
- [x] Schedule management (PDF upload with department/program/year level/section/teacher assignment)
- [x] User management (CRUD with role-based auto password generation)
- [x] Announcements management (create, pin, target by role, with attachments)
- [x] Financial reports and exports
- [x] **Landing Page CMS** — Edit hero (title, subtitle, image gallery carousel), faculty section, principal's message (with author photo), alumni/notable graduates section, footer, and navigation links — all from a 4-tab settings editor
- [x] **App Settings** — App name, academic structure type (K12/College), theme colors, logo/favicon upload
- [x] **Active Semester Management** — Set the active semester (1st Semester, 2nd Semester, Summer) from the Enrollment Period settings; used globally for college subject enrollment
- [x] **Audit Logs** — View all balance adjustments made by Super Accounting staff; filterable by student, school year, date range; shows amount, reason, adjuster, and timestamp with detail dialog

#### **1.2 Registrar Account** ✅ `90% COMPLETE`

- [x] Student record management (full CRUD with enrollment status)
- [x] Enrollment and registration processing (clearance workflow)
- [x] Class and section creation/management (assign students to sections)
- [x] Requirements tracking system (categories, documents, status updates)
- [x] Document request review system
- [x] Academic deadlines management
- [x] Subject management (view/manage)
- [x] Schedule viewing
- [x] Reports and exports
- [x] Announcements viewing (role-targeted)
- [x] **Student Subjects tab** — On the Registrar's student detail page, a Subjects tab appears for college students showing their enrolled subjects pulled from the `student_subjects` table
- [ ] Academic record and transcript generation
- [x] Archived students page — View/filter dropped/withdrawn/graduated students by classification (K-12/College), school year, semester, department; restore or permanently delete
- [x] **Drop Request Management** — Review student drop requests with dual-approval workflow (registrar → accounting); attach fee items for accounting to collect
- [x] **Active Semester Selector** — Quick-toggle semester (1st/2nd/Summer) directly from the Students management page alongside the Active School Year banner; persists to `app_settings`
- [x] **Dropped Tab Navigation** — Each student row in the Dropped tab is clickable and navigates to the student's full detail page; Re-Enroll button still works independently
- [x] **Drop Clearance Progress** — Student detail page shows a red-themed "Drop Clearance Progress" (instead of enrollment clearance) when the student status is `dropped`; 3-step flow: Registrar Clearance → Accounting Clearance → Officially Dropped
- [ ] Integration with e-LMS for student academic tracking

#### **1.3 Accounting Account** ✅ `85% COMPLETE`

- [x] Student billing and fees management (CRUD)
- [x] Student payments processing (CRUD)
- [x] Student clearance management (individual and bulk)
- [x] Payment tracking with status filters
- [x] Financial reports with export functionality
- [x] Announcements viewing (role-targeted)
- [x] **Comprehensive main dashboard** — Student count by payment status (fully paid/partial/overdue), total projected revenue, total collected, outstanding balance, collection rate progress bar, monthly income bar chart, department balance breakdown, recent payment activity feed
- [x] **Accounting dashboard** — Daily income table per month, colored stat cards with collection rate, payment status breakdown (fully paid/partial/unpaid) with progress indicators, recent payments and top pending balances
- [x] **Account dashboard** — Per-student account view with payment history, daily collection bar chart, payment method breakdown (Cash/GCash/Bank), transaction history table
- [x] **Per-unit fee items** — `FeeItem` model supports `is_per_unit` (boolean) and `unit_price`; fee management UI shows an amber per-unit card; `StudentPaymentController` auto-calculates charges based on enrolled unit count from `student_subjects`
- [x] **Auto carry-forward balance** — When the Registrar grants registrar clearance for a student, any outstanding balances from prior school years are automatically summed and written to the new year's fee record as `carried_forward_balance`
- [x] **Drop Request Approval** — Second-stage approval for drop requests; verify payment of attached fees before final approval
- [x] **Document Request Approval** — Process document fee payments and approve requests
- [x] **Promissory Notes** — Review and approve/decline student promissory notes
- [x] **Exam Approval** — Grant exam permits for students with outstanding balances
- [x] **Grant Management** — Create scholarships/grants and assign to students
- [x] **Online Transaction Verification** — Verify online payments (GCash, bank transfers)
- [ ] Advanced financial auditing
- [ ] Monitoring and approval of student wallet/load transactions

#### **1.3.1 Super Accounting Account** ✅ `90% COMPLETE`

- [x] All features from Accounting Account
- [x] Full access to all accounting functions with elevated privileges
- [x] Cross-department financial oversight
- [x] Same dashboard and management pages as Accounting role
- [x] **Add Balance** — Add balance to a student's fee record with mandatory reason; every adjustment is permanently logged in the `balance_adjustments` table and visible to the Owner in the Audit Logs page
- [x] **Add School Year** — Manually create a new school year fee record for a student (school year, total amount, reason) from the process page; useful for manual fee record creation outside the normal assignment flow
- [x] **Drop Clearance** — When a student's status is `dropped`, the Clearance button shows **Drop** (red) instead of **Clear**; contextual dialog explains the drop process and sets `accounting_clearance` so the Registrar can mark the student officially dropped

#### **1.4 Teacher Portal** 🔄 `55% COMPLETE`

- [x] Dashboard with analytics (classes, students, subjects)
- [x] View assigned class schedules (PDF viewer)
- [x] View and filter students by section
- [x] View subjects by department
- [x] View individual student details
- [x] **Quiz Management (Full CRUD)** - Create quizzes with multiple question types
- [x] **Quiz Publishing** - Publish/unpublish quizzes, set time limits and attempts
- [x] **Quiz Results** - View student attempts and scores
- [x] **Manual Grading** - Grade text-based answers manually
- [x] **Teacher Profile Page** — Update personal info (name, phone, specialization, bio), upload/remove profile photo, toggle `Show on Landing Page` to appear in the faculty section of the public landing page; accessible via **My Profile** sidebar link
- [x] Announcements viewing (role-targeted)
- [ ] Digital grade encoding
- [ ] Attendance monitoring
- [ ] Uploading of lessons, modules, and learning materials
- [ ] Creation of assignments
#### **1.5 Student Portal** 🔄 `70% COMPLETE`

- [x] Dashboard with quick links
- [x] View class schedules (PDF viewer, filtered by department/program)
- [x] View subjects by department/year level
- [x] Profile page with student information
- [x] Requirements tracking (view submission status)
- [x] **Quiz System** - Browse available quizzes
- [x] **Quiz Taking** - Take quizzes with timer and auto-save
- [x] **Quiz Results** - View scores and correct answers
- [x] Announcements viewing (role-targeted)
- [x] **Self-Enrollment** — Students with `not-enrolled` or `dropped` status can apply for re-enrollment from their dashboard; `SelfEnrollmentController` creates/updates the `EnrollmentClearance` record and sets status to `pending-registrar`
- [x] **Enrollment Status Dashboard** — Dashboard banner now surfaces the correct context per status: `not-enrolled`/`dropped` shows the Apply button; `pending-registrar` shows a yellow clock notice; `pending-accounting` shows a blue accounting notice
- [x] **Enrolled Subjects view** — `/student/subjects` shows subjects pulled from `student_subjects` (requires enrolled middleware)
- [x] **Drop Request Submission** — Submit drop requests with reason; tracked through dual-approval workflow (registrar → accounting)
- [x] **Promissory Note Submission** — Submit promissory notes for fee deferral
- [x] **Document Request Submission** — Request official documents (transcripts, certificates, etc.) with fee tracking
- [x] **Online Payment Submission** — Submit online payment proofs (GCash, bank transfer) for verification
- [x] **College Subject Enrollment** — Enrolled college students can select subjects for the active semester; shows available subjects grouped by year level with prerequisite validation, unit counter (min 15 / ideal 21 / max 24 per Philippine standards), search/filter, drop functionality, and confirmation dialogs; `CollegeEnrollmentController` enforces prerequisite completion, duplicate prevention, and unit limits in a DB transaction with action logging
- [ ] Viewing grades and report cards
- [ ] Attendance records using RFID Portal
- [ ] Enrollment fees viewing (no dedicated student fee summary page)
- [ ] Loadable wallet balance
- [ ] Submission of academic requirements
- [ ] Transaction history

#### **1.6 Parent Portal** 🔄 `35% COMPLETE`

- [x] Dashboard with per-child summary (fees balance, requirements progress, latest announcements)
- [x] View children's subjects
- [x] View children's schedules
- [x] **Fees & Payments** — Per-child fee summary (total fees, discounts, paid, balance), payment history, online transactions, promissory notes, due date alerts
- [x] **Requirements** — Per-child requirements progress bar, status breakdown (approved/submitted/pending/rejected) with per-document status icons
- [x] Announcements viewing (role-targeted)
- [ ] View grades and report cards
- [ ] View attendance records

#### **1.7 Guidance Counselor Account** 🔄 `35% COMPLETE`

- [x] Dashboard with statistics and quick links
- [x] Student guidance records (CRUD)
- [x] **Student Browser** — Search and filter all students, view guidance records count per student, filter to show only students with records
- [x] **Student Profile View** — Full student details with all guidance records (severity, status, counselor, incident dates, action taken, recommendations)
- [x] Announcements viewing (role-targeted)
- [ ] Counseling notes and reports
- [ ] Behavior and case monitoring
- [ ] Confidential case documentation

#### **1.8 Librarian Account** 🔄 `25% COMPLETE`

- [x] Dashboard with library statistics
- [x] Library book inventory management (CRUD)
- [x] Book borrowing/return transaction management
- [x] Announcements viewing (role-targeted)
- [ ] Due date tracking and penalty calculation
- [ ] Advanced library usage reports

#### **1.9 Medical / Clinic Account** 🔄 `5% COMPLETE`

- [x] Basic dashboard
- [x] Announcements viewing (role-targeted)
- [ ] Student medical records
- [ ] Clinic visit logs
- [ ] Health incident reports
- [ ] Health monitoring summaries

#### **1.10 Canteen POS** 🔄 `5% COMPLETE`

- [x] Basic dashboard
- [x] Announcements viewing (role-targeted)
- [ ] Sales transaction processing
- [ ] Product and price management
- [ ] Daily and monthly sales reports
- [ ] Integration with student wallet balances

---

### 2. 📱 **Mobile Application** ❌ `NOT STARTED`

- [ ] **Teacher Portal** (Android & iOS)
- [ ] **Student Portal** (Android & iOS)
- [ ] **Parent's Portal** (Android & iOS)
- [ ] **Owner's Portal** (Android & iOS)

---

## 🛠️ Tech Stack

### **Backend**
- **Laravel 12** - PHP Framework with Fortify for auth
- **MySQL 8** - Relational Database
- **Inertia.js v2** - Modern monolith approach (SPA-like without API)
- **Laravel Wayfinder** - Type-safe route generation

### **Frontend**
- **React 19** - UI Library with React Compiler
- **TypeScript 5.7** - Type Safety
- **TailwindCSS 4** - Utility-first CSS Framework
- **shadcn/ui + Radix UI** - Accessible Component Library
- **Lucide React** - Icon Library
- **date-fns** - Date manipulation
- **Sonner** - Toast notifications
- **next-themes** - Dark/Light mode support

### **Development Tools**
- **Vite 7** - Next-gen Build Tool
- **Pest PHP 3** - Elegant Testing Framework
- **Laravel Pint** - PHP Code Style Fixer
- **ESLint + Prettier** - JS/TS Linting & Formatting

---

## 📁 Project Structure

This project follows a **Modular Monolithic Architecture** with role-based separation:

```
school-mgmt_lms_pos/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Owner/                  # Admin portal (11 controllers)
│   │   │   │   ├── OwnerDashboardController.php
│   │   │   │   ├── DepartmentController.php
│   │   │   │   ├── ProgramController.php
│   │   │   │   ├── YearLevelController.php
│   │   │   │   ├── SectionController.php
│   │   │   │   ├── SubjectController.php
│   │   │   │   ├── ScheduleController.php
│   │   │   │   ├── UserManagementController.php
│   │   │   │   ├── AnnouncementController.php
│   │   │   │   ├── CalendarController.php
│   │   │   │   └── ReportsController.php
│   │   │   ├── Registrar/              # Registrar portal (8 controllers)
│   │   │   │   ├── ClassController.php
│   │   │   │   ├── DocumentRequestController.php
│   │   │   │   ├── DocumentApprovalController.php
│   │   │   │   ├── DropRequestController.php
│   │   │   │   ├── ArchivedStudentController.php
│   │   │   │   ├── RegistrarDeadlineController.php
│   │   │   │   ├── RegistrarSubjectController.php
│   │   │   │   ├── ScheduleController.php
│   │   │   │   └── ReportsController.php
│   │   │   ├── Accounting/             # Accounting & Super-Accounting portal (12 controllers)
│   │   │   │   ├── AccountingDashboardController.php
│   │   │   │   ├── StudentAccountController.php
│   │   │   │   ├── StudentFeeController.php
│   │   │   │   ├── StudentPaymentController.php
│   │   │   │   ├── StudentClearanceController.php
│   │   │   │   ├── DropApprovalController.php
│   │   │   │   ├── DocumentApprovalController.php
│   │   │   │   ├── DocumentRequestController.php
│   │   │   │   ├── PromissoryNoteController.php
│   │   │   │   ├── ExamApprovalController.php
│   │   │   │   ├── GrantController.php
│   │   │   │   ├── OnlineTransactionController.php
│   │   │   │   ├── RefundController.php
│   │   │   │   └── ReportsController.php
│   │   │   ├── Teacher/                # Teacher portal (8 controllers)
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── StudentController.php
│   │   │   │   ├── ClassController.php
│   │   │   │   ├── SubjectController.php
│   │   │   │   ├── ScheduleController.php
│   │   │   │   ├── QuizController.php      # Full quiz management
│   │   │   │   ├── GradeController.php
│   │   │   │   └── AttendanceController.php
│   │   │   ├── Student/                # Student portal (6 controllers)
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ProfileController.php
│   │   │   │   ├── SubjectController.php
│   │   │   │   ├── ScheduleController.php
│   │   │   │   ├── RequirementController.php
│   │   │   │   └── QuizController.php      # Quiz taking system
│   │   │   ├── Parent/                 # Parent portal (2 controllers)
│   │   │   ├── Guidance/               # Guidance portal (2 controllers)
│   │   │   ├── Librarian/              # Librarian portal (3 controllers)
│   │   │   └── Settings/               # Shared settings (profile, password, 2FA)
│   │   └── Middleware/
│   │       ├── HandleInertiaRequests.php   # Shared auth data
│   │       └── RoleMiddleware.php          # Role-based access control
│   ├── Models/                         # 32 Eloquent Models
│   │   ├── User.php                    # Central user with role relationships
│   │   ├── Student.php                 # Student profile & enrollment
│   │   ├── Teacher.php                 # Teacher profile
│   │   ├── ParentModel.php             # Parent/Guardian profile
│   │   ├── Department.php              # Academic departments
│   │   ├── Program.php                 # College programs
│   │   ├── YearLevel.php               # Grade/Year levels
│   │   ├── Section.php                 # Class sections
│   │   ├── Strand.php                  # SHS strands
│   │   ├── Subject.php                 # Academic subjects
│   │   ├── Schedule.php                # Class schedules (PDF)
│   │   ├── Announcement.php            # Role-targeted announcements
│   │   ├── Quiz.php                    # Quiz definitions
│   │   ├── QuizQuestion.php            # Quiz questions
│   │   ├── QuizAnswer.php              # Answer options
│   │   ├── QuizAttempt.php             # Student attempts
│   │   ├── QuizResponse.php            # Student responses
│   │   ├── StudentFee.php              # Fee records
│   │   ├── StudentPayment.php          # Payment records
│   │   ├── GuidanceRecord.php          # Counseling records
│   │   ├── LibraryBook.php             # Book inventory
│   │   ├── LibraryTransaction.php      # Borrowing records
│   │   └── ... (10 more models)
│   └── ...
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ui/                     # 40+ shadcn/ui components
│   │   │   ├── filters/                # Reusable filter components
│   │   │   ├── owner/                  # Owner-specific components
│   │   │   ├── registrar/              # Registrar components
│   │   │   ├── accounting/             # Accounting components
│   │   │   ├── teacher/                # Teacher components
│   │   │   ├── student/                # Student components
│   │   │   ├── guidance/               # Guidance components
│   │   │   ├── librarian/              # Librarian components
│   │   │   └── parent/                 # Parent components
│   │   ├── layouts/                    # Role-based layouts with sidebars
│   │   ├── pages/
│   │   │   ├── owner/                  # Owner portal (10 page groups)
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── departments/
│   │   │   │   ├── programs/
│   │   │   │   ├── year-levels/
│   │   │   │   ├── sections/
│   │   │   │   ├── subjects/
│   │   │   │   ├── schedules/
│   │   │   │   ├── users/
│   │   │   │   ├── announcements/
│   │   │   │   └── calendar.tsx
│   │   │   ├── registrar/              # Registrar portal (10 page groups)
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── students/
│   │   │   │   ├── classes/
│   │   │   │   ├── requirements/
│   │   │   │   ├── documents/
│   │   │   │   ├── drop-requests/
│   │   │   │   ├── deadlines/
│   │   │   │   ├── subjects/
│   │   │   │   ├── schedule/
│   │   │   │   ├── archived.tsx
│   │   │   │   ├── reports/
│   │   │   │   └── announcements/
│   │   │   ├── accounting/             # Accounting portal (15 page groups)
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── fees/
│   │   │   │   ├── fee-management/
│   │   │   │   ├── payments/
│   │   │   │   ├── student-accounts/
│   │   │   │   ├── clearance/
│   │   │   │   ├── drop-approvals/
│   │   │   │   ├── document-approvals/
│   │   │   │   ├── document-requests/
│   │   │   │   ├── promissory-notes/
│   │   │   │   ├── exam-approval/
│   │   │   │   ├── grants/
│   │   │   │   ├── online-transactions/
│   │   │   │   ├── refunds/
│   │   │   │   ├── reports.tsx
│   │   │   │   └── announcements/
│   │   │   ├── super-accounting/       # Super-Accounting portal (mirrors accounting)
│   │   │   │   └── ...                 # Same structure as accounting/
│   │   │   ├── teacher/                # Teacher portal (9 page groups)
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── students/
│   │   │   │   ├── classes/
│   │   │   │   ├── subjects/
│   │   │   │   ├── schedules/
│   │   │   │   ├── quizzes/            # Full quiz management UI
│   │   │   │   ├── grades/
│   │   │   │   ├── attendance/
│   │   │   │   └── announcements/
│   │   │   ├── student/                # Student portal (12 page groups)
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── profile.tsx
│   │   │   │   ├── subjects/
│   │   │   │   ├── schedules/
│   │   │   │   ├── requirements.tsx
│   │   │   │   ├── quizzes/            # Quiz taking UI
│   │   │   │   ├── drop-request/
│   │   │   │   ├── document-requests/
│   │   │   │   ├── promissory-notes/
│   │   │   │   ├── online-payments/
│   │   │   │   ├── refund-requests/
│   │   │   │   └── announcements/
│   │   │   ├── parent/                 # Parent portal
│   │   │   ├── guidance/               # Guidance portal
│   │   │   ├── librarian/              # Librarian portal
│   │   │   ├── clinic/                 # Clinic portal (placeholder)
│   │   │   └── canteen/                # Canteen portal (placeholder)
│   │   ├── hooks/                      # Custom React hooks
│   │   ├── types/                      # TypeScript type definitions
│   │   └── lib/                        # Utility functions
│   └── views/
│       └── app.blade.php               # Root Blade template
├── database/
│   ├── migrations/                     # 43 migration files
│   └── seeders/                        # 9 seeder classes
│       ├── DatabaseSeeder.php
│       ├── RoleBasedUserSeeder.php
│       ├── AcademicStructureSeeder.php
│       ├── DepartmentSeeder.php
│       ├── ProgramSeeder.php
│       ├── YearLevelSeeder.php
│       ├── SectionSeeder.php
│       ├── StudentSeeder.php
│       └── RequirementSeeder.php
├── routes/
│   ├── web.php                         # Main routes (307 lines, 10 role groups)
│   └── settings.php                    # Settings routes
└── tests/
    ├── Feature/                        # Feature tests
    └── Unit/                           # Unit tests
```

### **Benefits of This Structure:**
✅ **Role-Based Separation** - Each user role has its own folder structure  
✅ **Easy Maintainability** - Find and update role-specific code quickly  
✅ **Type Safety** - Full TypeScript coverage with Inertia/Wayfinder  
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

### **Overall Progress: ~65%**

| Module | Status | Completion | Priority |
|--------|--------|------------|----------|
| 🏫 Owner/Admin Portal | ✅ Done | 98% | - |
| 📝 Registrar Account | ✅ Done | 90% | - |
| 💰 Accounting Account | ✅ Enhanced | 85% | High |
| 👨‍🏫 Teacher Portal | 🔄 In Progress | 50% | **Critical** |
| 👨‍🎓 Student Portal | 🔄 In Progress | 70% | **Critical** |
| 👨‍👩‍👦 Parent Portal | 🔄 In Progress | 35% | **Critical** |
| 🧑‍⚕️ Guidance Counselor | 🔄 In Progress | 35% | Medium |
| 📚 Librarian Account | 🔄 In Progress | 25% | Medium |
| 🏥 Medical/Clinic | 🔄 Started | 5% | Low |
| 🍽️ Canteen POS | 🔄 Started | 5% | Low |
| 📱 Mobile App | ❌ Not Started | 0% | High |

### **Detailed Breakdown**

#### ✅ **Completed Features (50%)**
- [x] Authentication system (Login/Logout/Role-based access with 2FA support)
- [x] Owner/Administrator dashboard with full analytics
- [x] Department management (K-12 & College classification)
- [x] Year Levels management
- [x] Sections management (with room assignments)
- [x] Strands management (SHS)
- [x] Programs management (College)
- [x] Subject management (CRUD with multi-filter support)
- [x] Schedule management (PDF upload with teacher assignment)
- [x] User management (10 roles, auto password generation)
- [x] Student records management (full CRUD with enrollment workflow)
- [x] Student requirements tracking (categories, status updates)
- [x] Student fees management
- [x] Student payments processing
- [x] Student clearance management (individual and bulk)
- [x] Financial reports with export
- [x] Comprehensive filtering system (Search, Dropdowns, Date Range)
- [x] Pagination (25 items per page)
- [x] Registrar dashboard with analytics
- [x] Document request review system
- [x] Academic deadlines management
- [x] **Quiz System (Teacher)** - Full CRUD, publishing, results, manual grading
- [x] **Quiz System (Student)** - Taking quizzes, auto-save, results viewing
- [x] Role-based announcement system (create, pin, target by role)
- [x] Teacher/Student/Parent schedule and subject views
- [x] Dark/Light mode support
- [x] Profile settings with photo support
- [x] Guidance counselor records management
- [x] Library book inventory and transactions
- [x] **Landing Page CMS** — Owner can fully edit the public landing page (hero carousel, faculty section, principal's message with author photo, alumni section, footer, navigation links) from the app-settings page
- [x] **Public Landing Page** — Dynamic welcome page driven by app settings; hero image carousel, faculty cards from DB, principal's message, alumni showcase, custom footer; no gradients, clean flat design
- [x] **Accounting Dashboards** — Comprehensive stats with colored stat cards, collection rate progress, payment status breakdown, monthly/daily income charts, department balance breakdown
- [x] **Teacher Profile Page** — Edit bio, phone, specialization; upload profile photo; toggle `show_on_landing` to appear in public faculty section
- [x] **Student Self-Enrollment** — `SelfEnrollmentController` + `/student/enrollment` page; sets status to `pending-registrar` on submit
- [x] **Student Enrollment Status Dashboard** — Context-aware banner: Apply button for `not-enrolled`/`dropped`, yellow pending notice for `pending-registrar`, blue accounting notice for `pending-accounting`
- [x] **Student Subjects table** (`student_subjects`) — Migration, `StudentSubject` model, `StudentSubjectController`, routes; used for per-unit fee calculation
- [x] **Per-unit Fee Items** — `fee_items.is_per_unit` + `unit_price` columns; fee management UI toggle; payment controller auto-calculates from enrolled unit count
- [x] **Auto carry-forward balance** — On registrar clearance approval, prior-year outstanding balances are automatically stamped onto the new year's `StudentFee` record
- [x] **Registrar Student Subjects tab** — College students' subjects tab in the registrar's student show page
- [x] **Landing Page preview layout fix** — Full-width iframe preview at top of Landing tab in App Settings

#### 🔄 **In Progress (15%)**
- [ ] Teacher grade encoding
- [ ] Teacher attendance marking
- [ ] Complete enrollment workflow automation
- [ ] Academic transcript generation

#### ❌ **Pending (40%)**
- [ ] Lessons and module upload system
- [ ] Assignment creation and submission
- [ ] Student grades viewing
- [ ] Student attendance records (RFID)
- [ ] Student wallet/balance system
- [ ] Parent portal completion (grades, fees, attendance)
- [ ] Medical/Clinic records system
- [ ] Canteen POS with wallet integration
- [ ] Mobile Applications (Android & iOS)
- [ ] Real-time notifications
- [ ] Advanced reporting and analytics

---

## 🔑 User Roles & Permissions

| Role | Access Level | Key Features |
|------|--------------|--------------|
| **Owner/Admin** | Full System | Manage all modules, users, academic structure, announcements |
| **Registrar** | Academic Records | Student enrollment, records, requirements, classes, deadlines |
| **Accounting** | Financial | Fees, payments, clearance, financial reports |
| **Teacher** | Academic Content | Students, classes, schedules, quizzes (create/grade) |
| **Student** | Personal Records | Schedule, subjects, profile, quizzes (take), requirements |
| **Parent** | Student Monitoring | View children's schedules and subjects |
| **Guidance** | Student Welfare | Guidance records, student case management |
| **Librarian** | Library System | Book inventory, borrowing/return transactions |
| **Clinic** | Health Records | (Placeholder) Medical records, clinic visits |
| **Canteen** | POS System | (Placeholder) Sales, products, wallet integration |

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

✅ **Schedule Section Relationship Error** *(Fixed: Feb 11, 2026)*
- Issue: `Call to undefined relationship [program] on model [App\Models\Section]` in ScheduleController
- Fix: Changed `Section::with(['program', 'yearLevel'])` to `Section::with(['department', 'yearLevel'])`

✅ **Department Filtering for Portals** *(Fixed: Feb 11, 2026)*
- Issue: Student/Teacher/Parent portals showing wrong department data
- Fix: Student uses Program lookup, Teacher uses teacher record, Parent uses children's programs

✅ **Announcements Not Displaying** *(Fixed: Feb 13, 2026)*
- Issue: Role-targeted announcements not showing for some roles
- Fix: Restored `published_at` condition to allow NULL (immediate publish) and past dates

✅ **Profile Image Not Showing in Dropdown** *(Fixed: Feb 13, 2026)*
- Issue: User dropdown showing initials instead of profile photo
- Fix: Added `avatar` field to shared Inertia auth data from User model's `profile_photo_url` accessor

✅ **Teacher Portal Student/Grade Scoping** *(Fixed: Feb 2026)*
- Issue: Teacher portal was fetching ALL students and grades, not just the teacher's assigned sections
- Fix: `StudentController` and `GradeController` now scope queries to sections where `teacher_id` matches the authenticated teacher's ID

✅ **Subjects Showing TBA for Unassigned Sections** *(Fixed: Feb 2026)*
- Issue: Parent and student portals showed no teacher info when no teacher was assigned to a section
- Fix: Frontend displays "TBA" when `teacher_name` is null, preventing empty/broken UI

✅ **Welcome Page Duplicate Component** *(Fixed: Feb 22, 2026)*
- Issue: A `replace_string_in_file` operation prepended new content without removing old duplicate component (~500 lines of old code remained)
- Fix: File truncated to exact line boundary; one clean `Welcome` component remains

✅ **AppSetting::getSetting() Undefined Method** *(Fixed: Mar 2026)*
- Issue: `BadMethodCallException: Call to undefined method AppSetting::getSetting()` thrown in `StudentController`, `StudentSubjectController`, and `AppSettingsController`
- Fix: Replaced all three call sites with `AppSetting::current()->school_year ?? (date('Y').'-'.(date('Y')+1))`

✅ **Landing Page Preview Layout** *(Fixed: Mar 2026)*
- Issue: App-settings landing tab showed preview and editor in a 25/75 split that made the iframe unusable
- Fix: Restructured layout to full-width — iframe preview at top (85 vh), all editor forms (Hero, Features, Faculty, Message, Footer) stacked below in a single column

✅ **Student Dashboard Missing Pending Status UI** *(Fixed: Mar 2026)*
- Issue: Students in `pending-registrar` or `pending-accounting` status saw only the red "NOT enrolled" banner with no contextual guidance
- Fix: Added yellow clock notice for `pending-registrar` and blue clock notice for `pending-accounting`

✅ **FeeManagement Sidebar Logo Showing Default Name** *(Fixed: Mar 2026)*
- Issue: Accounting fee management page sidebar showed "SchoolHub" instead of the configured app name; `FeeManagementController` was overriding global `appSettings` with a stripped version missing `logo_url`/`app_name`
- Fix: Removed the local override entirely; global middleware provides the full settings

✅ **Re-Enroll Dialog Crash — SelectItem Empty Value** *(Fixed: Mar 2026)*
- Issue: `A <Select.Item /> must have a value prop that is not an empty string` crash on the Re-Enroll dialog
- Fix: Replaced `value=""` with sentinel `value="__none__"`; updated state init and submit handler

✅ **Student Document Request — No Status Legend** *(Fixed: Mar 2026)*
- Issue: Students couldn't understand status codes (Pending / Processing / Ready / Released / Rejected) on the document requests page
- Fix: Added a color-coded Status Guide card above the requests table

✅ **Process Page — Cannot Add School Year Manually** *(Fixed: Mar 2026)*
- Issue: No way to manually create a new school year fee record for a student on the process page
- Fix: Added `addSchoolYear` controller method + route + dialog with school_year/total_amount/reason fields

✅ **Drop Clearance — Wrong UI and Button Label for Dropped Students** *(Fixed: Mar 2026)*
- Issue: Dropped students showed the blue Enrollment Clearance progress and accounting had a "Clear" button instead of something drop-specific
- Fix: `EnrollmentClearanceProgress` component now has a `mode='drop'` variant with red theme and 3-step drop flow; accounting process page shows a red "Drop" button with contextual dialog when `enrollment_status === 'dropped'`

✅ **Dropped Tab — Student Rows Not Clickable** *(Fixed: Mar 2026)*
- Issue: Students in the Registrar's Dropped tab could only be opened via the small "Edit" button; the row itself was not navigable
- Fix: `TableRow` in the Dropped tab is now `cursor-pointer` with an `onClick` that navigates to the student detail page; Re-Enroll button uses `e.stopPropagation()` to remain independent

✅ **Student Accounts 404 on View Details** *(Fixed: Apr 2026)*
- Issue: Clicking "View Details" on a student account row returned a 404 because the link used `account.id` which resolves to `student_fee_id` (not the student's ID) when a fee record exists; Laravel's route model binding then looked for a `Student` with that fee ID
- Fix: Changed the link in `student-accounts/index.tsx` to use `account.student.id` which always references the real student primary key

✅ **Drop Requests Not Appearing After Registrar Direct Drop** *(Fixed: Apr 2026)*
- Issue: When the Registrar used the "Drop Student" shortcut on the student detail page, the student's `enrollment_status` was set to `dropped` but no `DropRequest` record was created; the Accounting `/drop-requests` page queries the `drop_requests` table, so nothing appeared there and Accounting could never see or clear the student
- Fix: `StudentController::dropStudent()` now creates a `DropRequest` record with `registrar_status = 'approved'` and `accounting_status = 'pending'` immediately after updating enrollment status, using `firstOrCreate` to avoid duplicates; `registrar_approved_by` and `registrar_approved_at` are set so the audit trail is complete; semester and school year are pulled from `AppSetting::current()`

✅ **Promissory Notes Using Generic Icon Instead of Student Photo** *(Fixed: Apr 2026)*
- Issue: Both `accounting/promissory-notes/index.tsx` and `super-accounting/promissory-notes/index.tsx` displayed a generic `<User>` Lucide icon in the student column instead of the student's actual profile photo; the controller also omitted `student_photo_url`, `student_first_name`, `student_last_name`, and `student_lrn` from its transform
- Fix: `PromissoryNoteController::index()` transform now includes `student_photo_url`, `student_first_name`, `student_last_name`, and `student_lrn`; both frontend pages updated with the `StudentPhoto` component (replacing the `User` icon), extended TypeScript interface, and a sub-row showing the LRN when available

✅ **Promissory Notes Missing from Accounting Sidebar** *(Fixed: Apr 2026)*
- Issue: Despite a complete route, controller, and page for promissory notes existing for both the accounting (`/accounting/promissory-notes`) and super-accounting (`/super-accounting/promissory-notes`) portals, neither sidebar listed a navigation item for the page
- Fix: Added `Promissory Notes` nav item (with `ScrollText` icon) to both `accounting-sidebar.tsx` (after Drop Requests) and `super-accounting-sidebar.tsx` (after Student Accounts)

---

## 🗺️ Roadmap

### **Phase 1: Core Academic Management** ✅ `COMPLETE (45%)`
- [x] Owner/Admin Portal (95%)
- [x] Department, Section, Year Level Management
- [x] Student Records System with Requirements
- [x] Registrar Portal (75%)
- [x] Accounting Portal with Fees/Payments (65%)
- [x] Subject Management (multi-role CRUD)
- [x] Schedule Management (PDF upload)
- [x] Quiz System (Teacher create, Student take)
- [x] Role-targeted Announcements
- [x] All portals with basic schedule & subject viewing

### **Phase 2: Academic Operations** 🔄 `IN PROGRESS (Target: 65%)`
- [x] Teacher Portal with quiz management (40%)
- [x] Student Portal with quiz taking (35%)
- [x] Guidance Counselor basics (20%)
- [x] Librarian basics (25%)
- [ ] Teacher grade encoding
- [ ] Teacher attendance marking
- [ ] Parent Portal completion
- [ ] Academic transcript generation

### **Phase 3: E-LMS Completion** (Target: 85%)
- [ ] Lessons & Modules Upload
- [ ] Assignments (create/submit)
- [ ] Student grades viewing
- [ ] Enhanced grading system
- [ ] Student wallet/balance

### **Phase 4: Advanced Features** (Target: 100%)
- [ ] RFID Attendance System
- [ ] Medical/Clinic Module completion
- [ ] Canteen POS with wallet integration
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

**Built with ❤️ using Laravel 12, React 19, TypeScript 5, and TailwindCSS 4**

*Project Progress: 65% Complete | Last Updated: March 5, 2026*

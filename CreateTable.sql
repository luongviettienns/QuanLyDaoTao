IF DB_ID(N'QUANLYDAOTAOSINHVIEN') IS NULL
BEGIN
    CREATE DATABASE QUANLYDAOTAOSINHVIEN;
END
GO

USE QUANLYDAOTAOSINHVIEN;
GO

/*
  WARNING:
  Reset block below drops existing tables in this module (data loss).
  Keep it when you need clean rebuild and consistent data types.
*/
DROP TABLE IF EXISTS dbo.attendance_records;
DROP TABLE IF EXISTS dbo.attendance_sessions;
DROP TABLE IF EXISTS dbo.timetable_sessions;
DROP TABLE IF EXISTS dbo.period_classes;
DROP TABLE IF EXISTS dbo.grade_appeals;
DROP TABLE IF EXISTS dbo.grades;
DROP TABLE IF EXISTS dbo.gpas;
DROP TABLE IF EXISTS dbo.grade_formula_config;
DROP TABLE IF EXISTS dbo.retake_records;
DROP TABLE IF EXISTS dbo.enrollments;
DROP TABLE IF EXISTS dbo.registration_periods;
DROP TABLE IF EXISTS dbo.classes;
DROP TABLE IF EXISTS dbo.subject_prerequisites;
DROP TABLE IF EXISTS dbo.subjects;
DROP TABLE IF EXISTS dbo.rooms;
DROP TABLE IF EXISTS dbo.students;
DROP TABLE IF EXISTS dbo.administrative_classes;
DROP TABLE IF EXISTS dbo.lecturers;
DROP TABLE IF EXISTS dbo.school_years;
DROP TABLE IF EXISTS dbo.academic_years;
DROP TABLE IF EXISTS dbo.majors;
DROP TABLE IF EXISTS dbo.departments;
DROP TABLE IF EXISTS dbo.faculties;
DROP TABLE IF EXISTS dbo.notifications;
DROP TABLE IF EXISTS dbo.audit_logs;
DROP TABLE IF EXISTS dbo.refresh_tokens;
DROP TABLE IF EXISTS dbo.users;
DROP TABLE IF EXISTS dbo.roles;
DROP TABLE IF EXISTS dbo.advisor_warning_config;
GO

-- =========================
-- 1) Auth / RBAC
-- =========================

CREATE TABLE dbo.roles (
    role_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_roles_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_roles_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL
);
GO

CREATE UNIQUE INDEX UX_roles_role_name_active
ON dbo.roles(role_name)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.users (
    user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NULL,
    full_name NVARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(500) NULL,
    role_id BIGINT NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_users_is_active DEFAULT (1),
    last_login_at DATETIME2(0) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_users_role_id FOREIGN KEY (role_id) REFERENCES dbo.roles(role_id)
);
GO

CREATE UNIQUE INDEX UX_users_username_active
ON dbo.users(username)
WHERE deleted_at IS NULL;
GO

CREATE UNIQUE INDEX UX_users_email_active
ON dbo.users(email)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.refresh_tokens (
    id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash NVARCHAR(500) NOT NULL,
    expires_at DATETIME2(0) NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_refresh_tokens_created_at DEFAULT SYSUTCDATETIME(),
    revoked_at DATETIME2(0) NULL,
    replaced_by_token_id UNIQUEIDENTIFIER NULL,
    device_name NVARCHAR(255) NULL,
    ip_address NVARCHAR(64) NULL,
    user_agent NVARCHAR(1024) NULL,
    revoked_reason NVARCHAR(500) NULL,
    created_by_ip NVARCHAR(64) NULL,
    CONSTRAINT FK_refresh_tokens_user_id FOREIGN KEY (user_id) REFERENCES dbo.users(user_id),
    CONSTRAINT FK_refresh_tokens_replaced_by FOREIGN KEY (replaced_by_token_id) REFERENCES dbo.refresh_tokens(id)
);
GO

CREATE UNIQUE INDEX UX_refresh_tokens_token_hash
ON dbo.refresh_tokens(token_hash);
GO

CREATE INDEX IX_refresh_tokens_user_expire_revoke
ON dbo.refresh_tokens(user_id, expires_at, revoked_at);
GO

CREATE INDEX IX_refresh_tokens_replaced_by
ON dbo.refresh_tokens(replaced_by_token_id);
GO

CREATE TABLE dbo.audit_logs (
    log_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NULL,
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(100) NULL,
    entity_id NVARCHAR(100) NULL,
    old_values NVARCHAR(MAX) NULL,
    new_values NVARCHAR(MAX) NULL,
    ip_address NVARCHAR(64) NULL,
    user_agent NVARCHAR(1024) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_audit_logs_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES dbo.users(user_id)
);
GO

CREATE INDEX IX_audit_logs_user_created
ON dbo.audit_logs(user_id, created_at);
GO

CREATE TABLE dbo.notifications (
    notification_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(20) NOT NULL,
    is_read BIT NOT NULL CONSTRAINT DF_notifications_is_read DEFAULT (0),
    sent_date DATETIME2(0) NOT NULL CONSTRAINT DF_notifications_sent_date DEFAULT SYSUTCDATETIME(),
    is_active BIT NOT NULL CONSTRAINT DF_notifications_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_notifications_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_notifications_recipient_id FOREIGN KEY (recipient_id) REFERENCES dbo.users(user_id),
    CONSTRAINT CK_notifications_type CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM'))
);
GO

CREATE INDEX IX_notifications_recipient_read
ON dbo.notifications(recipient_id, is_read, sent_date);
GO

-- =========================
-- 2) Academic Organization
-- =========================

CREATE TABLE dbo.faculties (
    faculty_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    faculty_code NVARCHAR(50) NOT NULL,
    faculty_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_faculties_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_faculties_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL
);
GO

CREATE UNIQUE INDEX UX_faculties_code_active
ON dbo.faculties(faculty_code)
WHERE deleted_at IS NULL;
GO

CREATE UNIQUE INDEX UX_faculties_name_active
ON dbo.faculties(faculty_name)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.departments (
    department_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    department_code NVARCHAR(50) NOT NULL,
    department_name NVARCHAR(255) NOT NULL,
    faculty_id BIGINT NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_departments_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_departments_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_departments_faculty_id FOREIGN KEY (faculty_id) REFERENCES dbo.faculties(faculty_id)
);
GO

CREATE UNIQUE INDEX UX_departments_code_active
ON dbo.departments(department_code)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.majors (
    major_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    major_code NVARCHAR(50) NOT NULL,
    major_name NVARCHAR(255) NOT NULL,
    faculty_id BIGINT NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_majors_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_majors_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_majors_faculty_id FOREIGN KEY (faculty_id) REFERENCES dbo.faculties(faculty_id)
);
GO

CREATE UNIQUE INDEX UX_majors_code_active
ON dbo.majors(major_code)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.academic_years (
    academic_year_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    year_name NVARCHAR(50) NOT NULL,
    cohort_code NVARCHAR(20) NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    duration_years TINYINT NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_academic_years_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_academic_years_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT CK_academic_years_start_end CHECK (start_year < end_year),
    CONSTRAINT UQ_academic_years_year_name UNIQUE (year_name)
);
GO

CREATE TABLE dbo.school_years (
    school_year_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    year_code NVARCHAR(50) NOT NULL,
    year_name NVARCHAR(100) NOT NULL,
    academic_year_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    semester1_start DATE NULL,
    semester1_end DATE NULL,
    semester2_start DATE NULL,
    semester2_end DATE NULL,
    is_active BIT NOT NULL CONSTRAINT DF_school_years_is_active DEFAULT (1),
    current_semester TINYINT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_school_years_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_school_years_academic_year_id FOREIGN KEY (academic_year_id) REFERENCES dbo.academic_years(academic_year_id),
    CONSTRAINT CK_school_years_start_end CHECK (start_date < end_date),
    CONSTRAINT CK_school_years_current_semester CHECK (current_semester IS NULL OR current_semester IN (1,2,3))
);
GO

CREATE UNIQUE INDEX UX_school_years_year_code_active
ON dbo.school_years(year_code)
WHERE deleted_at IS NULL;
GO

-- =========================
-- 3) Profiles
-- =========================

CREATE TABLE dbo.lecturers (
    lecturer_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    lecturer_code NVARCHAR(50) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(20) NULL,
    department_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    academic_title NVARCHAR(100) NULL,
    degree NVARCHAR(100) NULL,
    specialization NVARCHAR(255) NULL,
    position NVARCHAR(100) NULL,
    join_date DATE NULL,
    is_active BIT NOT NULL CONSTRAINT DF_lecturers_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_lecturers_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_lecturers_department_id FOREIGN KEY (department_id) REFERENCES dbo.departments(department_id),
    CONSTRAINT FK_lecturers_user_id FOREIGN KEY (user_id) REFERENCES dbo.users(user_id)
);
GO

CREATE UNIQUE INDEX UX_lecturers_code_active
ON dbo.lecturers(lecturer_code)
WHERE deleted_at IS NULL;
GO

CREATE UNIQUE INDEX UX_lecturers_user_active
ON dbo.lecturers(user_id)
WHERE user_id IS NOT NULL AND deleted_at IS NULL;
GO

CREATE TABLE dbo.administrative_classes (
    admin_class_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    class_code NVARCHAR(50) NOT NULL,
    class_name NVARCHAR(255) NOT NULL,
    major_id BIGINT NOT NULL,
    advisor_id BIGINT NULL,
    academic_year_id BIGINT NOT NULL,
    cohort_year INT NULL,
    max_students INT NULL,
    current_students INT NOT NULL CONSTRAINT DF_administrative_classes_current_students DEFAULT (0),
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_administrative_classes_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_administrative_classes_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_administrative_classes_major_id FOREIGN KEY (major_id) REFERENCES dbo.majors(major_id),
    CONSTRAINT FK_administrative_classes_advisor_id FOREIGN KEY (advisor_id) REFERENCES dbo.lecturers(lecturer_id),
    CONSTRAINT FK_administrative_classes_academic_year_id FOREIGN KEY (academic_year_id) REFERENCES dbo.academic_years(academic_year_id),
    CONSTRAINT CK_administrative_classes_max_students CHECK (max_students IS NULL OR max_students > 0),
    CONSTRAINT CK_administrative_classes_current_le_max CHECK (max_students IS NULL OR current_students <= max_students)
);
GO

CREATE UNIQUE INDEX UX_administrative_classes_code_active
ON dbo.administrative_classes(class_code)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.students (
    student_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_code NVARCHAR(50) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    date_of_birth DATE NULL,
    gender NVARCHAR(20) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(20) NULL,
    address NVARCHAR(500) NULL,
    major_id BIGINT NOT NULL,
    academic_year_id BIGINT NOT NULL,
    advisor_id BIGINT NULL,
    user_id BIGINT NULL,
    admin_class_id BIGINT NULL,
    faculty_id BIGINT NULL,
    cohort_year INT NULL,
    last_warning_sent DATETIME2(0) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_students_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_students_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_students_major_id FOREIGN KEY (major_id) REFERENCES dbo.majors(major_id),
    CONSTRAINT FK_students_academic_year_id FOREIGN KEY (academic_year_id) REFERENCES dbo.academic_years(academic_year_id),
    CONSTRAINT FK_students_advisor_id FOREIGN KEY (advisor_id) REFERENCES dbo.lecturers(lecturer_id),
    CONSTRAINT FK_students_user_id FOREIGN KEY (user_id) REFERENCES dbo.users(user_id),
    CONSTRAINT FK_students_admin_class_id FOREIGN KEY (admin_class_id) REFERENCES dbo.administrative_classes(admin_class_id),
    CONSTRAINT FK_students_faculty_id FOREIGN KEY (faculty_id) REFERENCES dbo.faculties(faculty_id)
);
GO

CREATE UNIQUE INDEX UX_students_code_active
ON dbo.students(student_code)
WHERE deleted_at IS NULL;
GO

CREATE UNIQUE INDEX UX_students_user_active
ON dbo.students(user_id)
WHERE user_id IS NOT NULL AND deleted_at IS NULL;
GO

-- =========================
-- 4) Subjects / Classes / Enrollment
-- =========================

CREATE TABLE dbo.subjects (
    subject_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    subject_code NVARCHAR(50) NOT NULL,
    subject_name NVARCHAR(255) NOT NULL,
    credits TINYINT NOT NULL,
    department_id BIGINT NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_subjects_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_subjects_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_subjects_department_id FOREIGN KEY (department_id) REFERENCES dbo.departments(department_id),
    CONSTRAINT CK_subjects_credits CHECK (credits > 0)
);
GO

CREATE UNIQUE INDEX UX_subjects_code_active
ON dbo.subjects(subject_code)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.subject_prerequisites (
    prerequisite_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    prerequisite_subject_id BIGINT NOT NULL,
    minimum_grade DECIMAL(4,2) NULL,
    is_required BIT NOT NULL CONSTRAINT DF_subject_prerequisites_is_required DEFAULT (1),
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_subject_prerequisites_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_subject_prerequisites_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_subject_prerequisites_subject_id FOREIGN KEY (subject_id) REFERENCES dbo.subjects(subject_id),
    CONSTRAINT FK_subject_prerequisites_prereq_subject_id FOREIGN KEY (prerequisite_subject_id) REFERENCES dbo.subjects(subject_id),
    CONSTRAINT CK_subject_prerequisites_no_self CHECK (subject_id <> prerequisite_subject_id),
    CONSTRAINT UQ_subject_prerequisites_pair UNIQUE (subject_id, prerequisite_subject_id)
);
GO

CREATE TABLE dbo.classes (
    class_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    class_code NVARCHAR(50) NOT NULL,
    class_name NVARCHAR(255) NOT NULL,
    subject_id BIGINT NOT NULL,
    lecturer_id BIGINT NULL,
    academic_year_id BIGINT NOT NULL,
    school_year_id BIGINT NULL,
    semester TINYINT NULL,
    max_students INT NULL,
    current_enrollment INT NOT NULL CONSTRAINT DF_classes_current_enrollment DEFAULT (0),
    is_active BIT NOT NULL CONSTRAINT DF_classes_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_classes_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_classes_subject_id FOREIGN KEY (subject_id) REFERENCES dbo.subjects(subject_id),
    CONSTRAINT FK_classes_lecturer_id FOREIGN KEY (lecturer_id) REFERENCES dbo.lecturers(lecturer_id),
    CONSTRAINT FK_classes_academic_year_id FOREIGN KEY (academic_year_id) REFERENCES dbo.academic_years(academic_year_id),
    CONSTRAINT FK_classes_school_year_id FOREIGN KEY (school_year_id) REFERENCES dbo.school_years(school_year_id),
    CONSTRAINT CK_classes_semester CHECK (semester IS NULL OR semester IN (1,2,3)),
    CONSTRAINT CK_classes_max_students CHECK (max_students IS NULL OR max_students > 0),
    CONSTRAINT CK_classes_current_enrollment_nonneg CHECK (current_enrollment >= 0),
    CONSTRAINT CK_classes_current_le_max CHECK (max_students IS NULL OR current_enrollment <= max_students)
);
GO

CREATE UNIQUE INDEX UX_classes_code_active
ON dbo.classes(class_code)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.registration_periods (
    period_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    period_name NVARCHAR(255) NOT NULL,
    academic_year_id BIGINT NOT NULL,
    semester TINYINT NOT NULL,
    start_date DATETIME2(0) NOT NULL,
    end_date DATETIME2(0) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    period_type NVARCHAR(20) NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_registration_periods_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_registration_periods_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_registration_periods_academic_year_id FOREIGN KEY (academic_year_id) REFERENCES dbo.academic_years(academic_year_id),
    CONSTRAINT CK_registration_periods_semester CHECK (semester IN (1,2,3)),
    CONSTRAINT CK_registration_periods_status CHECK (status IN ('UPCOMING','OPEN','CLOSED')),
    CONSTRAINT CK_registration_periods_period_type CHECK (period_type IN ('NORMAL','RETAKE')),
    CONSTRAINT CK_registration_periods_start_end CHECK (start_date < end_date)
);
GO

CREATE UNIQUE INDEX UX_registration_periods_open_unique
ON dbo.registration_periods(academic_year_id, semester, period_type)
WHERE is_active = 1 AND deleted_at IS NULL AND status = 'OPEN';
GO

CREATE TABLE dbo.period_classes (
    period_class_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    period_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_period_classes_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_period_classes_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_period_classes_period_id FOREIGN KEY (period_id) REFERENCES dbo.registration_periods(period_id),
    CONSTRAINT FK_period_classes_class_id FOREIGN KEY (class_id) REFERENCES dbo.classes(class_id),
    CONSTRAINT UQ_period_classes_period_class UNIQUE (period_id, class_id)
);
GO

CREATE TABLE dbo.enrollments (
    enrollment_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    enrollment_date DATETIME2(0) NOT NULL CONSTRAINT DF_enrollments_enrollment_date DEFAULT SYSUTCDATETIME(),
    enrollment_status NVARCHAR(20) NOT NULL CONSTRAINT DF_enrollments_status DEFAULT ('PENDING'),
    drop_deadline DATETIME2(0) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_enrollments_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_enrollments_student_id FOREIGN KEY (student_id) REFERENCES dbo.students(student_id),
    CONSTRAINT FK_enrollments_class_id FOREIGN KEY (class_id) REFERENCES dbo.classes(class_id),
    CONSTRAINT CK_enrollments_status CHECK (enrollment_status IN ('PENDING','APPROVED','DROPPED','WITHDRAWN')),
    CONSTRAINT UQ_enrollments_class_student UNIQUE (class_id, student_id),
    CONSTRAINT UQ_enrollments_enrollment_class UNIQUE (enrollment_id, class_id)
);
GO

-- =========================
-- 5) Rooms / Timetable / Attendance
-- =========================

CREATE TABLE dbo.rooms (
    room_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    room_code NVARCHAR(50) NOT NULL,
    building NVARCHAR(100) NULL,
    capacity INT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_rooms_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_rooms_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT CK_rooms_capacity CHECK (capacity IS NULL OR capacity > 0)
);
GO

CREATE UNIQUE INDEX UX_rooms_room_code_active
ON dbo.rooms(room_code)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.timetable_sessions (
    session_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    lecturer_id BIGINT NULL,
    room_id BIGINT NULL,
    school_year_id BIGINT NULL,
    week_no INT NULL,
    weekday TINYINT NOT NULL,
    start_time TIME(0) NOT NULL,
    end_time TIME(0) NOT NULL,
    period_from TINYINT NULL,
    period_to TINYINT NULL,
    recurrence NVARCHAR(30) NULL,
    status NVARCHAR(30) NULL,
    notes NVARCHAR(500) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_timetable_sessions_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_timetable_sessions_class_id FOREIGN KEY (class_id) REFERENCES dbo.classes(class_id),
    CONSTRAINT FK_timetable_sessions_subject_id FOREIGN KEY (subject_id) REFERENCES dbo.subjects(subject_id),
    CONSTRAINT FK_timetable_sessions_lecturer_id FOREIGN KEY (lecturer_id) REFERENCES dbo.lecturers(lecturer_id),
    CONSTRAINT FK_timetable_sessions_room_id FOREIGN KEY (room_id) REFERENCES dbo.rooms(room_id),
    CONSTRAINT FK_timetable_sessions_school_year_id FOREIGN KEY (school_year_id) REFERENCES dbo.school_years(school_year_id),
    CONSTRAINT CK_timetable_sessions_weekday CHECK (weekday BETWEEN 1 AND 7),
    CONSTRAINT CK_timetable_sessions_time CHECK (end_time > start_time),
    CONSTRAINT CK_timetable_sessions_period CHECK (
        (period_from IS NULL AND period_to IS NULL) OR
        (period_from IS NOT NULL AND period_to IS NOT NULL AND period_from <= period_to)
    ),
    CONSTRAINT CK_timetable_sessions_week_no CHECK (week_no IS NULL OR week_no > 0),
    CONSTRAINT CK_timetable_sessions_recurrence CHECK (recurrence IS NULL OR recurrence IN ('ONCE','WEEKLY','BIWEEKLY')),
    CONSTRAINT CK_timetable_sessions_status CHECK (status IS NULL OR status IN ('SCHEDULED','CANCELLED','RESCHEDULED','DONE'))
);
GO

CREATE INDEX IX_timetable_sessions_class_weekday
ON dbo.timetable_sessions(class_id, weekday, start_time);
GO

CREATE TABLE dbo.attendance_sessions (
    session_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    class_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME(0) NOT NULL,
    end_time TIME(0) NOT NULL,
    lecturer_id BIGINT NULL,
    room_id BIGINT NULL,
    timetable_session_id BIGINT NULL,
    week_no INT NULL,
    topic NVARCHAR(255) NULL,
    note NVARCHAR(500) NULL,
    is_locked BIT NOT NULL CONSTRAINT DF_attendance_sessions_is_locked DEFAULT (0),
    locked_at DATETIME2(0) NULL,
    locked_by BIGINT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_attendance_sessions_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_attendance_sessions_class_id FOREIGN KEY (class_id) REFERENCES dbo.classes(class_id),
    CONSTRAINT FK_attendance_sessions_lecturer_id FOREIGN KEY (lecturer_id) REFERENCES dbo.lecturers(lecturer_id),
    CONSTRAINT FK_attendance_sessions_room_id FOREIGN KEY (room_id) REFERENCES dbo.rooms(room_id),
    CONSTRAINT FK_attendance_sessions_timetable_session_id FOREIGN KEY (timetable_session_id) REFERENCES dbo.timetable_sessions(session_id),
    CONSTRAINT FK_attendance_sessions_locked_by FOREIGN KEY (locked_by) REFERENCES dbo.users(user_id),
    CONSTRAINT CK_attendance_sessions_time CHECK (start_time < end_time),
    CONSTRAINT CK_attendance_sessions_week_no CHECK (week_no IS NULL OR week_no > 0),
    CONSTRAINT CK_attendance_sessions_lock_consistency CHECK (
        (is_locked = 0 AND locked_at IS NULL AND locked_by IS NULL) OR
        (is_locked = 1 AND locked_at IS NOT NULL)
    ),
    CONSTRAINT UQ_attendance_sessions_session_class UNIQUE (session_id, class_id)
);
GO

CREATE UNIQUE INDEX UX_attendance_sessions_unique_slot_active
ON dbo.attendance_sessions(class_id, session_date, start_time, end_time)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.attendance_records (
    attendance_record_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    session_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    enrollment_id BIGINT NOT NULL,
    status NVARCHAR(20) NOT NULL,
    note NVARCHAR(500) NULL,
    checked_in_at DATETIME2(0) NULL,
    marked_at DATETIME2(0) NULL,
    marked_by BIGINT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_attendance_records_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_attendance_records_session_id FOREIGN KEY (session_id) REFERENCES dbo.attendance_sessions(session_id),
    CONSTRAINT FK_attendance_records_marked_by FOREIGN KEY (marked_by) REFERENCES dbo.users(user_id),
    CONSTRAINT FK_attendance_records_session_class FOREIGN KEY (session_id, class_id) REFERENCES dbo.attendance_sessions(session_id, class_id),
    CONSTRAINT FK_attendance_records_enrollment_class FOREIGN KEY (enrollment_id, class_id) REFERENCES dbo.enrollments(enrollment_id, class_id),
    CONSTRAINT UQ_attendance_records_session_enrollment UNIQUE (session_id, enrollment_id),
    CONSTRAINT CK_attendance_records_status CHECK (status IN ('PRESENT','ABSENT','LATE','EXCUSED'))
);
GO

CREATE INDEX IX_attendance_records_enrollment
ON dbo.attendance_records(enrollment_id, status);
GO

-- =========================
-- 6) Grades / Academic Affairs
-- =========================

CREATE TABLE dbo.grades (
    grade_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id BIGINT NOT NULL,
    midterm_score DECIMAL(4,2) NULL,
    final_score DECIMAL(4,2) NULL,
    total_score DECIMAL(4,2) NULL,
    letter_grade NVARCHAR(5) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_grades_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_grades_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_grades_enrollment_id FOREIGN KEY (enrollment_id) REFERENCES dbo.enrollments(enrollment_id),
    CONSTRAINT CK_grades_midterm_range CHECK (midterm_score IS NULL OR (midterm_score >= 0 AND midterm_score <= 10)),
    CONSTRAINT CK_grades_final_range CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 10)),
    CONSTRAINT CK_grades_total_range CHECK (total_score IS NULL OR (total_score >= 0 AND total_score <= 10))
);
GO

CREATE UNIQUE INDEX UX_grades_enrollment_active
ON dbo.grades(enrollment_id)
WHERE deleted_at IS NULL;
GO

CREATE TABLE dbo.gpas (
    gpa_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id BIGINT NOT NULL,
    academic_year_id BIGINT NULL,
    school_year_id BIGINT NOT NULL,
    semester TINYINT NOT NULL,
    gpa10 DECIMAL(4,2) NULL,
    gpa4 DECIMAL(3,2) NULL,
    total_credits INT NOT NULL CONSTRAINT DF_gpas_total_credits DEFAULT (0),
    accumulated_credits INT NOT NULL CONSTRAINT DF_gpas_accumulated_credits DEFAULT (0),
    rank_text NVARCHAR(50) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_gpas_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_gpas_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_gpas_student_id FOREIGN KEY (student_id) REFERENCES dbo.students(student_id),
    CONSTRAINT FK_gpas_academic_year_id FOREIGN KEY (academic_year_id) REFERENCES dbo.academic_years(academic_year_id),
    CONSTRAINT FK_gpas_school_year_id FOREIGN KEY (school_year_id) REFERENCES dbo.school_years(school_year_id),
    CONSTRAINT UQ_gpas_student_school_sem UNIQUE (student_id, school_year_id, semester),
    CONSTRAINT CK_gpas_gpa10 CHECK (gpa10 IS NULL OR (gpa10 >= 0 AND gpa10 <= 10)),
    CONSTRAINT CK_gpas_gpa4 CHECK (gpa4 IS NULL OR (gpa4 >= 0 AND gpa4 <= 4)),
    CONSTRAINT CK_gpas_semester CHECK (semester IN (1,2,3))
);
GO

CREATE TABLE dbo.grade_appeals (
    appeal_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    grade_id BIGINT NOT NULL,
    enrollment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    appeal_reason NVARCHAR(1000) NOT NULL,
    current_score DECIMAL(4,2) NULL,
    expected_score DECIMAL(4,2) NULL,
    supporting_docs NVARCHAR(1000) NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_grade_appeals_status DEFAULT ('PENDING'),
    priority NVARCHAR(20) NOT NULL CONSTRAINT DF_grade_appeals_priority DEFAULT ('NORMAL'),
    lecturer_response NVARCHAR(1000) NULL,
    lecturer_id BIGINT NULL,
    lecturer_decision NVARCHAR(20) NULL,
    advisor_id BIGINT NULL,
    advisor_response NVARCHAR(1000) NULL,
    advisor_decision NVARCHAR(20) NULL,
    final_score DECIMAL(4,2) NULL,
    resolution_notes NVARCHAR(1000) NULL,
    resolved_at DATETIME2(0) NULL,
    resolved_by BIGINT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_grade_appeals_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_grade_appeals_grade_id FOREIGN KEY (grade_id) REFERENCES dbo.grades(grade_id),
    CONSTRAINT FK_grade_appeals_enrollment_id FOREIGN KEY (enrollment_id) REFERENCES dbo.enrollments(enrollment_id),
    CONSTRAINT FK_grade_appeals_student_id FOREIGN KEY (student_id) REFERENCES dbo.students(student_id),
    CONSTRAINT FK_grade_appeals_class_id FOREIGN KEY (class_id) REFERENCES dbo.classes(class_id),
    CONSTRAINT FK_grade_appeals_lecturer_id FOREIGN KEY (lecturer_id) REFERENCES dbo.lecturers(lecturer_id),
    CONSTRAINT FK_grade_appeals_advisor_id FOREIGN KEY (advisor_id) REFERENCES dbo.lecturers(lecturer_id),
    CONSTRAINT FK_grade_appeals_resolved_by FOREIGN KEY (resolved_by) REFERENCES dbo.users(user_id),
    CONSTRAINT CK_grade_appeals_status CHECK (status IN ('PENDING','IN_REVIEW','APPROVED','REJECTED','RESOLVED','CANCELLED')),
    CONSTRAINT CK_grade_appeals_priority CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
    CONSTRAINT CK_grade_appeals_lecturer_decision CHECK (lecturer_decision IS NULL OR lecturer_decision IN ('APPROVE','REJECT','REQUEST_MORE_INFO')),
    CONSTRAINT CK_grade_appeals_advisor_decision CHECK (advisor_decision IS NULL OR advisor_decision IN ('APPROVE','REJECT','REQUEST_MORE_INFO'))
);
GO

CREATE INDEX IX_grade_appeals_student_status
ON dbo.grade_appeals(student_id, status, created_at);
GO

CREATE TABLE dbo.grade_formula_config (
    config_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    subject_id BIGINT NULL,
    class_id BIGINT NULL,
    school_year_id BIGINT NULL,
    midterm_weight DECIMAL(5,4) NOT NULL CONSTRAINT DF_grade_formula_midterm DEFAULT (0),
    final_weight DECIMAL(5,4) NOT NULL CONSTRAINT DF_grade_formula_final DEFAULT (0),
    assignment_weight DECIMAL(5,4) NOT NULL CONSTRAINT DF_grade_formula_assignment DEFAULT (0),
    quiz_weight DECIMAL(5,4) NOT NULL CONSTRAINT DF_grade_formula_quiz DEFAULT (0),
    project_weight DECIMAL(5,4) NOT NULL CONSTRAINT DF_grade_formula_project DEFAULT (0),
    custom_formula NVARCHAR(2000) NULL,
    rounding_method NVARCHAR(20) NOT NULL CONSTRAINT DF_grade_formula_rounding_method DEFAULT ('ROUND'),
    decimal_places TINYINT NOT NULL CONSTRAINT DF_grade_formula_decimal_places DEFAULT (2),
    description NVARCHAR(500) NULL,
    is_default BIT NOT NULL CONSTRAINT DF_grade_formula_is_default DEFAULT (0),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_grade_formula_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_grade_formula_subject_id FOREIGN KEY (subject_id) REFERENCES dbo.subjects(subject_id),
    CONSTRAINT FK_grade_formula_class_id FOREIGN KEY (class_id) REFERENCES dbo.classes(class_id),
    CONSTRAINT FK_grade_formula_school_year_id FOREIGN KEY (school_year_id) REFERENCES dbo.school_years(school_year_id),
    CONSTRAINT CK_grade_formula_scope CHECK (
        subject_id IS NOT NULL OR class_id IS NOT NULL OR school_year_id IS NOT NULL
    ),
    CONSTRAINT CK_grade_formula_weight_total CHECK (
        (midterm_weight + final_weight + assignment_weight + quiz_weight + project_weight) <= 1.0000
    ),
    CONSTRAINT CK_grade_formula_rounding_method CHECK (rounding_method IN ('ROUND','CEILING','FLOOR','TRUNCATE')),
    CONSTRAINT CK_grade_formula_decimal_places CHECK (decimal_places BETWEEN 0 AND 4)
);
GO

CREATE TABLE dbo.retake_records (
    retake_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    reason NVARCHAR(20) NOT NULL,
    threshold_value DECIMAL(5,2) NULL,
    current_value DECIMAL(5,2) NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_retake_records_status DEFAULT ('PENDING'),
    advisor_notes NVARCHAR(1000) NULL,
    resolved_at DATETIME2(0) NULL,
    resolved_by BIGINT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_retake_records_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT FK_retake_records_enrollment_id FOREIGN KEY (enrollment_id) REFERENCES dbo.enrollments(enrollment_id),
    CONSTRAINT FK_retake_records_student_id FOREIGN KEY (student_id) REFERENCES dbo.students(student_id),
    CONSTRAINT FK_retake_records_class_id FOREIGN KEY (class_id) REFERENCES dbo.classes(class_id),
    CONSTRAINT FK_retake_records_subject_id FOREIGN KEY (subject_id) REFERENCES dbo.subjects(subject_id),
    CONSTRAINT FK_retake_records_resolved_by FOREIGN KEY (resolved_by) REFERENCES dbo.users(user_id),
    CONSTRAINT CK_retake_records_reason CHECK (reason IN ('ATTENDANCE','GRADE','BOTH')),
    CONSTRAINT CK_retake_records_status CHECK (status IN ('PENDING','APPROVED','REJECTED','COMPLETED'))
);
GO

CREATE INDEX IX_retake_records_student_status
ON dbo.retake_records(student_id, status, created_at);
GO

CREATE TABLE dbo.advisor_warning_config (
    config_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    attendance_threshold DECIMAL(5,2) NOT NULL,
    gpa_threshold DECIMAL(4,2) NOT NULL,
    email_template NVARCHAR(MAX) NULL,
    email_subject NVARCHAR(255) NULL,
    auto_send_emails BIT NOT NULL CONSTRAINT DF_advisor_warning_auto_send DEFAULT (0),
    is_active BIT NOT NULL CONSTRAINT DF_advisor_warning_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_advisor_warning_created_at DEFAULT SYSUTCDATETIME(),
    created_by BIGINT NULL,
    updated_at DATETIME2(0) NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME2(0) NULL,
    deleted_by BIGINT NULL,
    CONSTRAINT CK_advisor_warning_attendance CHECK (attendance_threshold >= 0 AND attendance_threshold <= 100),
    CONSTRAINT CK_advisor_warning_gpa CHECK (gpa_threshold >= 0 AND gpa_threshold <= 10)
);
GO

-- Keep one active config record at a time.
CREATE UNIQUE INDEX UX_advisor_warning_single_active
ON dbo.advisor_warning_config(is_active)
WHERE is_active = 1 AND deleted_at IS NULL;
GO

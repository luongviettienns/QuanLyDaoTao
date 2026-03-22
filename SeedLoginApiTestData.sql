/*
  Seed data for testing POST /api/v1/auth/login (4 roles + negative cases).
  Source: backend/LOGIN_API_TEST_DATA_REQUIREMENTS.md

  Prerequisites:
  - Run CreateTable.sql first (schema QUANLYDAOTAOSINHVIEN).

  Password hashes: bcrypt cost 10, generated with bcryptjs (compatible with bcrypt / bcryptjs in Node).
  Plaintext passwords (for Postman / manual tests):
    admin01     -> Admin@123
    gv001       -> Lecturer@123
    cv001       -> Advisor@123
    sv001       -> Student@123
    locked01    -> Locked@123     (is_active = 0)
    deleted01   -> Deleted@123    (soft-deleted: deleted_at set)
    sv_nopf     -> Student@123    (role Sinh viên, NO row in students — profile edge case)
    gv_nopf     -> Lecturer@123    (role Giảng viên, NO row in lecturers — profile edge case)

  Re-run safe: uses IF NOT EXISTS / WHERE NOT EXISTS so it will not duplicate rows.
*/

USE QUANLYDAOTAOSINHVIEN;
GO

SET NOCOUNT ON;
GO

/* ---- Roles (4) ---- */
INSERT INTO dbo.roles (role_name, description, is_active)
SELECT v.role_name, v.description, 1
FROM (VALUES
    (N'Admin',       N'Quản trị hệ thống'),
    (N'Giảng viên',  N'Giảng viên'),
    (N'Cố vấn',      N'Cố vấn học tập'),
    (N'Sinh viên',   N'Sinh viên')
) AS v(role_name, description)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.roles r WHERE r.role_name = v.role_name AND r.deleted_at IS NULL
);
GO

/* ---- Academic org (minimal) ---- */
INSERT INTO dbo.faculties (faculty_code, faculty_name, description, is_active)
SELECT N'CNTT', N'Khoa Công nghệ thông tin', N'Seed login API test', 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.faculties WHERE faculty_code = N'CNTT' AND deleted_at IS NULL);
GO

INSERT INTO dbo.departments (department_code, department_name, faculty_id, description, is_active)
SELECT N'CNPM', N'Bộ môn Công nghệ phần mềm', f.faculty_id, N'Seed login API test', 1
FROM dbo.faculties f
WHERE f.faculty_code = N'CNTT' AND f.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.departments WHERE department_code = N'CNPM' AND deleted_at IS NULL);
GO

INSERT INTO dbo.majors (major_code, major_name, faculty_id, description, is_active)
SELECT N'KTPM', N'Kỹ thuật phần mềm', f.faculty_id, N'Seed login API test', 1
FROM dbo.faculties f
WHERE f.faculty_code = N'CNTT' AND f.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.majors WHERE major_code = N'KTPM' AND deleted_at IS NULL);
GO

INSERT INTO dbo.academic_years (
    year_name, cohort_code, start_year, end_year, duration_years, description, is_active
)
SELECT N'2023-2027', N'K23', 2023, 2027, 4, N'Seed login API test', 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.academic_years WHERE year_name = N'2023-2027' AND deleted_at IS NULL);
GO

/* ---- Users (bcrypt hashes) ---- */
-- Admin@123
DECLARE @hash_admin   NVARCHAR(255) = N'$2b$10$ZfoFYOu8yWX3.RRtcTUy5eyz9FdYkAGOFH8qEUOHwmAQaBfYbY4Ay';
-- Lecturer@123
DECLARE @hash_lecturer NVARCHAR(255) = N'$2b$10$xPjfpJ09LDvrYqx4KLWkqu3iRyzwDabrZPn3QmqTWkE30DulvI/bG';
-- Advisor@123
DECLARE @hash_advisor  NVARCHAR(255) = N'$2b$10$ggxjQB6.SrxZ2BtQ.mFcju5GUWum8D/uAZS4guco645rgUmGkA7Oy';
-- Student@123
DECLARE @hash_student  NVARCHAR(255) = N'$2b$10$HWZlHLDafYpaSBn.yf6JguIZU.dEPkEdxonFluCZ0MQFjTZz6NYpq';
-- Locked@123
DECLARE @hash_locked   NVARCHAR(255) = N'$2b$10$L.wDpvC1KinO.gCSGkMovOmLHi3dyu0YI/BuXcWKn/u/diFLzKIU2';
-- Deleted@123
DECLARE @hash_deleted  NVARCHAR(255) = N'$2b$10$i6idlEk4Ylo/VIwF9c4UU.tvxzsj4wVZTTLtXzjd1gCl4K46qxqfu';

UPDATE u
SET
  u.password_hash = v.password_hash,
  u.email = v.email,
  u.full_name = v.full_name,
  u.role_id = r.role_id,
  u.is_active = v.is_active,
  u.deleted_at = v.deleted_at,
  u.updated_at = SYSUTCDATETIME()
FROM dbo.users u
INNER JOIN (VALUES
  (N'admin01',   @hash_admin,    N'admin01@education.local',   N'Quản trị hệ thống', N'Admin',      CAST(1 AS BIT), CAST(NULL AS DATETIME2(0))),
  (N'gv001',     @hash_lecturer, N'gv001@education.local',     N'Nguyễn Văn Giảng',  N'Giảng viên', CAST(1 AS BIT), CAST(NULL AS DATETIME2(0))),
  (N'cv001',     @hash_advisor,  N'cv001@education.local',     N'Trần Thị Cố Vấn',   N'Cố vấn',     CAST(1 AS BIT), CAST(NULL AS DATETIME2(0))),
  (N'sv001',     @hash_student,  N'sv001@education.local',     N'Lê Văn Sinh Viên',  N'Sinh viên',  CAST(1 AS BIT), CAST(NULL AS DATETIME2(0))),
  (N'locked01',  @hash_locked,   N'locked01@education.local',  N'Tài khoản khóa',    N'Admin',      CAST(0 AS BIT), CAST(NULL AS DATETIME2(0))),
  (N'deleted01', @hash_deleted,  N'deleted01@education.local', N'User đã xóa mềm',   N'Admin',      CAST(1 AS BIT), SYSUTCDATETIME()),
  (N'sv_nopf',   @hash_student,  N'sv_nopf@education.local',   N'SV không profile',  N'Sinh viên',  CAST(1 AS BIT), CAST(NULL AS DATETIME2(0))),
  (N'gv_nopf',   @hash_lecturer, N'gv_nopf@education.local',   N'GV không profile',  N'Giảng viên', CAST(1 AS BIT), CAST(NULL AS DATETIME2(0)))
) AS v(username, password_hash, email, full_name, role_name, is_active, deleted_at)
  ON u.username = v.username
INNER JOIN dbo.roles r
  ON r.role_name = v.role_name
 AND r.deleted_at IS NULL;

INSERT INTO dbo.users (username, password_hash, email, phone, full_name, avatar_url, role_id, is_active, deleted_at)
SELECT N'admin01', @hash_admin, N'admin01@education.local', NULL, N'Quản trị hệ thống', NULL, r.role_id, 1, NULL
FROM dbo.roles r WHERE r.role_name = N'Admin' AND r.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'admin01');

INSERT INTO dbo.users (username, password_hash, email, phone, full_name, avatar_url, role_id, is_active, deleted_at)
SELECT N'gv001', @hash_lecturer, N'gv001@education.local', NULL, N'Nguyễn Văn Giảng', NULL, r.role_id, 1, NULL
FROM dbo.roles r WHERE r.role_name = N'Giảng viên' AND r.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'gv001');

INSERT INTO dbo.users (username, password_hash, email, phone, full_name, avatar_url, role_id, is_active, deleted_at)
SELECT N'cv001', @hash_advisor, N'cv001@education.local', NULL, N'Trần Thị Cố Vấn', NULL, r.role_id, 1, NULL
FROM dbo.roles r WHERE r.role_name = N'Cố vấn' AND r.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'cv001');

INSERT INTO dbo.users (username, password_hash, email, phone, full_name, avatar_url, role_id, is_active, deleted_at)
SELECT N'sv001', @hash_student, N'sv001@education.local', NULL, N'Lê Văn Sinh Viên', NULL, r.role_id, 1, NULL
FROM dbo.roles r WHERE r.role_name = N'Sinh viên' AND r.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'sv001');

INSERT INTO dbo.users (username, password_hash, email, phone, full_name, avatar_url, role_id, is_active, deleted_at)
SELECT N'locked01', @hash_locked, N'locked01@education.local', NULL, N'Tài khoản khóa', NULL, r.role_id, 0, NULL
FROM dbo.roles r WHERE r.role_name = N'Admin' AND r.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'locked01');

INSERT INTO dbo.users (username, password_hash, email, phone, full_name, avatar_url, role_id, is_active, deleted_at)
SELECT N'deleted01', @hash_deleted, N'deleted01@education.local', NULL, N'User đã xóa mềm', NULL, r.role_id, 1, SYSUTCDATETIME()
FROM dbo.roles r WHERE r.role_name = N'Admin' AND r.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'deleted01');

INSERT INTO dbo.users (username, password_hash, email, phone, full_name, avatar_url, role_id, is_active, deleted_at)
SELECT N'sv_nopf', @hash_student, N'sv_nopf@education.local', NULL, N'SV không profile', NULL, r.role_id, 1, NULL
FROM dbo.roles r WHERE r.role_name = N'Sinh viên' AND r.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'sv_nopf');

INSERT INTO dbo.users (username, password_hash, email, phone, full_name, avatar_url, role_id, is_active, deleted_at)
SELECT N'gv_nopf', @hash_lecturer, N'gv_nopf@education.local', NULL, N'GV không profile', NULL, r.role_id, 1, NULL
FROM dbo.roles r WHERE r.role_name = N'Giảng viên' AND r.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'gv_nopf');
GO

/* ---- Lecturers (GV + CV) ---- */
INSERT INTO dbo.lecturers (lecturer_code, full_name, email, phone, department_id, user_id, is_active, deleted_at)
SELECT N'GV001', N'Nguyễn Văn Giảng', N'gv001@education.local', NULL, d.department_id, u.user_id, 1, NULL
FROM dbo.departments d
INNER JOIN dbo.users u ON u.username = N'gv001' AND u.deleted_at IS NULL
WHERE d.department_code = N'CNPM' AND d.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.lecturers WHERE lecturer_code = N'GV001' AND deleted_at IS NULL);

INSERT INTO dbo.lecturers (lecturer_code, full_name, email, phone, department_id, user_id, is_active, deleted_at)
SELECT N'CV001', N'Trần Thị Cố Vấn', N'cv001@education.local', NULL, d.department_id, u.user_id, 1, NULL
FROM dbo.departments d
INNER JOIN dbo.users u ON u.username = N'cv001' AND u.deleted_at IS NULL
WHERE d.department_code = N'CNPM' AND d.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.lecturers WHERE lecturer_code = N'CV001' AND deleted_at IS NULL);
GO

/* ---- Administrative class (advisor = CV001) ---- */
INSERT INTO dbo.administrative_classes (
    class_code, class_name, major_id, advisor_id, academic_year_id, cohort_year,
    max_students, current_students, description, is_active, deleted_at
)
SELECT
    N'DHKTPM23A',
    N'Đại học Kỹ thuật phần mềm K23A',
    m.major_id,
    l.lecturer_id,
    ay.academic_year_id,
    2023,
    50,
    1,
    N'Seed login API test',
    1,
    NULL
FROM dbo.majors m
INNER JOIN dbo.academic_years ay ON ay.year_name = N'2023-2027' AND ay.deleted_at IS NULL
INNER JOIN dbo.lecturers l ON l.lecturer_code = N'CV001' AND l.deleted_at IS NULL
WHERE m.major_code = N'KTPM' AND m.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.administrative_classes WHERE class_code = N'DHKTPM23A' AND deleted_at IS NULL);
GO

/* ---- Student (SV001) ---- */
INSERT INTO dbo.students (
    student_code, full_name, date_of_birth, gender, email, phone, address,
    major_id, academic_year_id, advisor_id, user_id, admin_class_id, faculty_id,
    cohort_year, last_warning_sent, is_active, deleted_at
)
SELECT
    N'SV001',
    N'Lê Văn Sinh Viên',
    NULL,
    NULL,
    N'sv001@education.local',
    NULL,
    NULL,
    m.major_id,
    ay.academic_year_id,
    adv.lecturer_id,
    u.user_id,
    ac.admin_class_id,
    f.faculty_id,
    2023,
    NULL,
    1,
    NULL
FROM dbo.majors m
INNER JOIN dbo.academic_years ay ON ay.year_name = N'2023-2027' AND ay.deleted_at IS NULL
INNER JOIN dbo.faculties f ON f.faculty_code = N'CNTT' AND f.deleted_at IS NULL
INNER JOIN dbo.users u ON u.username = N'sv001' AND u.deleted_at IS NULL
INNER JOIN dbo.lecturers adv ON adv.lecturer_code = N'CV001' AND adv.deleted_at IS NULL
INNER JOIN dbo.administrative_classes ac ON ac.class_code = N'DHKTPM23A' AND ac.deleted_at IS NULL
WHERE m.major_code = N'KTPM' AND m.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.students WHERE student_code = N'SV001' AND deleted_at IS NULL);
GO

PRINT N'SeedLoginApiTestData.sql completed.';
GO

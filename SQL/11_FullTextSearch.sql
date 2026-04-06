-- ===========================================
-- 🎓 HỆ THỐNG QUẢN LÝ ĐIỂM DANH SINH VIÊN
-- 📋 File 11/??: FULL-TEXT SEARCH INDEXES
-- ===========================================

USE EducationManagement;
GO

SET NOCOUNT ON;
PRINT '=========================================';
PRINT 'Bắt đầu tạo Full-Text Search Indexes';
PRINT '=========================================';
GO

-- ===========================================
-- Bước 1: Kiểm tra Full-Text Search đã bật chưa
-- ===========================================
PRINT '';
PRINT 'Bước 1: Kiểm tra Full-Text Search...';

IF EXISTS (SELECT 1 FROM sys.fulltext_catalogs WHERE name = 'FT_EducationManagement')
BEGIN
    PRINT '   ✅ Full-Text Catalog đã tồn tại: FT_EducationManagement';
END
ELSE
BEGIN
    PRINT '   📦 Tạo Full-Text Catalog...';
    CREATE FULLTEXT CATALOG FT_EducationManagement
    AS DEFAULT
    AUTHORIZATION dbo;
    PRINT '   ✅ Đã tạo FT_EducationManagement';
END
GO

-- ===========================================
-- Bước 2: Tạo Full-Text Index cho bảng quan trọng
-- ===========================================

-- 1. students.full_name + student_code + email
PRINT '';
PRINT 'Bước 2: Tạo Full-Text Index cho các bảng...';
PRINT '';

IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.students')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.students
    (
        full_name,
        student_code,
        email,
        address
    )
    KEY INDEX PK__students__student_id
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: students';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: students';
GO

-- 2. lecturers.full_name + lecturer_code + email
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.lecturers')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.lecturers
    (
        full_name,
        lecturer_code,
        email
    )
    KEY INDEX PK__lecturers__lecturer_id
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: lecturers';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: lecturers';
GO

-- 3. subjects.subject_name + subject_code + description
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.subjects')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.subjects
    (
        subject_name,
        subject_code,
        description
    )
    KEY INDEX PK__subjects__subject_id
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: subjects';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: subjects';
GO

-- 4. classes.class_name + class_code
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.classes')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.classes
    (
        class_name,
        class_code
    )
    KEY INDEX PK__classes__class_id
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: classes';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: classes';
GO

-- 5. users.username + email + full_name
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.users')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.users
    (
        username,
        email,
        full_name
    )
    KEY INDEX PK__users__user_id
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: users';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: users';
GO

-- 6. notifications.title + content
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.notifications')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.notifications
    (
        title,
        content
    )
    KEY INDEX PK__notificatio__notif01
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: notifications';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: notifications';
GO

-- 7. grade_appeals.appeal_reason
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.grade_appeals')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.grade_appeals
    (
        appeal_reason,
        admin_notes
    )
    KEY INDEX PK__grade_app__appeal01
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: grade_appeals';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: grade_appeals';
END
GO

-- 8. departments.department_name + department_code
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.departments')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.departments
    (
        department_name,
        department_code,
        description
    )
    KEY INDEX PK__departmen__depart01
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: departments';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: departments';
GO

-- 9. majors.major_name + major_code
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.majors')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.majors
    (
        major_name,
        major_code,
        description
    )
    KEY INDEX PK__majors__major_id
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: majors';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: majors';
GO

-- 10. faculties.faculty_name + faculty_code
IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes
    WHERE object_id = OBJECT_ID('dbo.faculties')
)
BEGIN
    CREATE FULLTEXT INDEX ON dbo.faculties
    (
        faculty_name,
        faculty_code,
        description
    )
    KEY INDEX PK__faculties__faculty01
    ON FT_EducationManagement
    WITH (STOPLIST = SYSTEM);
    PRINT '   ✅ Full-Text Index: faculties';
END
ELSE
    PRINT '   ⏭️  Full-Text Index đã có: faculties';
GO

-- ===========================================
-- Bước 3: Populate indexes (đợi index được build)
-- ===========================================
PRINT '';
PRINT 'Bước 3: Population indexes...';
ALTER FULLTEXT INDEX ON dbo.students START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.lecturers START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.subjects START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.classes START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.users START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.notifications START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.grade_appeals START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.departments START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.majors START FULL POPULATION;
ALTER FULLTEXT INDEX ON dbo.faculties START FULL POPULATION;
PRINT '   ✅ Đã start FULL POPULATION cho tất cả indexes';
GO

-- ===========================================
-- Bước 4: Tạo các Stored Procedure tìm kiếm
-- ===========================================
PRINT '';
PRINT 'Bước 4: Tạo Stored Procedures tìm kiếm...';

-- 4A. Tìm kiếm sinh viên
IF OBJECT_ID('dbo.sp_SearchStudents', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_SearchStudents;
GO

CREATE PROCEDURE dbo.sp_SearchStudents
    @SearchText NVARCHAR(200),
    @PageIndex INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.student_id,
        s.student_code,
        s.full_name,
        s.email,
        s.phone,
        s.date_of_birth,
        s.gender,
        m.major_name,
        ay.year_name AS academic_year,
        s.is_active,
        KEY_TBL.RANK AS relevance
    FROM dbo.students s
    INNER JOIN CONTAINSTABLE(dbo.students, (full_name, student_code, email, address), @SearchText) AS KEY_TBL
        ON s.student_id = KEY_TBL.[KEY]
    LEFT JOIN dbo.majors m ON s.major_id = m.major_id
    LEFT JOIN dbo.academic_years ay ON s.academic_year_id = ay.academic_year_id
    WHERE s.deleted_at IS NULL
    ORDER BY KEY_TBL.RANK DESC, s.full_name
    OFFSET (@PageIndex - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    -- Tổng số
    SELECT COUNT(*) AS TotalCount
    FROM dbo.students s
    INNER JOIN CONTAINSTABLE(dbo.students, (full_name, student_code, email, address), @SearchText) AS KEY_TBL
        ON s.student_id = KEY_TBL.[KEY]
    WHERE s.deleted_at IS NULL;
END
GO
PRINT '   ✅ Created: sp_SearchStudents';
GO

-- 4B. Tìm kiếm giảng viên
IF OBJECT_ID('dbo.sp_SearchLecturers', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_SearchLecturers;
GO

CREATE PROCEDURE dbo.sp_SearchLecturers
    @SearchText NVARCHAR(200),
    @PageIndex INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        l.lecturer_id,
        l.lecturer_code,
        l.full_name,
        l.email,
        l.phone,
        d.department_name,
        l.is_active,
        KEY_TBL.RANK AS relevance
    FROM dbo.lecturers l
    INNER JOIN CONTAINSTABLE(dbo.lecturers, (full_name, lecturer_code, email), @SearchText) AS KEY_TBL
        ON l.lecturer_id = KEY_TBL.[KEY]
    LEFT JOIN dbo.departments d ON l.department_id = d.department_id
    WHERE l.deleted_at IS NULL
    ORDER BY KEY_TBL.RANK DESC, l.full_name
    OFFSET (@PageIndex - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM dbo.lecturers l
    INNER JOIN CONTAINSTABLE(dbo.lecturers, (full_name, lecturer_code, email), @SearchText) AS KEY_TBL
        ON l.lecturer_id = KEY_TBL.[KEY]
    WHERE l.deleted_at IS NULL;
END
GO
PRINT '   ✅ Created: sp_SearchLecturers';
GO

-- 4C. Tìm kiếm môn học
IF OBJECT_ID('dbo.sp_SearchSubjects', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_SearchSubjects;
GO

CREATE PROCEDURE dbo.sp_SearchSubjects
    @SearchText NVARCHAR(200),
    @PageIndex INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sub.subject_id,
        sub.subject_code,
        sub.subject_name,
        sub.credits,
        d.department_name,
        sub.description,
        KEY_TBL.RANK AS relevance
    FROM dbo.subjects sub
    INNER JOIN CONTAINSTABLE(dbo.subjects, (subject_name, subject_code, description), @SearchText) AS KEY_TBL
        ON sub.subject_id = KEY_TBL.[KEY]
    LEFT JOIN dbo.departments d ON sub.department_id = d.department_id
    WHERE sub.deleted_at IS NULL
    ORDER BY KEY_TBL.RANK DESC, sub.subject_name
    OFFSET (@PageIndex - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM dbo.subjects sub
    INNER JOIN CONTAINSTABLE(dbo.subjects, (subject_name, subject_code, description), @SearchText) AS KEY_TBL
        ON sub.subject_id = KEY_TBL.[KEY]
    WHERE sub.deleted_at IS NULL;
END
GO
PRINT '   ✅ Created: sp_SearchSubjects';
GO

-- 4D. Tìm kiếm lớp học phần
IF OBJECT_ID('dbo.sp_SearchClasses', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_SearchClasses;
GO

CREATE PROCEDURE dbo.sp_SearchClasses
    @SearchText NVARCHAR(200),
    @PageIndex INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.class_id,
        c.class_code,
        c.class_name,
        sub.subject_name,
        l.full_name AS lecturer_name,
        c.semester,
        c.max_students,
        c.current_enrollment,
        KEY_TBL.RANK AS relevance
    FROM dbo.classes c
    INNER JOIN CONTAINSTABLE(dbo.classes, (class_name, class_code), @SearchText) AS KEY_TBL
        ON c.class_id = KEY_TBL.[KEY]
    INNER JOIN dbo.subjects sub ON c.subject_id = sub.subject_id
    LEFT JOIN dbo.lecturers l ON c.lecturer_id = l.lecturer_id
    WHERE c.deleted_at IS NULL
    ORDER BY KEY_TBL.RANK DESC, c.class_name
    OFFSET (@PageIndex - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM dbo.classes c
    INNER JOIN CONTAINSTABLE(dbo.classes, (class_name, class_code), @SearchText) AS KEY_TBL
        ON c.class_id = KEY_TBL.[KEY]
    WHERE c.deleted_at IS NULL;
END
GO
PRINT '   ✅ Created: sp_SearchClasses';
GO

-- ===========================================
-- Bước 5: Tạo View xem trạng thái Full-Text Index
-- ===========================================
PRINT '';
PRINT 'Bước 5: Tạo View kiểm tra trạng thái indexes...';

IF OBJECT_ID('dbo.vw_FullTextIndexStatus', 'V') IS NOT NULL DROP VIEW dbo.vw_FullTextIndexStatus;
GO

CREATE VIEW dbo.vw_FullTextIndexStatus
AS
SELECT
    OBJECT_NAME(i.object_id) AS table_name,
    c.name AS catalog_name,
    CASE i.is_enabled
        WHEN 1 THEN N'✅ Bật'
        ELSE N'❌ Tắt'
    END AS status,
    i.change_tracking_state_desc AS change_tracking,
    CASE i.crawl_state
        WHEN 0 THEN N'Idle'
        WHEN 1 THEN N'Một cấu phần đang được điền'
        WHEN 2 THEN N'Đang điền toàn bộ'
        WHEN 3 THEN N'Đang tăng dần'
        WHEN 4 THEN N'Đang cập nhật chỉ mục'
        ELSE N'Không xác định'
    END AS crawl_state,
    STATS_DATE(i.object_id, i.index_id) AS last_population_date,
    i.unique_index_id
FROM sys.fulltext_indexes i
INNER JOIN sys.fulltext_catalogs c ON i.fulltext_catalog_id = c.fulltext_catalog_id;
GO
PRINT '   ✅ Created: vw_FullTextIndexStatus';
GO

-- Xem trạng thái
PRINT '';
PRINT '--- Trạng thái Full-Text Index hiện tại ---';
SELECT * FROM dbo.vw_FullTextIndexStatus;
GO

-- ===========================================
-- KẾT QUẢ
-- ===========================================
PRINT '';
PRINT '=========================================';
PRINT '✅ Hoàn thành Full-Text Search!';
PRINT '';
PRINT '📝 Cách sử dụng trong code C#:';
PRINT '';
PRINT '  // Tìm sinh viên (ADO.NET):';
PRINT '  var cmd = new SqlCommand("dbo.sp_SearchStudents");';
PRINT '  cmd.CommandType = CommandType.StoredProcedure;';
PRINT '  cmd.Parameters.AddWithValue("@SearchText", "Nguyễn Văn");';
PRINT '  cmd.Parameters.AddWithValue("@PageIndex", 1);';
PRINT '  cmd.Parameters.AddWithValue("@PageSize", 20);';
PRINT '';
PRINT '  // Hoặc dùng CONTAINS trực tiếp:';
PRINT '  SELECT * FROM students';
PRINT '  WHERE CONTAINS(full_name, ''"Nguyễn*" AND "Văn*"'');';
PRINT '';
PRINT '  // FREETEXT (tìm gần đúng, tự động tách từ):';
PRINT '  SELECT * FROM subjects';
PRINT '  WHERE FREETEXT(subject_name, ''lập trình web'');';
PRINT '';
PRINT '📦 Full-Text Index đã tạo cho:';
PRINT '  1. students (full_name, student_code, email, address)';
PRINT '  2. lecturers (full_name, lecturer_code, email)';
PRINT '  3. subjects (subject_name, subject_code, description)';
PRINT '  4. classes (class_name, class_code)';
PRINT '  5. users (username, email, full_name)';
PRINT '  6. notifications (title, content)';
PRINT '  7. grade_appeals (appeal_reason, admin_notes)';
PRINT '  8. departments (department_name, department_code)';
PRINT '  9. majors (major_name, major_code)';
PRINT '  10. faculties (faculty_name, faculty_code)';
PRINT '=========================================';
GO

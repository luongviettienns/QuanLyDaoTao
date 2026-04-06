USE EducationManagement;
GO

/*
    Seed 4 tai khoan mau cho 4 vai tro:
    - admin.demo / Student@123
    - advisor.demo / Student@123
    - lecturer.demo / Student@123
    - student.demo / Student@123

    Ghi chu:
    - Script chay an toan nhieu lan.
    - Password hash ben duoi la bcrypt hash cua "Student@123".
*/

DECLARE @DefaultPasswordHash VARCHAR(255) = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lSWE0cQ5pZri';
DECLARE @SeedBy VARCHAR(50) = 'seed-sample-users';

IF NOT EXISTS (
    SELECT 1
    FROM dbo.roles
    WHERE role_id = 'ROLE_ADMIN'
)
BEGIN
    INSERT INTO dbo.roles (
        role_id,
        role_name,
        description,
        is_active,
        created_at,
        created_by
    )
    VALUES (
        'ROLE_ADMIN',
        N'Admin',
        N'Quan tri he thong',
        1,
        GETDATE(),
        @SeedBy
    );
END
ELSE
BEGIN
    UPDATE dbo.roles
    SET role_name = N'Admin',
        description = N'Quan tri he thong',
        is_active = 1,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = GETDATE(),
        updated_by = @SeedBy
    WHERE role_id = 'ROLE_ADMIN';
END;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.roles
    WHERE role_id = 'ROLE_ADVISOR'
)
BEGIN
    INSERT INTO dbo.roles (
        role_id,
        role_name,
        description,
        is_active,
        created_at,
        created_by
    )
    VALUES (
        'ROLE_ADVISOR',
        N'Advisor',
        N'Co van hoc tap',
        1,
        GETDATE(),
        @SeedBy
    );
END
ELSE
BEGIN
    UPDATE dbo.roles
    SET role_name = N'Advisor',
        description = N'Co van hoc tap',
        is_active = 1,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = GETDATE(),
        updated_by = @SeedBy
    WHERE role_id = 'ROLE_ADVISOR';
END;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.roles
    WHERE role_id = 'ROLE_LECTURER'
)
BEGIN
    INSERT INTO dbo.roles (
        role_id,
        role_name,
        description,
        is_active,
        created_at,
        created_by
    )
    VALUES (
        'ROLE_LECTURER',
        N'Lecturer',
        N'Giang vien',
        1,
        GETDATE(),
        @SeedBy
    );
END
ELSE
BEGIN
    UPDATE dbo.roles
    SET role_name = N'Lecturer',
        description = N'Giang vien',
        is_active = 1,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = GETDATE(),
        updated_by = @SeedBy
    WHERE role_id = 'ROLE_LECTURER';
END;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.roles
    WHERE role_id = 'ROLE_STUDENT'
)
BEGIN
    INSERT INTO dbo.roles (
        role_id,
        role_name,
        description,
        is_active,
        created_at,
        created_by
    )
    VALUES (
        'ROLE_STUDENT',
        N'Student',
        N'Sinh vien',
        1,
        GETDATE(),
        @SeedBy
    );
END
ELSE
BEGIN
    UPDATE dbo.roles
    SET role_name = N'Student',
        description = N'Sinh vien',
        is_active = 1,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = GETDATE(),
        updated_by = @SeedBy
    WHERE role_id = 'ROLE_STUDENT';
END;

IF EXISTS (SELECT 1 FROM dbo.users WHERE user_id = 'USR-ADMIN-DEMO')
BEGIN
    UPDATE dbo.users
    SET username = 'admin.demo',
        password_hash = @DefaultPasswordHash,
        email = 'admin.demo@edu.local',
        phone = '0900000001',
        full_name = N'Quan tri vien Demo',
        avatar_url = '/avatars/default.png',
        role_id = 'ROLE_ADMIN',
        is_active = 1,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = GETDATE(),
        updated_by = @SeedBy
    WHERE user_id = 'USR-ADMIN-DEMO';
END
ELSE
BEGIN
    INSERT INTO dbo.users (
        user_id,
        username,
        password_hash,
        email,
        phone,
        full_name,
        avatar_url,
        role_id,
        is_active,
        created_at,
        created_by
    )
    VALUES (
        'USR-ADMIN-DEMO',
        'admin.demo',
        @DefaultPasswordHash,
        'admin.demo@edu.local',
        '0900000001',
        N'Quan tri vien Demo',
        '/avatars/default.png',
        'ROLE_ADMIN',
        1,
        GETDATE(),
        @SeedBy
    );
END;

IF EXISTS (SELECT 1 FROM dbo.users WHERE user_id = 'USR-ADVISOR-DEMO')
BEGIN
    UPDATE dbo.users
    SET username = 'advisor.demo',
        password_hash = @DefaultPasswordHash,
        email = 'advisor.demo@edu.local',
        phone = '0900000002',
        full_name = N'Co van hoc tap Demo',
        avatar_url = '/avatars/default.png',
        role_id = 'ROLE_ADVISOR',
        is_active = 1,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = GETDATE(),
        updated_by = @SeedBy
    WHERE user_id = 'USR-ADVISOR-DEMO';
END
ELSE
BEGIN
    INSERT INTO dbo.users (
        user_id,
        username,
        password_hash,
        email,
        phone,
        full_name,
        avatar_url,
        role_id,
        is_active,
        created_at,
        created_by
    )
    VALUES (
        'USR-ADVISOR-DEMO',
        'advisor.demo',
        @DefaultPasswordHash,
        'advisor.demo@edu.local',
        '0900000002',
        N'Co van hoc tap Demo',
        '/avatars/default.png',
        'ROLE_ADVISOR',
        1,
        GETDATE(),
        @SeedBy
    );
END;

IF EXISTS (SELECT 1 FROM dbo.users WHERE user_id = 'USR-LECTURER-DEMO')
BEGIN
    UPDATE dbo.users
    SET username = 'lecturer.demo',
        password_hash = @DefaultPasswordHash,
        email = 'lecturer.demo@edu.local',
        phone = '0900000003',
        full_name = N'Giang vien Demo',
        avatar_url = '/avatars/default.png',
        role_id = 'ROLE_LECTURER',
        is_active = 1,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = GETDATE(),
        updated_by = @SeedBy
    WHERE user_id = 'USR-LECTURER-DEMO';
END
ELSE
BEGIN
    INSERT INTO dbo.users (
        user_id,
        username,
        password_hash,
        email,
        phone,
        full_name,
        avatar_url,
        role_id,
        is_active,
        created_at,
        created_by
    )
    VALUES (
        'USR-LECTURER-DEMO',
        'lecturer.demo',
        @DefaultPasswordHash,
        'lecturer.demo@edu.local',
        '0900000003',
        N'Giang vien Demo',
        '/avatars/default.png',
        'ROLE_LECTURER',
        1,
        GETDATE(),
        @SeedBy
    );
END;

IF EXISTS (SELECT 1 FROM dbo.users WHERE user_id = 'USR-STUDENT-DEMO')
BEGIN
    UPDATE dbo.users
    SET username = 'student.demo',
        password_hash = @DefaultPasswordHash,
        email = 'student.demo@edu.local',
        phone = '0900000004',
        full_name = N'Sinh vien Demo',
        avatar_url = '/avatars/default.png',
        role_id = 'ROLE_STUDENT',
        is_active = 1,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = GETDATE(),
        updated_by = @SeedBy
    WHERE user_id = 'USR-STUDENT-DEMO';
END
ELSE
BEGIN
    INSERT INTO dbo.users (
        user_id,
        username,
        password_hash,
        email,
        phone,
        full_name,
        avatar_url,
        role_id,
        is_active,
        created_at,
        created_by
    )
    VALUES (
        'USR-STUDENT-DEMO',
        'student.demo',
        @DefaultPasswordHash,
        'student.demo@edu.local',
        '0900000004',
        N'Sinh vien Demo',
        '/avatars/default.png',
        'ROLE_STUDENT',
        1,
        GETDATE(),
        @SeedBy
    );
END;

PRINT 'Seed sample users completed successfully.';
PRINT 'admin.demo / Student@123';
PRINT 'advisor.demo / Student@123';
PRINT 'lecturer.demo / Student@123';
PRINT 'student.demo / Student@123';

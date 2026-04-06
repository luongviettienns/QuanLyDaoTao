-- ===========================================
-- 🎓 HỆ THỐNG QUẢN LÝ ĐIỂM DANH SINH VIÊN
-- 📋 File 9/??: KIỂM TRA SOFT DELETE TẤT CẢ BẢNG
-- ===========================================

USE EducationManagement;
GO

SET NOCOUNT ON;
PRINT '=========================================';
PRINT 'KIỂM TRA SOFT DELETE TRÊN TẤT CẢ BẢNG';
PRINT '=========================================';
PRINT '';

-- ===========================================
-- Bước 1: Lấy danh sách tất cả bảng user-defined
-- ===========================================
PRINT 'Bước 1: Liệt kê tất cả bảng...';
PRINT '';

DECLARE @SchemaName NVARCHAR(128);
DECLARE @TableName NVARCHAR(128);
DECLARE @FullName NVARCHAR(256);
DECLARE @SQL NVARCHAR(MAX);

-- Bảng tạm lưu kết quả
IF OBJECT_ID('tempdb..#SoftDeleteCheck') IS NOT NULL DROP TABLE #SoftDeleteCheck;
CREATE TABLE #SoftDeleteCheck (
    TableName       NVARCHAR(128),
    Has_deleted_at  BIT DEFAULT 0,
    Has_deleted_by  BIT DEFAULT 0,
    Has_is_active   BIT DEFAULT 0,
    SoftDeleteMode  NVARCHAR(50),  -- 'FULL', 'PARTIAL', 'NONE'
    MissingColumns  NVARCHAR(500) DEFAULT ''
);

-- Cursor để duyệt tất cả bảng
DECLARE table_cursor CURSOR FOR
SELECT
    s.name AS SchemaName,
    t.name AS TableName
FROM sys.tables t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.is_ms_shipped = 0
ORDER BY s.name, t.name;

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @SchemaName, @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @FullName = QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName);

    -- Check xem bảng có cột nào trong 3 cột soft delete không
    IF EXISTS (
        SELECT 1 FROM sys.columns c
        INNER JOIN sys.tables t2 ON c.object_id = t2.object_id
        INNER JOIN sys.schemas s2 ON t2.schema_id = s2.schema_id
        WHERE s2.name = @SchemaName AND t2.name = @TableName
        AND c.name IN ('deleted_at', 'deleted_by', 'is_active')
    )
    BEGIN
        -- Kiểm tra từng cột
        DECLARE @HasDeletedAt BIT = 0;
        DECLARE @HasDeletedBy BIT = 0;
        DECLARE @HasIsActive BIT = 0;

        IF EXISTS (
            SELECT 1 FROM sys.columns c
            INNER JOIN sys.tables t2 ON c.object_id = t2.object_id
            INNER JOIN sys.schemas s2 ON t2.schema_id = s2.schema_id
            WHERE s2.name = @SchemaName AND t2.name = @TableName AND c.name = 'deleted_at'
        )
            SET @HasDeletedAt = 1;

        IF EXISTS (
            SELECT 1 FROM sys.columns c
            INNER JOIN sys.tables t2 ON c.object_id = t2.object_id
            INNER JOIN sys.schemas s2 ON t2.schema_id = s2.schema_id
            WHERE s2.name = @SchemaName AND t2.name = @TableName AND c.name = 'deleted_by'
        )
            SET @HasDeletedBy = 1;

        IF EXISTS (
            SELECT 1 FROM sys.columns c
            INNER JOIN sys.tables t2 ON c.object_id = t2.object_id
            INNER JOIN sys.schemas s2 ON t2.schema_id = s2.schema_id
            WHERE s2.name = @SchemaName AND t2.name = @TableName AND c.name = 'is_active'
        )
            SET @HasIsActive = 1;

        DECLARE @Mode NVARCHAR(50);
        DECLARE @Missing NVARCHAR(500) = '';

        IF @HasDeletedAt = 1 AND @HasDeletedBy = 1 AND @HasIsActive = 1
        BEGIN
            SET @Mode = 'FULL ✅';
        END
        ELSE IF @HasDeletedAt = 1
        BEGIN
            SET @Mode = 'PARTIAL ⚠️';
            IF @HasDeletedBy = 0 SET @Missing = @Missing + 'deleted_by, ';
            IF @HasIsActive = 0 SET @Missing = @Missing + 'is_active, ';
        END
        ELSE
        BEGIN
            SET @Mode = 'NONE ❌';
            SET @Missing = 'Thiếu hoàn toàn soft delete!';
        END

        INSERT INTO #SoftDeleteCheck (TableName, Has_deleted_at, Has_deleted_by, Has_is_active, SoftDeleteMode, MissingColumns)
        VALUES (@TableName, @HasDeletedAt, @HasDeletedBy, @HasIsActive, @Mode, LEFT(@Missing, LEN(@Missing)-1));
    END
    ELSE
    BEGIN
        -- Bảng không có cột soft delete nào
        INSERT INTO #SoftDeleteCheck (TableName, Has_deleted_at, Has_deleted_by, Has_is_active, SoftDeleteMode, MissingColumns)
        VALUES (@TableName, 0, 0, 0, 'NONE ❌', 'Thiếu hoàn toàn soft delete!');
    END

    FETCH NEXT FROM table_cursor INTO @SchemaName, @TableName;
END

CLOSE table_cursor;
DEALLOCATE table_cursor;

-- ===========================================
-- Bước 2: Hiển thị kết quả phân loại
-- ===========================================
PRINT '';
PRINT '📊 KẾT QUẢ KIỂM TRA:';
PRINT '';
PRINT '--- BẢNG CÓ SOFT DELETE ĐẦY ĐỦ (FULL) ---';
SELECT TableName AS [Bảng], SoftDeleteMode AS [Trạng thái]
FROM #SoftDeleteCheck
WHERE SoftDeleteMode = 'FULL ✅'
ORDER BY TableName;

PRINT '';
PRINT '--- BẢNG CÓ SOFT DELETE PARTIAL (THIẾU CỘT) ---';
SELECT TableName AS [Bảng], SoftDeleteMode AS [Trạng thái], MissingColumns AS [Thiếu cột]
FROM #SoftDeleteCheck
WHERE SoftDeleteMode = 'PARTIAL ⚠️'
ORDER BY TableName;

PRINT '';
PRINT '--- BẢNG KHÔNG CÓ SOFT DELETE (CẦN BỔ SUNG) ---';
SELECT TableName AS [Bảng], SoftDeleteMode AS [Trạng thái], MissingColumns AS [Vấn đề]
FROM #SoftDeleteCheck
WHERE SoftDeleteMode = 'NONE ❌'
ORDER BY TableName;

-- ===========================================
-- Bước 3: Thống kê tổng quan
-- ===========================================
PRINT '';
PRINT '=========================================';
PRINT '📈 THỐNG KÊ TỔNG QUAN:';
PRINT '';

DECLARE @TotalTables INT;
DECLARE @FullCount INT;
DECLARE @PartialCount INT;
DECLARE @NoneCount INT;

SELECT @TotalTables = COUNT(*) FROM #SoftDeleteCheck;
SELECT @FullCount = COUNT(*) FROM #SoftDeleteCheck WHERE SoftDeleteMode = 'FULL ✅';
SELECT @PartialCount = COUNT(*) FROM #SoftDeleteCheck WHERE SoftDeleteMode = 'PARTIAL ⚠️';
SELECT @NoneCount = COUNT(*) FROM #SoftDeleteCheck WHERE SoftDeleteMode = 'NONE ❌';

PRINT 'Tổng số bảng:              ' + CAST(@TotalTables AS NVARCHAR(10));
PRINT 'Full soft delete (đầy đủ):  ' + CAST(@FullCount AS NVARCHAR(10)) + ' (' + CAST(CAST(@FullCount * 100.0 / NULLIF(@TotalTables,0) AS DECIMAL(5,1)) AS NVARCHAR(10)) + '%)';
PRINT 'Partial soft delete (thiếu):' + CAST(@PartialCount AS NVARCHAR(10)) + ' (' + CAST(CAST(@PartialCount * 100.0 / NULLIF(@TotalTables,0) AS DECIMAL(5,1)) AS NVARCHAR(10)) + '%)';
PRINT 'Không có soft delete:       ' + CAST(@NoneCount AS NVARCHAR(10)) + ' (' + CAST(CAST(@NoneCount * 100.0 / NULLIF(@TotalTables,0) AS DECIMAL(5,1)) AS NVARCHAR(10)) + '%)';

-- ===========================================
-- Bước 4: Script ALTER TABLE cho bảng thiếu soft delete
-- ===========================================
PRINT '';
PRINT '=========================================';
PRINT '📝 SCRIPTS CẦN CHẠY ĐỂ BỔ SUNG SOFT DELETE:';
PRINT '=========================================';

DECLARE @TablesNoneCursor CURSOR FOR
SELECT TableName FROM #SoftDeleteCheck WHERE SoftDeleteMode <> 'FULL ✅' ORDER BY TableName;

OPEN @TablesNoneCursor;
FETCH NEXT FROM @TablesNoneCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '';
    PRINT '-- ▶ Bảng: ' + @TableName;
    PRINT 'ALTER TABLE dbo.' + @TableName + ' ADD deleted_at DATETIME NULL;';
    PRINT 'ALTER TABLE dbo.' + @TableName + ' ADD deleted_by VARCHAR(50) NULL;';
    PRINT 'ALTER TABLE dbo.' + @TableName + ' ADD is_active BIT NOT NULL DEFAULT 1;';

    FETCH NEXT FROM @TablesNoneCursor INTO @TableName;
END

CLOSE @TablesNoneCursor;
DEALLOCATE @TablesNoneCursor;

PRINT '';
PRINT '=========================================';
PRINT '✅ Hoàn thành kiểm tra soft delete!';
PRINT '=========================================';

DROP TABLE #SoftDeleteCheck;
GO

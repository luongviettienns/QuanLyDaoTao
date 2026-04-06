-- ===========================================
-- 🎓 HỆ THỐNG QUẢN LÝ ĐIỂM DANH SINH VIÊN
-- 📋 File 10/??: BACKUP & RESTORE SCRIPTS
-- ===========================================

USE master;
GO

SET NOCOUNT ON;
PRINT '=========================================';
PRINT 'BACKUP & RESTORE DATABASE SCRIPTS';
PRINT '=========================================';
GO

-- ===========================================
-- 📦 PHẦN 1: BACKUP
-- ===========================================

-- ===========================================
-- 1A. FULL BACKUP (Backup đầy đủ)
-- ===========================================
/*
-- Chạy từng script riêng (bỏ comment khi cần)

-- Khai báo biến
DECLARE @DBName NVARCHAR(128) = 'EducationManagement';
DECLARE @BackupPath NVARCHAR(260);
DECLARE @BackupFile NVARCHAR(260);
DECLARE @BackupDate NVARCHAR(14);
DECLARE @SQL NVARCHAR(MAX);

-- Tự động tạo đường dẫn theo ngày
SET @BackupDate = CONVERT(NVARCHAR(8), GETDATE(), 112) + '_' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 108), ':', '');
SET @BackupPath = 'D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\';
SET @BackupFile = @BackupPath + @DBName + '_FULL_' + @BackupDate + '.bak';

-- Tạo thư mục nếu chưa có (dùng xp_cmdshell)
EXEC xp_create_subdir @BackupPath;

-- Backup Full
BACKUP DATABASE @DBName
TO DISK = @BackupFile
WITH
    NAME = @DBName + '-Full Backup',
    DESCRIPTION = 'Full backup of ' + @DBName + ' - ' + CONVERT(NVARCHAR(20), GETDATE(), 120),
    COMPRESSION,
    STATS = 10;

PRINT '✅ Full backup hoàn thành: ' + @BackupFile;
*/

-- ===========================================
-- 1B. FULL BACKUP - Script cố định (chạy trực tiếp)
-- ===========================================
PRINT '';
PRINT '📦 BACKUP SCRIPTS (copy và chạy riêng)';
PRINT '';

PRINT '--- FULL BACKUP ---';
PRINT 'DECLARE @DBName NVARCHAR(128) = ''EducationManagement'';';
PRINT 'DECLARE @BackupPath NVARCHAR(260) = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\';';
PRINT 'DECLARE @BackupFile NVARCHAR(260);';
PRINT 'DECLARE @BackupDate NVARCHAR(14);';
PRINT '';
PRINT 'SET @BackupDate = CONVERT(NVARCHAR(8), GETDATE(), 112) + ''_'' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 108), '':'', '''');';
PRINT 'SET @BackupFile = @BackupPath + @DBName + ''_FULL_'' + @BackupDate + ''.bak'';';
PRINT '';
PRINT 'EXEC xp_create_subdir @BackupPath;';
PRINT '';
PRINT 'BACKUP DATABASE @DBName';
PRINT 'TO DISK = @BackupFile';
PRINT 'WITH NAME = @DBName + ''-Full Backup'', COMPRESSION, STATS = 10;';
PRINT '';
PRINT 'PRINT ''✅ Full backup: '' + @BackupFile;';
GO

-- ===========================================
-- 1C. DIFFERENTIAL BACKUP (Backup vi sai - nhanh hơn)
-- ===========================================
PRINT '';
PRINT '--- DIFFERENTIAL BACKUP ---';
PRINT 'DECLARE @DBName NVARCHAR(128) = ''EducationManagement'';';
PRINT 'DECLARE @BackupPath NVARCHAR(260) = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\';';
PRINT 'DECLARE @BackupFile NVARCHAR(260);';
PRINT 'DECLARE @BackupDate NVARCHAR(14);';
PRINT '';
PRINT 'SET @BackupDate = CONVERT(NVARCHAR(8), GETDATE(), 112) + ''_'' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 108), '':'', '''');';
PRINT 'SET @BackupFile = @BackupPath + @DBName + ''_DIFF_'' + @BackupDate + ''.bak'';';
PRINT '';
PRINT 'EXEC xp_create_subdir @BackupPath;';
PRINT '';
PRINT 'BACKUP DATABASE @DBName';
PRINT 'TO DISK = @BackupFile';
PRINT 'WITH DIFFERENTIAL, NAME = @DBName + ''-Differential Backup'', COMPRESSION, STATS = 10;';
PRINT '';
PRINT 'PRINT ''✅ Differential backup: '' + @BackupFile;';
GO

-- ===========================================
-- 1D. TRANSACTION LOG BACKUP (Backup log - cho full recovery mode)
-- ===========================================
PRINT '';
PRINT '--- TRANSACTION LOG BACKUP ---';
PRINT 'DECLARE @DBName NVARCHAR(128) = ''EducationManagement'';';
PRINT 'DECLARE @BackupPath NVARCHAR(260) = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\Logs\';';
PRINT 'DECLARE @BackupFile NVARCHAR(260);';
PRINT 'DECLARE @BackupDate NVARCHAR(14);';
PRINT '';
PRINT 'SET @BackupDate = CONVERT(NVARCHAR(8), GETDATE(), 112) + ''_'' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 108), '':'', '''');';
PRINT 'SET @BackupFile = @BackupPath + @DBName + ''_LOG_'' + @BackupDate + ''.trn'';';
PRINT '';
PRINT 'EXEC xp_create_subdir @BackupPath;';
PRINT '';
PRINT 'BACKUP LOG @DBName';
PRINT 'TO DISK = @BackupFile';
PRINT 'WITH COMPRESSION, STATS = 10;';
PRINT '';
PRINT 'PRINT ''✅ Log backup: '' + @BackupFile;';
GO

-- ===========================================
-- 1E. FULL BACKUP SCRIPT CỐ ĐỊNH (không dùng biến - copy paste chạy ngay)
-- ===========================================
PRINT '';
PRINT '--- FULL BACKUP (cố định, chạy trực tiếp) ---';
PRINT '';
PRINT 'USE master;';
PRINT 'GO';
PRINT '';
PRINT 'DECLARE @BackupPath NVARCHAR(260) = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups'';';
PRINT 'EXEC xp_create_subdir @BackupPath;';
PRINT 'EXEC xp_create_subdir @BackupPath + ''\Logs'';';
PRINT 'GO';
PRINT '';
PRINT 'BACKUP DATABASE EducationManagement';
PRINT 'TO DISK = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\EducationManagement_FULL_20260402_120000.bak''';
PRINT 'WITH NAME = ''EducationManagement-Full Backup'', COMPRESSION, STATS = 10;';
PRINT 'GO';
GO

-- ===========================================
-- 📥 PHẦN 2: RESTORE
-- ===========================================

PRINT '';
PRINT '=========================================';
PRINT '📥 RESTORE SCRIPTS';
PRINT '=========================================';

-- ===========================================
-- 2A. RESTORE FULL BACKUP
-- ===========================================
PRINT '';
PRINT '--- RESTORE FULL BACKUP ---';
PRINT '';
PRINT 'USE master;';
PRINT 'GO';
PRINT '';
PRINT '-- 1. Drop connections hiện tại';
PRINT 'ALTER DATABASE EducationManagement SET SINGLE_USER WITH ROLLBACK IMMEDIATE;';
PRINT 'GO';
PRINT '';
PRINT '-- 2. Restore';
PRINT 'RESTORE DATABASE EducationManagement';
PRINT 'FROM DISK = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\EducationManagement_FULL_20260402_120000.bak''';
PRINT 'WITH REPLACE, STATS = 10;';
PRINT 'GO';
PRINT '';
PRINT '-- 3. Mở lại multi-user';
PRINT 'ALTER DATABASE EducationManagement SET MULTI_USER;';
PRINT 'GO';
GO

-- ===========================================
-- 2B. RESTORE WITH MOVE (đổi đường dẫn data/log files)
-- ===========================================
PRINT '';
PRINT '--- RESTORE WITH MOVE (khi đổi server) ---';
PRINT '';
PRINT 'USE master;';
PRINT 'GO';
PRINT '';
PRINT '-- 1. Drop connections';
PRINT 'ALTER DATABASE EducationManagement SET SINGLE_USER WITH ROLLBACK IMMEDIATE;';
PRINT 'GO';
PRINT '';
PRINT '-- 2. Restore with MOVE (đổi đường dẫn file)';
PRINT 'RESTORE DATABASE EducationManagement';
PRINT 'FROM DISK = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\EducationManagement_FULL_20260402_120000.bak''';
PRINT 'WITH REPLACE,';
PRINT '   MOVE ''EducationManagement'' TO ''D:\SQLServer\Data\EducationManagement.mdf'',';
PRINT '   MOVE ''EducationManagement_log'' TO ''D:\SQLServer\Logs\EducationManagement_log.ldf'',';
PRINT '   STATS = 10;';
PRINT 'GO';
PRINT '';
PRINT '-- 3. Mở lại multi-user';
PRINT 'ALTER DATABASE EducationManagement SET MULTI_USER;';
PRINT 'GO';
GO

-- ===========================================
-- 2C. CHECK BACKUP HISTORY (xem lịch sử backup)
-- ===========================================
PRINT '';
PRINT '--- CHECK BACKUP HISTORY ---';
PRINT '';
PRINT 'USE msdb;';
PRINT 'GO';
PRINT '';
PRINT 'SELECT TOP 20';
PRINT '    bs.backup_set_id,';
PRINT '    bs.database_name,';
PRINT '    bs.backup_start_date,';
PRINT '    bs.backup_finish_date,';
PRINT '    CAST(bs.backup_size / 1024 / 1024 AS DECIMAL(10,2)) AS backup_size_MB,';
PRINT '    CASE bs.type';
PRINT '        WHEN ''D'' THEN ''Full''';
PRINT '        WHEN ''I'' THEN ''Differential''';
PRINT '        WHEN ''L'' THEN ''Log''';
PRINT '    END AS backup_type,';
PRINT '    bmf.physical_device_name';
PRINT 'FROM backupset bs';
PRINT 'INNER JOIN backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id';
PRINT 'WHERE bs.database_name = ''EducationManagement''';
PRINT 'ORDER BY bs.backup_start_date DESC;';
PRINT 'GO';
GO

-- ===========================================
-- 2D. VERIFY BACKUP (kiểm tra tính toàn vẹn backup)
-- ===========================================
PRINT '';
PRINT '--- VERIFY BACKUP ---';
PRINT '';
PRINT 'RESTORE VERIFYONLY';
PRINT 'FROM DISK = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\EducationManagement_FULL_20260402_120000.bak'';';
PRINT 'GO';
GO

-- ===========================================
-- 2E. RESTORE POINT-IN-TIME (phục hồi đến thời điểm cụ thể)
-- ===========================================
PRINT '';
PRINT '--- RESTORE POINT-IN-TIME ---';
PRINT '';
PRINT 'USE master;';
PRINT 'GO';
PRINT '';
PRINT 'ALTER DATABASE EducationManagement SET SINGLE_USER WITH ROLLBACK IMMEDIATE;';
PRINT 'GO';
PRINT '';
PRINT '-- Phục hồi Full + Log đến thời điểm cụ thể';
PRINT 'RESTORE DATABASE EducationManagement';
PRINT 'FROM DISK = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\EducationManagement_FULL_20260402_120000.bak''';
PRINT 'WITH REPLACE, NORECOVERY;';
PRINT '';
PRINT 'RESTORE LOG EducationManagement';
PRINT 'FROM DISK = ''D:\Khanh\BTL API\EducationManagement\student-attendance-system\SQL\Backups\Logs\EducationManagement_LOG_20260402_150000.trn''';
PRINT 'WITH RECOVERY, STOPAT = ''2026-04-02T14:30:00'';';
PRINT 'GO';
PRINT '';
PRINT 'ALTER DATABASE EducationManagement SET MULTI_USER;';
PRINT 'GO';
GO

-- ===========================================
-- 📋 PHẦN 3: THÔNG TIN DATABASE HIỆN TẠI
-- ===========================================

PRINT '';
PRINT '=========================================';
PRINT '📋 THÔNG TIN DATABASE HIỆN TẠI';
PRINT '=========================================';

PRINT '';
PRINT '--- File paths của database hiện tại ---';
PRINT '';
PRINT 'USE EducationManagement;';
PRINT 'GO';
PRINT '';
PRINT 'SELECT';
PRINT '    name AS logical_name,';
PRINT '    physical_name AS file_path,';
PRINT '    CAST(size * 8.0 / 1024 AS DECIMAL(10,2)) AS size_MB,';
PRINT '    type_desc';
PRINT 'FROM sys.database_files;';
PRINT 'GO';
PRINT '';
PRINT '--- Dung lượng database ---';
PRINT '';
PRINT 'USE EducationManagement;';
PRINT 'GO';
PRINT '';
PRINT 'SELECT';
PRINT '    DB_NAME() AS database_name,';
PRINT '    CAST(SUM(size) * 8.0 / 1024 AS DECIMAL(10,2)) AS total_size_MB,';
PRINT '    CAST(SUM(CASE WHEN type = 0 THEN size ELSE 0 END) * 8.0 / 1024 AS DECIMAL(10,2)) AS data_size_MB,';
PRINT '    CAST(SUM(CASE WHEN type = 1 THEN size ELSE 0 END) * 8.0 / 1024 AS DECIMAL(10,2)) AS log_size_MB';
PRINT 'FROM sys.database_files;';
PRINT 'GO';

PRINT '';
PRINT '=========================================';
PRINT '✅ Hoàn thành Backup & Restore Scripts!';
PRINT '';
PRINT '📝 Hướng dẫn sử dụng:';
PRINT '  1. Chạy phần FULL BACKUP (cố định) trước';
PRINT '  2. Tạo thư mục Backups\Logs trong SQL\';
PRINT '  3. Nên backup mỗi ngày (schedule job)';
PRINT '  4. Giữ lại ít nhất 7 bản backup gần nhất';
PRINT '  5. Test restore trên server khác trước khi deploy';
PRINT '=========================================';
GO

using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EducationManagement.Common.Models;

namespace EducationManagement.DAL.Repositories
{
    public class ClassRepository
    {
        private readonly string _connectionString;
        private const string ClassSelect = @"
            SELECT
                c.class_id, c.class_code, c.class_name, c.subject_id, c.lecturer_id,
                c.semester, c.academic_year_id, c.school_year_id, c.max_students, c.current_enrollment,
                c.is_active, c.created_at, c.created_by, c.updated_at, c.updated_by, c.deleted_at, c.deleted_by,
                s.subject_name, s.credits,
                l.full_name AS lecturer_name,
                ay.year_name
            FROM dbo.classes c
            LEFT JOIN dbo.subjects s ON c.subject_id = s.subject_id
            LEFT JOIN dbo.lecturers l ON c.lecturer_id = l.lecturer_id
            LEFT JOIN dbo.academic_years ay ON c.academic_year_id = ay.academic_year_id
            WHERE c.deleted_at IS NULL";

        public ClassRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        /// <summary>
        /// Lấy tất cả classes - KHÔNG PAGINATION
        /// </summary>
        public async Task<List<Class>> GetAllAsync()
        {
            var classes = new List<Class>();

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                ClassSelect + @"
                ORDER BY c.created_at DESC, c.class_code");

            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    classes.Add(MapToClass(row));
                }
            }

            return classes;
        }

        /// <summary>
        /// Lấy tất cả classes với pagination
        /// </summary>
        public async Task<(List<Class> items, int totalCount)> GetAllPagedAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? subjectId = null,
            string? lecturerId = null,
            string? academicYearId = null)
        {
            const string countQuery = @"
                SELECT COUNT(*)
                FROM dbo.classes c
                WHERE c.deleted_at IS NULL
                  AND (@Search IS NULL OR c.class_code LIKE '%' + @Search + '%' OR c.class_name LIKE '%' + @Search + '%')
                  AND (@SubjectId IS NULL OR c.subject_id = @SubjectId)
                  AND (@LecturerId IS NULL OR c.lecturer_id = @LecturerId)
                  AND (@AcademicYearId IS NULL OR c.academic_year_id = @AcademicYearId)";
            var totalCount = Convert.ToInt32(
                await DatabaseHelper.ExecuteRawScalarAsync(
                    _connectionString,
                    countQuery,
                    new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                    new SqlParameter("@SubjectId", (object?)subjectId ?? DBNull.Value),
                    new SqlParameter("@LecturerId", (object?)lecturerId ?? DBNull.Value),
                    new SqlParameter("@AcademicYearId", (object?)academicYearId ?? DBNull.Value)) ?? 0);

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                ClassSelect + @"
                  AND (@Search IS NULL OR c.class_code LIKE '%' + @Search + '%' OR c.class_name LIKE '%' + @Search + '%')
                  AND (@SubjectId IS NULL OR c.subject_id = @SubjectId)
                  AND (@LecturerId IS NULL OR c.lecturer_id = @LecturerId)
                  AND (@AcademicYearId IS NULL OR c.academic_year_id = @AcademicYearId)
                ORDER BY c.created_at DESC, c.class_code
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@SubjectId", (object?)subjectId ?? DBNull.Value),
                new SqlParameter("@LecturerId", (object?)lecturerId ?? DBNull.Value),
                new SqlParameter("@AcademicYearId", (object?)academicYearId ?? DBNull.Value),
                new SqlParameter("@Offset", Math.Max(page - 1, 0) * pageSize),
                new SqlParameter("@PageSize", pageSize));

            var items = new List<Class>();
            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    items.Add(MapToClass(row));
                }
            }

            return (items, totalCount);
        }

        /// <summary>
        /// Lấy class theo ID
        /// </summary>
        public async Task<Class?> GetByIdAsync(string classId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                ClassSelect + @"
                  AND c.class_id = @ClassId",
                new SqlParameter("@ClassId", classId));

            if (dt.Rows.Count == 0)
                return null;

            return MapToClass(dt.Rows[0]);
        }

        /// <summary>
        /// Tạo class mới
        /// </summary>
        public async Task<string> CreateAsync(string classId, string classCode, string className,
            string subjectId, string lecturerId, string semester, string academicYearId,
            int maxStudents, string createdBy)
        {
            const string query = @"
                INSERT INTO dbo.classes
                (
                    class_id, class_code, class_name, subject_id, lecturer_id, semester,
                    academic_year_id, max_students, current_enrollment, is_active, created_at, created_by
                )
                VALUES
                (
                    @ClassId, @ClassCode, @ClassName, @SubjectId, @LecturerId, @Semester,
                    @AcademicYearId, @MaxStudents, 0, 1, GETDATE(), @CreatedBy
                )";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@ClassId", classId),
                new SqlParameter("@ClassCode", classCode),
                new SqlParameter("@ClassName", className),
                new SqlParameter("@SubjectId", subjectId),
                new SqlParameter("@LecturerId", lecturerId),
                new SqlParameter("@Semester", semester),
                new SqlParameter("@AcademicYearId", academicYearId),
                new SqlParameter("@MaxStudents", maxStudents),
                new SqlParameter("@CreatedBy", createdBy));
            return classId;
        }

        /// <summary>
        /// Cập nhật class
        /// </summary>
        public async Task UpdateAsync(string classId, string classCode, string className,
            string subjectId, string lecturerId, string semester, string academicYearId,
            int maxStudents, string updatedBy)
        {
            const string query = @"
                UPDATE dbo.classes
                SET class_code = @ClassCode,
                    class_name = @ClassName,
                    subject_id = @SubjectId,
                    lecturer_id = @LecturerId,
                    semester = @Semester,
                    academic_year_id = @AcademicYearId,
                    max_students = @MaxStudents,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE class_id = @ClassId
                  AND deleted_at IS NULL";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@ClassId", classId),
                new SqlParameter("@ClassCode", classCode),
                new SqlParameter("@ClassName", className),
                new SqlParameter("@SubjectId", subjectId),
                new SqlParameter("@LecturerId", lecturerId),
                new SqlParameter("@Semester", semester),
                new SqlParameter("@AcademicYearId", academicYearId),
                new SqlParameter("@MaxStudents", maxStudents),
                new SqlParameter("@UpdatedBy", updatedBy));
        }

        /// <summary>
        /// Xóa class (soft delete)
        /// </summary>
        public async Task DeleteAsync(string classId, string deletedBy)
        {
            const string query = @"
                UPDATE dbo.classes
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy,
                    is_active = 0
                WHERE class_id = @ClassId
                  AND deleted_at IS NULL";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@ClassId", classId),
                new SqlParameter("@DeletedBy", deletedBy));
        }

        public async Task UpdateIsActiveAsync(string classId, bool isActive, string updatedBy)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"UPDATE dbo.classes 
                                SET is_active = @isActive, 
                                    updated_at = GETDATE(), 
                                    updated_by = @updatedBy
                                WHERE class_id = @classId AND deleted_at IS NULL";
            cmd.Parameters.AddWithValue("@classId", classId);
            cmd.Parameters.AddWithValue("@isActive", isActive);
            cmd.Parameters.AddWithValue("@updatedBy", updatedBy);
            await cmd.ExecuteNonQueryAsync();
        }

        /// <summary>
        /// Lấy classes theo lecturer ID
        /// </summary>
        public async Task<List<Class>> GetByLecturerIdAsync(string lecturerId)
        {
            var classes = new List<Class>();
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                ClassSelect + @"
                  AND c.lecturer_id = @LecturerId
                ORDER BY c.created_at DESC, c.class_code",
                new SqlParameter("@LecturerId", lecturerId));

            foreach (DataRow row in dt.Rows)
            {
                classes.Add(MapToClass(row));
            }

            return classes;
        }

        /// <summary>
        /// Lấy classes theo student ID (qua enrollments)
        /// </summary>
        public async Task<List<Class>> GetByStudentIdAsync(string studentId)
        {
            var classes = new List<Class>();
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                ClassSelect + @"
                  AND EXISTS (
                        SELECT 1
                        FROM dbo.enrollments e
                        WHERE e.class_id = c.class_id
                          AND e.student_id = @StudentId
                          AND e.deleted_at IS NULL
                    )
                ORDER BY c.created_at DESC, c.class_code",
                new SqlParameter("@StudentId", studentId));

            foreach (DataRow row in dt.Rows)
            {
                classes.Add(MapToClass(row));
            }

            return classes;
        }

        /// <summary>
        /// Map DataRow to Class model
        /// </summary>
        private static Class MapToClass(DataRow row)
        {
            return new Class
            {
                ClassId = row["class_id"].ToString()!,
                ClassCode = row["class_code"].ToString()!,
                ClassName = row["class_name"].ToString()!,
                SubjectId = row["subject_id"].ToString()!,
                LecturerId = row["lecturer_id"].ToString()!,
                Semester = row["semester"].ToString()!,
                AcademicYearId = row["academic_year_id"].ToString()!,
                SchoolYearId = row.Table.Columns.Contains("school_year_id") && row["school_year_id"] != DBNull.Value
                    ? row["school_year_id"].ToString()
                    : null,
                MaxStudents = row.Table.Columns.Contains("max_students") ? Convert.ToInt32(row["max_students"]) : 0,
                CurrentEnrollment = row.Table.Columns.Contains("current_enrollment") && row["current_enrollment"] != DBNull.Value
                    ? Convert.ToInt32(row["current_enrollment"])
                    : 0,
                SubjectName = row.Table.Columns.Contains("subject_name") ? row["subject_name"]?.ToString() : null,
                LecturerName = row.Table.Columns.Contains("lecturer_name") ? row["lecturer_name"]?.ToString() : null,
                AcademicYearName = row.Table.Columns.Contains("year_name") ? row["year_name"]?.ToString() : null,
                IsActive = row.Table.Columns.Contains("is_active") && row["is_active"] != DBNull.Value
                    ? Convert.ToBoolean(row["is_active"])
                    : true,
                CreatedAt = row.Table.Columns.Contains("created_at") && row["created_at"] != DBNull.Value 
                    ? Convert.ToDateTime(row["created_at"]) 
                    : DateTime.Now,
                CreatedBy = row.Table.Columns.Contains("created_by") ? row["created_by"]?.ToString() : null,
                UpdatedAt = row.Table.Columns.Contains("updated_at") && row["updated_at"] != DBNull.Value 
                    ? Convert.ToDateTime(row["updated_at"]) 
                    : (DateTime?)null,
                UpdatedBy = row.Table.Columns.Contains("updated_by") ? row["updated_by"]?.ToString() : null,
                DeletedAt = row.Table.Columns.Contains("deleted_at") && row["deleted_at"] != DBNull.Value
                    ? Convert.ToDateTime(row["deleted_at"])
                    : null,
                DeletedBy = row.Table.Columns.Contains("deleted_by") ? row["deleted_by"]?.ToString() : null
            };
        }

        /// <summary>
        /// Kiểm tra số lượng enrollments của class
        /// </summary>
        public async Task<int> GetEnrollmentCountAsync(string classId)
        {
            var sql = @"
                SELECT COUNT(*) 
                FROM dbo.enrollments 
                WHERE class_id = @ClassId 
                AND deleted_at IS NULL";
            
            var param = new SqlParameter("@ClassId", classId);
            var result = await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, sql, param);
            return result != null ? Convert.ToInt32(result) : 0;
        }

        /// <summary>
        /// Kiểm tra số lượng grades của class
        /// </summary>
        public async Task<int> GetGradeCountAsync(string classId)
        {
            var sql = @"
                SELECT COUNT(*) 
                FROM dbo.grades g
                INNER JOIN dbo.enrollments e ON g.enrollment_id = e.enrollment_id
                WHERE e.class_id = @ClassId 
                AND e.deleted_at IS NULL";
            
            var param = new SqlParameter("@ClassId", classId);
            var result = await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, sql, param);
            return result != null ? Convert.ToInt32(result) : 0;
        }

        /// <summary>
        /// Kiểm tra số lượng attendances của class
        /// </summary>
        public async Task<int> GetAttendanceCountAsync(string classId)
        {
            var sql = @"
                SELECT COUNT(*) 
                FROM dbo.attendances 
                WHERE class_id = @ClassId 
                AND deleted_at IS NULL";
            
            var param = new SqlParameter("@ClassId", classId);
            var result = await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, sql, param);
            return result != null ? Convert.ToInt32(result) : 0;
        }

        /// <summary>
        /// Lấy current_enrollment của class
        /// </summary>
        public async Task<int> GetCurrentEnrollmentAsync(string classId)
        {
            var sql = @"
                SELECT current_enrollment 
                FROM dbo.classes 
                WHERE class_id = @ClassId 
                AND deleted_at IS NULL";
            
            var param = new SqlParameter("@ClassId", classId);
            var result = await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, sql, param);
            return result != null ? Convert.ToInt32(result) : 0;
        }
    }
}


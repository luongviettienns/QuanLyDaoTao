using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EducationManagement.Common.Models;
using EducationManagement.Common.DTOs.Organization;
using EducationManagement.DAL;

namespace EducationManagement.DAL.Repositories
{
    public class FacultyRepository
    {
        private readonly string _connectionString;
        private const string FacultySelect = @"
            SELECT
                f.faculty_id, f.faculty_code, f.faculty_name, f.description, f.is_active,
                f.created_at, f.created_by, f.updated_at, f.updated_by, f.deleted_at, f.deleted_by,
                (
                    SELECT COUNT(*) FROM dbo.departments d
                    WHERE d.faculty_id = f.faculty_id AND d.deleted_at IS NULL
                ) AS department_count,
                (
                    SELECT COUNT(*) FROM dbo.majors m
                    WHERE m.faculty_id = f.faculty_id AND m.deleted_at IS NULL
                ) AS major_count
            FROM dbo.faculties f
            WHERE f.deleted_at IS NULL";

        public FacultyRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH KHOA (ACTIVE) - KHÔNG PAGINATION
        // ============================================================
        public async Task<List<Faculty>> GetAllAsync()
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                FacultySelect + @"
                ORDER BY f.faculty_code, f.faculty_name");
            var list = new List<Faculty>();

            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                    list.Add(MapToFaculty(row));
            }

            return list;
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH KHOA VỚI PAGINATION
        // ============================================================
        public async Task<(List<Faculty> items, int totalCount)> GetAllPagedAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null)
        {
            const string countQuery = @"
                SELECT COUNT(*)
                FROM dbo.faculties f
                WHERE f.deleted_at IS NULL
                  AND (@Search IS NULL OR f.faculty_code LIKE '%' + @Search + '%' OR f.faculty_name LIKE '%' + @Search + '%')";
            var totalCount = Convert.ToInt32(
                await DatabaseHelper.ExecuteRawScalarAsync(
                    _connectionString,
                    countQuery,
                    new SqlParameter("@Search", (object?)search ?? DBNull.Value)) ?? 0);

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                FacultySelect + @"
                  AND (@Search IS NULL OR f.faculty_code LIKE '%' + @Search + '%' OR f.faculty_name LIKE '%' + @Search + '%')
                ORDER BY f.faculty_code, f.faculty_name
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@Offset", Math.Max(page - 1, 0) * pageSize),
                new SqlParameter("@PageSize", pageSize));
            var items = new List<Faculty>();
            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    items.Add(MapToFaculty(row));
                }
            }

            return (items, totalCount);
        }

        // ============================================================
        // 🔹 LẤY KHOA THEO ID
        // ============================================================
        public async Task<Faculty?> GetByIdAsync(string facultyId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                FacultySelect + @"
                  AND f.faculty_id = @FacultyId",
                new SqlParameter("@FacultyId", facultyId));

            if (dt.Rows.Count == 0)
                return null;

            return MapToFaculty(dt.Rows[0]);
        }

        // ============================================================
        // 🔹 THÊM MỚI KHOA
        // ============================================================
        public async Task AddAsync(Faculty faculty)
        {
            const string query = @"
                INSERT INTO dbo.faculties
                (
                    faculty_id, faculty_code, faculty_name, description, is_active, created_at, created_by
                )
                VALUES
                (
                    @FacultyId, @FacultyCode, @FacultyName, @Description, @IsActive, GETDATE(), @CreatedBy
                )";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@FacultyId", faculty.FacultyId ?? string.Empty),
                new SqlParameter("@FacultyCode", (object?)faculty.FacultyCode ?? DBNull.Value),
                new SqlParameter("@FacultyName", faculty.FacultyName),
                new SqlParameter("@Description", (object?)faculty.Description ?? DBNull.Value),
                new SqlParameter("@IsActive", faculty.IsActive),
                new SqlParameter("@CreatedBy", (object?)faculty.CreatedBy ?? DBNull.Value));
        }

        // ============================================================
        // 🔹 CẬP NHẬT KHOA
        // ============================================================
        public async Task<int> UpdateAsync(Faculty faculty)
        {
            const string query = @"
                UPDATE dbo.faculties
                SET faculty_code = @FacultyCode,
                    faculty_name = @FacultyName,
                    description = @Description,
                    is_active = @IsActive,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE faculty_id = @FacultyId
                  AND deleted_at IS NULL";
            return await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@FacultyId", faculty.FacultyId ?? string.Empty),
                new SqlParameter("@FacultyCode", (object?)faculty.FacultyCode ?? DBNull.Value),
                new SqlParameter("@FacultyName", faculty.FacultyName),
                new SqlParameter("@Description", (object?)faculty.Description ?? DBNull.Value),
                new SqlParameter("@IsActive", faculty.IsActive),
                new SqlParameter("@UpdatedBy", (object?)faculty.UpdatedBy ?? DBNull.Value));
        }

        // ============================================================
        // 🔹 XOÁ MỀM (SOFT DELETE)
        // ============================================================
        public async Task DeleteAsync(string facultyId)
        {
            const string query = @"
                UPDATE dbo.faculties
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy,
                    is_active = 0
                WHERE faculty_id = @FacultyId
                  AND deleted_at IS NULL";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@FacultyId", facultyId),
                new SqlParameter("@DeletedBy", "System"));
        }

        // ============================================================
        // 🔹 MAP DỮ LIỆU DataRow → Faculty
        // ============================================================
        private static Faculty MapToFaculty(DataRow row)
        {
            var faculty = new Faculty
            {
                FacultyId = row["faculty_id"].ToString()!,
                FacultyCode = row.Table.Columns.Contains("faculty_code") 
                    ? row["faculty_code"]?.ToString() ?? ""
                    : "",
                FacultyName = row["faculty_name"].ToString()!,
                Description = row.Table.Columns.Contains("description") ? row["description"]?.ToString() : null,
                IsActive = row.Table.Columns.Contains("is_active") && row["is_active"] != DBNull.Value
                    ? Convert.ToBoolean(row["is_active"])
                    : true,
                CreatedBy = row.Table.Columns.Contains("created_by") ? row["created_by"]?.ToString() : null,
                UpdatedBy = row.Table.Columns.Contains("updated_by") ? row["updated_by"]?.ToString() : null,
                DeletedBy = row.Table.Columns.Contains("deleted_by") ? row["deleted_by"]?.ToString() : null
            };

            // ✅ Gán giá trị DateTime an toàn, không lỗi kiểu
            faculty.CreatedAt = row.Table.Columns.Contains("created_at") && row["created_at"] != DBNull.Value
                ? Convert.ToDateTime(row["created_at"])
                : DateTime.Now;

            faculty.UpdatedAt = row.Table.Columns.Contains("updated_at") && row["updated_at"] != DBNull.Value
                ? Convert.ToDateTime(row["updated_at"])
                : (DateTime?)null;

            faculty.DeletedAt = row.Table.Columns.Contains("deleted_at") && row["deleted_at"] != DBNull.Value
                ? Convert.ToDateTime(row["deleted_at"])
                : null;

            // ✅ Map counts from stored procedure
            faculty.DepartmentCount = row.Table.Columns.Contains("department_count") && row["department_count"] != DBNull.Value
                ? Convert.ToInt32(row["department_count"])
                : 0;

            faculty.MajorCount = row.Table.Columns.Contains("major_count") && row["major_count"] != DBNull.Value
                ? Convert.ToInt32(row["major_count"])
                : 0;

            return faculty;
        }

        // ============================================================
        // 🔹 KIỂM TRA RÀNG BUỘC TRƯỚC KHI XÓA
        // ============================================================
        public async Task<FacultyConstraintDto> CheckConstraintsAsync(string facultyId)
        {
            var param = new SqlParameter("@FacultyId", facultyId);
            var dt = await DatabaseHelper.ExecuteQueryAsync(_connectionString, "sp_CheckFacultyConstraints", param);

            if (dt.Rows.Count == 0)
            {
                return new FacultyConstraintDto();
            }

            var row = dt.Rows[0];
            return new FacultyConstraintDto
            {
                DepartmentCount = Convert.ToInt32(row["department_count"]),
                ActiveDepartmentCount = Convert.ToInt32(row["active_department_count"]),
                MajorCount = Convert.ToInt32(row["major_count"]),
                ActiveMajorCount = Convert.ToInt32(row["active_major_count"])
            };
        }

    }
}

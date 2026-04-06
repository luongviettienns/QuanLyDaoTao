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
    public class DepartmentRepository
    {
        private readonly string _connectionString;
        private const string DepartmentSelect = @"
            SELECT
                d.department_id, d.department_code, d.department_name, d.faculty_id, d.description,
                d.created_at, d.created_by, d.updated_at, d.updated_by, d.deleted_at, d.deleted_by,
                f.faculty_name
            FROM dbo.departments d
            LEFT JOIN dbo.faculties f ON d.faculty_id = f.faculty_id
            WHERE d.deleted_at IS NULL";

        public DepartmentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH BỘ MÔN (ACTIVE) - KHÔNG PAGINATION
        // ============================================================
        public async Task<List<Department>> GetAllAsync()
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                DepartmentSelect + @"
                ORDER BY d.department_code, d.department_name");
            var list = new List<Department>();

            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                    list.Add(MapToDepartment(row));
            }

            return list;
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH BỘ MÔN VỚI PAGINATION
        // ============================================================
        public async Task<(List<Department> items, int totalCount)> GetAllPagedAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null)
        {
            const string countQuery = @"
                SELECT COUNT(*)
                FROM dbo.departments d
                WHERE d.deleted_at IS NULL
                  AND (@Search IS NULL OR d.department_code LIKE '%' + @Search + '%' OR d.department_name LIKE '%' + @Search + '%')";
            var totalCount = Convert.ToInt32(
                await DatabaseHelper.ExecuteRawScalarAsync(
                    _connectionString,
                    countQuery,
                    new SqlParameter("@Search", (object?)search ?? DBNull.Value)) ?? 0);

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                DepartmentSelect + @"
                  AND (@Search IS NULL OR d.department_code LIKE '%' + @Search + '%' OR d.department_name LIKE '%' + @Search + '%')
                ORDER BY d.department_code, d.department_name
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@Offset", Math.Max(page - 1, 0) * pageSize),
                new SqlParameter("@PageSize", pageSize));
            var items = new List<Department>();
            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    items.Add(MapToDepartment(row));
                }
            }

            return (items, totalCount);
        }

        // ============================================================
        // 🔹 LẤY BỘ MÔN THEO ID
        // ============================================================
        public async Task<Department?> GetByIdAsync(string departmentId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                DepartmentSelect + @"
                  AND d.department_id = @DepartmentId",
                new SqlParameter("@DepartmentId", departmentId));

            if (dt.Rows.Count == 0)
                return null;

            return MapToDepartment(dt.Rows[0]);
        }

        // ============================================================
        // 🔹 THÊM MỚI BỘ MÔN
        // ============================================================
        public async Task AddAsync(Department department)
        {
            const string query = @"
                INSERT INTO dbo.departments
                (
                    department_id, department_code, department_name, faculty_id, description, created_at, created_by
                )
                VALUES
                (
                    @DepartmentId, @DepartmentCode, @DepartmentName, @FacultyId, @Description, GETDATE(), @CreatedBy
                )";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@DepartmentId", department.DepartmentId),
                new SqlParameter("@DepartmentCode", department.DepartmentCode),
                new SqlParameter("@DepartmentName", department.DepartmentName),
                new SqlParameter("@FacultyId", department.FacultyId),
                new SqlParameter("@Description", (object?)department.Description ?? DBNull.Value),
                new SqlParameter("@CreatedBy", department.CreatedBy ?? "system"));
        }

        // ============================================================
        // 🔹 CẬP NHẬT BỘ MÔN
        // ============================================================
        public async Task<int> UpdateAsync(Department department)
        {
            const string query = @"
                UPDATE dbo.departments
                SET department_code = @DepartmentCode,
                    department_name = @DepartmentName,
                    faculty_id = @FacultyId,
                    description = @Description,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE department_id = @DepartmentId
                  AND deleted_at IS NULL";
            return await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@DepartmentId", department.DepartmentId),
                new SqlParameter("@DepartmentCode", department.DepartmentCode),
                new SqlParameter("@DepartmentName", department.DepartmentName),
                new SqlParameter("@FacultyId", department.FacultyId),
                new SqlParameter("@Description", (object?)department.Description ?? DBNull.Value),
                new SqlParameter("@UpdatedBy", department.UpdatedBy ?? "system"));
        }

        // ============================================================
        // 🔹 SINH MÃ BỘ MÔN TỰ ĐỘNG (DEPT001, DEPT002...)
        // ============================================================
        public async Task<string> GenerateNextCodeAsync()
        {
            var sql = "SELECT dbo.fn_GenerateNextDepartmentCode()";
            var result = await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, sql);
            return result?.ToString() ?? "DEPT001";
        }

        // ============================================================
        // 🔹 XOÁ MỀM (SOFT DELETE)
        // ============================================================
        public async Task DeleteAsync(string departmentId)
        {
            const string query = @"
                UPDATE dbo.departments
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy
                WHERE department_id = @DepartmentId
                  AND deleted_at IS NULL";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@DepartmentId", departmentId),
                new SqlParameter("@DeletedBy", "System"));
        }

        // ============================================================
        // 🔹 MAP DỮ LIỆU DataRow → Department
        // ============================================================
        private static Department MapToDepartment(DataRow row)
        {
            return new Department
            {
                DepartmentId = row["department_id"].ToString()!,
                // Database không có department_code, dùng department_id làm code
                DepartmentCode = row.Table.Columns.Contains("department_code") 
                    ? row["department_code"]?.ToString() ?? ""
                    : row["department_id"].ToString()!,
                DepartmentName = row["department_name"].ToString()!,
                FacultyId = row["faculty_id"].ToString()!,
                FacultyName = row.Table.Columns.Contains("faculty_name") 
                    ? row["faculty_name"]?.ToString() 
                    : null,
                Description = row.Table.Columns.Contains("description") ? row["description"]?.ToString() : null,
                IsActive = row.Table.Columns.Contains("is_active") && row["is_active"] != DBNull.Value
                    ? Convert.ToBoolean(row["is_active"])
                    : true,
                CreatedAt = row.Table.Columns.Contains("created_at") && row["created_at"] != DBNull.Value 
                    ? Convert.ToDateTime(row["created_at"]) 
                    : (DateTime?)null,
                CreatedBy = row.Table.Columns.Contains("created_by") ? row["created_by"]?.ToString() : null,
                UpdatedAt = row.Table.Columns.Contains("updated_at") && row["updated_at"] != DBNull.Value 
                    ? Convert.ToDateTime(row["updated_at"]) 
                    : (DateTime?)null,
                UpdatedBy = row.Table.Columns.Contains("updated_by") ? row["updated_by"]?.ToString() : null
            };
        }

        // ============================================================
        // 🔹 KIỂM TRA RÀNG BUỘC TRƯỚC KHI XÓA
        // ============================================================
        public async Task<DepartmentConstraintDto> CheckConstraintsAsync(string departmentId)
        {
            var param = new SqlParameter("@DepartmentId", departmentId);
            var dt = await DatabaseHelper.ExecuteQueryAsync(_connectionString, "sp_CheckDepartmentConstraints", param);

            if (dt.Rows.Count == 0)
            {
                return new DepartmentConstraintDto();
            }

            var row = dt.Rows[0];
            return new DepartmentConstraintDto
            {
                SubjectCount = Convert.ToInt32(row["subject_count"]),
                ActiveSubjectCount = Convert.ToInt32(row["active_subject_count"]),
                LecturerCount = Convert.ToInt32(row["lecturer_count"]),
                ActiveLecturerCount = Convert.ToInt32(row["active_lecturer_count"])
            };
        }
    }
}
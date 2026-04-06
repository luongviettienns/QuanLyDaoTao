using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EducationManagement.Common.Models;
using EducationManagement.DAL;

namespace EducationManagement.DAL.Repositories
{
    public class SubjectRepository
    {
        private readonly string _connectionString;

        public SubjectRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ==========================================================
        // 🔹 LẤY DANH SÁCH MÔN HỌC (ACTIVE) - KHÔNG PAGINATION
        // ==========================================================
        public async Task<List<Subject>> GetAllAsync()
        {
            const string query = @"
                SELECT
                    s.subject_id, s.subject_code, s.subject_name, s.credits, s.description,
                    s.department_id, s.created_at, s.created_by, s.updated_at, s.updated_by,
                    d.department_name
                FROM dbo.subjects s
                LEFT JOIN dbo.departments d ON s.department_id = d.department_id
                WHERE s.deleted_at IS NULL
                ORDER BY s.subject_code";
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(_connectionString, query);
            var list = new List<Subject>();

            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                    list.Add(MapToSubject(row));
            }

            return list;
        }

        // ==========================================================
        // 🔹 LẤY DANH SÁCH MÔN HỌC VỚI PAGINATION
        // ==========================================================
        public async Task<(List<Subject> items, int totalCount)> GetAllPagedAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? departmentId = null)
        {
            const string countQuery = @"
                SELECT COUNT(*)
                FROM dbo.subjects s
                WHERE s.deleted_at IS NULL
                  AND (@Search IS NULL OR s.subject_code LIKE '%' + @Search + '%' OR s.subject_name LIKE '%' + @Search + '%')
                  AND (@DepartmentId IS NULL OR s.department_id = @DepartmentId)";
            const string dataQuery = @"
                SELECT
                    s.subject_id, s.subject_code, s.subject_name, s.credits, s.description,
                    s.department_id, s.created_at, s.created_by, s.updated_at, s.updated_by,
                    d.department_name
                FROM dbo.subjects s
                LEFT JOIN dbo.departments d ON s.department_id = d.department_id
                WHERE s.deleted_at IS NULL
                  AND (@Search IS NULL OR s.subject_code LIKE '%' + @Search + '%' OR s.subject_name LIKE '%' + @Search + '%')
                  AND (@DepartmentId IS NULL OR s.department_id = @DepartmentId)
                ORDER BY s.subject_code
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
            var parameters = new[]
            {
                new SqlParameter("@PageSize", pageSize),
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@DepartmentId", (object?)departmentId ?? DBNull.Value),
                new SqlParameter("@Offset", Math.Max(page - 1, 0) * pageSize)
            };
            var totalCount = Convert.ToInt32(
                await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, countQuery,
                    new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                    new SqlParameter("@DepartmentId", (object?)departmentId ?? DBNull.Value)) ?? 0);
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(_connectionString, dataQuery, parameters);
            var items = new List<Subject>();
            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    items.Add(MapToSubject(row));
                }
            }

            return (items, totalCount);
        }

        // ==========================================================
        // 🔹 LẤY MÔN HỌC THEO ID
        // ==========================================================
        public async Task<Subject?> GetByIdAsync(string subjectId)
        {
            const string query = @"
                SELECT
                    s.subject_id, s.subject_code, s.subject_name, s.credits, s.description,
                    s.department_id, s.created_at, s.created_by, s.updated_at, s.updated_by,
                    d.department_name
                FROM dbo.subjects s
                LEFT JOIN dbo.departments d ON s.department_id = d.department_id
                WHERE s.subject_id = @SubjectId
                  AND s.deleted_at IS NULL";
            var param = new SqlParameter("@SubjectId", subjectId);
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(_connectionString, query, param);

            if (dt.Rows.Count == 0)
                return null;

            return MapToSubject(dt.Rows[0]);
        }

        // ==========================================================
        // 🔹 THÊM MỚI MÔN HỌC
        // ==========================================================
        public async Task AddAsync(Subject subject)
        {
            const string query = @"
                INSERT INTO dbo.subjects
                (
                    subject_id, subject_code, subject_name, credits, description,
                    department_id, created_at, created_by
                )
                VALUES
                (
                    @SubjectId, @SubjectCode, @SubjectName, @Credits, @Description,
                    @DepartmentId, GETDATE(), @CreatedBy
                )";
            var parameters = new[]
            {
                new SqlParameter("@SubjectId", subject.SubjectId),
                new SqlParameter("@SubjectCode", subject.SubjectCode),
                new SqlParameter("@SubjectName", subject.SubjectName),
                new SqlParameter("@Credits", subject.Credits),
                new SqlParameter("@Description", (object?)subject.Description ?? DBNull.Value),
                new SqlParameter("@DepartmentId", (object?)subject.DepartmentId ?? DBNull.Value),
                new SqlParameter("@CreatedBy", subject.CreatedBy)
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, query, parameters);
        }

        // ==========================================================
        // 🔹 CẬP NHẬT MÔN HỌC
        // ==========================================================
        public async Task<int> UpdateAsync(Subject subject)
        {
            const string query = @"
                UPDATE dbo.subjects
                SET subject_code = @SubjectCode,
                    subject_name = @SubjectName,
                    credits = @Credits,
                    description = @Description,
                    department_id = @DepartmentId,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE subject_id = @SubjectId
                  AND deleted_at IS NULL";
            var parameters = new[]
            {
                new SqlParameter("@SubjectId", subject.SubjectId),
                new SqlParameter("@SubjectCode", subject.SubjectCode),
                new SqlParameter("@SubjectName", subject.SubjectName),
                new SqlParameter("@Credits", subject.Credits),
                new SqlParameter("@Description", (object?)subject.Description ?? DBNull.Value),
                new SqlParameter("@DepartmentId", (object?)subject.DepartmentId ?? DBNull.Value),
                new SqlParameter("@UpdatedBy", subject.UpdatedBy)
            };

            return await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, query, parameters);
        }

        // ==========================================================
        // 🔹 XOÁ MỀM (SOFT DELETE)
        // ==========================================================
        public async Task DeleteAsync(string subjectId)
        {
            const string query = @"
                UPDATE dbo.subjects
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy
                WHERE subject_id = @SubjectId
                  AND deleted_at IS NULL";
            var parameters = new[]
            {
                new SqlParameter("@SubjectId", subjectId),
                new SqlParameter("@DeletedBy", "System") // TODO: Lấy từ context user
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, query, parameters);
        }

        // ==========================================================
        // 🔹 LẤY MÔN HỌC THEO BỘ MÔN
        // ==========================================================
        public async Task<List<Subject>> GetByDepartmentAsync(string departmentId)
        {
            const string query = @"
                SELECT
                    s.subject_id, s.subject_code, s.subject_name, s.credits, s.description,
                    s.department_id, s.created_at, s.created_by, s.updated_at, s.updated_by,
                    d.department_name
                FROM dbo.subjects s
                LEFT JOIN dbo.departments d ON s.department_id = d.department_id
                WHERE s.department_id = @DepartmentId
                  AND s.deleted_at IS NULL
                ORDER BY s.subject_code";
            var param = new SqlParameter("@DepartmentId", departmentId);
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(_connectionString, query, param);
            var list = new List<Subject>();

            foreach (DataRow row in dt.Rows)
                list.Add(MapToSubject(row));

            return list;
        }

        // ==========================================================
        // 🔹 KIỂM TRA MÃ MÔN HỌC ĐÃ TỒN TẠI
        // ==========================================================
        public async Task<bool> ExistsCodeAsync(string subjectCode)
        {
            const string query = @"
                SELECT COUNT(*)
                FROM dbo.subjects
                WHERE subject_code = @SubjectCode
                  AND deleted_at IS NULL";
            var param = new SqlParameter("@SubjectCode", subjectCode);
            var result = await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, query, param);
            return Convert.ToInt32(result ?? 0) > 0;
        }

        // ==========================================================
        // 🔹 MAP DỮ LIỆU DataRow → Subject
        // ==========================================================
        private static Subject MapToSubject(DataRow row)
        {
            return new Subject
            {
                SubjectId = row["subject_id"].ToString()!,
                SubjectCode = row["subject_code"].ToString()!,
                SubjectName = row["subject_name"].ToString()!,
                Credits = Convert.ToInt32(row["credits"]),
                Description = row["description"]?.ToString(),
                DepartmentId = row["department_id"]?.ToString(),
                DepartmentName = row.Table.Columns.Contains("department_name")
                                    ? row["department_name"]?.ToString()
                                    : null,
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
    }
}

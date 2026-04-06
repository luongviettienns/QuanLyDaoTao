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
    public class MajorRepository
    {
        private readonly string _connectionString;
        private const string MajorSelect = @"
            SELECT
                m.major_id, m.major_code, m.major_name, m.faculty_id, m.description, m.is_active,
                m.created_at, m.created_by, m.updated_at, m.updated_by, m.deleted_at, m.deleted_by,
                f.faculty_name
            FROM dbo.majors m
            LEFT JOIN dbo.faculties f ON m.faculty_id = f.faculty_id
            WHERE m.deleted_at IS NULL";

        public MajorRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH NGÀNH HỌC (ACTIVE) - KHÔNG PAGINATION
        // ============================================================
        public async Task<List<Major>> GetAllAsync()
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                MajorSelect + @"
                ORDER BY m.major_code, m.major_name");
            var list = new List<Major>();

            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                    list.Add(MapToMajor(row));
            }

            return list;
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH NGÀNH HỌC VỚI PAGINATION
        // ============================================================
        public async Task<(List<Major> items, int totalCount)> GetAllPagedAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null)
        {
            const string countQuery = @"
                SELECT COUNT(*)
                FROM dbo.majors m
                WHERE m.deleted_at IS NULL
                  AND (@Search IS NULL OR m.major_code LIKE '%' + @Search + '%' OR m.major_name LIKE '%' + @Search + '%')";
            var totalCount = Convert.ToInt32(
                await DatabaseHelper.ExecuteRawScalarAsync(
                    _connectionString,
                    countQuery,
                    new SqlParameter("@Search", (object?)search ?? DBNull.Value)) ?? 0);

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                MajorSelect + @"
                  AND (@Search IS NULL OR m.major_code LIKE '%' + @Search + '%' OR m.major_name LIKE '%' + @Search + '%')
                ORDER BY m.major_code, m.major_name
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@Offset", Math.Max(page - 1, 0) * pageSize),
                new SqlParameter("@PageSize", pageSize));
            var items = new List<Major>();
            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    items.Add(MapToMajor(row));
                }
            }

            return (items, totalCount);
        }

        // ============================================================
        // 🔹 LẤY NGÀNH HỌC THEO ID
        // ============================================================
        public async Task<Major?> GetByIdAsync(string majorId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                MajorSelect + @"
                  AND m.major_id = @MajorId",
                new SqlParameter("@MajorId", majorId));

            if (dt.Rows.Count == 0)
                return null;

            return MapToMajor(dt.Rows[0]);
        }

        // ============================================================
        // 🔹 THÊM MỚI NGÀNH HỌC
        // ============================================================
        public async Task AddAsync(Major major)
        {
            const string query = @"
                INSERT INTO dbo.majors
                (
                    major_id, major_code, major_name, faculty_id, description, is_active, created_at, created_by
                )
                VALUES
                (
                    @MajorId, @MajorCode, @MajorName, @FacultyId, @Description, @IsActive, GETDATE(), @CreatedBy
                )";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@MajorId", major.MajorId),
                new SqlParameter("@MajorCode", major.MajorCode),
                new SqlParameter("@MajorName", major.MajorName),
                new SqlParameter("@FacultyId", major.FacultyId),
                new SqlParameter("@Description", (object?)major.Description ?? DBNull.Value),
                new SqlParameter("@IsActive", major.IsActive),
                new SqlParameter("@CreatedBy", (object?)major.CreatedBy ?? DBNull.Value));
        }

        // ============================================================
        // 🔹 CẬP NHẬT NGÀNH HỌC
        // ============================================================
        public async Task<int> UpdateAsync(Major major)
        {
            const string query = @"
                UPDATE dbo.majors
                SET major_code = @MajorCode,
                    major_name = @MajorName,
                    faculty_id = @FacultyId,
                    description = @Description,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE major_id = @MajorId
                  AND deleted_at IS NULL";
            return await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@MajorId", major.MajorId),
                new SqlParameter("@MajorCode", major.MajorCode),
                new SqlParameter("@MajorName", major.MajorName),
                new SqlParameter("@FacultyId", major.FacultyId),
                new SqlParameter("@Description", (object?)major.Description ?? DBNull.Value),
                new SqlParameter("@UpdatedBy", (object?)major.UpdatedBy ?? DBNull.Value));
        }

        // ============================================================
        // 🔹 XOÁ MỀM (SOFT DELETE)
        // ============================================================
        public async Task DeleteAsync(string majorId)
        {
            const string query = @"
                UPDATE dbo.majors
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy,
                    is_active = 0
                WHERE major_id = @MajorId
                  AND deleted_at IS NULL";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@MajorId", majorId),
                new SqlParameter("@DeletedBy", "System"));
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH NGÀNH THEO KHOA
        // ============================================================
        public async Task<List<Major>> GetByFacultyAsync(string facultyId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                MajorSelect + @"
                  AND m.faculty_id = @FacultyId
                ORDER BY m.major_code, m.major_name",
                new SqlParameter("@FacultyId", facultyId));
            var list = new List<Major>();

            foreach (DataRow row in dt.Rows)
                list.Add(MapToMajor(row));

            return list;
        }

        // ============================================================
        // 🔹 MAP DỮ LIỆU DataRow → Major
        // ============================================================
        private static Major MapToMajor(DataRow row)
        {
            return new Major
            {
                MajorId = row["major_id"].ToString()!,
                MajorCode = row["major_code"].ToString()!,
                MajorName = row["major_name"].ToString()!,
                FacultyId = row["faculty_id"].ToString()!,
                FacultyName = row.Table.Columns.Contains("faculty_name") 
                    ? row["faculty_name"]?.ToString() 
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

        // ============================================================
        // 🔹 KIỂM TRA RÀNG BUỘC TRƯỚC KHI XÓA
        // ============================================================
        public async Task<MajorConstraintDto> CheckConstraintsAsync(string majorId)
        {
            var param = new SqlParameter("@MajorId", majorId);
            var dt = await DatabaseHelper.ExecuteQueryAsync(_connectionString, "sp_CheckMajorConstraints", param);

            if (dt.Rows.Count == 0)
            {
                return new MajorConstraintDto();
            }

            var row = dt.Rows[0];
            return new MajorConstraintDto
            {
                StudentCount = Convert.ToInt32(row["student_count"]),
                ActiveStudentCount = Convert.ToInt32(row["active_student_count"])
            };
        }
    }
}
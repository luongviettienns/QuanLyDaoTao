using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EducationManagement.Common.Models;
using EducationManagement.Common.DTOs.RegistrationPeriod;

namespace EducationManagement.DAL.Repositories
{
    public class RegistrationPeriodRepository
    {
        private readonly string _connectionString;
        private const string RegistrationPeriodSelect = @"
            SELECT
                rp.period_id, rp.period_name, rp.academic_year_id, rp.semester, rp.start_date, rp.end_date,
                rp.status, rp.period_type, rp.description, rp.is_active, rp.created_at, rp.created_by,
                ay.year_name AS academic_year_name, ay.start_year, ay.end_year
            FROM dbo.registration_periods rp
            LEFT JOIN dbo.academic_years ay ON rp.academic_year_id = ay.academic_year_id
            WHERE rp.deleted_at IS NULL";

        public RegistrationPeriodRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ============================================================
        // 1️⃣ GET ALL
        // ============================================================
        public async Task<List<PeriodDetailDto>> GetAllAsync(string? periodType = null)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                RegistrationPeriodSelect + @"
                  AND (@PeriodType IS NULL OR rp.period_type = @PeriodType)
                ORDER BY rp.start_date DESC, rp.created_at DESC",
                new SqlParameter("@PeriodType", (object?)periodType ?? DBNull.Value));

            var periods = new List<PeriodDetailDto>();
            foreach (DataRow row in dt.Rows)
            {
                periods.Add(MapToPeriodDetailDto(row));
            }

            return periods;
        }
        
        // ============================================================
        // 1️⃣.1 GET RETAKE PERIODS
        // ============================================================
        public async Task<List<PeriodDetailDto>> GetRetakePeriodsAsync()
        {
            return await GetAllAsync("RETAKE");
        }

        // ============================================================
        // 2️⃣ GET BY ID
        // ============================================================
        public async Task<PeriodDetailDto?> GetByIdAsync(string periodId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                RegistrationPeriodSelect + @"
                  AND rp.period_id = @PeriodId",
                new SqlParameter("@PeriodId", periodId));

            if (dt.Rows.Count == 0)
                return null;

            return MapToPeriodDetailDto(dt.Rows[0]);
        }

        // ============================================================
        // 3️⃣ GET ACTIVE PERIOD
        // ============================================================
        public async Task<PeriodDetailDto?> GetActiveAsync()
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                RegistrationPeriodSelect + @"
                  AND rp.is_active = 1
                  AND rp.status = 'OPEN'
                  AND GETDATE() BETWEEN rp.start_date AND rp.end_date
                ORDER BY rp.start_date DESC");

            if (dt.Rows.Count == 0)
                return null;

            return MapToPeriodDetailDto(dt.Rows[0]);
        }

        // ============================================================
        // 4️⃣ CREATE
        // ============================================================
        public async Task<string> CreateAsync(CreatePeriodDto dto, string createdBy)
        {
            string periodId = $"RP-{Guid.NewGuid()}";
            const string query = @"
                INSERT INTO dbo.registration_periods
                (
                    period_id, period_name, academic_year_id, semester, start_date, end_date,
                    status, period_type, description, is_active, created_at, created_by
                )
                VALUES
                (
                    @PeriodId, @PeriodName, @AcademicYearId, @Semester, @StartDate, @EndDate,
                    'UPCOMING', @PeriodType, @Description, 1, GETDATE(), @CreatedBy
                )";

            var parameters = new[]
            {
                new SqlParameter("@PeriodId", periodId),
                new SqlParameter("@PeriodName", dto.PeriodName),
                new SqlParameter("@AcademicYearId", dto.AcademicYearId),
                new SqlParameter("@Semester", dto.Semester),
                new SqlParameter("@StartDate", dto.StartDate),
                new SqlParameter("@EndDate", dto.EndDate),
                new SqlParameter("@PeriodType", dto.PeriodType ?? "NORMAL"),
                new SqlParameter("@Description", (object?)dto.Description ?? DBNull.Value),
                new SqlParameter("@CreatedBy", createdBy)
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, query, parameters);

            return periodId;
        }

        // ============================================================
        // 5️⃣ UPDATE
        // ============================================================
        public async Task UpdateAsync(string periodId, UpdatePeriodDto dto, string updatedBy)
        {
            const string query = @"
                UPDATE dbo.registration_periods
                SET period_name = @PeriodName,
                    academic_year_id = @AcademicYearId,
                    semester = @Semester,
                    start_date = @StartDate,
                    end_date = @EndDate,
                    period_type = @PeriodType,
                    description = @Description,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE period_id = @PeriodId
                  AND deleted_at IS NULL";
            var parameters = new[]
            {
                new SqlParameter("@PeriodId", periodId),
                new SqlParameter("@PeriodName", dto.PeriodName),
                new SqlParameter("@AcademicYearId", dto.AcademicYearId),
                new SqlParameter("@Semester", dto.Semester),
                new SqlParameter("@StartDate", dto.StartDate),
                new SqlParameter("@EndDate", dto.EndDate),
                new SqlParameter("@PeriodType", dto.PeriodType ?? "NORMAL"),
                new SqlParameter("@Description", (object?)dto.Description ?? DBNull.Value),
                new SqlParameter("@UpdatedBy", updatedBy)
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, query, parameters);
        }

        // ============================================================
        // 6️⃣ DELETE (Soft Delete)
        // ============================================================
        public async Task DeleteAsync(string periodId, string deletedBy)
        {
            const string query = @"
                UPDATE dbo.registration_periods
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy,
                    is_active = 0
                WHERE period_id = @PeriodId
                  AND deleted_at IS NULL";
            var parameters = new[]
            {
                new SqlParameter("@PeriodId", periodId),
                new SqlParameter("@DeletedBy", deletedBy)
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, query, parameters);
        }

        // ============================================================
        // 7️⃣ OPEN PERIOD
        // ============================================================
        public async Task OpenPeriodAsync(string periodId, string openedBy)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                using (var closeOthersCmd = new SqlCommand(@"
                    UPDATE dbo.registration_periods
                    SET status = 'CLOSED',
                        is_active = 0,
                        updated_at = GETDATE(),
                        updated_by = @OpenedBy
                    WHERE status = 'OPEN'
                      AND deleted_at IS NULL
                      AND period_id <> @PeriodId", conn, transaction))
                {
                    closeOthersCmd.Parameters.AddWithValue("@OpenedBy", openedBy);
                    closeOthersCmd.Parameters.AddWithValue("@PeriodId", periodId);
                    await closeOthersCmd.ExecuteNonQueryAsync();
                }

                using (var openTargetCmd = new SqlCommand(@"
                    UPDATE dbo.registration_periods
                    SET status = 'OPEN',
                        is_active = 1,
                        updated_at = GETDATE(),
                        updated_by = @OpenedBy
                    WHERE period_id = @PeriodId
                      AND deleted_at IS NULL", conn, transaction))
                {
                    openTargetCmd.Parameters.AddWithValue("@OpenedBy", openedBy);
                    openTargetCmd.Parameters.AddWithValue("@PeriodId", periodId);
                    await openTargetCmd.ExecuteNonQueryAsync();
                }

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        // ============================================================
        // 8️⃣ CLOSE PERIOD
        // ============================================================
        public async Task ClosePeriodAsync(string periodId, string closedBy)
        {
            const string query = @"
                UPDATE dbo.registration_periods
                SET status = 'CLOSED',
                    is_active = 0,
                    updated_at = GETDATE(),
                    updated_by = @ClosedBy
                WHERE period_id = @PeriodId
                  AND deleted_at IS NULL";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@PeriodId", periodId),
                new SqlParameter("@ClosedBy", closedBy));
        }

        // ============================================================
        // 9️⃣ PERIOD CLASSES MANAGEMENT
        // ============================================================
        public async Task<DataTable> GetClassesByPeriodAsync(string periodId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"SELECT 
                pc.period_class_id,
                c.class_id,
                c.class_code,
                c.class_name,
                s.subject_code,
                s.subject_name,
                s.credits,
                l.full_name AS lecturer_name,
                c.max_students,
                c.current_enrollment,
                (c.max_students - c.current_enrollment) AS available_seats,
                pc.is_active,
                pc.created_at
            FROM period_classes pc
            INNER JOIN classes c ON pc.class_id = c.class_id
            INNER JOIN subjects s ON c.subject_id = s.subject_id
            LEFT JOIN lecturers l ON c.lecturer_id = l.lecturer_id
            WHERE pc.period_id = @periodId
              AND pc.deleted_at IS NULL
              AND c.deleted_at IS NULL
            ORDER BY c.class_code";
            cmd.Parameters.AddWithValue("@periodId", periodId);
            var dt = new DataTable();
            using var da = new SqlDataAdapter((SqlCommand)cmd);
            da.Fill(dt);
            return dt;
        }

        public async Task<DataTable> GetAvailableClassesForPeriodAsync(string periodId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"SELECT 
                c.class_id,
                c.class_code,
                c.class_name,
                s.subject_code,
                s.subject_name,
                s.credits,
                l.full_name AS lecturer_name,
                c.max_students,
                c.current_enrollment
            FROM classes c
            INNER JOIN subjects s ON c.subject_id = s.subject_id
            LEFT JOIN lecturers l ON c.lecturer_id = l.lecturer_id
            INNER JOIN registration_periods rp ON rp.period_id = @periodId
            WHERE c.academic_year_id = rp.academic_year_id
              AND c.semester = CAST(rp.semester AS VARCHAR(20))
              AND c.deleted_at IS NULL
              -- Chỉ hiển thị lớp khi registration period đang mở và trong thời gian đăng ký
              AND rp.status = 'OPEN'
              AND GETDATE() BETWEEN rp.start_date AND rp.end_date
              AND rp.is_active = 1
              AND rp.deleted_at IS NULL
              -- Lớp chưa được thêm vào period này
              AND NOT EXISTS (
                  SELECT 1 FROM period_classes pc
                  WHERE pc.class_id = c.class_id
                    AND pc.period_id = @periodId
                    AND pc.deleted_at IS NULL
              )
            ORDER BY c.class_code";
            cmd.Parameters.AddWithValue("@periodId", periodId);
            var dt = new DataTable();
            using var da = new SqlDataAdapter((SqlCommand)cmd);
            da.Fill(dt);
            return dt;
        }

        public async Task AddClassToPeriodAsync(string periodId, string classId, string createdBy)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            var cmd = conn.CreateCommand();
            var periodClassId = Guid.NewGuid().ToString();
            cmd.CommandText = @"INSERT INTO period_classes 
                (period_class_id, period_id, class_id, created_by)
                VALUES (@periodClassId, @periodId, @classId, @createdBy)";
            cmd.Parameters.AddWithValue("@periodClassId", periodClassId);
            cmd.Parameters.AddWithValue("@periodId", periodId);
            cmd.Parameters.AddWithValue("@classId", classId);
            cmd.Parameters.AddWithValue("@createdBy", createdBy);
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task RemoveClassFromPeriodAsync(string periodClassId, string updatedBy)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"UPDATE period_classes 
                SET deleted_at = GETDATE(), updated_by = @updatedBy
                WHERE period_class_id = @periodClassId";
            cmd.Parameters.AddWithValue("@periodClassId", periodClassId);
            cmd.Parameters.AddWithValue("@updatedBy", updatedBy);
            await cmd.ExecuteNonQueryAsync();
        }

        // ============================================================
        // MAPPING HELPER
        // ============================================================
        private static PeriodDetailDto MapToPeriodDetailDto(DataRow row)
        {
            return new PeriodDetailDto
            {
                PeriodId = row["period_id"].ToString()!,
                PeriodName = row["period_name"].ToString()!,
                AcademicYearId = row["academic_year_id"].ToString()!,
                AcademicYearName = row["academic_year_name"]?.ToString(),
                StartYear = row.Table.Columns.Contains("start_year") && row["start_year"] != DBNull.Value 
                    ? Convert.ToInt32(row["start_year"]) : null,
                EndYear = row.Table.Columns.Contains("end_year") && row["end_year"] != DBNull.Value 
                    ? Convert.ToInt32(row["end_year"]) : null,
                Semester = Convert.ToInt32(row["semester"]),
                StartDate = Convert.ToDateTime(row["start_date"]),
                EndDate = Convert.ToDateTime(row["end_date"]),
                Status = row["status"].ToString()!,
                PeriodType = row.Table.Columns.Contains("period_type") && row["period_type"] != DBNull.Value
                    ? row["period_type"].ToString() ?? "NORMAL"
                    : "NORMAL",
                Description = row["description"]?.ToString(),
                TotalEnrollments = row.Table.Columns.Contains("total_enrollments") && row["total_enrollments"] != DBNull.Value
                    ? Convert.ToInt32(row["total_enrollments"]) : null,
                TotalStudentsEnrolled = row.Table.Columns.Contains("total_students_enrolled") && row["total_students_enrolled"] != DBNull.Value
                    ? Convert.ToInt32(row["total_students_enrolled"]) : null,
                IsActive = Convert.ToBoolean(row["is_active"]),
                CreatedAt = Convert.ToDateTime(row["created_at"]),
                CreatedBy = row["created_by"]?.ToString()
            };
        }
    }
}


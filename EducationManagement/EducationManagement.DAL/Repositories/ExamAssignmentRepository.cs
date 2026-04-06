using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EducationManagement.Common.Models;
using EducationManagement.Common.DTOs.Exam;

namespace EducationManagement.DAL.Repositories
{
    public class ExamAssignmentRepository
    {
        private readonly string _connectionString;
        private const string ExamAssignmentSelect = @"
            SELECT
                ea.assignment_id, ea.exam_id, ea.enrollment_id, ea.student_id, ea.seat_number,
                ea.status, ea.notes, ea.created_at, ea.created_by,
                s.student_code, s.full_name AS student_name,
                CONVERT(VARCHAR(10), es.exam_date, 120) AS exam_date,
                es.exam_type, sub.subject_name, r.room_code
            FROM dbo.exam_assignments ea
            INNER JOIN dbo.students s ON ea.student_id = s.student_id
            INNER JOIN dbo.exam_schedules es ON ea.exam_id = es.exam_id
            LEFT JOIN dbo.subjects sub ON es.subject_id = sub.subject_id
            LEFT JOIN dbo.rooms r ON es.room_id = r.room_id
            WHERE ea.deleted_at IS NULL";

        public ExamAssignmentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH SINH VIÊN TRONG CA THI
        // ============================================================
        public async Task<List<ExamAssignment>> GetByExamAsync(string examId)
        {
            var param = new SqlParameter("@ExamId", examId);
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                ExamAssignmentSelect + @"
                  AND ea.exam_id = @ExamId
                ORDER BY COALESCE(ea.seat_number, 999999), s.student_code",
                param);

            var assignments = new List<ExamAssignment>();
            foreach (DataRow row in dt.Rows)
            {
                assignments.Add(MapToExamAssignment(row));
            }

            return assignments;
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH LỊCH THI CỦA SINH VIÊN
        // ============================================================
        public async Task<List<ExamAssignment>> GetByStudentAsync(string studentId)
        {
            var parameters = new[]
            {
                new SqlParameter("@StudentId", studentId)
            };

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                ExamAssignmentSelect + @"
                  AND ea.student_id = @StudentId
                ORDER BY es.exam_date, es.exam_time",
                parameters);

            var assignments = new List<ExamAssignment>();
            foreach (DataRow row in dt.Rows)
            {
                assignments.Add(MapToExamAssignment(row));
            }

            return assignments;
        }

        // ============================================================
        // 🔹 TẠO PHÂN SINH VIÊN VÀO CA THI
        // ============================================================
        public async Task<string> CreateAsync(ExamAssignment assignment)
        {
            var assignmentId = assignment.AssignmentId;
            if (string.IsNullOrWhiteSpace(assignmentId))
            {
                assignmentId = $"EA-{Guid.NewGuid()}";
            }

            var parameters = new[]
            {
                new SqlParameter("@AssignmentId", assignmentId),
                new SqlParameter("@ExamId", assignment.ExamId),
                new SqlParameter("@EnrollmentId", assignment.EnrollmentId),
                new SqlParameter("@StudentId", assignment.StudentId),
                new SqlParameter("@SeatNumber", (object?)assignment.SeatNumber ?? DBNull.Value),
                new SqlParameter("@Status", assignment.Status),
                new SqlParameter("@Notes", (object?)assignment.Notes ?? DBNull.Value),
                new SqlParameter("@CreatedBy", (object?)assignment.CreatedBy ?? "system")
            };

            // Note: Cần tạo stored procedure sp_CreateExamAssignment
            // Tạm thời dùng raw SQL hoặc tạo SP sau
            var sql = @"
                INSERT INTO dbo.exam_assignments 
                (assignment_id, exam_id, enrollment_id, student_id, seat_number, status, notes, created_at, created_by)
                VALUES 
                (@AssignmentId, @ExamId, @EnrollmentId, @StudentId, @SeatNumber, @Status, @Notes, GETDATE(), @CreatedBy)";

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, sql, parameters);

            return assignmentId;
        }

        // ============================================================
        // 🔹 XÓA PHÂN SINH VIÊN KHỎI CA THI (SOFT DELETE)
        // ============================================================
        public async Task DeleteAsync(string assignmentId, string deletedBy)
        {
            var sql = @"
                UPDATE dbo.exam_assignments
                SET deleted_at = GETDATE(), deleted_by = @DeletedBy
                WHERE assignment_id = @AssignmentId AND deleted_at IS NULL";

            var parameters = new[]
            {
                new SqlParameter("@AssignmentId", assignmentId),
                new SqlParameter("@DeletedBy", deletedBy)
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, sql, parameters);
        }

        // ============================================================
        // 🔹 KIỂM TRA ĐIỀU KIỆN DỰ THI CỦA SINH VIÊN
        // ============================================================
        public async Task<bool> CheckStudentQualificationAsync(string studentId, string classId)
        {
            const string sql = @"
                SELECT CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM dbo.attendances a
                        INNER JOIN dbo.enrollments e ON a.enrollment_id = e.enrollment_id
                        WHERE e.student_id = @StudentId
                          AND e.class_id = @ClassId
                          AND e.deleted_at IS NULL
                          AND a.deleted_at IS NULL
                        GROUP BY e.enrollment_id
                        HAVING
                            COUNT(*) > 0 AND
                            (SUM(CASE WHEN a.status IN ('Absent', 'Vắng') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) > 20
                    ) THEN CAST(0 AS bit)
                    ELSE CAST(1 AS bit)
                END";
            var parameters = new[]
            {
                new SqlParameter("@StudentId", studentId),
                new SqlParameter("@ClassId", classId)
            };

            var result = await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, sql, parameters);
            return result == null || Convert.ToBoolean(result);
        }

        // ============================================================
        // 🔹 MAP DATA ROW TO EXAMASSIGNMENT MODEL
        // ============================================================
        private static ExamAssignment MapToExamAssignment(DataRow row)
        {
            return new ExamAssignment
            {
                AssignmentId = row["assignment_id"]?.ToString() ?? string.Empty,
                ExamId = row["exam_id"]?.ToString() ?? string.Empty,
                EnrollmentId = row["enrollment_id"]?.ToString() ?? string.Empty,
                StudentId = row["student_id"]?.ToString() ?? string.Empty,
                SeatNumber = row.Table.Columns.Contains("seat_number") && row["seat_number"] != DBNull.Value
                    ? Convert.ToInt32(row["seat_number"])
                    : null,
                Status = row.Table.Columns.Contains("status") && row["status"] != DBNull.Value
                    ? row["status"]?.ToString() ?? "ASSIGNED"
                    : "ASSIGNED",
                Notes = row.Table.Columns.Contains("notes") && row["notes"] != DBNull.Value
                    ? row["notes"]?.ToString()
                    : null,
                StudentCode = row.Table.Columns.Contains("student_code") && row["student_code"] != DBNull.Value
                    ? row["student_code"]?.ToString()
                    : null,
                StudentName = row.Table.Columns.Contains("student_name") && row["student_name"] != DBNull.Value
                    ? row["student_name"]?.ToString()
                    : null,
                ExamDate = row.Table.Columns.Contains("exam_date") && row["exam_date"] != DBNull.Value
                    ? row["exam_date"]?.ToString()
                    : null,
                ExamType = row.Table.Columns.Contains("exam_type") && row["exam_type"] != DBNull.Value
                    ? row["exam_type"]?.ToString()
                    : null,
                SubjectName = row.Table.Columns.Contains("subject_name") && row["subject_name"] != DBNull.Value
                    ? row["subject_name"]?.ToString()
                    : null,
                RoomCode = row.Table.Columns.Contains("room_code") && row["room_code"] != DBNull.Value
                    ? row["room_code"]?.ToString()
                    : null,
                CreatedAt = row.Table.Columns.Contains("created_at") && row["created_at"] != DBNull.Value
                    ? Convert.ToDateTime(row["created_at"])
                    : DateTime.Now,
                CreatedBy = row.Table.Columns.Contains("created_by") && row["created_by"] != DBNull.Value
                    ? row["created_by"]?.ToString()
                    : null
            };
        }
    }
}


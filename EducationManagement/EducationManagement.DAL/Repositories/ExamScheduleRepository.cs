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
    public class ExamScheduleRepository
    {
        private readonly string _connectionString;
        private const string ExamScheduleSelect = @"
            SELECT
                es.exam_id, es.class_id, es.subject_id, es.exam_date, es.exam_time, es.end_time,
                es.room_id, es.exam_type, es.session_no, es.proctor_lecturer_id, es.duration,
                es.max_students, es.notes, es.status, es.school_year_id, es.semester,
                es.created_at, es.created_by, es.updated_at, es.updated_by,
                c.class_code, c.class_name,
                sub.subject_code, sub.subject_name,
                r.room_code, r.building, r.capacity AS room_capacity,
                l.full_name AS proctor_name,
                sy.year_code, sy.year_name,
                (
                    SELECT COUNT(*)
                    FROM dbo.exam_assignments ea
                    WHERE ea.exam_id = es.exam_id AND ea.deleted_at IS NULL
                ) AS assigned_students
            FROM dbo.exam_schedules es
            INNER JOIN dbo.classes c ON es.class_id = c.class_id
            INNER JOIN dbo.subjects sub ON es.subject_id = sub.subject_id
            LEFT JOIN dbo.rooms r ON es.room_id = r.room_id
            LEFT JOIN dbo.lecturers l ON es.proctor_lecturer_id = l.lecturer_id
            LEFT JOIN dbo.school_years sy ON es.school_year_id = sy.school_year_id
            WHERE es.deleted_at IS NULL
              AND c.deleted_at IS NULL";

        public ExamScheduleRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH LỊCH THI VỚI FILTER
        // ============================================================
        public async Task<List<ExamSchedule>> GetAllAsync(
            string? schoolYearId = null,
            int? semester = null,
            string? examType = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? classId = null,
            string? subjectId = null)
        {
            var query = ExamScheduleSelect + @"
              AND (@SchoolYearId IS NULL OR es.school_year_id = @SchoolYearId)
              AND (@Semester IS NULL OR es.semester = @Semester)
              AND (@ExamType IS NULL OR es.exam_type = @ExamType)
              AND (@StartDate IS NULL OR es.exam_date >= @StartDate)
              AND (@EndDate IS NULL OR es.exam_date <= @EndDate)
              AND (@ClassId IS NULL OR es.class_id = @ClassId)
              AND (@SubjectId IS NULL OR es.subject_id = @SubjectId)
            ORDER BY es.exam_date, es.exam_time, c.class_code";
            var parameters = new[]
            {
                new SqlParameter("@SchoolYearId", (object?)schoolYearId ?? DBNull.Value),
                new SqlParameter("@Semester", (object?)semester ?? DBNull.Value),
                new SqlParameter("@ExamType", (object?)examType ?? DBNull.Value),
                new SqlParameter("@StartDate", (object?)startDate?.Date ?? DBNull.Value),
                new SqlParameter("@EndDate", (object?)endDate?.Date ?? DBNull.Value),
                new SqlParameter("@ClassId", (object?)classId ?? DBNull.Value),
                new SqlParameter("@SubjectId", (object?)subjectId ?? DBNull.Value)
            };

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(_connectionString, query, parameters);
            
            var schedules = new List<ExamSchedule>();
            foreach (DataRow row in dt.Rows)
            {
                schedules.Add(MapToExamSchedule(row));
            }
            
            return schedules;
        }

        // ============================================================
        // 🔹 LẤY LỊCH THI THEO ID
        // ============================================================
        public async Task<ExamSchedule?> GetByIdAsync(string examId)
        {
            var query = ExamScheduleSelect + @"
              AND es.exam_id = @ExamId";
            var param = new SqlParameter("@ExamId", examId);
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(_connectionString, query, param);

            if (dt.Rows.Count == 0)
                return null;

            return MapToExamSchedule(dt.Rows[0]);
        }

        // ============================================================
        // 🔹 LẤY LỊCH THI THEO NĂM HỌC VÀ HỌC KỲ
        // ============================================================
        public async Task<List<ExamSchedule>> GetBySchoolYearAsync(string schoolYearId, int? semester = null)
        {
            return await GetAllAsync(schoolYearId: schoolYearId, semester: semester);
        }

        // ============================================================
        // 🔹 LẤY LỊCH THI THEO LỚP HỌC PHẦN
        // ============================================================
        public async Task<List<ExamSchedule>> GetByClassAsync(string classId)
        {
            return await GetAllAsync(classId: classId);
        }

        // ============================================================
        // 🔹 LẤY LỊCH THI CỦA SINH VIÊN
        // ============================================================
        public async Task<List<ExamSchedule>> GetByStudentAsync(string studentId, string? schoolYearId = null, int? semester = null)
        {
            var query = ExamScheduleSelect + @"
              AND EXISTS (
                    SELECT 1
                    FROM dbo.exam_assignments ea
                    WHERE ea.exam_id = es.exam_id
                      AND ea.student_id = @StudentId
                      AND ea.deleted_at IS NULL
                )
              AND (@SchoolYearId IS NULL OR es.school_year_id = @SchoolYearId)
              AND (@Semester IS NULL OR es.semester = @Semester)
            ORDER BY es.exam_date, es.exam_time, c.class_code";
            var parameters = new[]
            {
                new SqlParameter("@StudentId", studentId),
                new SqlParameter("@SchoolYearId", (object?)schoolYearId ?? DBNull.Value),
                new SqlParameter("@Semester", (object?)semester ?? DBNull.Value)
            };

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(_connectionString, query, parameters);
            
            var schedules = new List<ExamSchedule>();
            foreach (DataRow row in dt.Rows)
            {
                schedules.Add(MapToExamSchedule(row));
            }
            
            return schedules;
        }

        // ============================================================
        // 🔹 TẠO LỊCH THI MỚI
        // ============================================================
        public async Task<string> CreateAsync(ExamSchedule exam)
        {
            var examId = exam.ExamId;
            if (string.IsNullOrWhiteSpace(examId))
            {
                examId = $"EXAM-{Guid.NewGuid()}";
            }

            const string sql = @"
                INSERT INTO dbo.exam_schedules
                (
                    exam_id, class_id, subject_id, exam_date, exam_time, end_time, room_id,
                    exam_type, session_no, proctor_lecturer_id, duration, max_students, notes,
                    status, school_year_id, semester, created_at, created_by
                )
                VALUES
                (
                    @ExamId, @ClassId, @SubjectId, @ExamDate, @ExamTime, @EndTime, @RoomId,
                    @ExamType, @SessionNo, @ProctorLecturerId, @Duration, @MaxStudents, @Notes,
                    @Status, @SchoolYearId, @Semester, GETDATE(), @CreatedBy
                )";
            var parameters = new[]
            {
                new SqlParameter("@ExamId", examId),
                new SqlParameter("@ClassId", exam.ClassId),
                new SqlParameter("@SubjectId", exam.SubjectId),
                new SqlParameter("@ExamDate", exam.ExamDate.Date),
                new SqlParameter("@ExamTime", exam.ExamTime),
                new SqlParameter("@EndTime", exam.EndTime),
                new SqlParameter("@RoomId", (object?)exam.RoomId ?? DBNull.Value),
                new SqlParameter("@ExamType", exam.ExamType),
                new SqlParameter("@SessionNo", (object?)exam.SessionNo ?? DBNull.Value),
                new SqlParameter("@ProctorLecturerId", (object?)exam.ProctorLecturerId ?? DBNull.Value),
                new SqlParameter("@Duration", exam.Duration),
                new SqlParameter("@MaxStudents", (object?)exam.MaxStudents ?? DBNull.Value),
                new SqlParameter("@Notes", (object?)exam.Notes ?? DBNull.Value),
                new SqlParameter("@Status", exam.Status),
                new SqlParameter("@SchoolYearId", (object?)exam.SchoolYearId ?? DBNull.Value),
                new SqlParameter("@Semester", (object?)exam.Semester ?? DBNull.Value),
                new SqlParameter("@CreatedBy", (object?)exam.CreatedBy ?? "system")
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, sql, parameters);

            return examId;
        }

        // ============================================================
        // 🔹 CẬP NHẬT LỊCH THI
        // ============================================================
        public async Task UpdateAsync(ExamSchedule exam)
        {
            const string sql = @"
                UPDATE dbo.exam_schedules
                SET exam_date = @ExamDate,
                    exam_time = @ExamTime,
                    end_time = @EndTime,
                    room_id = @RoomId,
                    session_no = @SessionNo,
                    proctor_lecturer_id = @ProctorLecturerId,
                    duration = @Duration,
                    max_students = @MaxStudents,
                    notes = @Notes,
                    status = @Status,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE exam_id = @ExamId
                  AND deleted_at IS NULL";
            var parameters = new[]
            {
                new SqlParameter("@ExamId", exam.ExamId),
                new SqlParameter("@ExamDate", exam.ExamDate.Date),
                new SqlParameter("@ExamTime", (object?)exam.ExamTime ?? DBNull.Value),
                new SqlParameter("@EndTime", (object?)exam.EndTime ?? DBNull.Value),
                new SqlParameter("@RoomId", (object?)exam.RoomId ?? DBNull.Value),
                new SqlParameter("@SessionNo", (object?)exam.SessionNo ?? DBNull.Value),
                new SqlParameter("@ProctorLecturerId", (object?)exam.ProctorLecturerId ?? DBNull.Value),
                new SqlParameter("@Duration", (object?)exam.Duration ?? DBNull.Value),
                new SqlParameter("@MaxStudents", (object?)exam.MaxStudents ?? DBNull.Value),
                new SqlParameter("@Notes", (object?)exam.Notes ?? DBNull.Value),
                new SqlParameter("@Status", (object?)exam.Status ?? DBNull.Value),
                new SqlParameter("@UpdatedBy", (object?)exam.UpdatedBy ?? "system")
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, sql, parameters);
        }

        // ============================================================
        // 🔹 XÓA LỊCH THI (SOFT DELETE)
        // ============================================================
        public async Task DeleteAsync(string examId, string deletedBy)
        {
            const string sql = @"
                UPDATE dbo.exam_schedules
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy
                WHERE exam_id = @ExamId
                  AND deleted_at IS NULL";
            var parameters = new[]
            {
                new SqlParameter("@ExamId", examId),
                new SqlParameter("@DeletedBy", deletedBy)
            };

            await DatabaseHelper.ExecuteRawNonQueryAsync(_connectionString, sql, parameters);
        }

        // ============================================================
        // 🔹 KIỂM TRA XUNG ĐỘT PHÒNG THI
        // ============================================================
        public async Task<bool> CheckRoomConflictAsync(
            string roomId,
            DateTime examDate,
            TimeSpan startTime,
            TimeSpan endTime,
            string? excludeExamId = null)
        {
            const string sql = @"
                SELECT COUNT(*) 
                FROM dbo.exam_schedules
                WHERE room_id = @RoomId
                  AND exam_date = @ExamDate
                  AND deleted_at IS NULL
                  AND (@ExcludeExamId IS NULL OR exam_id <> @ExcludeExamId)
                  AND exam_time < @EndTime
                  AND end_time > @StartTime";
            var parameters = new[]
            {
                new SqlParameter("@RoomId", roomId),
                new SqlParameter("@ExamDate", examDate.Date),
                new SqlParameter("@StartTime", startTime),
                new SqlParameter("@EndTime", endTime),
                new SqlParameter("@ExcludeExamId", (object?)excludeExamId ?? DBNull.Value)
            };

            var result = await DatabaseHelper.ExecuteRawScalarAsync(_connectionString, sql, parameters);
            return Convert.ToInt32(result ?? 0) > 0;
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH SINH VIÊN TRONG LỚP HỌC PHẦN
        // ============================================================
        public async Task<List<ClassStudentDto>> GetStudentsByClassAsync(string classId)
        {
            const string sql = @"
                SELECT
                    e.student_id,
                    s.student_code,
                    s.full_name,
                    e.enrollment_id,
                    e.enrollment_date,
                    e.enrollment_status
                FROM dbo.enrollments e
                INNER JOIN dbo.students s ON e.student_id = s.student_id
                WHERE e.class_id = @ClassId
                  AND e.deleted_at IS NULL
                  AND s.deleted_at IS NULL
                ORDER BY s.student_code";
            var param = new SqlParameter("@ClassId", classId);
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(_connectionString, sql, param);

            var students = new List<ClassStudentDto>();
            foreach (DataRow row in dt.Rows)
            {
                students.Add(new ClassStudentDto
                {
                    StudentId = row["student_id"]?.ToString() ?? string.Empty,
                    StudentCode = row["student_code"]?.ToString() ?? string.Empty,
                    FullName = row["full_name"]?.ToString() ?? string.Empty,
                    EnrollmentId = row["enrollment_id"]?.ToString() ?? string.Empty,
                    EnrollmentDate = row["enrollment_date"] != DBNull.Value
                        ? Convert.ToDateTime(row["enrollment_date"])
                        : DateTime.Now,
                    EnrollmentStatus = row["enrollment_status"]?.ToString()
                });
            }

            return students;
        }

        // ============================================================
        // 🔹 LẤY LỊCH THI CỦA LỚP TRONG TUẦN CỤ THỂ (ĐỂ TÍCH HỢP TIMETABLE)
        // ============================================================
        public async Task<List<ExamSchedule>> GetExamsByClassAndWeekAsync(string classId, int year, int week)
        {
            // Tính ngày bắt đầu và kết thúc của tuần ISO
            var (startDate, endDate) = GetIsoWeekDateRange(year, week);

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                ExamScheduleSelect + @"
                  AND es.class_id = @ClassId
                  AND es.exam_date >= @StartDate
                  AND es.exam_date <= @EndDate
                ORDER BY es.exam_date, es.exam_time, c.class_code",
                new SqlParameter("@ClassId", classId),
                new SqlParameter("@StartDate", startDate.Date),
                new SqlParameter("@EndDate", endDate.Date));

            var schedules = new List<ExamSchedule>();
            foreach (DataRow row in dt.Rows)
            {
                schedules.Add(MapToExamSchedule(row));
            }

            return schedules;
        }

        // ============================================================
        // 🔹 HELPER: TÍNH TUẦN ISO TỪ DATE
        // ============================================================
        private int GetIsoWeekNumber(DateTime date)
        {
            // ISO 8601: Tuần 1 là tuần có ngày 4/1
            var day = (int)System.Globalization.CultureInfo.CurrentCulture.Calendar.GetDayOfWeek(date);
            if (day >= (int)DayOfWeek.Monday && day <= (int)DayOfWeek.Wednesday)
            {
                date = date.AddDays(3);
            }
            return System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                date, 
                System.Globalization.CalendarWeekRule.FirstFourDayWeek, 
                DayOfWeek.Monday);
        }

        // ============================================================
        // 🔹 HELPER: TÍNH DATE RANGE CỦA TUẦN ISO
        // ============================================================
        private (DateTime startDate, DateTime endDate) GetIsoWeekDateRange(int year, int week)
        {
            // Tính ngày 4/1 của năm (luôn nằm trong tuần 1 ISO)
            var jan4 = new DateTime(year, 1, 4);
            var jan4Day = ((int)jan4.DayOfWeek == 0 ? 7 : (int)jan4.DayOfWeek); // Convert Sunday to 7

            // Tính thứ 2 của tuần 1
            var mondayOfWeek1 = jan4.AddDays(-(jan4Day - 1));

            // Tính thứ 2 của tuần được yêu cầu
            var mondayOfTargetWeek = mondayOfWeek1.AddDays((week - 1) * 7);

            // Tuần ISO từ thứ 2 đến chủ nhật
            var startDate = mondayOfTargetWeek;
            var endDate = mondayOfTargetWeek.AddDays(6);

            return (startDate, endDate);
        }

        // ============================================================
        // 🔹 TẠO LỊCH THI CHO LỚP HỌC PHẦN (TỰ ĐỘNG PHÂN SINH VIÊN)
        // ============================================================
        public async Task<List<ExamSchedule>> CreateExamScheduleForClassAsync(ExamSchedule exam, string roomId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                var roomCapacity = await GetRoomCapacityAsync(conn, transaction, roomId);
                var students = await GetApprovedStudentsByClassAsync(conn, transaction, exam.ClassId);
                var requiredSessions = Math.Max(1, (int)Math.Ceiling((double)Math.Max(students.Count, 1) / roomCapacity));
                var maxStudentsPerSession = Math.Max(1, roomCapacity);
                var createdExamIds = new List<string>();

                for (var sessionIndex = 0; sessionIndex < requiredSessions; sessionIndex++)
                {
                    var createdExamId = $"EXAM-{Guid.NewGuid()}";
                    var sessionStudents = students
                        .Skip(sessionIndex * maxStudentsPerSession)
                        .Take(maxStudentsPerSession)
                        .ToList();

                    using var insertExamCmd = new SqlCommand(@"
                        INSERT INTO dbo.exam_schedules
                        (
                            exam_id, class_id, subject_id, exam_date, exam_time, end_time, room_id,
                            exam_type, session_no, proctor_lecturer_id, duration, max_students, notes,
                            status, school_year_id, semester, created_at, created_by
                        )
                        VALUES
                        (
                            @ExamId, @ClassId, @SubjectId, @ExamDate, @ExamTime, @EndTime, @RoomId,
                            @ExamType, @SessionNo, @ProctorLecturerId, @Duration, @MaxStudents, @Notes,
                            @Status, @SchoolYearId, @Semester, GETDATE(), @CreatedBy
                        )", conn, transaction);
                    insertExamCmd.Parameters.AddWithValue("@ExamId", createdExamId);
                    insertExamCmd.Parameters.AddWithValue("@ClassId", exam.ClassId);
                    insertExamCmd.Parameters.AddWithValue("@SubjectId", exam.SubjectId);
                    insertExamCmd.Parameters.AddWithValue("@ExamDate", exam.ExamDate.Date);
                    insertExamCmd.Parameters.AddWithValue("@ExamTime", exam.ExamTime);
                    insertExamCmd.Parameters.AddWithValue("@EndTime", exam.EndTime);
                    insertExamCmd.Parameters.AddWithValue("@RoomId", roomId);
                    insertExamCmd.Parameters.AddWithValue("@ExamType", exam.ExamType);
                    insertExamCmd.Parameters.AddWithValue("@SessionNo", sessionIndex + 1);
                    insertExamCmd.Parameters.AddWithValue("@ProctorLecturerId", (object?)exam.ProctorLecturerId ?? DBNull.Value);
                    insertExamCmd.Parameters.AddWithValue("@Duration", exam.Duration);
                    insertExamCmd.Parameters.AddWithValue("@MaxStudents", maxStudentsPerSession);
                    insertExamCmd.Parameters.AddWithValue("@Notes", (object?)exam.Notes ?? DBNull.Value);
                    insertExamCmd.Parameters.AddWithValue("@Status", exam.Status);
                    insertExamCmd.Parameters.AddWithValue("@SchoolYearId", (object?)exam.SchoolYearId ?? DBNull.Value);
                    insertExamCmd.Parameters.AddWithValue("@Semester", (object?)exam.Semester ?? DBNull.Value);
                    insertExamCmd.Parameters.AddWithValue("@CreatedBy", (object?)exam.CreatedBy ?? "system");
                    await insertExamCmd.ExecuteNonQueryAsync();

                    for (var i = 0; i < sessionStudents.Count; i++)
                    {
                        var student = sessionStudents[i];
                        var isQualified = await IsStudentQualifiedAsync(conn, transaction, student.StudentId, exam.ClassId);

                        using var insertAssignmentCmd = new SqlCommand(@"
                            INSERT INTO dbo.exam_assignments
                            (
                                assignment_id, exam_id, enrollment_id, student_id, seat_number,
                                status, notes, created_at, created_by
                            )
                            VALUES
                            (
                                @AssignmentId, @ExamId, @EnrollmentId, @StudentId, @SeatNumber,
                                @Status, @Notes, GETDATE(), @CreatedBy
                            )", conn, transaction);
                        insertAssignmentCmd.Parameters.AddWithValue("@AssignmentId", $"EA-{Guid.NewGuid()}");
                        insertAssignmentCmd.Parameters.AddWithValue("@ExamId", createdExamId);
                        insertAssignmentCmd.Parameters.AddWithValue("@EnrollmentId", student.EnrollmentId);
                        insertAssignmentCmd.Parameters.AddWithValue("@StudentId", student.StudentId);
                        insertAssignmentCmd.Parameters.AddWithValue("@SeatNumber", isQualified ? i + 1 : DBNull.Value);
                        insertAssignmentCmd.Parameters.AddWithValue("@Status", isQualified ? "ASSIGNED" : "NOT_QUALIFIED");
                        insertAssignmentCmd.Parameters.AddWithValue("@Notes", DBNull.Value);
                        insertAssignmentCmd.Parameters.AddWithValue("@CreatedBy", (object?)exam.CreatedBy ?? "system");
                        await insertAssignmentCmd.ExecuteNonQueryAsync();
                    }

                    createdExamIds.Add(createdExamId);
                }

                transaction.Commit();

                var createdExams = new List<ExamSchedule>();
                foreach (var createdExamId in createdExamIds)
                {
                    var createdExam = await GetByIdAsync(createdExamId);
                    if (createdExam != null)
                    {
                        createdExams.Add(createdExam);
                    }
                }

                return createdExams;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private static async Task<int> GetRoomCapacityAsync(SqlConnection conn, SqlTransaction transaction, string roomId)
        {
            using var cmd = new SqlCommand(
                "SELECT ISNULL(capacity, 50) FROM dbo.rooms WHERE room_id = @RoomId AND deleted_at IS NULL",
                conn,
                transaction);
            cmd.Parameters.AddWithValue("@RoomId", roomId);
            var result = await cmd.ExecuteScalarAsync();
            return Convert.ToInt32(result ?? 50);
        }

        private static async Task<List<(string EnrollmentId, string StudentId)>> GetApprovedStudentsByClassAsync(
            SqlConnection conn,
            SqlTransaction transaction,
            string classId)
        {
            using var cmd = new SqlCommand(@"
                SELECT enrollment_id, student_id
                FROM dbo.enrollments
                WHERE class_id = @ClassId
                  AND deleted_at IS NULL
                  AND enrollment_status = 'APPROVED'
                ORDER BY enrollment_date, enrollment_id", conn, transaction);
            cmd.Parameters.AddWithValue("@ClassId", classId);

            var students = new List<(string EnrollmentId, string StudentId)>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                students.Add((reader["enrollment_id"].ToString() ?? string.Empty, reader["student_id"].ToString() ?? string.Empty));
            }

            return students;
        }

        private static async Task<bool> IsStudentQualifiedAsync(
            SqlConnection conn,
            SqlTransaction transaction,
            string studentId,
            string classId)
        {
            using var cmd = new SqlCommand(@"
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
                        HAVING COUNT(*) > 0
                           AND (SUM(CASE WHEN a.status IN ('Absent', 'Vắng') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) > 20
                    ) THEN CAST(0 AS bit)
                    ELSE CAST(1 AS bit)
                END", conn, transaction);
            cmd.Parameters.AddWithValue("@StudentId", studentId);
            cmd.Parameters.AddWithValue("@ClassId", classId);
            var result = await cmd.ExecuteScalarAsync();
            return result == null || Convert.ToBoolean(result);
        }

        // ============================================================
        // 🔹 MAP DATA ROW TO EXAMSCHEDULE MODEL
        // ============================================================
        private static ExamSchedule MapToExamSchedule(DataRow row)
        {
            var exam = new ExamSchedule
            {
                ExamId = row["exam_id"]?.ToString() ?? string.Empty,
                ClassId = row["class_id"]?.ToString() ?? string.Empty,
                SubjectId = row["subject_id"]?.ToString() ?? string.Empty,
                ExamDate = row["exam_date"] != DBNull.Value
                    ? Convert.ToDateTime(row["exam_date"])
                    : DateTime.Now,
                ExamTime = row["exam_time"] != DBNull.Value
                    ? (row["exam_time"] is TimeSpan ts ? ts : TimeSpan.Parse(row["exam_time"].ToString()!))
                    : TimeSpan.Zero,
                EndTime = row["end_time"] != DBNull.Value
                    ? (row["end_time"] is TimeSpan ts2 ? ts2 : TimeSpan.Parse(row["end_time"].ToString()!))
                    : TimeSpan.Zero,
                RoomId = row.Table.Columns.Contains("room_id") && row["room_id"] != DBNull.Value
                    ? row["room_id"]?.ToString()
                    : null,
                ExamType = row["exam_type"]?.ToString() ?? string.Empty,
                SessionNo = row.Table.Columns.Contains("session_no") && row["session_no"] != DBNull.Value
                    ? Convert.ToInt32(row["session_no"])
                    : null,
                ProctorLecturerId = row.Table.Columns.Contains("proctor_lecturer_id") && row["proctor_lecturer_id"] != DBNull.Value
                    ? row["proctor_lecturer_id"]?.ToString()
                    : null,
                Duration = row["duration"] != DBNull.Value
                    ? Convert.ToInt32(row["duration"])
                    : 0,
                MaxStudents = row.Table.Columns.Contains("max_students") && row["max_students"] != DBNull.Value
                    ? Convert.ToInt32(row["max_students"])
                    : null,
                Notes = row.Table.Columns.Contains("notes") && row["notes"] != DBNull.Value
                    ? row["notes"]?.ToString()
                    : null,
                Status = row["status"]?.ToString() ?? "PLANNED",
                SchoolYearId = row.Table.Columns.Contains("school_year_id") && row["school_year_id"] != DBNull.Value
                    ? row["school_year_id"]?.ToString()
                    : null,
                Semester = row.Table.Columns.Contains("semester") && row["semester"] != DBNull.Value
                    ? Convert.ToInt32(row["semester"])
                    : null,
                CreatedAt = row.Table.Columns.Contains("created_at") && row["created_at"] != DBNull.Value
                    ? Convert.ToDateTime(row["created_at"])
                    : DateTime.Now,
                CreatedBy = row.Table.Columns.Contains("created_by") && row["created_by"] != DBNull.Value
                    ? row["created_by"]?.ToString()
                    : null,
                UpdatedAt = row.Table.Columns.Contains("updated_at") && row["updated_at"] != DBNull.Value
                    ? Convert.ToDateTime(row["updated_at"])
                    : (DateTime?)null,
                UpdatedBy = row.Table.Columns.Contains("updated_by") && row["updated_by"] != DBNull.Value
                    ? row["updated_by"]?.ToString()
                    : null
            };

            // Map NotMapped properties
            exam.ClassCode = row.Table.Columns.Contains("class_code") && row["class_code"] != DBNull.Value
                ? row["class_code"]?.ToString()
                : null;
            exam.ClassName = row.Table.Columns.Contains("class_name") && row["class_name"] != DBNull.Value
                ? row["class_name"]?.ToString()
                : null;
            exam.SubjectCode = row.Table.Columns.Contains("subject_code") && row["subject_code"] != DBNull.Value
                ? row["subject_code"]?.ToString()
                : null;
            exam.SubjectName = row.Table.Columns.Contains("subject_name") && row["subject_name"] != DBNull.Value
                ? row["subject_name"]?.ToString()
                : null;
            exam.RoomCode = row.Table.Columns.Contains("room_code") && row["room_code"] != DBNull.Value
                ? row["room_code"]?.ToString()
                : null;
            exam.Building = row.Table.Columns.Contains("building") && row["building"] != DBNull.Value
                ? row["building"]?.ToString()
                : null;
            exam.RoomCapacity = row.Table.Columns.Contains("room_capacity") && row["room_capacity"] != DBNull.Value
                ? Convert.ToInt32(row["room_capacity"])
                : null;
            exam.ProctorName = row.Table.Columns.Contains("proctor_name") && row["proctor_name"] != DBNull.Value
                ? row["proctor_name"]?.ToString()
                : null;
            exam.SchoolYearCode = row.Table.Columns.Contains("year_code") && row["year_code"] != DBNull.Value
                ? row["year_code"]?.ToString()
                : null;
            exam.SchoolYearName = row.Table.Columns.Contains("year_name") && row["year_name"] != DBNull.Value
                ? row["year_name"]?.ToString()
                : null;
            exam.AssignedStudents = row.Table.Columns.Contains("assigned_students") && row["assigned_students"] != DBNull.Value
                ? Convert.ToInt32(row["assigned_students"])
                : null;

            return exam;
        }
    }
}


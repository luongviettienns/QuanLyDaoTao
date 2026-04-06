using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EducationManagement.Common.Models;
using EducationManagement.Common.DTOs.Enrollment;

namespace EducationManagement.DAL.Repositories
{
    public class EnrollmentRepository
    {
        private readonly string _connectionString;
        private const string EnrollmentSelect = @"
            SELECT
                e.enrollment_id, e.student_id, e.class_id, e.enrollment_date, e.status,
                e.enrollment_status, e.drop_deadline, e.notes,
                e.drop_reason, e.created_at, e.created_by, e.updated_at, e.updated_by,
                s.student_code, s.full_name AS student_name,
                c.class_code, c.class_name
            FROM dbo.enrollments e
            LEFT JOIN dbo.students s ON e.student_id = s.student_id
            LEFT JOIN dbo.classes c ON e.class_id = c.class_id
            WHERE e.deleted_at IS NULL";

        public EnrollmentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<List<Enrollment>> GetAllAsync()
        {
            var enrollments = new List<Enrollment>();
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                EnrollmentSelect + @"
                ORDER BY e.enrollment_date DESC, e.created_at DESC");
            foreach (DataRow row in dt.Rows)
                enrollments.Add(MapToEnrollment(row));
            return enrollments;
        }

        public async Task<Enrollment?> GetByIdAsync(string enrollmentId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                EnrollmentSelect + @"
                  AND e.enrollment_id = @EnrollmentId",
                new SqlParameter("@EnrollmentId", enrollmentId));

            if (dt.Rows.Count == 0)
                return null;

            return MapToEnrollment(dt.Rows[0]);
        }

        public async Task<List<Enrollment>> GetByStudentIdAsync(string studentId)
        {
            var enrollments = new List<Enrollment>();
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                EnrollmentSelect + @"
                  AND e.student_id = @StudentId
                ORDER BY e.enrollment_date DESC",
                new SqlParameter("@StudentId", studentId));

            foreach (DataRow row in dt.Rows)
                enrollments.Add(MapToEnrollment(row));

            return enrollments;
        }

        public async Task<List<Enrollment>> GetByClassIdAsync(string classId)
        {
            var enrollments = new List<Enrollment>();
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                EnrollmentSelect + @"
                  AND e.class_id = @ClassId
                ORDER BY e.enrollment_date DESC",
                new SqlParameter("@ClassId", classId));

            foreach (DataRow row in dt.Rows)
                enrollments.Add(MapToEnrollment(row));

            return enrollments;
        }

        // ============================================================
        // 🔹 PHASE 2: ENROLLMENT SYSTEM - NEW METHODS
        // ============================================================

        // 1️⃣ GET AVAILABLE CLASSES FOR STUDENT
        public async Task<List<AvailableClassDto>> GetAvailableClassesAsync(
            string studentId, 
            string academicYearId, 
            int semester)
        {
            var parameters = new[]
            {
                new SqlParameter("@StudentId", studentId),
                new SqlParameter("@AcademicYearId", academicYearId),
                new SqlParameter("@Semester", semester)
            };

            var dt = await DatabaseHelper.ExecuteQueryAsync(
                _connectionString, "sp_GetAvailableClassesForStudent", parameters);

            var classes = new List<AvailableClassDto>();
            foreach (DataRow row in dt.Rows)
            {
                classes.Add(MapToAvailableClassDto(row));
            }

            return classes;
        }

        // 2️⃣ CHECK ENROLLMENT ELIGIBILITY
        public async Task<EligibilityCheckResponse> CheckEligibilityAsync(string studentId, string classId)
        {
            const string query = @"
                DECLARE @AcademicYearId VARCHAR(50);
                DECLARE @Semester NVARCHAR(20);
                DECLARE @SubjectId VARCHAR(50);
                DECLARE @MaxStudents INT;
                DECLARE @CurrentEnrollment INT;
                DECLARE @DropDeadline DATE;
                DECLARE @IsInPeriod BIT = 0;
                DECLARE @HasSlots BIT = 0;
                DECLARE @NotEnrolled BIT = 0;
                DECLARE @NoConflict BIT = 1;
                DECLARE @HasPrereq BIT = 1;
                DECLARE @ConflictClass NVARCHAR(200) = NULL;
                DECLARE @MissingPrereq NVARCHAR(200) = NULL;

                SELECT
                    @AcademicYearId = c.academic_year_id,
                    @Semester = c.semester,
                    @SubjectId = c.subject_id,
                    @MaxStudents = c.max_students,
                    @CurrentEnrollment = ISNULL(c.current_enrollment, 0)
                FROM dbo.classes c
                WHERE c.class_id = @ClassId
                  AND c.deleted_at IS NULL;

                IF @AcademicYearId IS NOT NULL
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM dbo.registration_periods rp
                        WHERE rp.academic_year_id = @AcademicYearId
                          AND CAST(rp.semester AS NVARCHAR(20)) = @Semester
                          AND rp.status = 'OPEN'
                          AND rp.is_active = 1
                          AND rp.deleted_at IS NULL
                          AND CAST(GETDATE() AS DATE) BETWEEN CAST(rp.start_date AS DATE) AND CAST(rp.end_date AS DATE)
                    )
                        SET @IsInPeriod = 1;
                END

                IF @MaxStudents IS NULL OR @CurrentEnrollment < @MaxStudents
                    SET @HasSlots = 1;

                IF NOT EXISTS (
                    SELECT 1
                    FROM dbo.enrollments e
                    WHERE e.student_id = @StudentId
                      AND e.class_id = @ClassId
                      AND e.deleted_at IS NULL
                      AND e.enrollment_status IN ('PENDING', 'APPROVED')
                )
                    SET @NotEnrolled = 1;

                SELECT TOP 1
                    @ConflictClass = c2.class_name
                FROM dbo.enrollments e
                INNER JOIN dbo.classes c2 ON e.class_id = c2.class_id
                INNER JOIN dbo.timetable_sessions tsExisting ON tsExisting.class_id = c2.class_id AND tsExisting.deleted_at IS NULL
                INNER JOIN dbo.timetable_sessions tsNew ON tsNew.class_id = @ClassId AND tsNew.deleted_at IS NULL
                WHERE e.student_id = @StudentId
                  AND e.deleted_at IS NULL
                  AND e.enrollment_status IN ('PENDING', 'APPROVED')
                  AND c2.deleted_at IS NULL
                  AND tsExisting.weekday = tsNew.weekday
                  AND tsExisting.start_time < tsNew.end_time
                  AND tsExisting.end_time > tsNew.start_time;

                IF @ConflictClass IS NOT NULL
                    SET @NoConflict = 0;

                SELECT TOP 1
                    @MissingPrereq = s2.subject_name
                FROM dbo.subject_prerequisites sp
                INNER JOIN dbo.subjects s2 ON sp.prerequisite_subject_id = s2.subject_id
                WHERE sp.subject_id = @SubjectId
                  AND sp.deleted_at IS NULL
                  AND sp.is_active = 1
                  AND NOT EXISTS (
                        SELECT 1
                        FROM dbo.enrollments e
                        INNER JOIN dbo.classes c ON e.class_id = c.class_id
                        LEFT JOIN dbo.grades g ON g.enrollment_id = e.enrollment_id
                        WHERE e.student_id = @StudentId
                          AND c.subject_id = sp.prerequisite_subject_id
                          AND e.deleted_at IS NULL
                          AND c.deleted_at IS NULL
                          AND ISNULL(g.total_score, 0) >= ISNULL(sp.minimum_grade, 4.0)
                  );

                IF @MissingPrereq IS NOT NULL
                    SET @HasPrereq = 0;

                SELECT
                    CAST(CASE WHEN @IsInPeriod = 1 AND @HasSlots = 1 AND @NotEnrolled = 1 AND @NoConflict = 1 AND @HasPrereq = 1 THEN 1 ELSE 0 END AS bit) AS is_eligible,
                    CASE
                        WHEN @IsInPeriod = 0 THEN N'Không nằm trong thời gian đăng ký'
                        WHEN @HasSlots = 0 THEN N'Lớp đã đủ sĩ số'
                        WHEN @NotEnrolled = 0 THEN N'Sinh viên đã đăng ký lớp này'
                        WHEN @NoConflict = 0 THEN N'Bị trùng lịch với lớp khác'
                        WHEN @HasPrereq = 0 THEN N'Chưa đạt môn tiên quyết'
                        ELSE NULL
                    END AS error_message,
                    @IsInPeriod AS is_in_period,
                    @HasSlots AS has_slots,
                    @NotEnrolled AS not_enrolled,
                    @NoConflict AS no_conflict,
                    @HasPrereq AS has_prereq,
                    @ConflictClass AS conflicting_class,
                    @MissingPrereq AS missing_prereq;";

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@StudentId", studentId),
                new SqlParameter("@ClassId", classId));

            if (dt.Rows.Count == 0)
                return new EligibilityCheckResponse { IsEligible = false, ErrorMessage = "Không thể kiểm tra điều kiện" };

            var row = dt.Rows[0];
            return new EligibilityCheckResponse
            {
                IsEligible = Convert.ToBoolean(row["is_eligible"]),
                ErrorMessage = row["error_message"]?.ToString(),
                IsInRegistrationPeriod = row.Table.Columns.Contains("is_in_period") && Convert.ToBoolean(row["is_in_period"]),
                HasAvailableSlots = row.Table.Columns.Contains("has_slots") && Convert.ToBoolean(row["has_slots"]),
                IsNotAlreadyEnrolled = row.Table.Columns.Contains("not_enrolled") && Convert.ToBoolean(row["not_enrolled"]),
                NoScheduleConflict = row.Table.Columns.Contains("no_conflict") && Convert.ToBoolean(row["no_conflict"]),
                HasPrerequisites = row.Table.Columns.Contains("has_prereq") && Convert.ToBoolean(row["has_prereq"]),
                ConflictingClass = row.Table.Columns.Contains("conflicting_class") ? row["conflicting_class"]?.ToString() : null,
                MissingPrerequisite = row.Table.Columns.Contains("missing_prereq") ? row["missing_prereq"]?.ToString() : null
            };
        }

        // 3️⃣ CREATE ENROLLMENT
        public async Task<string> CreateEnrollmentAsync(
            string studentId, 
            string classId, 
            string? notes, 
            string createdBy)
        {
            string enrollmentId = $"ENR-{Guid.NewGuid()}";
            const string query = @"
                INSERT INTO dbo.enrollments
                (
                    enrollment_id, student_id, class_id, enrollment_date, status,
                    enrollment_status, drop_deadline, notes, created_at, created_by
                )
                VALUES
                (
                    @EnrollmentId, @StudentId, @ClassId, GETDATE(), 'Active',
                    'APPROVED', CAST(DATEADD(WEEK, 2, GETDATE()) AS DATE), @Notes, GETDATE(), @CreatedBy
                );

                UPDATE dbo.classes
                SET current_enrollment = ISNULL(current_enrollment, 0) + 1,
                    updated_at = GETDATE(),
                    updated_by = @CreatedBy
                WHERE class_id = @ClassId
                  AND deleted_at IS NULL;";

            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@EnrollmentId", enrollmentId),
                new SqlParameter("@StudentId", studentId),
                new SqlParameter("@ClassId", classId),
                new SqlParameter("@Notes", (object?)notes ?? DBNull.Value),
                new SqlParameter("@CreatedBy", createdBy));

            return enrollmentId;
        }

        // 4️⃣ DROP ENROLLMENT
        public async Task DropEnrollmentAsync(string enrollmentId, string reason, string deletedBy)
        {
            const string query = @"
                UPDATE dbo.enrollments
                SET enrollment_status = 'DROPPED',
                    status = 'Dropped',
                    drop_reason = @Reason,
                    updated_at = GETDATE(),
                    updated_by = @DeletedBy,
                    deleted_at = GETDATE(),
                    deleted_by = @DeletedBy
                WHERE enrollment_id = @EnrollmentId
                  AND deleted_at IS NULL;

                UPDATE c
                SET c.current_enrollment = CASE
                        WHEN ISNULL(c.current_enrollment, 0) > 0 THEN c.current_enrollment - 1
                        ELSE 0
                    END,
                    c.updated_at = GETDATE(),
                    c.updated_by = @DeletedBy
                FROM dbo.classes c
                INNER JOIN dbo.enrollments e ON e.class_id = c.class_id
                WHERE e.enrollment_id = @EnrollmentId;";

            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@EnrollmentId", enrollmentId),
                new SqlParameter("@Reason", reason),
                new SqlParameter("@DeletedBy", deletedBy));
        }

        // 5️⃣ WITHDRAW ENROLLMENT
        public async Task WithdrawEnrollmentAsync(string enrollmentId, string reason, string withdrawnBy)
        {
            const string query = @"
                UPDATE dbo.enrollments
                SET enrollment_status = 'WITHDRAWN',
                    status = 'Dropped',
                    drop_reason = @Reason,
                    updated_at = GETDATE(),
                    updated_by = @WithdrawnBy
                WHERE enrollment_id = @EnrollmentId
                  AND deleted_at IS NULL";

            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@EnrollmentId", enrollmentId),
                new SqlParameter("@Reason", reason),
                new SqlParameter("@WithdrawnBy", withdrawnBy));
        }

        // 6️⃣ BULK ENROLLMENT
        public async Task<(int SuccessCount, int ErrorCount, string ErrorDetails)> BulkEnrollmentAsync(
            string studentId, 
            List<string> classIds, 
            string createdBy)
        {
            // Call SP for each classId and aggregate results
            int successCount = 0;
            int errorCount = 0;
            var errorDetails = new List<string>();

            foreach (var classId in classIds)
            {
                try
                {
                    await CreateEnrollmentAsync(studentId, classId, null, createdBy);
                    successCount++;
                }
                catch (Exception ex)
                {
                    errorCount++;
                    errorDetails.Add($"{classId}: {ex.Message}");
                }
            }

            return (successCount, errorCount, string.Join("; ", errorDetails));
        }

        // 7️⃣ GET STUDENT SCHEDULE
        public async Task<List<StudentScheduleDto>> GetStudentScheduleAsync(
            string studentId, 
            int semester, 
            string academicYearId)
        {
            const string query = @"
                SELECT
                    c.class_id,
                    c.class_code,
                    c.class_name,
                    s.subject_code,
                    s.subject_name,
                    s.credits,
                    l.full_name AS lecturer_name,
                    ts.weekday AS day_of_week,
                    ts.start_time,
                    ts.end_time,
                    r.room_code AS room,
                    r.building,
                    NULL AS color
                FROM dbo.enrollments e
                INNER JOIN dbo.classes c ON e.class_id = c.class_id
                INNER JOIN dbo.subjects s ON c.subject_id = s.subject_id
                LEFT JOIN dbo.lecturers l ON c.lecturer_id = l.lecturer_id
                LEFT JOIN dbo.timetable_sessions ts ON ts.class_id = c.class_id AND ts.deleted_at IS NULL
                LEFT JOIN dbo.rooms r ON ts.room_id = r.room_id
                WHERE e.student_id = @StudentId
                  AND e.deleted_at IS NULL
                  AND e.enrollment_status IN ('PENDING', 'APPROVED')
                  AND c.deleted_at IS NULL
                  AND c.academic_year_id = @AcademicYearId
                  AND CAST(c.semester AS INT) = @Semester
                ORDER BY ts.weekday, ts.start_time, c.class_code";

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@StudentId", studentId),
                new SqlParameter("@Semester", semester),
                new SqlParameter("@AcademicYearId", academicYearId));

            var schedule = new List<StudentScheduleDto>();
            foreach (DataRow row in dt.Rows)
            {
                schedule.Add(MapToStudentScheduleDto(row));
            }

            return schedule;
        }

        // 8️⃣ CHECK SCHEDULE CONFLICT
        public async Task<(bool HasConflict, string? ConflictDetails)> CheckScheduleConflictAsync(
            string studentId, 
            string classId)
        {
            const string query = @"
                SELECT TOP 1
                    CAST(1 AS bit) AS has_conflict,
                    CONCAT(N'Trùng lịch với lớp ', c2.class_code, N' - ', c2.class_name) AS conflict_details
                FROM dbo.enrollments e
                INNER JOIN dbo.classes c2 ON e.class_id = c2.class_id
                INNER JOIN dbo.timetable_sessions tsExisting ON tsExisting.class_id = c2.class_id AND tsExisting.deleted_at IS NULL
                INNER JOIN dbo.timetable_sessions tsNew ON tsNew.class_id = @NewClassId AND tsNew.deleted_at IS NULL
                WHERE e.student_id = @StudentId
                  AND e.deleted_at IS NULL
                  AND e.enrollment_status IN ('PENDING', 'APPROVED')
                  AND c2.deleted_at IS NULL
                  AND tsExisting.weekday = tsNew.weekday
                  AND tsExisting.start_time < tsNew.end_time
                  AND tsExisting.end_time > tsNew.start_time";

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@StudentId", studentId),
                new SqlParameter("@NewClassId", classId));

            if (dt.Rows.Count == 0)
                return (false, null);

            var row = dt.Rows[0];
            bool hasConflict = Convert.ToBoolean(row["has_conflict"]);
            string? conflictDetails = row["conflict_details"]?.ToString();

            return (hasConflict, conflictDetails);
        }

        // 9️⃣ GET CLASS ROSTER
        public async Task<List<Student>> GetClassRosterAsync(string classId)
        {
            var parameters = new[]
            {
                new SqlParameter("@ClassId", classId)
            };

            // Stored procedure returns 2 result sets:
            // - Result set 1: Class info (1 row)
            // - Result set 2: Student roster (multiple rows)
            var ds = await DatabaseHelper.ExecuteQueryMultipleAsync(
                _connectionString, "sp_GetClassRoster", parameters);

            var students = new List<Student>();
            
            // Read result set 2 (student roster) - index 1
            if (ds.Tables.Count > 1 && ds.Tables[1] != null)
            {
                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    students.Add(MapToStudentRoster(row));
                }
            }

            return students;
        }

        // 🔟 UPDATE ENROLLMENT STATUS
        public async Task UpdateEnrollmentStatusAsync(string enrollmentId, string newStatus, string updatedBy)
        {
            const string query = @"
                UPDATE dbo.enrollments
                SET enrollment_status = @NewStatus,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE enrollment_id = @EnrollmentId
                  AND deleted_at IS NULL";

            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@EnrollmentId", enrollmentId),
                new SqlParameter("@NewStatus", newStatus),
                new SqlParameter("@UpdatedBy", updatedBy));
        }

        // 1️⃣1️⃣ GET ENROLLMENT STATISTICS
        public async Task<Dictionary<string, int>> GetEnrollmentStatisticsAsync(
            string academicYearId, 
            int semester)
        {
            const string query = @"
                SELECT
                    COUNT(*) AS total_enrollments,
                    SUM(CASE WHEN e.enrollment_status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_enrollments,
                    SUM(CASE WHEN e.enrollment_status = 'PENDING' THEN 1 ELSE 0 END) AS pending_enrollments,
                    SUM(CASE WHEN e.enrollment_status = 'DROPPED' THEN 1 ELSE 0 END) AS dropped_enrollments,
                    SUM(CASE WHEN e.enrollment_status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_enrollments
                FROM dbo.enrollments e
                INNER JOIN dbo.classes c ON e.class_id = c.class_id
                WHERE e.deleted_at IS NULL
                  AND c.deleted_at IS NULL
                  AND c.academic_year_id = @AcademicYearId
                  AND CAST(c.semester AS INT) = @Semester";

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@AcademicYearId", academicYearId),
                new SqlParameter("@Semester", semester));

            var stats = new Dictionary<string, int>();
            if (dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                foreach (DataColumn col in dt.Columns)
                {
                    stats[col.ColumnName] = Convert.ToInt32(row[col]);
                }
            }

            return stats;
        }

        // 1️⃣2️⃣ GET ENROLLMENTS BY STUDENT (with details)
        public async Task<List<EnrollmentDetailDto>> GetEnrollmentsByStudentDetailedAsync(
            string studentId, 
            string? academicYearId = null, 
            int? semester = null)
        {
            var parameters = new[]
            {
                new SqlParameter("@StudentId", studentId),
                new SqlParameter("@AcademicYearId", (object?)academicYearId ?? DBNull.Value),
                new SqlParameter("@Semester", (object?)semester ?? DBNull.Value)
            };

            var dt = await DatabaseHelper.ExecuteQueryAsync(
                _connectionString, "sp_GetEnrollmentsByStudent", parameters);

            var enrollments = new List<EnrollmentDetailDto>();
            foreach (DataRow row in dt.Rows)
            {
                enrollments.Add(MapToEnrollmentDetailDto(row));
            }

            return enrollments;
        }

        // 1️⃣3️⃣ GET PENDING ENROLLMENTS (For Advisor Approval)
        public async Task<(List<EnrollmentDetailDto> Enrollments, int TotalCount)> GetPendingEnrollmentsAsync(
            string? studentId = null,
            string? classId = null,
            string? subjectId = null,
            string? schoolYearId = null,
            int? semester = null,
            int page = 1,
            int pageSize = 50)
        {
            var parameters = new[]
            {
                new SqlParameter("@StudentId", (object?)studentId ?? DBNull.Value),
                new SqlParameter("@ClassId", (object?)classId ?? DBNull.Value),
                new SqlParameter("@SubjectId", (object?)subjectId ?? DBNull.Value),
                new SqlParameter("@SchoolYearId", (object?)schoolYearId ?? DBNull.Value),
                new SqlParameter("@Semester", (object?)semester ?? DBNull.Value),
                new SqlParameter("@Page", page),
                new SqlParameter("@PageSize", pageSize)
            };

            var dt = await DatabaseHelper.ExecuteQueryAsync(
                _connectionString, "sp_GetPendingEnrollments", parameters);

            var enrollments = new List<EnrollmentDetailDto>();
            int totalCount = 0;

            foreach (DataRow row in dt.Rows)
            {
                enrollments.Add(MapToEnrollmentDetailDto(row));
                // Get total count from first row
                if (totalCount == 0 && row.Table.Columns.Contains("total_count"))
                {
                    totalCount = Convert.ToInt32(row["total_count"]);
                }
            }

            return (enrollments, totalCount);
        }

        // ============================================================
        // MAPPING HELPERS
        // ============================================================
        
        private static Enrollment MapToEnrollment(DataRow row)
        {
            return new Enrollment
            {
                EnrollmentId = row["enrollment_id"].ToString()!,
                StudentId = row["student_id"].ToString()!,
                ClassId = row["class_id"].ToString()!,
                EnrollmentDate = Convert.ToDateTime(row["enrollment_date"]),
                Status = row["status"]?.ToString() ?? "Active",
                DroppedDate = null,
                DroppedReason = row.Table.Columns.Contains("drop_reason") ? row["drop_reason"]?.ToString() : null,
                EnrollmentStatus = row.Table.Columns.Contains("enrollment_status") ? row["enrollment_status"]?.ToString() ?? "APPROVED" : "APPROVED",
                DropDeadline = row.Table.Columns.Contains("drop_deadline") && row["drop_deadline"] != DBNull.Value 
                    ? Convert.ToDateTime(row["drop_deadline"]) : null,
                Notes = row.Table.Columns.Contains("notes") ? row["notes"]?.ToString() : null,
                CreatedAt = row["created_at"] == DBNull.Value ? DateTime.Now : Convert.ToDateTime(row["created_at"]),
                CreatedBy = row["created_by"]?.ToString(),
                UpdatedAt = row["updated_at"] == DBNull.Value ? null : Convert.ToDateTime(row["updated_at"]),
                UpdatedBy = row["updated_by"]?.ToString()
            };
        }

        private static AvailableClassDto MapToAvailableClassDto(DataRow row)
        {
            return new AvailableClassDto
            {
                ClassId = row["class_id"].ToString()!,
                ClassCode = row["class_code"].ToString()!,
                ClassName = row["class_name"].ToString()!,
                SubjectId = row["subject_id"].ToString()!,
                SubjectCode = row["subject_code"].ToString()!,
                SubjectName = row["subject_name"].ToString()!,
                Credits = Convert.ToInt32(row["credits"]),
                LecturerId = row["lecturer_id"]?.ToString(),
                LecturerName = row["lecturer_name"]?.ToString(),
                Schedule = row["schedule"]?.ToString(),
                Room = row["room"]?.ToString(),
                MaxStudents = Convert.ToInt32(row["max_students"]),
                CurrentEnrollment = Convert.ToInt32(row["current_enrollment"]),
                IsEligible = row.Table.Columns.Contains("is_eligible") && Convert.ToBoolean(row["is_eligible"]),
                IneligibleReason = row.Table.Columns.Contains("ineligible_reason") ? row["ineligible_reason"]?.ToString() : null,
                IsAlreadyEnrolled = row.Table.Columns.Contains("is_already_enrolled") && Convert.ToBoolean(row["is_already_enrolled"]),
                HasScheduleConflict = row.Table.Columns.Contains("has_schedule_conflict") && Convert.ToBoolean(row["has_schedule_conflict"]),
                MissingPrerequisites = row.Table.Columns.Contains("missing_prerequisites") && Convert.ToBoolean(row["missing_prerequisites"]),
                ConflictingClassName = row.Table.Columns.Contains("conflicting_class_name") ? row["conflicting_class_name"]?.ToString() : null
            };
        }

        private static StudentScheduleDto MapToStudentScheduleDto(DataRow row)
        {
            return new StudentScheduleDto
            {
                ClassId = row["class_id"].ToString()!,
                ClassCode = row["class_code"].ToString()!,
                ClassName = row["class_name"].ToString()!,
                SubjectCode = row["subject_code"].ToString()!,
                SubjectName = row["subject_name"].ToString()!,
                Credits = Convert.ToInt32(row["credits"]),
                LecturerName = row["lecturer_name"]?.ToString(),
                DayOfWeek = Convert.ToInt32(row["day_of_week"]),
                StartTime = TimeSpan.Parse(row["start_time"].ToString()!),
                EndTime = TimeSpan.Parse(row["end_time"].ToString()!),
                Room = row["room"]?.ToString(),
                Building = row.Table.Columns.Contains("building") ? row["building"]?.ToString() : null,
                Color = row.Table.Columns.Contains("color") ? row["color"]?.ToString() : null
            };
        }

        private static EnrollmentDetailDto MapToEnrollmentDetailDto(DataRow row)
        {
            return new EnrollmentDetailDto
            {
                EnrollmentId = row["enrollment_id"].ToString()!,
                StudentId = row["student_id"].ToString()!,
                StudentCode = row.Table.Columns.Contains("student_code") ? row["student_code"]?.ToString() : null,
                StudentName = row.Table.Columns.Contains("student_name") ? row["student_name"]?.ToString() : null,
                ClassId = row["class_id"].ToString()!,
                ClassCode = row.Table.Columns.Contains("class_code") ? row["class_code"]?.ToString() : null,
                ClassName = row.Table.Columns.Contains("class_name") ? row["class_name"]?.ToString() : null,
                SubjectId = row.Table.Columns.Contains("subject_id") ? row["subject_id"]?.ToString() : null,
                SubjectCode = row.Table.Columns.Contains("subject_code") ? row["subject_code"]?.ToString() : null,
                SubjectName = row.Table.Columns.Contains("subject_name") ? row["subject_name"]?.ToString() : null,
                Credits = row.Table.Columns.Contains("credits") && row["credits"] != DBNull.Value ? Convert.ToInt32(row["credits"]) : null,
                LecturerName = row.Table.Columns.Contains("lecturer_name") ? row["lecturer_name"]?.ToString() : null,
                Schedule = row.Table.Columns.Contains("schedule") ? row["schedule"]?.ToString() : null,
                Room = row.Table.Columns.Contains("room") ? row["room"]?.ToString() : null,
                EnrollmentDate = Convert.ToDateTime(row["enrollment_date"]),
                EnrollmentStatus = row.Table.Columns.Contains("enrollment_status") ? (row["enrollment_status"]?.ToString() ?? "APPROVED") : "APPROVED",
                DropDeadline = row.Table.Columns.Contains("drop_deadline") && row["drop_deadline"] != DBNull.Value ? Convert.ToDateTime(row["drop_deadline"]) : null,
                Notes = row.Table.Columns.Contains("notes") ? row["notes"]?.ToString() : null,
                DropReason = row.Table.Columns.Contains("drop_reason") ? row["drop_reason"]?.ToString() : null
            };
        }

        private static Student MapToStudentRoster(DataRow row)
        {
            return new Student
            {
                StudentId = row["student_id"].ToString()!,
                StudentCode = row["student_code"].ToString()!,
                FullName = row["full_name"].ToString()!,
                Email = row["email"]?.ToString(),
                Phone = row.Table.Columns.Contains("phone_number") ? row["phone_number"]?.ToString() : 
                        (row.Table.Columns.Contains("phone") ? row["phone"]?.ToString() : null),
                Gender = row.Table.Columns.Contains("gender") ? row["gender"]?.ToString() : null,
                AdminClassName = row.Table.Columns.Contains("admin_class_name") ? row["admin_class_name"]?.ToString() : null,
                AdminClassCode = row.Table.Columns.Contains("admin_class_code") ? row["admin_class_code"]?.ToString() : null
            };
        }
    }
}


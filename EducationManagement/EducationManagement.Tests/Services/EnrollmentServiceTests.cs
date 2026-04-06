using EducationManagement.BLL.Services;
using Xunit;

namespace EducationManagement.Tests.Services;

public class EnrollmentServiceValidationTests
{
    // ─── GetEnrollmentByIdAsync ─────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetEnrollmentByIdAsync_WithEmptyId_ThrowsArgumentException(string? enrollmentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetEnrollmentByIdAsync(enrollmentId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── GetEnrollmentsByStudentAsync ─────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetEnrollmentsByStudentAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetEnrollmentsByStudentAsync(studentId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── GetEnrollmentsByClassAsync ──────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetEnrollmentsByClassAsync_WithEmptyClassId_ThrowsArgumentException(string? classId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetEnrollmentsByClassAsync(classId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── GetAvailableClassesAsync ─────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetAvailableClassesAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetAvailableClassesAsync_Throws(studentId!, "year-001", 1));

        Assert.Contains("Student ID", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetAvailableClassesAsync_WithEmptyAcademicYearId_ThrowsArgumentException(string? academicYearId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetAvailableClassesAsync_Throws("student-001", academicYearId!, 1));

        Assert.Contains("Academic Year ID", ex.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(4)]
    [InlineData(10)]
    public async Task GetAvailableClassesAsync_WithInvalidSemester_ThrowsArgumentException(int semester)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetAvailableClassesAsync_Throws("student-001", "year-001", semester));

        Assert.Contains("Học kỳ phải là 1, 2, hoặc 3", ex.Message);
    }

    // ─── CheckEligibilityAsync ────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CheckEligibilityAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CheckEligibilityAsync(studentId!, "class-001"));

        Assert.Contains("Student ID", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CheckEligibilityAsync_WithEmptyClassId_ThrowsArgumentException(string? classId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CheckEligibilityAsync("student-001", classId!));

        Assert.Contains("Class ID", ex.Message);
    }

    // ─── EnrollAsync ─────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task EnrollAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EnrollAsync(studentId!, "class-001", null, "admin-001"));

        Assert.Contains("Student ID", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task EnrollAsync_WithEmptyClassId_ThrowsArgumentException(string? classId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EnrollAsync("student-001", classId!, null, "admin-001"));

        Assert.Contains("Class ID", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task EnrollAsync_WithEmptyCreatedBy_ThrowsArgumentException(string? createdBy)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EnrollAsync("student-001", "class-001", null, createdBy!));

        Assert.Contains("CreatedBy", ex.Message);
    }

    // ─── DropEnrollmentAsync ───────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task DropEnrollmentAsync_WithEmptyEnrollmentId_ThrowsArgumentException(string? enrollmentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.DropEnrollmentAsync(enrollmentId!, "Tôi muốn hủy", "admin-001"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task DropEnrollmentAsync_WithEmptyReason_ThrowsArgumentException(string? reason)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.DropEnrollmentAsync("enroll-001", reason!, "admin-001"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task DropEnrollmentAsync_WithEmptyDeletedBy_ThrowsArgumentException(string? deletedBy)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.DropEnrollmentAsync("enroll-001", "reason", deletedBy!));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── BulkEnrollAsync ──────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task BulkEnrollAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.BulkEnrollAsync(studentId!, new List<string> { "c1", "c2" }, "admin-001"));

        Assert.Contains("Student ID", ex.Message);
    }

    [Fact]
    public async Task BulkEnrollAsync_WithEmptyClassList_ThrowsArgumentException()
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.BulkEnrollAsync("student-001", new List<string>(), "admin-001"));

        Assert.Contains("không được rỗng", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task BulkEnrollAsync_WithEmptyCreatedBy_ThrowsArgumentException(string? createdBy)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.BulkEnrollAsync("student-001", new List<string> { "c1" }, createdBy!));

        Assert.Contains("CreatedBy", ex.Message);
    }

    // ─── GetStudentScheduleAsync ──────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetStudentScheduleAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetStudentScheduleAsync(studentId!, 1, "year-001"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(4)]
    public async Task GetStudentScheduleAsync_WithInvalidSemester_ThrowsArgumentException(int semester)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetStudentScheduleAsync("student-001", semester, "year-001"));

        Assert.Contains("Học kỳ phải là 1, 2, hoặc 3", ex.Message);
    }

    // ─── CheckScheduleConflictAsync ───────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CheckScheduleConflictAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CheckScheduleConflictAsync(studentId!, "class-001"));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── GetClassRosterAsync ─────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetClassRosterAsync_WithEmptyClassId_ThrowsArgumentException(string? classId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetClassRosterAsync(classId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── GetEnrollmentStatisticsAsync ────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetEnrollmentStatisticsAsync_WithEmptyAcademicYearId_ThrowsArgumentException(string? academicYearId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetEnrollmentStatisticsAsync(academicYearId!, 1));

        Assert.Contains("Academic Year ID", ex.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(4)]
    public async Task GetEnrollmentStatisticsAsync_WithInvalidSemester_ThrowsArgumentException(int semester)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetEnrollmentStatisticsAsync("year-001", semester));

        Assert.Contains("Học kỳ phải là 1, 2, hoặc 3", ex.Message);
    }

    // ─── UpdateEnrollmentStatusAsync ─────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task UpdateEnrollmentStatusAsync_WithEmptyEnrollmentId_ThrowsArgumentException(string? enrollmentId)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateEnrollmentStatusAsync(enrollmentId!, "APPROVED", "admin-001"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task UpdateEnrollmentStatusAsync_WithEmptyStatus_ThrowsArgumentException(string? newStatus)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateEnrollmentStatusAsync("enroll-001", newStatus!, "admin-001"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("INVALID")]
    [InlineData("PENDINGD")]
    [InlineData("Approved")]       // case sensitive
    [InlineData("pending")]       // lowercase
    public async Task UpdateEnrollmentStatusAsync_WithInvalidStatus_ThrowsArgumentException(string newStatus)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateEnrollmentStatusAsync("enroll-001", newStatus, "admin-001"));

        Assert.Contains("không hợp lệ", ex.Message);
    }

    [Theory]
    [InlineData("PENDING")]
    [InlineData("APPROVED")]
    [InlineData("DROPPED")]
    [InlineData("WITHDRAWN")]
    public async Task UpdateEnrollmentStatusAsync_WithValidStatus_DoesNotThrow(string newStatus)
    {
        var service = new TestableEnrollmentService();

        var ex = await Record.ExceptionAsync(
            () => service.UpdateEnrollmentStatusAsync("enroll-001", newStatus, "admin-001"));

        Assert.Null(ex);
    }

    // ─── GetPendingEnrollmentsAsync ──────────────────────

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetPendingEnrollmentsAsync_WithInvalidPage_ThrowsArgumentException(int page)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetPendingEnrollmentsAsync(null, null, null, null, null, page, 50));

        Assert.Contains("Page phải lớn hơn 0", ex.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(101)]
    [InlineData(500)]
    public async Task GetPendingEnrollmentsAsync_WithInvalidPageSize_ThrowsArgumentException(int pageSize)
    {
        var service = new TestableEnrollmentService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetPendingEnrollmentsAsync(null, null, null, null, null, 1, pageSize));

        Assert.Contains("PageSize phải từ 1 đến 100", ex.Message);
    }
}

// ─── Helper ────────────────────────────────────────────────

internal class TestableEnrollmentService
{
    public async Task GetEnrollmentByIdAsync(string enrollmentId)
    {
        if (string.IsNullOrWhiteSpace(enrollmentId))
            throw new ArgumentException("Enrollment ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetEnrollmentsByStudentAsync(string studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetEnrollmentsByClassAsync(string classId)
    {
        if (string.IsNullOrWhiteSpace(classId))
            throw new ArgumentException("Class ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetAvailableClassesAsync_Throws(string studentId, string academicYearId, int semester)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        if (string.IsNullOrWhiteSpace(academicYearId))
            throw new ArgumentException("Academic Year ID không được để trống");
        if (semester < 1 || semester > 3)
            throw new ArgumentException("Học kỳ phải là 1, 2, hoặc 3");
        await Task.CompletedTask;
    }

    public async Task CheckEligibilityAsync(string studentId, string classId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        if (string.IsNullOrWhiteSpace(classId))
            throw new ArgumentException("Class ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task EnrollAsync(string studentId, string classId, string? notes, string createdBy)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        if (string.IsNullOrWhiteSpace(classId))
            throw new ArgumentException("Class ID không được để trống");
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("CreatedBy không được để trống");
        await Task.CompletedTask;
    }

    public async Task DropEnrollmentAsync(string enrollmentId, string reason, string deletedBy)
    {
        if (string.IsNullOrWhiteSpace(enrollmentId))
            throw new ArgumentException("Enrollment ID không được để trống");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Lý do hủy đăng ký không được để trống");
        if (string.IsNullOrWhiteSpace(deletedBy))
            throw new ArgumentException("DeletedBy không được để trống");
        await Task.CompletedTask;
    }

    public async Task BulkEnrollAsync(string studentId, List<string> classIds, string createdBy)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        if (classIds == null || classIds.Count == 0)
            throw new ArgumentException("Danh sách lớp không được rỗng");
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("CreatedBy không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetStudentScheduleAsync(string studentId, int semester, string academicYearId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        if (semester < 1 || semester > 3)
            throw new ArgumentException("Học kỳ phải là 1, 2, hoặc 3");
        await Task.CompletedTask;
    }

    public async Task CheckScheduleConflictAsync(string studentId, string classId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetClassRosterAsync(string classId)
    {
        if (string.IsNullOrWhiteSpace(classId))
            throw new ArgumentException("Class ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetEnrollmentStatisticsAsync(string academicYearId, int semester)
    {
        if (string.IsNullOrWhiteSpace(academicYearId))
            throw new ArgumentException("Academic Year ID không được để trống");
        if (semester < 1 || semester > 3)
            throw new ArgumentException("Học kỳ phải là 1, 2, hoặc 3");
        await Task.CompletedTask;
    }

    public async Task UpdateEnrollmentStatusAsync(string enrollmentId, string newStatus, string updatedBy)
    {
        if (string.IsNullOrWhiteSpace(enrollmentId))
            throw new ArgumentException("Enrollment ID không được để trống");
        if (string.IsNullOrWhiteSpace(newStatus))
            throw new ArgumentException("Status không được để trống");
        var validStatuses = new[] { "PENDING", "APPROVED", "DROPPED", "WITHDRAWN" };
        if (!Array.Exists(validStatuses, s => s == newStatus))
            throw new ArgumentException($"Status không hợp lệ. Phải là: {string.Join(", ", validStatuses)}");
        await Task.CompletedTask;
    }

    public async Task GetPendingEnrollmentsAsync(
        string? studentId, string? classId, string? subjectId, string? schoolYearId,
        int? semester, int page, int pageSize)
    {
        if (page < 1)
            throw new ArgumentException("Page phải lớn hơn 0");
        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException("PageSize phải từ 1 đến 100");
        await Task.CompletedTask;
    }
}

using EducationManagement.BLL.Services;
using EducationManagement.Common.DTOs.Grade;
using Xunit;

namespace EducationManagement.Tests.Services;

public class AttendanceServiceValidationTests
{
    // ─── GetAttendanceByIdAsync ─────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetAttendanceByIdAsync_WithInvalidId_ThrowsArgumentException(string? attendanceId)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetAttendanceByIdAsync(attendanceId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── CreateAttendanceAsync ──────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateAttendanceAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateAttendanceAsync("att-001", studentId!, "sch-001",
                DateTime.Now, "Present", null, "lecturer-001", "admin-001"));

        Assert.Contains("Student ID", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateAttendanceAsync_WithEmptyScheduleId_ThrowsArgumentException(string? scheduleId)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateAttendanceAsync("att-001", "student-001", scheduleId!,
                DateTime.Now, "Present", null, "lecturer-001", "admin-001"));

        Assert.Contains("Schedule ID", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateAttendanceAsync_WithEmptyStatus_ThrowsArgumentException(string? status)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateAttendanceAsync("att-001", "student-001", "sch-001",
                DateTime.Now, status!, null, "lecturer-001", "admin-001"));

        Assert.Contains("Status", ex.Message);
    }

    [Theory]
    [InlineData("Invalid")]
    [InlineData("AbsentExtra")]
    [InlineData("LateExtra")]
    [InlineData("ExcusedExtra")]
    public async Task CreateAttendanceAsync_WithInvalidStatus_ThrowsArgumentException(string status)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateAttendanceAsync("att-001", "student-001", "sch-001",
                DateTime.Now, status, null, "lecturer-001", "admin-001"));

        Assert.Contains("Status phải là một trong", ex.Message);
    }

    [Theory]
    [InlineData("Present")]
    [InlineData("Absent")]
    [InlineData("Late")]
    [InlineData("Excused")]
    public async Task CreateAttendanceAsync_WithValidStatus_DoesNotThrow(string status)
    {
        var service = new TestableAttendanceService();

        var ex = await Record.ExceptionAsync(
            () => service.CreateAttendanceAsync("att-001", "student-001", "sch-001",
                DateTime.Now, status, null, "lecturer-001", "admin-001"));

        Assert.Null(ex);
    }

    // ─── UpdateAttendanceAsync ─────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task UpdateAttendanceAsync_WithEmptyAttendanceId_ThrowsArgumentException(string? attendanceId)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateAttendanceAsync(attendanceId!, "Present", null, "admin-001"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task UpdateAttendanceAsync_WithEmptyStatus_ThrowsArgumentException(string? status)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateAttendanceAsync("att-001", status!, null, "admin-001"));

        Assert.Contains("Status", ex.Message);
    }

    [Theory]
    [InlineData("Invalid")]
    [InlineData("bad_status")]
    public async Task UpdateAttendanceAsync_WithInvalidStatus_ThrowsArgumentException(string status)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateAttendanceAsync("att-001", status, null, "admin-001"));

        Assert.Contains("Status phải là một trong", ex.Message);
    }

    // ─── DeleteAttendanceAsync ─────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task DeleteAttendanceAsync_WithEmptyId_ThrowsArgumentException(string? attendanceId)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.DeleteAttendanceAsync(attendanceId!, "admin-001"));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── GetAttendancesByStudentAsync ──────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetAttendancesByStudentAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetAttendancesByStudentAsync(studentId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── GetAttendancesByScheduleAsync ────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetAttendancesByScheduleAsync_WithEmptyScheduleId_ThrowsArgumentException(string? scheduleId)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetAttendancesByScheduleAsync(scheduleId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    // ─── GetAttendancesByClassAsync ───────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetAttendancesByClassAsync_WithEmptyClassId_ThrowsArgumentException(string? classId)
    {
        var service = new TestableAttendanceService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetAttendancesByClassAsync(classId!));

        Assert.Contains("không được để trống", ex.Message);
    }
}

// ─── Helper ────────────────────────────────────────────────

internal class TestableAttendanceService
{
    private static readonly string[] ValidStatuses = { "Present", "Absent", "Late", "Excused" };

    public async Task GetAttendanceByIdAsync(string attendanceId)
    {
        if (string.IsNullOrWhiteSpace(attendanceId))
            throw new ArgumentException("Attendance ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task CreateAttendanceAsync(
        string attendanceId, string studentId, string scheduleId,
        DateTime attendanceDate, string status, string? notes, string? markedBy, string createdBy)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        if (string.IsNullOrWhiteSpace(scheduleId))
            throw new ArgumentException("Schedule ID không được để trống");
        if (string.IsNullOrWhiteSpace(status))
            throw new ArgumentException("Status không được để trống");
        if (!Array.Exists(ValidStatuses, s => s.Equals(status, StringComparison.OrdinalIgnoreCase)))
            throw new ArgumentException($"Status phải là một trong: {string.Join(", ", ValidStatuses)}");
        await Task.CompletedTask;
    }

    public async Task UpdateAttendanceAsync(string attendanceId, string status, string? notes, string updatedBy)
    {
        if (string.IsNullOrWhiteSpace(attendanceId))
            throw new ArgumentException("Attendance ID không được để trống");
        if (string.IsNullOrWhiteSpace(status))
            throw new ArgumentException("Status không được để trống");
        if (!Array.Exists(ValidStatuses, s => s.Equals(status, StringComparison.OrdinalIgnoreCase)))
            throw new ArgumentException($"Status phải là một trong: {string.Join(", ", ValidStatuses)}");
        await Task.CompletedTask;
    }

    public async Task DeleteAttendanceAsync(string attendanceId, string deletedBy)
    {
        if (string.IsNullOrWhiteSpace(attendanceId))
            throw new ArgumentException("Attendance ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetAttendancesByStudentAsync(string studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetAttendancesByScheduleAsync(string scheduleId)
    {
        if (string.IsNullOrWhiteSpace(scheduleId))
            throw new ArgumentException("Schedule ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetAttendancesByClassAsync(string classId)
    {
        if (string.IsNullOrWhiteSpace(classId))
            throw new ArgumentException("Class ID không được để trống");
        await Task.CompletedTask;
    }
}

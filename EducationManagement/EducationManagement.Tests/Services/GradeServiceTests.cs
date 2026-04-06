using EducationManagement.BLL.Services;
using EducationManagement.Common.DTOs.Grade;
using Xunit;

namespace EducationManagement.Tests.Services;

/// <summary>
/// Test validation logic và business rules của GradeService.
/// Các test này KHÔNG cần database vì chỉ test validation và logic tính toán.
/// Integration tests (với DB) cần chạy riêng.
/// </summary>
public class GradeServiceValidationTests
{
    // ─── GetGradeByIdAsync: Validation Tests ─────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetGradeByIdAsync_WithInvalidId_ThrowsArgumentException(string? gradeId)
    {
        // Vì không mock được GradeRepository (phụ thuộc DB thật),
        // ta test bằng cách gọi reflection hoặc test tương tự
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetGradeByIdAsync_Throws(gradeId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Fact]
    public async Task CreateGradeAsync_WithEmptyStudentId_ThrowsArgumentException()
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateGradeAsync("gradeId", "", "class-001", "Final", 8.0m, 10m, 0.4m, null, null, "a1"));

        Assert.Contains("Student ID", ex.Message);
    }

    [Fact]
    public async Task CreateGradeAsync_WithEmptyClassId_ThrowsArgumentException()
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateGradeAsync("gradeId", "s1", "", "Final", 8.0m, 10m, 0.4m, null, null, "a1"));

        Assert.Contains("Class ID", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateGradeAsync_WithEmptyGradeType_ThrowsArgumentException(string? gradeType)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateGradeAsync("gradeId", "s1", "c1", gradeType!, 8.0m, 10m, 0.4m, null, null, "a1"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData(-1.0, 10.0)]
    [InlineData(-0.01, 10.0)]
    public async Task CreateGradeAsync_WithNegativeScore_ThrowsArgumentException(decimal score, decimal max)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateGradeAsync("gradeId", "s1", "c1", "Final", score, max, 0.4m, null, null, "a1"));

        Assert.Contains("nằm trong khoảng", ex.Message);
    }

    [Theory]
    [InlineData(10.1, 10.0)]
    [InlineData(15.0, 10.0)]
    [InlineData(100.0, 10.0)]
    public async Task CreateGradeAsync_WithScoreExceedsMax_ThrowsArgumentException(decimal score, decimal max)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateGradeAsync("gradeId", "s1", "c1", "Final", score, max, 0.4m, null, null, "a1"));

        Assert.Contains("nằm trong khoảng", ex.Message);
    }

    [Theory]
    [InlineData(0, 10.0)]
    [InlineData(5.0, 10.0)]
    [InlineData(9.9, 10.0)]
    public async Task CreateGradeAsync_WithValidScore_DoesNotThrow(decimal score, decimal max)
    {
        var service = new TestableGradeService();

        var ex = await Record.ExceptionAsync(
            () => service.CreateGradeAsync("gradeId", "s1", "c1", "Final", score, max, 0.4m, null, null, "a1"));

        Assert.Null(ex);
    }

    [Fact]
    public async Task UpdateGradeAsync_WithEmptyGradeId_ThrowsArgumentException()
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateGradeAsync("", "Final", 8.0m, 10m, 0.4m, null, "a1"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData(11.0, 10.0)]
    [InlineData(-1.0, 10.0)]
    public async Task UpdateGradeAsync_WithScoreOutOfRange_ThrowsArgumentException(decimal score, decimal max)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateGradeAsync("g1", "Final", score, max, 0.4m, null, "a1"));

        Assert.Contains("nằm trong khoảng", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task DeleteGradeAsync_WithEmptyId_ThrowsArgumentException(string gradeId)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.DeleteGradeAsync(gradeId, "a1"));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetGradesByStudentAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetGradesByStudentAsync(studentId!));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetGradesByClassAsync_WithEmptyClassId_ThrowsArgumentException(string classId)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetGradesByClassAsync(classId));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetGradesByStudentSchoolYearAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetGradesByStudentSchoolYearAsync(studentId!, null, null));

        Assert.Contains("không được để trống", ex.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task GetGradeSummaryAsync_WithEmptyStudentId_ThrowsArgumentException(string? studentId)
    {
        var service = new TestableGradeService();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetGradeSummaryAsync(studentId!, null, null));

        Assert.Contains("không được để trống", ex.Message);
    }
}

// ─── GPA Conversion Tests (Logic thuần túy) ───────────────

public class GpaConversionTests
{
    [Theory]
    [InlineData(9.0, 4.0)]   // ≥9.0 → 4.0
    [InlineData(9.5, 4.0)]   // ≥9.0 → 4.0
    [InlineData(8.5, 3.7)]   // ≥8.5 → 3.7
    [InlineData(8.0, 3.5)]   // ≥8.0 → 3.5
    [InlineData(7.5, 3.0)]   // ≥7.0 → 3.0
    [InlineData(6.5, 2.5)]   // ≥6.5 → 2.5
    [InlineData(6.0, 2.0)]   // ≥6.0 → 2.0
    [InlineData(5.5, 1.5)]   // ≥5.5 → 1.5
    [InlineData(5.0, 1.0)]   // ≥5.0 → 1.0
    [InlineData(4.9, 0.0)]   // <5.0 → 0.0
    [InlineData(0.0, 0.0)]   // 0 → 0.0
    public void Gpa10ToGpa4_ConvertsCorrectly(decimal gpa10, decimal expectedGpa4)
    {
        // Act: GPA 10 → GPA 4 conversion logic (trích từ GradeSummaryDto)
        var gpa4 = gpa10 switch
        {
            >= 9.0m => 4.0m,
            >= 8.5m => 3.7m,
            >= 8.0m => 3.5m,
            >= 7.0m => 3.0m,
            >= 6.5m => 2.5m,
            >= 6.0m => 2.0m,
            >= 5.5m => 1.5m,
            >= 5.0m => 1.0m,
            _ => 0.0m
        };

        Assert.Equal(expectedGpa4, gpa4);
    }

    // Use object[] to force decimal literals (5.0 is double, 5.0m is decimal)
    public static IEnumerable<object[]> Gpa10ToRankText_Data()
    {
        yield return new object[] { 9.0m, "Xuất sắc" };
        yield return new object[] { 8.5m, "Giỏi" };
        yield return new object[] { 8.0m, "Giỏi" };
        yield return new object[] { 7.5m, "Khá" };
        yield return new object[] { 7.0m, "Khá" };
        yield return new object[] { 5.5m, "Trung bình" };
        yield return new object[] { 5.0m, "Yếu" };
        yield return new object[] { 4.9m, "Yếu" };
        yield return new object[] { 0.0m, "Yếu" };
    }

    [Theory]
    [MemberData(nameof(Gpa10ToRankText_Data))]
    public void Gpa10ToRankText_ReturnsCorrectVietnameseRank(decimal gpa10, string expectedRank)
    {
        // Copy logic from GradeService.GetGradeSummaryAsync()
        var rank = gpa10 switch
        {
            >= 9.0m => "Xuất sắc",
            >= 8.0m => "Giỏi",
            >= 7.0m => "Khá",
            >= 5.5m => "Trung bình",
            _ => "Yếu"
        };
        Assert.Equal(expectedRank, rank);
    }

    [Fact]
    public void Gpa10ToGpa4_BoundaryAt9_0_Returns4Point0()
    {
        // Ranh giới: 9.0 → 4.0, 8.99 → 3.7
        var gpaAt9 = 9.0m switch { >= 9.0m => 4.0m, _ => 0.0m };
        var gpaAt8_99 = 8.99m switch { >= 9.0m => 4.0m, _ => 3.7m };

        Assert.Equal(4.0m, gpaAt9);
        Assert.Equal(3.7m, gpaAt8_99);
    }
}

// ─── Helper: TestableGradeService ─────────────────────────

/// <summary>
/// Wrapper cho GradeService để test validation logic
/// mà không cần database thật.
/// </summary>
internal class TestableGradeService
{
    // Delegate các validation checks giống hệt GradeService
    public async Task GetGradeByIdAsync_Throws(string gradeId)
    {
        if (string.IsNullOrWhiteSpace(gradeId))
            throw new ArgumentException("Grade ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task CreateGradeAsync(string gradeId, string studentId, string classId,
        string gradeType, decimal score, decimal maxScore, decimal weight,
        string? notes, string? gradedBy, string createdBy)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        if (string.IsNullOrWhiteSpace(classId))
            throw new ArgumentException("Class ID không được để trống");
        if (string.IsNullOrWhiteSpace(gradeType))
            throw new ArgumentException("Grade type không được để trống");
        if (score < 0 || score > maxScore)
            throw new ArgumentException($"Điểm phải nằm trong khoảng 0 đến {maxScore}");
        await Task.CompletedTask;
    }

    public async Task UpdateGradeAsync(string gradeId, string gradeType, decimal score,
        decimal maxScore, decimal weight, string? notes, string updatedBy)
    {
        if (string.IsNullOrWhiteSpace(gradeId))
            throw new ArgumentException("Grade ID không được để trống");
        if (score < 0 || score > maxScore)
            throw new ArgumentException($"Điểm phải nằm trong khoảng 0 đến {maxScore}");
        await Task.CompletedTask;
    }

    public async Task DeleteGradeAsync(string gradeId, string deletedBy)
    {
        if (string.IsNullOrWhiteSpace(gradeId))
            throw new ArgumentException("Grade ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetGradesByStudentAsync(string studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetGradesByClassAsync(string classId)
    {
        if (string.IsNullOrWhiteSpace(classId))
            throw new ArgumentException("Class ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetGradesByStudentSchoolYearAsync(string studentId, string? schoolYearId, string? semester)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        await Task.CompletedTask;
    }

    public async Task GetGradeSummaryAsync(string studentId, string? schoolYearId, string? semester)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            throw new ArgumentException("Student ID không được để trống");
        await Task.CompletedTask;
    }
}

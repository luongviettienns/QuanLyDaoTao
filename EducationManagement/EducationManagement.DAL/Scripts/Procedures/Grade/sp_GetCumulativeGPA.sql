CREATE OR ALTER PROCEDURE dbo.sp_GetCumulativeGPA
    @StudentId VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH GradeSource AS
    (
        SELECT
            s.student_id,
            s.student_code,
            s.full_name AS student_name,
            sub.credits,
            g.total_score
        FROM dbo.students s
        LEFT JOIN dbo.enrollments e
            ON e.student_id = s.student_id
           AND e.deleted_at IS NULL
        LEFT JOIN dbo.classes c
            ON c.class_id = e.class_id
           AND c.deleted_at IS NULL
        LEFT JOIN dbo.subjects sub
            ON sub.subject_id = c.subject_id
        LEFT JOIN dbo.grades g
            ON g.enrollment_id = e.enrollment_id
        WHERE s.student_id = @StudentId
          AND s.deleted_at IS NULL
    )
    SELECT
        student_id,
        MAX(student_code) AS student_code,
        MAX(student_name) AS student_name,
        CAST(
            CASE
                WHEN SUM(CASE WHEN total_score IS NOT NULL THEN credits ELSE 0 END) = 0 THEN NULL
                ELSE ROUND(
                    SUM(
                        CASE
                            WHEN total_score >= 9.0 THEN 4.0 * credits
                            WHEN total_score >= 8.5 THEN 3.7 * credits
                            WHEN total_score >= 8.0 THEN 3.5 * credits
                            WHEN total_score >= 7.0 THEN 3.0 * credits
                            WHEN total_score >= 6.5 THEN 2.5 * credits
                            WHEN total_score >= 6.0 THEN 2.0 * credits
                            WHEN total_score >= 5.5 THEN 1.5 * credits
                            WHEN total_score >= 5.0 THEN 1.0 * credits
                            ELSE 0
                        END
                    ) / NULLIF(SUM(CASE WHEN total_score IS NOT NULL THEN credits ELSE 0 END), 0),
                    2
                )
            END AS DECIMAL(10, 2)
        ) AS cumulative_gpa4,
        CAST(
            CASE
                WHEN COUNT(CASE WHEN total_score IS NOT NULL THEN 1 END) = 0 THEN NULL
                ELSE ROUND(AVG(CAST(total_score AS DECIMAL(10, 2))), 2)
            END AS DECIMAL(10, 2)
        ) AS cumulative_gpa10,
        SUM(CASE WHEN total_score >= 5.0 THEN credits ELSE 0 END) AS total_credits_earned,
        SUM(CASE WHEN total_score IS NOT NULL THEN credits ELSE 0 END) AS accumulated_credits,
        COUNT(CASE WHEN total_score IS NOT NULL THEN 1 END) AS total_subjects,
        COUNT(CASE WHEN total_score >= 5.0 THEN 1 END) AS passed_subjects,
        COUNT(CASE WHEN total_score IS NOT NULL AND total_score < 5.0 THEN 1 END) AS failed_subjects,
        CASE
            WHEN COUNT(CASE WHEN total_score IS NOT NULL THEN 1 END) = 0 THEN NULL
            WHEN AVG(CAST(total_score AS DECIMAL(10, 2))) >= 8.5 THEN N'Xuất sắc'
            WHEN AVG(CAST(total_score AS DECIMAL(10, 2))) >= 7.0 THEN N'Giỏi'
            WHEN AVG(CAST(total_score AS DECIMAL(10, 2))) >= 5.5 THEN N'Khá'
            WHEN AVG(CAST(total_score AS DECIMAL(10, 2))) >= 4.0 THEN N'Trung bình'
            ELSE N'Yếu'
        END AS overall_rank
    FROM GradeSource
    GROUP BY student_id;
END

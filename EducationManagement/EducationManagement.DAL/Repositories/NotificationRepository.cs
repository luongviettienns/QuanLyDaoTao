using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EducationManagement.Common.Models;
using EducationManagement.Common.Helpers;

namespace EducationManagement.DAL.Repositories
{
    public class NotificationRepository
    {
        private readonly string _connectionString;
        private const string NotificationSelect = @"
            SELECT
                notification_id, recipient_id, title, content, type, is_read, sent_date,
                is_active, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by
            FROM dbo.notifications
            WHERE deleted_at IS NULL";

        public NotificationRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<string> CreateAsync(string recipientId, string title, string content, string type, string? createdBy = null, DateTime? sentDate = null)
        {
            var notificationId = IdGenerator.Generate("notif");
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                @"
                INSERT INTO dbo.notifications
                (
                    notification_id, recipient_id, title, content, type, is_read, sent_date,
                    is_active, created_at, created_by
                )
                VALUES
                (
                    @NotificationId, @RecipientId, @Title, @Content, @Type, 0, @SentDate,
                    1, GETDATE(), @CreatedBy
                )",
                new SqlParameter("@NotificationId", notificationId),
                new SqlParameter("@RecipientId", recipientId),
                new SqlParameter("@Title", title),
                new SqlParameter("@Content", content),
                new SqlParameter("@Type", type),
                new SqlParameter("@CreatedBy", (object?)createdBy ?? DBNull.Value),
                new SqlParameter("@SentDate", (object?)sentDate ?? DBNull.Value));
            return notificationId;
        }

        public async Task<(List<Notification> Notifications, int TotalCount)> GetByUserIdAsync(string userId, int page = 1, int pageSize = 50, string? type = null, bool? isRead = null)
        {
            var notifications = new List<Notification>();
            var totalCount = Convert.ToInt32(
                await DatabaseHelper.ExecuteRawScalarAsync(
                    _connectionString,
                    @"
                    SELECT COUNT(*)
                    FROM dbo.notifications
                    WHERE deleted_at IS NULL
                      AND recipient_id = @UserId
                      AND (@Type IS NULL OR type = @Type)
                      AND (@IsRead IS NULL OR is_read = @IsRead)",
                    new SqlParameter("@UserId", userId),
                    new SqlParameter("@Type", (object?)type ?? DBNull.Value),
                    new SqlParameter("@IsRead", (object?)isRead ?? DBNull.Value)) ?? 0);

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                NotificationSelect + @"
                  AND recipient_id = @UserId
                  AND (@Type IS NULL OR type = @Type)
                  AND (@IsRead IS NULL OR is_read = @IsRead)
                ORDER BY created_at DESC
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@UserId", userId),
                new SqlParameter("@Type", (object?)type ?? DBNull.Value),
                new SqlParameter("@IsRead", (object?)isRead ?? DBNull.Value),
                new SqlParameter("@Offset", Math.Max(page - 1, 0) * pageSize),
                new SqlParameter("@PageSize", pageSize));

            foreach (DataRow row in dt.Rows)
                notifications.Add(MapToNotification(row));

            return (notifications, totalCount);
        }

        public async Task<List<Notification>> GetUnreadByUserIdAsync(string userId, int limit = 10)
        {
            var notifications = new List<Notification>();
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                @"
                SELECT TOP (@Limit)
                    notification_id, recipient_id, title, content, type, is_read, sent_date,
                    is_active, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by
                FROM dbo.notifications
                WHERE deleted_at IS NULL
                  AND recipient_id = @UserId
                  AND is_read = 0
                ORDER BY created_at DESC",
                new SqlParameter("@UserId", userId),
                new SqlParameter("@Limit", limit));
            foreach (DataRow row in dt.Rows)
                notifications.Add(MapToNotification(row));

            return notifications;
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            var result = await DatabaseHelper.ExecuteRawScalarAsync(
                _connectionString,
                @"
                SELECT COUNT(*)
                FROM dbo.notifications
                WHERE deleted_at IS NULL
                  AND recipient_id = @UserId
                  AND is_read = 0",
                new SqlParameter("@UserId", userId));

            return Convert.ToInt32(result ?? 0);
        }

        public async Task<Notification?> GetByIdAsync(string notificationId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                NotificationSelect + @"
                  AND notification_id = @NotificationId",
                new SqlParameter("@NotificationId", notificationId));

            if (dt.Rows.Count > 0)
                return MapToNotification(dt.Rows[0]);

            return null;
        }

        public async Task MarkAsReadAsync(string notificationId, string? userId = null)
        {
            if (string.IsNullOrWhiteSpace(notificationId))
            {
                throw new ArgumentException("Notification ID không được để trống");
            }

            var affected = await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                @"
                UPDATE dbo.notifications
                SET is_read = 1,
                    updated_at = GETDATE(),
                    updated_by = @UserId
                WHERE notification_id = @NotificationId
                  AND deleted_at IS NULL
                  AND (@UserId IS NULL OR recipient_id = @UserId)",
                new SqlParameter("@NotificationId", notificationId),
                new SqlParameter("@UserId", (object?)userId ?? DBNull.Value));

            if (affected == 0)
                throw new Exception("Không tìm thấy notification hoặc đã bị xóa");
        }

        public async Task<int> MarkAllAsReadAsync(string userId, string? updatedBy = null)
        {
            return await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                @"
                UPDATE dbo.notifications
                SET is_read = 1,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE recipient_id = @UserId
                  AND is_read = 0
                  AND deleted_at IS NULL",
                new SqlParameter("@UserId", userId),
                new SqlParameter("@UpdatedBy", (object?)updatedBy ?? DBNull.Value));
        }

        public async Task DeleteAsync(string notificationId, string? deletedBy = null)
        {
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                @"
                UPDATE dbo.notifications
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy,
                    is_active = 0
                WHERE notification_id = @NotificationId
                  AND deleted_at IS NULL",
                new SqlParameter("@NotificationId", notificationId),
                new SqlParameter("@DeletedBy", (object?)deletedBy ?? DBNull.Value));
        }

        private static Notification MapToNotification(DataRow row)
        {
            return new Notification
            {
                NotificationId = row["notification_id"]?.ToString() ?? "",
                RecipientId = row.Table.Columns.Contains("recipient_id") 
                    ? (row["recipient_id"]?.ToString() ?? "") 
                    : (row.Table.Columns.Contains("user_id") ? row["user_id"]?.ToString() ?? "" : ""),
                Title = row["title"]?.ToString() ?? "",
                Content = row.Table.Columns.Contains("content") 
                    ? (row["content"]?.ToString() ?? "") 
                    : (row.Table.Columns.Contains("message") ? row["message"]?.ToString() ?? "" : ""),
                Type = row.Table.Columns.Contains("type")
                    ? (row["type"]?.ToString() ?? "System")
                    : (row.Table.Columns.Contains("notification_type") ? row["notification_type"]?.ToString() ?? "System" : "System"),
                IsRead = row.Table.Columns.Contains("is_read") && row["is_read"] != DBNull.Value 
                    ? Convert.ToBoolean(row["is_read"]) 
                    : false,
                SentDate = row.Table.Columns.Contains("sent_date") && row["sent_date"] != DBNull.Value
                    ? Convert.ToDateTime(row["sent_date"])
                    : (row.Table.Columns.Contains("created_at") && row["created_at"] != DBNull.Value
                        ? Convert.ToDateTime(row["created_at"])
                        : null),
                CreatedAt = row.Table.Columns.Contains("created_at") && row["created_at"] != DBNull.Value
                    ? Convert.ToDateTime(row["created_at"])
                    : DateTime.Now,
                CreatedBy = row.Table.Columns.Contains("created_by") && row["created_by"] != DBNull.Value
                    ? row["created_by"]?.ToString()
                    : null,
                UpdatedAt = row.Table.Columns.Contains("updated_at") && row["updated_at"] != DBNull.Value
                    ? Convert.ToDateTime(row["updated_at"])
                    : null,
                UpdatedBy = row.Table.Columns.Contains("updated_by") && row["updated_by"] != DBNull.Value
                    ? row["updated_by"]?.ToString()
                    : null,
                IsActive = row.Table.Columns.Contains("is_active") && row["is_active"] != DBNull.Value
                    ? Convert.ToBoolean(row["is_active"])
                    : true
            };
        }
    }
}


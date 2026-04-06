using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EducationManagement.Common.Models;
using EducationManagement.DAL;

namespace EducationManagement.DAL.Repositories
{
    public class UserRepository
    {
        private readonly string _connectionString;
        private const string UserSelect = @"
            SELECT
                u.user_id, u.username, u.password_hash, u.email, u.phone, u.full_name, u.avatar_url,
                u.role_id, u.is_active, u.last_login_at, u.created_at, u.created_by,
                u.updated_at, u.updated_by, u.deleted_at, u.deleted_by,
                r.role_name
            FROM dbo.users u
            LEFT JOIN dbo.roles r ON u.role_id = r.role_id
            WHERE u.deleted_at IS NULL";

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH NGƯỜI DÙNG (CÓ PHÂN TRANG)
        // ============================================================
        public async Task<(List<User> Users, int TotalCount)> GetAllAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? roleId = null,
            bool? isActive = null)
        {
            const string countQuery = @"
                SELECT COUNT(*)
                FROM dbo.users u
                WHERE u.deleted_at IS NULL
                  AND (@Search IS NULL OR u.username LIKE '%' + @Search + '%' OR u.full_name LIKE '%' + @Search + '%' OR u.email LIKE '%' + @Search + '%')
                  AND (@RoleId IS NULL OR u.role_id = @RoleId)
                  AND (@IsActive IS NULL OR u.is_active = @IsActive)";
            var totalCount = Convert.ToInt32(
                await DatabaseHelper.ExecuteRawScalarAsync(
                    _connectionString,
                    countQuery,
                    new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                    new SqlParameter("@RoleId", (object?)roleId ?? DBNull.Value),
                    new SqlParameter("@IsActive", (object?)isActive ?? DBNull.Value)) ?? 0);

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                UserSelect + @"
                  AND (@Search IS NULL OR u.username LIKE '%' + @Search + '%' OR u.full_name LIKE '%' + @Search + '%' OR u.email LIKE '%' + @Search + '%')
                  AND (@RoleId IS NULL OR u.role_id = @RoleId)
                  AND (@IsActive IS NULL OR u.is_active = @IsActive)
                ORDER BY u.created_at DESC
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@RoleId", (object?)roleId ?? DBNull.Value),
                new SqlParameter("@IsActive", (object?)isActive ?? DBNull.Value),
                new SqlParameter("@Offset", Math.Max(page - 1, 0) * pageSize),
                new SqlParameter("@PageSize", pageSize));

            var users = new List<User>();
            foreach (DataRow row in dt.Rows)
            {
                users.Add(MapToUser(row));
            }

            return (users, totalCount);
        }

        // ============================================================
        // 🔹 LẤY NGƯỜI DÙNG THEO ID
        // ============================================================
        public async Task<User?> GetByIdAsync(string userId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                UserSelect + @"
                  AND u.user_id = @UserId",
                new SqlParameter("@UserId", userId));

            if (dt.Rows.Count == 0)
                return null;

            return MapToUser(dt.Rows[0]);
        }

        // ============================================================
        // 🔹 LẤY NGƯỜI DÙNG THEO USERNAME (CHO AUTH)
        // ============================================================
        public async Task<User?> GetByUsernameAsync(string username)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                UserSelect + @"
                  AND u.username = @Username",
                new SqlParameter("@Username", username));

            if (dt.Rows.Count == 0)
                return null;

            return MapToUser(dt.Rows[0]);
        }

        // ============================================================
        // 🔹 LẤY NGƯỜI DÙNG THEO EMAIL (CHO FORGOT PASSWORD)
        // ============================================================
        public async Task<User?> GetByEmailAsync(string email)
        {
            var query = @"
                SELECT u.*, r.role_name
                FROM dbo.users u
                LEFT JOIN dbo.roles r ON u.role_id = r.role_id
                WHERE LOWER(LTRIM(RTRIM(u.email))) = LOWER(LTRIM(RTRIM(@Email)))
                    AND u.deleted_at IS NULL
                    AND u.is_active = 1";

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@Email", email.Trim().ToLower());
                
                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapToUserFromReader(reader);
                }
                
                return null;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        // Helper method để map từ DataReader
        private User MapToUserFromReader(System.Data.Common.DbDataReader reader)
        {
            return new User
            {
                UserId = reader["user_id"]?.ToString() ?? string.Empty,
                Username = reader["username"]?.ToString() ?? string.Empty,
                PasswordHash = reader["password_hash"]?.ToString() ?? string.Empty,
                Email = reader["email"]?.ToString() ?? string.Empty,
                Phone = reader["phone"]?.ToString(),
                FullName = reader["full_name"]?.ToString() ?? string.Empty,
                AvatarUrl = reader["avatar_url"]?.ToString(),
                RoleId = reader["role_id"]?.ToString() ?? string.Empty,
                RoleName = reader["role_name"]?.ToString(),
                IsActive = Convert.ToBoolean(reader["is_active"]),
                LastLoginAt = reader["last_login_at"] != DBNull.Value ? (DateTime?)reader["last_login_at"] : null,
                CreatedAt = reader["created_at"] != DBNull.Value ? Convert.ToDateTime(reader["created_at"]) : DateTime.UtcNow,
                CreatedBy = reader["created_by"]?.ToString(),
                UpdatedAt = reader["updated_at"] != DBNull.Value ? (DateTime?)reader["updated_at"] : null,
                UpdatedBy = reader["updated_by"]?.ToString()
            };
        }

        // ============================================================
        // 🔹 TẠO MỚI NGƯỜI DÙNG
        // ============================================================
        public async Task<string?> CreateAsync(User user)
        {
            const string query = @"
                INSERT INTO dbo.users
                (
                    user_id, username, password_hash, email, phone, full_name, role_id,
                    is_active, avatar_url, created_at, created_by
                )
                VALUES
                (
                    @UserId, @Username, @PasswordHash, @Email, @Phone, @FullName, @RoleId,
                    @IsActive, @AvatarUrl, GETDATE(), @CreatedBy
                )";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@UserId", user.UserId),
                new SqlParameter("@Username", user.Username),
                new SqlParameter("@PasswordHash", user.PasswordHash),
                new SqlParameter("@Email", user.Email),
                new SqlParameter("@Phone", (object?)user.Phone ?? DBNull.Value),
                new SqlParameter("@FullName", user.FullName),
                new SqlParameter("@RoleId", user.RoleId),
                new SqlParameter("@IsActive", user.IsActive),
                new SqlParameter("@AvatarUrl", (object?)user.AvatarUrl ?? "/avatars/default.png"),
                new SqlParameter("@CreatedBy", user.CreatedBy ?? "System"));
            return user.UserId;
        }

        // ============================================================
        // 🔹 CẬP NHẬT NGƯỜI DÙNG
        // ============================================================
        public async Task<int> UpdateAsync(User user)
        {
            const string query = @"
                UPDATE dbo.users
                SET full_name = @FullName,
                    email = @Email,
                    phone = @Phone,
                    role_id = @RoleId,
                    is_active = @IsActive,
                    avatar_url = @AvatarUrl,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE user_id = @UserId
                  AND deleted_at IS NULL";
            return await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@UserId", user.UserId),
                new SqlParameter("@FullName", user.FullName),
                new SqlParameter("@Email", user.Email),
                new SqlParameter("@Phone", (object?)user.Phone ?? DBNull.Value),
                new SqlParameter("@RoleId", user.RoleId),
                new SqlParameter("@IsActive", user.IsActive),
                new SqlParameter("@AvatarUrl", (object?)user.AvatarUrl ?? DBNull.Value),
                new SqlParameter("@UpdatedBy", user.UpdatedBy ?? "System"));
        }

        // ============================================================
        // 🔹 CẬP NHẬT MẬT KHẨU (CHO FORGOT PASSWORD)
        // ============================================================
        public async Task<bool> UpdatePasswordAsync(string userId, string newPasswordHash)
        {
            var query = @"
                UPDATE dbo.users 
                SET password_hash = @PasswordHash, 
                    updated_at = GETUTCDATE()
                WHERE user_id = @UserId 
                    AND deleted_at IS NULL
                    AND is_active = 1";

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@PasswordHash", newPasswordHash);
                
                await conn.OpenAsync();
                var rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        // ============================================================
        // 🔹 XOÁ NGƯỜI DÙNG (SOFT DELETE)
        // ============================================================
        public async Task<int> DeleteAsync(string userId, string deletedBy)
        {
            const string query = @"
                UPDATE dbo.users
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy,
                    is_active = 0
                WHERE user_id = @UserId
                  AND deleted_at IS NULL";
            return await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@UserId", userId),
                new SqlParameter("@DeletedBy", deletedBy));
        }

        // ============================================================
        // 🔹 CHUYỂN TRẠNG THÁI KÍCH HOẠT / VÔ HIỆU
        // ============================================================
        public async Task<bool> ToggleStatusAsync(string userId, string updatedBy)
        {
            const string query = @"
                UPDATE dbo.users
                SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                OUTPUT INSERTED.is_active
                WHERE user_id = @UserId
                  AND deleted_at IS NULL";
            var result = await DatabaseHelper.ExecuteRawScalarAsync(
                _connectionString,
                query,
                new SqlParameter("@UserId", userId),
                new SqlParameter("@UpdatedBy", updatedBy));

            return result != null && Convert.ToBoolean(result);
        }

        // ============================================================
        // 🔹 KIỂM TRA USERNAME ĐÃ TỒN TẠI
        // ============================================================
        public async Task<bool> ExistsByUsernameAsync(string username)
        {
            var query = "SELECT COUNT(*) FROM dbo.users WHERE username = @Username AND deleted_at IS NULL";

            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Username", username);

            await conn.OpenAsync();
            var count = (int)(await cmd.ExecuteScalarAsync() ?? 0);
            return count > 0;
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH USER IDS THEO ROLE
        // ============================================================
        public async Task<List<string>> GetUserIdsByRoleNameAsync(string roleName)
        {
            var userIds = new List<string>();
            var query = @"
                SELECT DISTINCT u.user_id
                FROM dbo.users u
                INNER JOIN dbo.roles r ON u.role_id = r.role_id
                WHERE r.role_name = @RoleName
                    AND u.is_active = 1
                    AND u.deleted_at IS NULL
                    AND r.deleted_at IS NULL";

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@RoleName", roleName);
                
                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    var userId = reader["user_id"]?.ToString();
                    if (!string.IsNullOrEmpty(userId))
                        userIds.Add(userId);
                }
            }
            catch (Exception ex)
            {
            }

            return userIds;
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH USER IDS VÀ EMAILS THEO ROLE
        // ============================================================
        public async Task<List<(string UserId, string Email, string FullName)>> GetUsersByRoleNameAsync(string roleName)
        {
            var users = new List<(string UserId, string Email, string FullName)>();
            var query = @"
                SELECT DISTINCT u.user_id, u.email, u.full_name
                FROM dbo.users u
                INNER JOIN dbo.roles r ON u.role_id = r.role_id
                WHERE r.role_name = @RoleName
                    AND u.is_active = 1
                    AND u.deleted_at IS NULL
                    AND r.deleted_at IS NULL";

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@RoleName", roleName);
                
                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    var userId = reader["user_id"]?.ToString() ?? "";
                    var email = reader["email"]?.ToString() ?? "";
                    var fullName = reader["full_name"]?.ToString() ?? "";
                    if (!string.IsNullOrEmpty(userId))
                        users.Add((userId, email, fullName));
                }
            }
            catch (Exception ex)
            {
            }

            return users;
        }

        // ============================================================
        // 🔹 KIỂM TRA EMAIL ĐÃ TỒN TẠI
        // ============================================================
        public async Task<bool> ExistsByEmailAsync(string email, string? excludeUserId = null)
        {
            var query = excludeUserId == null
                ? "SELECT COUNT(*) FROM dbo.users WHERE email = @Email AND deleted_at IS NULL"
                : "SELECT COUNT(*) FROM dbo.users WHERE email = @Email AND user_id != @ExcludeId AND deleted_at IS NULL";

            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Email", email);
            if (excludeUserId != null)
                cmd.Parameters.AddWithValue("@ExcludeId", excludeUserId);

            await conn.OpenAsync();
            var count = (int)(await cmd.ExecuteScalarAsync() ?? 0);
            return count > 0;
        }

        // ============================================================
        // 🔹 XOÁ MỀM USER
        // ============================================================
        public async Task SoftDeleteAsync(string userId, string deletedBy)
        {
            await DeleteAsync(userId, deletedBy);
        }

        // ============================================================
        // 🔹 MAP DỮ LIỆU DataRow → User
        // ============================================================
        private static User MapToUser(DataRow row)
        {
            var user = new User
            {
                UserId = row["user_id"].ToString()!,
                Username = row["username"].ToString()!,
                // ✅ Thêm map PasswordHash
                PasswordHash = row.Table.Columns.Contains("password_hash") ? row["password_hash"]?.ToString() ?? string.Empty : string.Empty,
                FullName = row["full_name"].ToString()!,
                Email = row["email"].ToString()!,
                Phone = row["phone"]?.ToString(),
                RoleId = row["role_id"].ToString()!,
                RoleName = row.Table.Columns.Contains("role_name") ? row["role_name"]?.ToString() : null,
                AvatarUrl = row["avatar_url"]?.ToString(),
                IsActive = Convert.ToBoolean(row["is_active"]),
                CreatedBy = row.Table.Columns.Contains("created_by") ? row["created_by"]?.ToString() : null,
                UpdatedBy = row.Table.Columns.Contains("updated_by") ? row["updated_by"]?.ToString() : null,
                DeletedBy = row.Table.Columns.Contains("deleted_by") ? row["deleted_by"]?.ToString() : null
            };

            // Xử lý kiểu DateTime nullable an toàn
            user.LastLoginAt = row.Table.Columns.Contains("last_login_at") && row["last_login_at"] != DBNull.Value
                ? Convert.ToDateTime(row["last_login_at"])
                : null;
            user.CreatedAt = row.Table.Columns.Contains("created_at") && row["created_at"] != DBNull.Value
                ? Convert.ToDateTime(row["created_at"])
                : DateTime.Now;
            user.UpdatedAt = row.Table.Columns.Contains("updated_at") && row["updated_at"] != DBNull.Value
                ? Convert.ToDateTime(row["updated_at"])
                : null;
            user.DeletedAt = row.Table.Columns.Contains("deleted_at") && row["deleted_at"] != DBNull.Value
                ? Convert.ToDateTime(row["deleted_at"])
                : null;

            return user;
        }
    }
}

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
    public class RoomRepository
    {
        private readonly string _connectionString;
        private const string RoomSelect = @"
            SELECT
                room_id, room_code, building, capacity, is_active,
                created_at, created_by, updated_at, updated_by, deleted_at, deleted_by
            FROM dbo.rooms
            WHERE deleted_at IS NULL";

        public RoomRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
        }

        // ============================================================
        // 🔹 LẤY DANH SÁCH PHÒNG HỌC
        // ============================================================
        public async Task<List<Room>> GetAllAsync()
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                RoomSelect + @"
                ORDER BY room_code");
            
            var list = new List<Room>();
            foreach (DataRow row in dt.Rows)
            {
                list.Add(MapToRoom(row));
            }
            return list;
        }

        // ============================================================
        // 🔹 LẤY PHÒNG HỌC THEO ID
        // ============================================================
        public async Task<Room?> GetByIdAsync(string roomId)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                RoomSelect + @"
                  AND room_id = @RoomId",
                new SqlParameter("@RoomId", roomId));
            
            if (dt.Rows.Count == 0)
                return null;

            return MapToRoom(dt.Rows[0]);
        }

        // ============================================================
        // 🔹 LẤY PHÒNG HỌC THEO CODE
        // ============================================================
        public async Task<Room?> GetByCodeAsync(string roomCode)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                RoomSelect + @"
                  AND room_code = @RoomCode",
                new SqlParameter("@RoomCode", roomCode));
            
            if (dt.Rows.Count == 0)
                return null;

            return MapToRoom(dt.Rows[0]);
        }

        // ============================================================
        // 🔹 TÌM KIẾM PHÒNG HỌC
        // ============================================================
        public async Task<List<Room>> SearchAsync(string? search = null, bool? isActive = null)
        {
            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                RoomSelect + @"
                  AND (@Search IS NULL OR room_code LIKE '%' + @Search + '%' OR building LIKE '%' + @Search + '%')
                  AND (@IsActive IS NULL OR is_active = @IsActive)
                ORDER BY room_code",
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@IsActive", (object?)isActive ?? DBNull.Value));
            
            var list = new List<Room>();
            foreach (DataRow row in dt.Rows)
            {
                list.Add(MapToRoom(row));
            }
            return list;
        }

        // ============================================================
        // 🔹 KIỂM TRA PHÒNG HỌC CÓ TỒN TẠI
        // ============================================================
        public async Task<bool> ExistsAsync(string roomId)
        {
            var room = await GetByIdAsync(roomId);
            return room != null;
        }

        // ============================================================
        // 🔹 KIỂM TRA ROOM CODE ĐÃ TỒN TẠI CHƯA
        // ============================================================
        public async Task<bool> ExistsByCodeAsync(string roomCode, string? excludeRoomId = null)
        {
            var room = await GetByCodeAsync(roomCode);
            if (room == null)
                return false;
            
            // Nếu có excludeRoomId, kiểm tra xem room tìm được có phải chính nó không
            if (!string.IsNullOrEmpty(excludeRoomId))
            {
                return room.RoomId != excludeRoomId;
            }
            
            return true;
        }

        // ============================================================
        // 🔹 LẤY PHÒNG HỌC CÓ PAGINATION
        // ============================================================
        public async Task<(List<Room> items, int totalCount)> GetPagedAsync(int page, int pageSize, string? search = null, bool? isActive = null)
        {
            const string countQuery = @"
                SELECT COUNT(*)
                FROM dbo.rooms
                WHERE deleted_at IS NULL
                  AND (@Search IS NULL OR room_code LIKE '%' + @Search + '%' OR building LIKE '%' + @Search + '%')
                  AND (@IsActive IS NULL OR is_active = @IsActive)";
            var totalCount = Convert.ToInt32(
                await DatabaseHelper.ExecuteRawScalarAsync(
                    _connectionString,
                    countQuery,
                    new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                    new SqlParameter("@IsActive", (object?)isActive ?? DBNull.Value)) ?? 0);

            var dt = await DatabaseHelper.ExecuteRawQueryAsync(
                _connectionString,
                RoomSelect + @"
                  AND (@Search IS NULL OR room_code LIKE '%' + @Search + '%' OR building LIKE '%' + @Search + '%')
                  AND (@IsActive IS NULL OR is_active = @IsActive)
                ORDER BY room_code
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@IsActive", (object?)isActive ?? DBNull.Value),
                new SqlParameter("@Offset", Math.Max(page - 1, 0) * pageSize),
                new SqlParameter("@PageSize", pageSize));

            var items = new List<Room>();
            foreach (DataRow row in dt.Rows)
            {
                items.Add(MapToRoom(row));
            }

            return (items, totalCount);
        }

        // ============================================================
        // 🔹 THÊM PHÒNG HỌC MỚI
        // ============================================================
        public async Task AddAsync(Room room)
        {
            const string query = @"
                INSERT INTO dbo.rooms
                (
                    room_id, room_code, building, capacity, is_active, created_at, created_by
                )
                VALUES
                (
                    @RoomId, @RoomCode, @Building, @Capacity, @IsActive, GETDATE(), @CreatedBy
                )";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@RoomId", room.RoomId),
                new SqlParameter("@RoomCode", room.RoomCode),
                new SqlParameter("@Building", (object?)room.Building ?? DBNull.Value),
                new SqlParameter("@Capacity", (object?)room.Capacity ?? DBNull.Value),
                new SqlParameter("@IsActive", room.IsActive),
                new SqlParameter("@CreatedBy", (object?)room.CreatedBy ?? DBNull.Value));
        }

        // ============================================================
        // 🔹 CẬP NHẬT PHÒNG HỌC
        // ============================================================
        public async Task UpdateAsync(Room room)
        {
            const string query = @"
                UPDATE dbo.rooms
                SET room_code = @RoomCode,
                    building = @Building,
                    capacity = @Capacity,
                    is_active = @IsActive,
                    updated_at = GETDATE(),
                    updated_by = @UpdatedBy
                WHERE room_id = @RoomId
                  AND deleted_at IS NULL";
            await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@RoomId", room.RoomId),
                new SqlParameter("@RoomCode", room.RoomCode),
                new SqlParameter("@Building", (object?)room.Building ?? DBNull.Value),
                new SqlParameter("@Capacity", (object?)room.Capacity ?? DBNull.Value),
                new SqlParameter("@IsActive", room.IsActive),
                new SqlParameter("@UpdatedBy", (object?)room.UpdatedBy ?? DBNull.Value));
        }

        // ============================================================
        // 🔹 SOFT DELETE PHÒNG HỌC
        // ============================================================
        public async Task<int> SoftDeleteAsync(string roomId, string? deletedBy = null)
        {
            const string query = @"
                UPDATE dbo.rooms
                SET deleted_at = GETDATE(),
                    deleted_by = @DeletedBy,
                    is_active = 0
                WHERE room_id = @RoomId
                  AND deleted_at IS NULL";
            return await DatabaseHelper.ExecuteRawNonQueryAsync(
                _connectionString,
                query,
                new SqlParameter("@RoomId", roomId),
                new SqlParameter("@DeletedBy", (object?)deletedBy ?? DBNull.Value));
        }

        // ============================================================
        // 🔹 KIỂM TRA PHÒNG HỌC CÓ ĐANG ĐƯỢC SỬ DỤNG
        // ============================================================
        public async Task<bool> IsRoomInUseAsync(string roomId)
        {
            const string query = @"
                SELECT CASE
                    WHEN EXISTS (
                        SELECT 1 FROM dbo.timetable_sessions
                        WHERE room_id = @RoomId AND deleted_at IS NULL
                    ) OR EXISTS (
                        SELECT 1 FROM dbo.exam_schedules
                        WHERE room_id = @RoomId AND deleted_at IS NULL
                    )
                    THEN CAST(1 AS bit)
                    ELSE CAST(0 AS bit)
                END";
            var result = await DatabaseHelper.ExecuteRawScalarAsync(
                _connectionString,
                query,
                new SqlParameter("@RoomId", roomId));

            return result != null && Convert.ToBoolean(result);
        }

        // ============================================================
        // 🔹 MAP DATA ROW TO ROOM MODEL
        // ============================================================
        private static Room MapToRoom(DataRow row)
        {
            return new Room
            {
                RoomId = row["room_id"].ToString()!,
                RoomCode = row["room_code"].ToString()!,
                Building = row["building"] == DBNull.Value ? null : row["building"].ToString(),
                Capacity = row["capacity"] == DBNull.Value ? null : Convert.ToInt32(row["capacity"]),
                IsActive = Convert.ToBoolean(row["is_active"]),
                CreatedAt = Convert.ToDateTime(row["created_at"]),
                CreatedBy = row["created_by"] == DBNull.Value ? null : row["created_by"].ToString(),
                UpdatedAt = row["updated_at"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["updated_at"]),
                UpdatedBy = row["updated_by"] == DBNull.Value ? null : row["updated_by"].ToString(),
                DeletedAt = row["deleted_at"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["deleted_at"]),
                DeletedBy = row["deleted_by"] == DBNull.Value ? null : row["deleted_by"].ToString()
            };
        }
    }
}


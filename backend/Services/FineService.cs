using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using MongoDB.Driver;

namespace LibManagementSystem.API.Services
{
    public class FineService : IFineService
    {
        private readonly IMongoDbContext _context;

        public FineService(IMongoDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<FineDto>>> GetAllFinesAsync(string? status)
        {
            var filterBuilder = Builders<Fine>.Filter;
            var filter = filterBuilder.Empty;

            if (!string.IsNullOrWhiteSpace(status))
            {
                filter &= filterBuilder.Eq(f => f.Status, status);
            }

            var fines = await _context.Fines.Find(filter).SortByDescending(f => f.CreatedAt).ToListAsync();

            var userIds = fines.Select(f => f.UserId).Distinct().ToList();
            var users = await _context.Users.Find(u => userIds.Contains(u.Id!)).ToListAsync();
            var userDict = users.ToDictionary(u => u.Id!, u => u);

            var recordIds = fines.Select(f => f.BorrowRecordId).Distinct().ToList();
            var records = await _context.BorrowRecords.Find(r => recordIds.Contains(r.Id!)).ToListAsync();
            var bookIds = records.Select(r => r.BookId).Distinct().ToList();
            var books = await _context.Books.Find(b => bookIds.Contains(b.Id!)).ToListAsync();
            var bookDict = books.ToDictionary(b => b.Id!, b => b);
            var recordBookDict = records.Where(r => r.Id != null).GroupBy(r => r.Id!).ToDictionary(g => g.Key, g => bookDict.TryGetValue(g.First().BookId, out var b) ? b?.Title : "N/A");

            var dtos = fines.Select(f => new FineDto
            {
                Id = f.Id ?? string.Empty,
                BorrowRecordId = f.BorrowRecordId,
                UserId = f.UserId,
                UserFullName = userDict.TryGetValue(f.UserId, out var u) ? u.FullName : "N/A",
                BookTitle = recordBookDict.TryGetValue(f.BorrowRecordId, out var title) ? title ?? "N/A" : "N/A",
                Amount = f.Amount,
                Reason = f.Reason,
                Status = f.Status,
                PaidAt = f.PaidAt,
                CreatedAt = f.CreatedAt
            }).ToList();

            return ApiResponse<List<FineDto>>.SuccessResult(dtos);
        }

        public async Task<ApiResponse<List<FineDto>>> GetMyFinesAsync(string userId)
        {
            var fines = await _context.Fines.Find(f => f.UserId == userId).SortByDescending(f => f.CreatedAt).ToListAsync();

            var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();

            var recordIds = fines.Select(f => f.BorrowRecordId).Distinct().ToList();
            var records = await _context.BorrowRecords.Find(r => recordIds.Contains(r.Id!)).ToListAsync();
            var bookIds = records.Select(r => r.BookId).Distinct().ToList();
            var books = await _context.Books.Find(b => bookIds.Contains(b.Id!)).ToListAsync();
            var bookDict = books.ToDictionary(b => b.Id!, b => b);
            var recordBookDict = records.Where(r => r.Id != null).GroupBy(r => r.Id!).ToDictionary(g => g.Key, g => bookDict.TryGetValue(g.First().BookId, out var b) ? b?.Title : "N/A");

            var dtos = fines.Select(f => new FineDto
            {
                Id = f.Id ?? string.Empty,
                BorrowRecordId = f.BorrowRecordId,
                UserId = f.UserId,
                UserFullName = user?.FullName ?? "N/A",
                BookTitle = recordBookDict.TryGetValue(f.BorrowRecordId, out var title) ? title ?? "N/A" : "N/A",
                Amount = f.Amount,
                Reason = f.Reason,
                Status = f.Status,
                PaidAt = f.PaidAt,
                CreatedAt = f.CreatedAt
            }).ToList();

            return ApiResponse<List<FineDto>>.SuccessResult(dtos);
        }

        public async Task<ApiResponse<FineDto>> PayFineAsync(string fineId, string? requestingUserId = null, bool isStaff = true)
        {
            var fine = await _context.Fines.Find(f => f.Id == fineId).FirstOrDefaultAsync();
            if (fine == null)
            {
                return ApiResponse<FineDto>.FailureResult("Không tìm thấy phiếu phạt");
            }

            if (!isStaff && !string.IsNullOrWhiteSpace(requestingUserId) && fine.UserId != requestingUserId)
            {
                return ApiResponse<FineDto>.FailureResult("Bạn không có quyền thanh toán phiếu phạt của người khác");
            }

            if (fine.Status == FineStatus.Paid)
            {
                return ApiResponse<FineDto>.FailureResult("Phiếu phạt này đã được thanh toán trước đó");
            }

            fine.Status = FineStatus.Paid;
            fine.PaidAt = DateTime.UtcNow;

            await _context.Fines.ReplaceOneAsync(f => f.Id == fineId, fine);

            var user = await _context.Users.Find(u => u.Id == fine.UserId).FirstOrDefaultAsync();
            var record = await _context.BorrowRecords.Find(r => r.Id == fine.BorrowRecordId).FirstOrDefaultAsync();
            var book = record != null ? await _context.Books.Find(b => b.Id == record.BookId).FirstOrDefaultAsync() : null;

            var dto = new FineDto
            {
                Id = fine.Id ?? string.Empty,
                BorrowRecordId = fine.BorrowRecordId,
                UserId = fine.UserId,
                UserFullName = user?.FullName ?? "N/A",
                BookTitle = book?.Title ?? "N/A",
                Amount = fine.Amount,
                Reason = fine.Reason,
                Status = fine.Status,
                PaidAt = fine.PaidAt,
                CreatedAt = fine.CreatedAt
            };

            return ApiResponse<FineDto>.SuccessResult(dto, "Xác nhận thanh toán phiếu phạt thành công");
        }
    }
}

using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using MongoDB.Driver;

namespace LibManagementSystem.API.Services
{
    public class BorrowService : IBorrowService
    {
        private readonly IMongoDbContext _context;
        private const decimal DAILY_OVERDUE_FINE = 5000m; // 5.000 VNĐ / ngày quá hạn

        public BorrowService(IMongoDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<BorrowRecordDto>> CreateBorrowAsync(string currentUserId, CreateBorrowDto dto)
        {
            var targetUserId = string.IsNullOrWhiteSpace(dto.UserId) ? currentUserId : dto.UserId;

            var user = await _context.Users.Find(u => u.Id == targetUserId).FirstOrDefaultAsync();
            if (user == null)
            {
                return ApiResponse<BorrowRecordDto>.FailureResult("Không tìm thấy thông tin độc giả");
            }

            var book = await _context.Books.Find(b => b.Id == dto.BookId).FirstOrDefaultAsync();
            if (book == null)
            {
                return ApiResponse<BorrowRecordDto>.FailureResult("Không tìm thấy cuốn sách này");
            }

            if (book.AvailableCopies <= 0)
            {
                return ApiResponse<BorrowRecordDto>.FailureResult("Sách này hiện tại đã hết lượt khả dụng để mượn");
            }

            // Kiểm tra xem độc giả có đang mượn chính cuốn sách này mà chưa trả không
            var existingLoan = await _context.BorrowRecords.Find(r =>
                r.UserId == targetUserId &&
                r.BookId == dto.BookId &&
                (r.Status == BorrowStatus.Borrowed || r.Status == BorrowStatus.Overdue)
            ).FirstOrDefaultAsync();

            if (existingLoan != null)
            {
                return ApiResponse<BorrowRecordDto>.FailureResult("Độc giả đang mượn cuốn sách này, vui lòng hoàn trả trước khi mượn tiếp");
            }

            var borrowRecord = new BorrowRecord
            {
                UserId = targetUserId,
                BookId = dto.BookId,
                BorrowDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(dto.BorrowDays > 0 ? dto.BorrowDays : 14),
                ReturnDate = null,
                Status = BorrowStatus.Borrowed,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            await _context.BorrowRecords.InsertOneAsync(borrowRecord);

            // Giảm số lượng sách khả dụng
            book.AvailableCopies -= 1;
            book.UpdatedAt = DateTime.UtcNow;
            await _context.Books.ReplaceOneAsync(b => b.Id == book.Id, book);

            var resultDto = MapToBorrowRecordDto(borrowRecord, user, book);
            return ApiResponse<BorrowRecordDto>.SuccessResult(resultDto, "Tạo phiếu mượn sách thành công");
        }

        public async Task<ApiResponse<BorrowRecordDto>> ReturnBookAsync(string borrowRecordId, ReturnBookDto dto)
        {
            var record = await _context.BorrowRecords.Find(r => r.Id == borrowRecordId).FirstOrDefaultAsync();
            if (record == null)
            {
                return ApiResponse<BorrowRecordDto>.FailureResult("Không tìm thấy phiếu mượn");
            }

            if (record.Status == BorrowStatus.Returned)
            {
                return ApiResponse<BorrowRecordDto>.FailureResult("Phiếu mượn này đã được hoàn trả trước đó");
            }

            var user = await _context.Users.Find(u => u.Id == record.UserId).FirstOrDefaultAsync();
            var book = await _context.Books.Find(b => b.Id == record.BookId).FirstOrDefaultAsync();

            var now = DateTime.UtcNow;
            record.ReturnDate = now;
            record.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? record.Notes : dto.Notes;

            // Kiểm tra quá hạn
            decimal overdueFineAmount = 0m;
            int overdueDays = 0;
            if (now > record.DueDate)
            {
                overdueDays = (int)Math.Ceiling((now - record.DueDate).TotalDays);
                overdueFineAmount = overdueDays * DAILY_OVERDUE_FINE;
                record.Status = BorrowStatus.Overdue;
            }
            else
            {
                record.Status = BorrowStatus.Returned;
            }

            if (dto.IsDamagedOrLost)
            {
                record.Status = BorrowStatus.Lost;
            }
            else
            {
                // Cộng lại số lượng sách khả dụng
                if (book != null)
                {
                    book.AvailableCopies += 1;
                    book.UpdatedAt = DateTime.UtcNow;
                    await _context.Books.ReplaceOneAsync(b => b.Id == book.Id, book);
                }
            }

            await _context.BorrowRecords.ReplaceOneAsync(r => r.Id == borrowRecordId, record);

            // Tạo phiếu phạt nếu quá hạn hoặc sách bị hỏng/mất
            decimal totalFine = overdueFineAmount + (dto.IsDamagedOrLost ? dto.PenaltyAmount : 0m);
            if (totalFine > 0)
            {
                string reason = overdueDays > 0 ? $"Quá hạn {overdueDays} ngày ({overdueFineAmount:N0} VNĐ)" : "";
                if (dto.IsDamagedOrLost)
                {
                    reason += string.IsNullOrWhiteSpace(reason) ? dto.PenaltyReason : $" + {dto.PenaltyReason}";
                }

                var fine = new Fine
                {
                    BorrowRecordId = record.Id!,
                    UserId = record.UserId,
                    Amount = totalFine,
                    Reason = reason,
                    Status = FineStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Fines.InsertOneAsync(fine);
            }

            var resultDto = MapToBorrowRecordDto(record, user, book);
            return ApiResponse<BorrowRecordDto>.SuccessResult(resultDto, "Xử lý trả sách thành công");
        }

        public async Task<ApiResponse<List<BorrowRecordDto>>> GetMyLoansAsync(string userId)
        {
            var records = await _context.BorrowRecords.Find(r => r.UserId == userId)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();

            var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();

            var bookIds = records.Select(r => r.BookId).Distinct().ToList();
            var books = await _context.Books.Find(b => bookIds.Contains(b.Id!)).ToListAsync();
            var bookDict = books.ToDictionary(b => b.Id!, b => b);

            var dtos = records.Select(r => MapToBorrowRecordDto(r, user, bookDict.TryGetValue(r.BookId, out var b) ? b : null)).ToList();
            return ApiResponse<List<BorrowRecordDto>>.SuccessResult(dtos);
        }

        public async Task<ApiResponse<List<BorrowRecordDto>>> GetAllLoansAsync(string? status)
        {
            var filterBuilder = Builders<BorrowRecord>.Filter;
            var filter = filterBuilder.Empty;

            if (!string.IsNullOrWhiteSpace(status))
            {
                filter &= filterBuilder.Eq(r => r.Status, status);
            }

            var records = await _context.BorrowRecords.Find(filter)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();

            var userIds = records.Select(r => r.UserId).Distinct().ToList();
            var users = await _context.Users.Find(u => userIds.Contains(u.Id!)).ToListAsync();
            var userDict = users.ToDictionary(u => u.Id!, u => u);

            var bookIds = records.Select(r => r.BookId).Distinct().ToList();
            var books = await _context.Books.Find(b => bookIds.Contains(b.Id!)).ToListAsync();
            var bookDict = books.ToDictionary(b => b.Id!, b => b);

            var dtos = records.Select(r => MapToBorrowRecordDto(
                r,
                userDict.TryGetValue(r.UserId, out var u) ? u : null,
                bookDict.TryGetValue(r.BookId, out var b) ? b : null
            )).ToList();

            return ApiResponse<List<BorrowRecordDto>>.SuccessResult(dtos);
        }

        public async Task<ApiResponse<BorrowRecordDto>> ExtendLoanAsync(string borrowRecordId, int extendDays)
        {
            var record = await _context.BorrowRecords.Find(r => r.Id == borrowRecordId).FirstOrDefaultAsync();
            if (record == null)
            {
                return ApiResponse<BorrowRecordDto>.FailureResult("Không tìm thấy phiếu mượn");
            }

            if (record.Status == BorrowStatus.Returned || record.Status == BorrowStatus.Lost)
            {
                return ApiResponse<BorrowRecordDto>.FailureResult("Không thể gia hạn phiếu mượn đã kết thúc");
            }

            int days = extendDays > 0 ? extendDays : 7;
            record.DueDate = record.DueDate.AddDays(days);

            await _context.BorrowRecords.ReplaceOneAsync(r => r.Id == borrowRecordId, record);

            var user = await _context.Users.Find(u => u.Id == record.UserId).FirstOrDefaultAsync();
            var book = await _context.Books.Find(b => b.Id == record.BookId).FirstOrDefaultAsync();

            return ApiResponse<BorrowRecordDto>.SuccessResult(MapToBorrowRecordDto(record, user, book), $"Gia hạn thành công thêm {days} ngày");
        }

        private static BorrowRecordDto MapToBorrowRecordDto(BorrowRecord record, User? user, Book? book)
        {
            decimal? estFine = null;
            if (record.Status == BorrowStatus.Borrowed && DateTime.UtcNow > record.DueDate)
            {
                int overdueDays = (int)Math.Ceiling((DateTime.UtcNow - record.DueDate).TotalDays);
                estFine = overdueDays * DAILY_OVERDUE_FINE;
            }

            return new BorrowRecordDto
            {
                Id = record.Id ?? string.Empty,
                UserId = record.UserId,
                UserName = user?.Username ?? "N/A",
                UserFullName = user?.FullName ?? "N/A",
                BookId = record.BookId,
                BookTitle = book?.Title ?? "N/A",
                BookCoverUrl = book?.CoverImageUrl ?? string.Empty,
                BorrowDate = record.BorrowDate,
                DueDate = record.DueDate,
                ReturnDate = record.ReturnDate,
                Status = record.Status,
                Notes = record.Notes,
                EstimatedFine = estFine,
                CreatedAt = record.CreatedAt
            };
        }
    }
}

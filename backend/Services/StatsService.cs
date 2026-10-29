using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using MongoDB.Driver;

namespace LibManagementSystem.API.Services
{
    public class StatsService : IStatsService
    {
        private readonly IMongoDbContext _context;

        public StatsService(IMongoDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync()
        {
            var totalBooks = await _context.Books.CountDocumentsAsync(_ => true);
            var books = await _context.Books.Find(_ => true).ToListAsync();
            long totalCopies = books.Sum(b => (long)b.TotalCopies);
            long availableCopies = books.Sum(b => (long)b.AvailableCopies);

            var totalUsers = await _context.Users.CountDocumentsAsync(_ => true);
            var totalMembers = await _context.Users.CountDocumentsAsync(u => u.Role == UserRoles.Member);

            var activeLoans = await _context.BorrowRecords.CountDocumentsAsync(r => r.ReturnDate == null && r.Status != BorrowStatus.Returned && r.Status != BorrowStatus.Lost);
            var overdueLoans = await _context.BorrowRecords.CountDocumentsAsync(r => r.ReturnDate == null && r.Status != BorrowStatus.Lost && DateTime.UtcNow > r.DueDate);

            var paidFines = await _context.Fines.Find(f => f.Status == FineStatus.Paid).ToListAsync();
            decimal totalFineCollected = paidFines.Sum(f => f.Amount);

            var pendingFines = await _context.Fines.Find(f => f.Status == FineStatus.Pending).ToListAsync();
            decimal totalPendingFines = pendingFines.Sum(f => f.Amount);

            // Lấy 5 lượt mượn gần nhất
            var recentRecords = await _context.BorrowRecords.Find(_ => true)
                .SortByDescending(r => r.CreatedAt)
                .Limit(5)
                .ToListAsync();

            var recentUserIds = recentRecords.Select(r => r.UserId).Distinct().ToList();
            var recentUsers = await _context.Users.Find(u => recentUserIds.Contains(u.Id!)).ToListAsync();
            var userDict = recentUsers.ToDictionary(u => u.Id!, u => u.FullName);

            var recentBookIds = recentRecords.Select(r => r.BookId).Distinct().ToList();
            var recentBooks = await _context.Books.Find(b => recentBookIds.Contains(b.Id!)).ToListAsync();
            var bookDict = recentBooks.ToDictionary(b => b.Id!, b => b.Title);

            var recentLoans = recentRecords.Select(r =>
            {
                string status = r.Status;
                if (r.ReturnDate == null && r.Status != BorrowStatus.Lost && DateTime.UtcNow > r.DueDate)
                {
                    status = BorrowStatus.Overdue;
                }
                return new RecentLoanDto
                {
                    Id = r.Id ?? string.Empty,
                    BookTitle = bookDict.TryGetValue(r.BookId, out var bTitle) ? bTitle : "N/A",
                    UserFullName = userDict.TryGetValue(r.UserId, out var uName) ? uName : "N/A",
                    BorrowDate = r.BorrowDate,
                    DueDate = r.DueDate,
                    Status = status
                };
            }).ToList();

            // Lấy top 5 sách được mượn nhiều nhất
            var allLoans = await _context.BorrowRecords.Find(_ => true).ToListAsync();
            var topBookGroups = allLoans.GroupBy(r => r.BookId)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new { BookId = g.Key, Count = g.Count() })
                .ToList();

            var topBookIds = topBookGroups.Select(g => g.BookId).ToList();
            var topBookEntities = await _context.Books.Find(b => topBookIds.Contains(b.Id!)).ToListAsync();
            var topBookDict = topBookEntities.ToDictionary(b => b.Id!, b => b);

            var topBorrowedBooks = topBookGroups.Select(g =>
            {
                topBookDict.TryGetValue(g.BookId, out var b);
                return new TopBookDto
                {
                    BookId = g.BookId,
                    Title = b?.Title ?? "N/A",
                    Author = b?.Author ?? "N/A",
                    CoverImageUrl = b?.CoverImageUrl ?? string.Empty,
                    BorrowCount = g.Count
                };
            }).ToList();

            var stats = new DashboardStatsDto
            {
                TotalBooks = totalBooks,
                TotalCopies = totalCopies,
                AvailableCopies = availableCopies,
                TotalUsers = totalUsers,
                TotalMembers = totalMembers,
                ActiveLoans = activeLoans,
                OverdueLoans = overdueLoans,
                TotalFineCollected = totalFineCollected,
                TotalPendingFines = totalPendingFines,
                RecentLoans = recentLoans,
                TopBorrowedBooks = topBorrowedBooks
            };

            return ApiResponse<DashboardStatsDto>.SuccessResult(stats);
        }
    }
}

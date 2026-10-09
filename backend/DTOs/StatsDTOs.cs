namespace LibManagementSystem.API.DTOs
{
    public class DashboardStatsDto
    {
        public long TotalBooks { get; set; }
        public long TotalCopies { get; set; }
        public long AvailableCopies { get; set; }
        public long TotalUsers { get; set; }
        public long TotalMembers { get; set; }
        public long ActiveLoans { get; set; }
        public long OverdueLoans { get; set; }
        public decimal TotalFineCollected { get; set; }
        public decimal TotalPendingFines { get; set; }
        public List<RecentLoanDto> RecentLoans { get; set; } = new();
        public List<TopBookDto> TopBorrowedBooks { get; set; } = new();
    }

    public class RecentLoanDto
    {
        public string Id { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class TopBookDto
    {
        public string BookId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; } = string.Empty;
        public int BorrowCount { get; set; }
    }
}

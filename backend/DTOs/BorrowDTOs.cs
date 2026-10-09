using System.ComponentModel.DataAnnotations;

namespace LibManagementSystem.API.DTOs
{
    public class CreateBorrowDto
    {
        [Required(ErrorMessage = "Mã sách không được để trống")]
        public string BookId { get; set; } = string.Empty;

        public string? UserId { get; set; } // Nếu Thủ thư mượn hộ Độc giả

        public int BorrowDays { get; set; } = 14; // Thời hạn mượn mặc định 14 ngày
        public string Notes { get; set; } = string.Empty;
    }

    public class BorrowRecordDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string BookCoverUrl { get; set; } = string.Empty;
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public decimal? EstimatedFine { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ReturnBookDto
    {
        public string? Notes { get; set; }
        public bool IsDamagedOrLost { get; set; }
        public decimal PenaltyAmount { get; set; }
        public string? PenaltyReason { get; set; }
    }
}

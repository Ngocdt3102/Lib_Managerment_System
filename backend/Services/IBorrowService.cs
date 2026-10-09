using LibManagementSystem.API.DTOs;

namespace LibManagementSystem.API.Services
{
    public interface IBorrowService
    {
        Task<ApiResponse<BorrowRecordDto>> CreateBorrowAsync(string currentUserId, CreateBorrowDto dto);
        Task<ApiResponse<BorrowRecordDto>> ReturnBookAsync(string borrowRecordId, ReturnBookDto dto);
        Task<ApiResponse<List<BorrowRecordDto>>> GetMyLoansAsync(string userId);
        Task<ApiResponse<List<BorrowRecordDto>>> GetAllLoansAsync(string? status);
        Task<ApiResponse<BorrowRecordDto>> ExtendLoanAsync(string borrowRecordId, int extendDays);
    }
}

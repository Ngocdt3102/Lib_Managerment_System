using LibManagementSystem.API.DTOs;

namespace LibManagementSystem.API.Services
{
    public interface IFineService
    {
        Task<ApiResponse<List<FineDto>>> GetAllFinesAsync(string? status);
        Task<ApiResponse<List<FineDto>>> GetMyFinesAsync(string userId);
        Task<ApiResponse<FineDto>> PayFineAsync(string fineId);
    }
}

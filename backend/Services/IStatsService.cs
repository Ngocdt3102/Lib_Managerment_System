using LibManagementSystem.API.DTOs;

namespace LibManagementSystem.API.Services
{
    public interface IStatsService
    {
        Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync();
    }
}

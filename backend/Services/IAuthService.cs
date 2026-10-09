using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;

namespace LibManagementSystem.API.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto);
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);
        Task<ApiResponse<UserDto>> GetProfileAsync(string userId);
        Task<ApiResponse<List<UserDto>>> GetAllUsersAsync();
        Task<ApiResponse<UserDto>> UpdateUserAsync(string userId, UpdateUserDto dto);
        Task<ApiResponse<bool>> DeleteUserAsync(string userId);
        Task SeedInitialAdminAsync();
    }
}

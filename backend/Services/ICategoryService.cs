using LibManagementSystem.API.DTOs;

namespace LibManagementSystem.API.Services
{
    public interface ICategoryService
    {
        Task<ApiResponse<List<CategoryDto>>> GetAllCategoriesAsync();
        Task<ApiResponse<CategoryDto>> GetCategoryByIdAsync(string id);
        Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryDto dto);
        Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(string id, UpdateCategoryDto dto);
        Task<ApiResponse<bool>> DeleteCategoryAsync(string id);
        Task SeedInitialCategoriesAsync();
    }
}

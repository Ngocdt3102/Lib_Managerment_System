using LibManagementSystem.API.DTOs;

namespace LibManagementSystem.API.Services
{
    public interface IBookService
    {
        Task<ApiResponse<PagedResultDto<BookDto>>> GetBooksAsync(BookQueryDto query);
        Task<ApiResponse<BookDto>> GetBookByIdAsync(string id);
        Task<ApiResponse<BookDto>> CreateBookAsync(CreateBookDto dto);
        Task<ApiResponse<BookDto>> UpdateBookAsync(string id, UpdateBookDto dto);
        Task<ApiResponse<bool>> DeleteBookAsync(string id);
        Task SeedInitialBooksAsync();
    }
}

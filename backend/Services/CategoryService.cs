using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using MongoDB.Driver;

namespace LibManagementSystem.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IMongoDbContext _context;

        public CategoryService(IMongoDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<CategoryDto>>> GetAllCategoriesAsync()
        {
            var categories = await _context.Categories.Find(_ => true).SortBy(c => c.Name).ToListAsync();
            var dtos = categories.Select(c => new CategoryDto
            {
                Id = c.Id ?? string.Empty,
                Name = c.Name,
                Description = c.Description,
                CreatedAt = c.CreatedAt
            }).ToList();

            return ApiResponse<List<CategoryDto>>.SuccessResult(dtos);
        }

        public async Task<ApiResponse<CategoryDto>> GetCategoryByIdAsync(string id)
        {
            var category = await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (category == null)
            {
                return ApiResponse<CategoryDto>.FailureResult("Không tìm thấy danh mục");
            }

            var dto = new CategoryDto
            {
                Id = category.Id ?? string.Empty,
                Name = category.Name,
                Description = category.Description,
                CreatedAt = category.CreatedAt
            };

            return ApiResponse<CategoryDto>.SuccessResult(dto);
        }

        public async Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryDto dto)
        {
            var existing = await _context.Categories.Find(c => c.Name.ToLower() == dto.Name.ToLower()).FirstOrDefaultAsync();
            if (existing != null)
            {
                return ApiResponse<CategoryDto>.FailureResult("Tên danh mục này đã tồn tại");
            }

            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Categories.InsertOneAsync(category);

            var resultDto = new CategoryDto
            {
                Id = category.Id ?? string.Empty,
                Name = category.Name,
                Description = category.Description,
                CreatedAt = category.CreatedAt
            };

            return ApiResponse<CategoryDto>.SuccessResult(resultDto, "Tạo danh mục sách thành công");
        }

        public async Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(string id, UpdateCategoryDto dto)
        {
            var category = await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (category == null)
            {
                return ApiResponse<CategoryDto>.FailureResult("Không tìm thấy danh mục");
            }

            category.Name = dto.Name;
            category.Description = dto.Description;

            await _context.Categories.ReplaceOneAsync(c => c.Id == id, category);

            var resultDto = new CategoryDto
            {
                Id = category.Id ?? string.Empty,
                Name = category.Name,
                Description = category.Description,
                CreatedAt = category.CreatedAt
            };

            return ApiResponse<CategoryDto>.SuccessResult(resultDto, "Cập nhật danh mục thành công");
        }

        public async Task<ApiResponse<bool>> DeleteCategoryAsync(string id)
        {
            // Kiểm tra xem danh mục có sách nào không
            var booksCount = await _context.Books.CountDocumentsAsync(b => b.CategoryId == id);
            if (booksCount > 0)
            {
                return ApiResponse<bool>.FailureResult($"Không thể xóa danh mục này vì còn {booksCount} cuốn sách thuộc danh mục");
            }

            var result = await _context.Categories.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
            {
                return ApiResponse<bool>.FailureResult("Không tìm thấy danh mục để xóa");
            }

            return ApiResponse<bool>.SuccessResult(true, "Xóa danh mục thành công");
        }

        public async Task SeedInitialCategoriesAsync()
        {
            var count = await _context.Categories.CountDocumentsAsync(_ => true);
            if (count == 0)
            {
                var initialCategories = new[]
                {
                    new Category { Name = "Công Nghệ Thông Tin", Description = "Lập trình, Khoa học máy tính, AI, Dữ liệu", CreatedAt = DateTime.UtcNow },
                    new Category { Name = "Khoa Học Kỹ Thuật", Description = "Toán học, Vật lý, Hóa học, Cơ khí", CreatedAt = DateTime.UtcNow },
                    new Category { Name = "Kinh Tế - QTKD", Description = "Quản trị kinh doanh, Tài chính, Marketing, Khởi nghiệp", CreatedAt = DateTime.UtcNow },
                    new Category { Name = "Văn Học - Nghệ Thuật", Description = "Tiểu thuyết, Thơ, Truyện ngắn, Hội họa", CreatedAt = DateTime.UtcNow },
                    new Category { Name = "Kỹ Năng Sống", Description = "Phát triển bản thân, Tư duy, Quản lý thời gian", CreatedAt = DateTime.UtcNow }
                };

                await _context.Categories.InsertManyAsync(initialCategories);
            }
        }
    }
}

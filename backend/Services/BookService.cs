using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace LibManagementSystem.API.Services
{
    public class BookService : IBookService
    {
        private readonly IMongoDbContext _context;

        public BookService(IMongoDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PagedResultDto<BookDto>>> GetBooksAsync(BookQueryDto query)
        {
            var filterBuilder = Builders<Book>.Filter;
            var filter = filterBuilder.Empty;

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var keywordFilter = filterBuilder.Or(
                    filterBuilder.Regex(b => b.Title, new BsonRegularExpression(query.Keyword, "i")),
                    filterBuilder.Regex(b => b.Author, new BsonRegularExpression(query.Keyword, "i")),
                    filterBuilder.Regex(b => b.Isbn, new BsonRegularExpression(query.Keyword, "i"))
                );
                filter &= keywordFilter;
            }

            if (!string.IsNullOrWhiteSpace(query.CategoryId))
            {
                filter &= filterBuilder.Eq(b => b.CategoryId, query.CategoryId);
            }

            if (query.AvailableOnly == true)
            {
                filter &= filterBuilder.Gt(b => b.AvailableCopies, 0);
            }

            var totalCount = (int)await _context.Books.CountDocumentsAsync(filter);
            
            var books = await _context.Books.Find(filter)
                .SortByDescending(b => b.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Limit(query.PageSize)
                .ToListAsync();

            // Lấy danh mục để map CategoryName
            var categoryIds = books.Select(b => b.CategoryId).Distinct().ToList();
            var categories = await _context.Categories.Find(c => categoryIds.Contains(c.Id!)).ToListAsync();
            var categoryDict = categories.ToDictionary(c => c.Id!, c => c.Name);

            var bookDtos = books.Select(b => MapToBookDto(b, categoryDict.TryGetValue(b.CategoryId, out var catName) ? catName : "Chưa phân loại")).ToList();

            var result = new PagedResultDto<BookDto>
            {
                Items = bookDtos,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            return ApiResponse<PagedResultDto<BookDto>>.SuccessResult(result);
        }

        public async Task<ApiResponse<BookDto>> GetBookByIdAsync(string id)
        {
            var book = await _context.Books.Find(b => b.Id == id).FirstOrDefaultAsync();
            if (book == null)
            {
                return ApiResponse<BookDto>.FailureResult("Không tìm thấy cuốn sách này");
            }

            var category = await _context.Categories.Find(c => c.Id == book.CategoryId).FirstOrDefaultAsync();
            var categoryName = category?.Name ?? "Chưa phân loại";

            return ApiResponse<BookDto>.SuccessResult(MapToBookDto(book, categoryName));
        }

        public async Task<ApiResponse<BookDto>> CreateBookAsync(CreateBookDto dto)
        {
            var existingIsbn = await _context.Books.Find(b => b.Isbn == dto.Isbn).FirstOrDefaultAsync();
            if (existingIsbn != null)
            {
                return ApiResponse<BookDto>.FailureResult("Mã ISBN này đã tồn tại trong hệ thống");
            }

            var category = await _context.Categories.Find(c => c.Id == dto.CategoryId).FirstOrDefaultAsync();
            if (category == null)
            {
                return ApiResponse<BookDto>.FailureResult("Danh mục được chọn không hợp lệ");
            }

            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                Isbn = dto.Isbn,
                CategoryId = dto.CategoryId,
                Publisher = dto.Publisher,
                PublishYear = dto.PublishYear,
                TotalCopies = dto.TotalCopies,
                AvailableCopies = dto.TotalCopies, // Ban đầu khả dụng bằng tổng số lượng
                Location = dto.Location,
                CoverImageUrl = dto.CoverImageUrl,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Books.InsertOneAsync(book);

            return ApiResponse<BookDto>.SuccessResult(MapToBookDto(book, category.Name), "Thêm sách mới thành công");
        }

        public async Task<ApiResponse<BookDto>> UpdateBookAsync(string id, UpdateBookDto dto)
        {
            var book = await _context.Books.Find(b => b.Id == id).FirstOrDefaultAsync();
            if (book == null)
            {
                return ApiResponse<BookDto>.FailureResult("Không tìm thấy sách");
            }

            var category = await _context.Categories.Find(c => c.Id == dto.CategoryId).FirstOrDefaultAsync();
            var categoryName = category?.Name ?? "Chưa phân loại";

            int deltaCopies = dto.TotalCopies - book.TotalCopies;

            book.Title = dto.Title;
            book.Author = dto.Author;
            book.Isbn = dto.Isbn;
            book.CategoryId = dto.CategoryId;
            book.Publisher = dto.Publisher;
            book.PublishYear = dto.PublishYear;
            book.TotalCopies = dto.TotalCopies;
            book.AvailableCopies = Math.Max(0, book.AvailableCopies + deltaCopies);
            book.Location = dto.Location;
            book.CoverImageUrl = dto.CoverImageUrl;
            book.Description = dto.Description;
            book.UpdatedAt = DateTime.UtcNow;

            await _context.Books.ReplaceOneAsync(b => b.Id == id, book);

            return ApiResponse<BookDto>.SuccessResult(MapToBookDto(book, categoryName), "Cập nhật thông tin sách thành công");
        }

        public async Task<ApiResponse<bool>> DeleteBookAsync(string id)
        {
            var activeLoans = await _context.BorrowRecords.CountDocumentsAsync(r => r.BookId == id && r.Status == BorrowStatus.Borrowed);
            if (activeLoans > 0)
            {
                return ApiResponse<bool>.FailureResult($"Không thể xóa sách vì đang có {activeLoans} lượt mượn chưa hoàn trả");
            }

            var result = await _context.Books.DeleteOneAsync(b => b.Id == id);
            if (result.DeletedCount == 0)
            {
                return ApiResponse<bool>.FailureResult("Không tìm thấy sách để xóa");
            }

            return ApiResponse<bool>.SuccessResult(true, "Xóa sách thành công");
        }

        public async Task SeedInitialBooksAsync()
        {
            var count = await _context.Books.CountDocumentsAsync(_ => true);
            if (count == 0)
            {
                var categories = await _context.Categories.Find(_ => true).ToListAsync();
                var cntCategory = categories.FirstOrDefault(c => c.Name == "Công Nghệ Thông Tin");
                var catId = cntCategory?.Id ?? string.Empty;

                var sampleBooks = new[]
                {
                    new Book
                    {
                        Title = "Clean Code: A Handbook of Agile Software Craftsmanship",
                        Author = "Robert C. Martin",
                        Isbn = "9780132350884",
                        CategoryId = catId,
                        Publisher = "Prentice Hall",
                        PublishYear = 2008,
                        TotalCopies = 5,
                        AvailableCopies = 5,
                        Location = "Kệ A1-01",
                        CoverImageUrl = "https://m.media-amazon.com/images/I/41xShLch03L._SX376_BO1,204,203,200_.jpg",
                        Description = "Cuốn sách kinh điển về viết code sạch, dễ đọc và dễ bảo trì.",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Book
                    {
                        Title = "Design Patterns: Elements of Reusable Object-Oriented Software",
                        Author = "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
                        Isbn = "9780201633610",
                        CategoryId = catId,
                        Publisher = "Addison-Wesley",
                        PublishYear = 1994,
                        TotalCopies = 3,
                        AvailableCopies = 3,
                        Location = "Kệ A1-02",
                        CoverImageUrl = "https://m.media-amazon.com/images/I/51szD9HC9pL._SX395_BO1,204,203,200_.jpg",
                        Description = "23 mẫu thiết kế hướng đối tượng kinh điển của nhóm Gang of Four (GoF).",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Book
                    {
                        Title = "Refactoring: Improving the Design of Existing Code",
                        Author = "Martin Fowler",
                        Isbn = "9780134757599",
                        CategoryId = catId,
                        Publisher = "Addison-Wesley",
                        PublishYear = 2018,
                        TotalCopies = 4,
                        AvailableCopies = 4,
                        Location = "Kệ A1-03",
                        CoverImageUrl = "https://m.media-amazon.com/images/I/41OD5ed4qRL._SX397_BO1,204,203,200_.jpg",
                        Description = "Cải thiện cấu trúc mã nguồn cũ mà không thay đổi hành vi bên ngoài.",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                await _context.Books.InsertManyAsync(sampleBooks);
            }
        }

        private static BookDto MapToBookDto(Book book, string categoryName)
        {
            return new BookDto
            {
                Id = book.Id ?? string.Empty,
                Title = book.Title,
                Author = book.Author,
                Isbn = book.Isbn,
                CategoryId = book.CategoryId,
                CategoryName = categoryName,
                Publisher = book.Publisher,
                PublishYear = book.PublishYear,
                TotalCopies = book.TotalCopies,
                AvailableCopies = book.AvailableCopies,
                Location = book.Location,
                CoverImageUrl = book.CoverImageUrl,
                Description = book.Description,
                CreatedAt = book.CreatedAt
            };
        }
    }
}

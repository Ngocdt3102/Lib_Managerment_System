using System.ComponentModel.DataAnnotations;

namespace LibManagementSystem.API.DTOs
{
    public class BookDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Isbn { get; set; } = string.Empty;
        public string CategoryId { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public int PublishYear { get; set; }
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public string Location { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBookDto
    {
        [Required(ErrorMessage = "Tiêu đề sách không được để trống")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tác giả không được để trống")]
        public string Author { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mã ISBN không được để trống")]
        public string Isbn { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng chọn danh mục sách")]
        public string CategoryId { get; set; } = string.Empty;

        public string Publisher { get; set; } = string.Empty;
        public int PublishYear { get; set; } = DateTime.Now.Year;

        [Range(1, 10000, ErrorMessage = "Số lượng tổng phải lớn hơn 0")]
        public int TotalCopies { get; set; } = 1;

        public string Location { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateBookDto
    {
        [Required(ErrorMessage = "Tiêu đề sách không được để trống")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tác giả không được để trống")]
        public string Author { get; set; } = string.Empty;

        public string Isbn { get; set; } = string.Empty;
        public string CategoryId { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public int PublishYear { get; set; }
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public string Location { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class BookQueryDto
    {
        public string? Keyword { get; set; }
        public string? CategoryId { get; set; }
        public bool? AvailableOnly { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}

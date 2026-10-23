using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using LibManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibManagementSystem.API.Controllers
{
    /// <summary>
    /// Quản lý danh mục sách và tìm kiếm sách trong thư viện
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        /// <summary>
        /// Lấy danh sách sách có hỗ trợ tìm kiếm, lọc theo thể loại và phân trang
        /// </summary>
        /// <param name="query">Tham số tìm kiếm (Search, CategoryId, Page, PageSize)</param>
        /// <response code="200">Danh sách sách kèm thông tin phân trang</response>
        [HttpGet]
        public async Task<IActionResult> GetBooks([FromQuery] BookQueryDto query)
        {
            var result = await _bookService.GetBooksAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// Lấy chi tiết thông tin cuốn sách theo mã ID
        /// </summary>
        /// <param name="id">Mã ID của sách</param>
        /// <response code="200">Chi tiết cuốn sách</response>
        /// <response code="404">Không tìm thấy sách với mã ID cung cấp</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookById(string id)
        {
            var result = await _bookService.GetBookByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Thêm một cuốn sách mới vào hệ thống
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="dto">Dữ liệu tạo sách mới</param>
        /// <response code="201">Tạo sách thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ hoặc ISBN đã tồn tại</response>
        /// <response code="401">Chưa xác thực</response>
        /// <response code="403">Không có quyền truy cập</response>
        [HttpPost]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> CreateBook([FromBody] CreateBookDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<BookDto>.FailureResult("Dữ liệu tạo sách không hợp lệ"));
            }

            var result = await _bookService.CreateBookAsync(dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetBookById), new { id = result.Data?.Id }, result);
        }

        /// <summary>
        /// Cập nhật thông tin cuốn sách theo mã ID
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="id">Mã ID của sách cần cập nhật</param>
        /// <param name="dto">Dữ liệu cập nhật sách</param>
        /// <response code="200">Cập nhật thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ hoặc không tìm thấy sách</response>
        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> UpdateBook(string id, [FromBody] UpdateBookDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<BookDto>.FailureResult("Dữ liệu không hợp lệ"));
            }

            var result = await _bookService.UpdateBookAsync(id, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Xóa cuốn sách khỏi hệ thống theo mã ID
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="id">Mã ID của sách cần xóa</param>
        /// <response code="200">Xóa sách thành công</response>
        /// <response code="400">Không thể xóa sách do đang được mượn hoặc không tồn tại</response>
        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> DeleteBook(string id)
        {
            var result = await _bookService.DeleteBookAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}

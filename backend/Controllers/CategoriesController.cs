using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using LibManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibManagementSystem.API.Controllers
{
    /// <summary>
    /// Quản lý thể loại sách trong hệ thống thư viện
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách các thể loại sách
        /// </summary>
        /// <response code="200">Danh sách thể loại</response>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _categoryService.GetAllCategoriesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Lấy chi tiết thể loại theo mã ID
        /// </summary>
        /// <param name="id">Mã ID của thể loại</param>
        /// <response code="200">Chi tiết thể loại</response>
        /// <response code="404">Không tìm thấy thể loại</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _categoryService.GetCategoryByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Thêm một thể loại sách mới
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="dto">Thông tin thể loại mới</param>
        /// <response code="201">Tạo thể loại thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ hoặc tên thể loại đã tồn tại</response>
        [HttpPost]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<CategoryDto>.FailureResult("Dữ liệu không hợp lệ"));
            }

            var result = await _categoryService.CreateCategoryAsync(dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
        }

        /// <summary>
        /// Cập nhật thông tin thể loại sách
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="id">Mã ID của thể loại</param>
        /// <param name="dto">Thông tin cập nhật</param>
        /// <response code="200">Cập nhật thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ hoặc không tìm thấy thể loại</response>
        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateCategoryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<CategoryDto>.FailureResult("Dữ liệu không hợp lệ"));
            }

            var result = await _categoryService.UpdateCategoryAsync(id, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Xóa thể loại sách theo mã ID
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="id">Mã ID của thể loại cần xóa</param>
        /// <response code="200">Xóa thể loại thành công</response>
        /// <response code="400">Không thể xóa thể loại (đang có sách thuộc thể loại này)</response>
        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _categoryService.DeleteCategoryAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}

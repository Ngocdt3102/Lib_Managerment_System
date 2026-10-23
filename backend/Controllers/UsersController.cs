using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using LibManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibManagementSystem.API.Controllers
{
    /// <summary>
    /// Quản lý người dùng, độc giả và phân quyền tài khoản
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;

        public UsersController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách người dùng trong hệ thống
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <response code="200">Danh sách người dùng</response>
        [HttpGet]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _authService.GetAllUsersAsync();
            return Ok(result);
        }

        /// <summary>
        /// Lấy thông tin chi tiết một người dùng theo mã ID
        /// </summary>
        /// <param name="id">Mã ID của người dùng</param>
        /// <response code="200">Thông tin người dùng</response>
        /// <response code="404">Không tìm thấy người dùng</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var result = await _authService.GetProfileAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Cập nhật thông tin tài khoản người dùng
        /// </summary>
        /// <param name="id">Mã ID của người dùng cần cập nhật</param>
        /// <param name="dto">Thông tin cập nhật (Họ tên, Số điện thoại, Vai trò...)</param>
        /// <response code="200">Cập nhật thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ hoặc không tìm thấy người dùng</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var result = await _authService.UpdateUserAsync(id, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Xóa tài khoản người dùng khỏi hệ thống
        /// </summary>
        /// <remarks>Chỉ dành riêng cho tài khoản Quản trị viên (Admin)</remarks>
        /// <param name="id">Mã ID của người dùng cần xóa</param>
        /// <response code="200">Xóa người dùng thành công</response>
        /// <response code="400">Không tìm thấy hoặc không thể xóa tài khoản</response>
        [HttpDelete("{id}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _authService.DeleteUserAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}

using System.Security.Claims;
using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibManagementSystem.API.Controllers
{
    /// <summary>
    /// Quản lý xác thực và phân quyền người dùng (Đăng ký, Đăng nhập, Thông tin cá nhân)
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Đăng ký tài khoản độc giả mới
        /// </summary>
        /// <param name="dto">Thông tin đăng ký (Tên người dùng, Email, Mật khẩu, Họ tên)</param>
        /// <response code="200">Đăng ký thành công và trả về token JWT</response>
        /// <response code="400">Dữ liệu không hợp lệ hoặc email/username đã tồn tại</response>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<AuthResponseDto>.FailureResult("Dữ liệu đầu vào không hợp lệ"));
            }

            var result = await _authService.RegisterAsync(dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Đăng nhập hệ thống để nhận Token xác thực JWT
        /// </summary>
        /// <param name="dto">Thông tin đăng nhập (Username và Password)</param>
        /// <response code="200">Đăng nhập thành công, trả về JWT Token và thông tin User</response>
        /// <response code="401">Tài khoản hoặc mật khẩu không chính xác</response>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<AuthResponseDto>.FailureResult("Dữ liệu đầu vào không hợp lệ"));
            }

            var result = await _authService.LoginAsync(dto);
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Lấy thông tin tài khoản hiện tại đang đăng nhập
        /// </summary>
        /// <remarks>Yêu cầu Header Authorization: Bearer {token}</remarks>
        /// <response code="200">Lấy thông tin tài khoản thành công</response>
        /// <response code="401">Chưa xác thực hoặc token hết hạn</response>
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<UserDto>.FailureResult("Chưa xác thực người dùng"));
            }

            var result = await _authService.GetProfileAsync(userId);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
    }
}

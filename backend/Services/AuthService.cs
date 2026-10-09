using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using LibManagementSystem.API.Configurations;
using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

namespace LibManagementSystem.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IMongoDbContext _context;
        private readonly JwtSettings _jwtSettings;

        public AuthService(IMongoDbContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto)
        {
            // Kiểm tra username đã tồn tại chưa
            var existingUsername = await _context.Users.Find(u => u.Username.ToLower() == dto.Username.ToLower()).FirstOrDefaultAsync();
            if (existingUsername != null)
            {
                return ApiResponse<AuthResponseDto>.FailureResult("Tên đăng nhập đã tồn tại trong hệ thống");
            }

            // Kiểm tra email đã tồn tại chưa
            var existingEmail = await _context.Users.Find(u => u.Email.ToLower() == dto.Email.ToLower()).FirstOrDefaultAsync();
            if (existingEmail != null)
            {
                return ApiResponse<AuthResponseDto>.FailureResult("Email đã tồn tại trong hệ thống");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = passwordHash,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                Role = string.IsNullOrEmpty(dto.Role) ? UserRoles.Member : dto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(user);

            var token = GenerateJwtToken(user);
            var response = new AuthResponseDto
            {
                Token = token,
                User = MapToUserDto(user)
            };

            return ApiResponse<AuthResponseDto>.SuccessResult(response, "Đăng ký tài khoản thành công");
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.Find(u =>
                u.Username.ToLower() == dto.UsernameOrEmail.ToLower() ||
                u.Email.ToLower() == dto.UsernameOrEmail.ToLower()
            ).FirstOrDefaultAsync();

            if (user == null)
            {
                return ApiResponse<AuthResponseDto>.FailureResult("Tên đăng nhập hoặc mật khẩu không chính xác");
            }

            if (!user.IsActive)
            {
                return ApiResponse<AuthResponseDto>.FailureResult("Tài khoản của bạn đã bị khóa");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return ApiResponse<AuthResponseDto>.FailureResult("Tên đăng nhập hoặc mật khẩu không chính xác");
            }

            var token = GenerateJwtToken(user);
            var response = new AuthResponseDto
            {
                Token = token,
                User = MapToUserDto(user)
            };

            return ApiResponse<AuthResponseDto>.SuccessResult(response, "Đăng nhập thành công");
        }

        public async Task<ApiResponse<UserDto>> GetProfileAsync(string userId)
        {
            var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                return ApiResponse<UserDto>.FailureResult("Không tìm thấy thông tin người dùng");
            }

            return ApiResponse<UserDto>.SuccessResult(MapToUserDto(user));
        }

        public async Task<ApiResponse<List<UserDto>>> GetAllUsersAsync()
        {
            var users = await _context.Users.Find(_ => true).ToListAsync();
            var dtos = users.Select(MapToUserDto).ToList();
            return ApiResponse<List<UserDto>>.SuccessResult(dtos);
        }

        public async Task<ApiResponse<UserDto>> UpdateUserAsync(string userId, UpdateUserDto dto)
        {
            var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                return ApiResponse<UserDto>.FailureResult("Không tìm thấy thông tin người dùng");
            }

            user.FullName = string.IsNullOrEmpty(dto.FullName) ? user.FullName : dto.FullName;
            user.PhoneNumber = string.IsNullOrEmpty(dto.PhoneNumber) ? user.PhoneNumber : dto.PhoneNumber;
            
            if (!string.IsNullOrEmpty(dto.Role))
            {
                user.Role = dto.Role;
            }

            if (dto.IsActive.HasValue)
            {
                user.IsActive = dto.IsActive.Value;
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.Users.ReplaceOneAsync(u => u.Id == userId, user);

            return ApiResponse<UserDto>.SuccessResult(MapToUserDto(user), "Cập nhật thông tin thành công");
        }

        public async Task<ApiResponse<bool>> DeleteUserAsync(string userId)
        {
            var result = await _context.Users.DeleteOneAsync(u => u.Id == userId);
            if (result.DeletedCount == 0)
            {
                return ApiResponse<bool>.FailureResult("Không tìm thấy người dùng để xóa");
            }

            return ApiResponse<bool>.SuccessResult(true, "Xóa tài khoản thành công");
        }

        public async Task SeedInitialAdminAsync()
        {
            var count = await _context.Users.CountDocumentsAsync(_ => true);
            if (count == 0)
            {
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@lib.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    FullName = "Hệ Thống Admin",
                    PhoneNumber = "0900000000",
                    Role = UserRoles.Admin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var librarian = new User
                {
                    Username = "librarian",
                    Email = "librarian@lib.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Librarian@123"),
                    FullName = "Thủ Thư Nguyễn Văn A",
                    PhoneNumber = "0911111111",
                    Role = UserRoles.Librarian,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var member = new User
                {
                    Username = "member",
                    Email = "member@lib.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Member@123"),
                    FullName = "Độc Giả Trần Văn B",
                    PhoneNumber = "0922222222",
                    Role = UserRoles.Member,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _context.Users.InsertManyAsync(new[] { admin, librarian, member });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id ?? string.Empty,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
    }
}

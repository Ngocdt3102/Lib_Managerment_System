# 📚 Tài Liệu Hướng Dẫn & Kiến Trúc Dự Án: Lib_Management_System

> **File cấu hình & ngữ cảnh dành cho AI Agent (`Agent.md`)**  
> **Dự án**: Hệ Thống Quản Lý Thư Viện (Library Management System)  
> **Kiến trúc**: Full-stack Web Application (React.js + ASP.NET Core Web API + MongoDB)  

---

## 1. 🎯 Tổng Quan Dự Án (Project Overview)

**Lib_Management_System** là ứng dụng web quản lý thư viện hiện đại, toàn diện. Hệ thống hỗ trợ quản lý kho sách, thông tin độc giả, quy trình mượn/trả sách, tính toán và xử lý phí phạt quá hạn, cũng như cung cấp các báo cáo thống kê trực quan. 

Hệ thống được thiết kế hỗ trợ phân quyền người dùng đa cấp:
- **Admin**: Quản trị viên hệ thống.
- **Librarian (Thủ thư)**: Quản lý nghiệp vụ mượn/trả, quản lý kho sách và duyệt phạt.
- **Member (Độc giả / Học sinh / Sinh viên)**: Tra cứu sách, gửi yêu cầu mượn và theo dõi lịch sử cá nhân.

---

## 2. 🛠️ Kiến Trúc Công Nghệ (Tech Stack)

### **Frontend**
- **Framework / Library**: React.js (Vite)
- **Language**: JavaScript / TypeScript
- **UI Toolkit & Styling**: Tailwind CSS / Ant Design / Material UI
- **State Management**: Redux Toolkit / Zustand / Context API
- **HTTP Client**: Axios (Tích hợp Request/Response Interceptors xử lý JWT Token)
- **Routing**: React Router DOM v6+

### **Backend**
- **Framework**: ASP.NET Core Web API (.NET 8 / .NET 9)
- **Language**: C#
- **Architecture Pattern**: Layered Architecture / Clean Architecture (Controllers -> Services -> Repositories -> Models/DTOs)
- **Authentication & Authorization**: JWT (JSON Web Token), Role-Based Authorization
- **API Documentation**: Swagger / OpenAPI

### **Database**
- **Database Type**: NoSQL
- **Database System**: MongoDB
- **Driver**: MongoDB.Driver cho .NET
- **Data Access Pattern**: Repository Pattern tích hợp MongoDbContext

---

## 3. 📦 Các Module Chức Năng (Core Modules & Features)

### 3.1. 👤 Module Quản Lý Người Dùng & Xác Thực (Users & Authentication)
- **Xác thực hệ thống**:
  - Đăng ký (Register), Đăng nhập (Login), Đổi mật khẩu, Quên mật khẩu.
  - Cấp phát & Làm mới JWT Token (Access Token & Refresh Token).
- **Phân quyền người dùng (Role-Based Access Control - RBAC)**:
  - `Admin`: Quyền quản trị hệ thống (Quản lý tài khoản, cấu hình hệ thống, xem báo cáo tổng quan).
  - `Librarian` (Thủ thư): Quản lý sách, danh mục, duyệt yêu cầu mượn/trả, xử lý thu phí phạt.
  - `Member` (Độc giả): Tìm kiếm sách, đăng ký mượn sách, xem lịch sử mượn, tra cứu phiếu phạt cá nhân.
- **Quản lý Hồ sơ (User Profiles)**: Xem & cập nhật thông tin cá nhân, quản lý trạng thái tài khoản.

### 3.2. 📚 Module Quản Lý Sách & Danh Mục (Books & Catalog Management)
- **Quản lý Danh mục (Categories)**: Thêm, sửa, xóa, tìm kiếm thể loại sách (Công nghệ, Khoa học, Văn học, Kinh tế, v.v.).
- **Quản lý Sách (Books CRUD)**:
  - Thêm mới, cập nhật thông tin, ẩn/xóa sách.
  - Quản lý các thuộc tính: Mã ISBN, Tên sách, Tác giả, Thể loại, Nhà xuất bản, Năm xuất bản, Số lượng tổng (Total Copies), Số lượng khả dụng (Available Copies), Vị trí kệ sách, Ảnh bìa (Cover Image).
- **Tra cứu & Tìm kiếm Nâng cao (Search & Filtering)**:
  - Tìm kiếm đa tiêu chí: Từ khóa (Tiêu đề, Tác giả, ISBN), Lọc theo Thể loại, Trạng thái (Còn sách / Hết sách).
  - Phân trang (Pagination) và Sắp xếp (Sorting).

### 3.3. 🔄 Module Quản Lý Mượn & Trả Sách (Borrow & Return Management)
- **Đăng ký mượn sách**: Độc giả gửi yêu cầu mượn sách trực tuyến hoặc đăng ký trực tiếp tại quầy.
- **Duyệt & Xuất phiếu mượn**: Thủ thư duyệt yêu cầu mượn, hệ thống tự động trừ số lượng sách khả dụng (`availableCopies`).
- **Xử lý Trả sách**:
  - Ghi nhận ngày trả thực tế.
  - Tự động kiểm tra trạng thái mượn quá hạn (Overdue).
  - Cập nhật cộng trả lại số lượng sách khả dụng.
- **Gia hạn thời gian mượn**: Cho phép độc giả gia hạn (nếu chưa quá hạn và không có người đăng ký chờ).

### 3.4. 💰 Module Phí Phạt & Xử Lý Vi Phạm (Fines & Penalties)
- **Tự động tính phí quá hạn**: Áp dụng công thức tính phạt dựa trên số ngày quá hạn (ví dụ: 5.000 VNĐ / ngày).
- **Phạt Sách Hỏng / Mất**: Thủ thư lập biên bản vi phạm và áp dụng mức phí tương ứng.
- **Quản lý Thanh toán**: Theo dõi trạng thái phiếu phạt (`Pending` - Chưa trả, `Paid` - Đã thanh toán), ghi nhận lịch sử nộp phạt.

### 3.5. 📊 Module Thống Kê & Báo Cáo (Analytics & Reporting)
- Tổng số lượng sách, tổng số độc giả, số lượng lượt mượn đang diễn ra.
- Thống kê biểu đồ lượt mượn/trả theo khoảng thời gian (Tuần / Tháng / Năm).
- Top các cuốn sách được mượn nhiều nhất.
- Danh sách mượn quá hạn chưa hoàn trả.
- Báo cáo doanh thu thu được từ phí phạt.

---

## 4. 🗄️ Thiết Kế Cơ Sở Dữ Liệu MongoDB (Database Schemas)

Hệ thống bao gồm các Collections chính trong MongoDB:

### 4.1. Collection `users`
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "passwordHash": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "Admin | Librarian | Member",
  "isActive": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 4.2. Collection `categories`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "createdAt": "ISODate"
}
```

### 4.3. Collection `books`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "author": "string",
  "isbn": "string",
  "categoryId": "ObjectId",
  "publisher": "string",
  "publishYear": 2024,
  "totalCopies": 10,
  "availableCopies": 7,
  "location": "Kệ A1-03",
  "coverImageUrl": "string",
  "description": "string",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 4.4. Collection `borrowRecords`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "bookId": "ObjectId",
  "borrowDate": "ISODate",
  "dueDate": "ISODate",
  "returnDate": "ISODate | null",
  "status": "Borrowed | Returned | Overdue | Lost",
  "notes": "string",
  "createdAt": "ISODate"
}
```

### 4.5. Collection `fines`
```json
{
  "_id": "ObjectId",
  "borrowRecordId": "ObjectId",
  "userId": "ObjectId",
  "amount": 25000,
  "reason": "Quá hạn 5 ngày",
  "status": "Pending | Paid",
  "paidAt": "ISODate | null",
  "createdAt": "ISODate"
}
```

---

## 5. 📁 Cấu Trúc Thư Mục Dự Án Dự Kiến (Project Structure)

```text
Lib_Management_System/
├── Agent.md                         # File hướng dẫn & ngữ cảnh hệ thống cho AI Agent
├── backend/                         # ASP.NET Core Web API
│   ├── Controllers/                 # RESTful API Endpoints (Auth, Users, Books, Borrows...)
│   ├── Models/                      # MongoDB BSON Data Entities
│   ├── DTOs/                        # Request & Response Data Transfer Objects
│   ├── Repositories/                # MongoDb Repository Pattern & Interfaces
│   ├── Services/                    # Business Logic Layer
│   ├── Configurations/              # MongoDbSettings, JwtSettings, AppSettings
│   ├── Middleware/                  # Exception Handling & Authentication Middleware
│   ├── Program.cs                   # Entry point & Dependency Injection Setup
│   └── appsettings.json             # Application Configuration
└── frontend/                        # React.js Web Application
    ├── public/                      # Static Assets
    ├── src/
    │   ├── assets/                  # Images, Icons, CSS Styles
    │   ├── components/              # Reusable UI Components (Navbar, Table, Modal...)
    │   ├── pages/                   # Views (Dashboard, BookList, LoanHistory, Login...)
    │   ├── services/                # Axios API Integrations (authService, bookService...)
    │   ├── store/                   # Global State Management (Redux Toolkit / Context)
    │   ├── routes/                  # App Routing & Private/Protected Routes
    │   ├── utils/                   # Helper functions, Constants, Date Formatters
    │   ├── App.jsx / App.tsx        # App Root Component
    │   └── main.jsx / main.tsx      # Main Entry Point
    ├── package.json
    └── vite.config.js
```

---

## 6. 🔌 Chuẩn Định Hướng RESTful API Endpoints

- **Authentication**:
  - `POST /api/v1/auth/login`: Đăng nhập cấp JWT Token.
  - `POST /api/v1/auth/register`: Đăng ký tài khoản độc giả mới.
  - `GET /api/v1/auth/me`: Lấy thông tin tài khoản hiện tại.
- **Users**:
  - `GET /api/v1/users`: Danh sách người dùng (Admin).
  - `GET /api/v1/users/{id}` / `PUT /api/v1/users/{id}`: Quản lý thông tin độc giả.
- **Categories**:
  - `GET /api/v1/categories`: Lấy danh sách thể loại sách.
  - `POST /api/v1/categories`: Thêm danh mục mới (Librarian/Admin).
- **Books**:
  - `GET /api/v1/books`: Danh sách sách (có tìm kiếm, lọc, phân trang).
  - `GET /api/v1/books/{id}`: Chi tiết sách.
  - `POST /api/v1/books`: Thêm sách mới.
  - `PUT /api/v1/books/{id}`: Cập nhật thông tin sách.
  - `DELETE /api/v1/books/{id}`: Xóa/ẩn sách.
- **Borrows**:
  - `POST /api/v1/borrows`: Tạo yêu cầu mượn sách.
  - `PUT /api/v1/borrows/{id}/approve`: Duyệt mượn sách (Librarian).
  - `PUT /api/v1/borrows/{id}/return`: Xử lý trả sách (Librarian).
  - `GET /api/v1/borrows/my-loans`: Lịch sử mượn sách của cá nhân.
- **Fines**:
  - `GET /api/v1/fines`: Danh sách phiếu phạt.
  - `PUT /api/v1/fines/{id}/pay`: Ghi nhận thanh toán phiếu phạt.
- **Dashboard & Statistics**:
  - `GET /api/v1/stats/overview`: Lấy số liệu thống kê tổng quan cho Admin/Thủ thư.

---

## 7. 🤖 Quy Tắc & Hướng Dẫn Cho AI Agent Khi Phát Triển Code

Khi hỗ trợ viết code, refactor hoặc sửa lỗi trong dự án này, AI Agent phải tuân thủ các nguyên tắc sau:

1. **Tuân thủ chuẩn RESTful API & DTOs**:
   - Sử dụng đúng HTTP Method (`GET`, `POST`, `PUT`, `DELETE`).
   - Sử dụng DTOs cho các request và response; không expose trực tiếp MongoDB Entity ra bên ngoài API.
   - Chuẩn hóa cấu trúc JSON Response dạng:
     ```json
     {
       "success": true,
       "message": "Nội dung thông báo",
       "data": { ... },
       "errors": null
     }
     ```
2. **Xử lý Bất đồng bộ (Async / Await)**:
   - Tất cả các thao tác với MongoDB trong C# Backend phải dùng API bất đồng bộ (`FindAsync`, `InsertOneAsync`, `UpdateOneAsync`, v.v.).
   - Tất cả API Controller actions phải trả về `Task<IActionResult>`.
3. **Bảo mật & Phân quyền**:
   - Luôn áp dụng thuộc tính `[Authorize]` và `[Authorize(Roles = "...")]` trên các Controller/Action cần bảo mật.
   - Đảm bảo mật khẩu người dùng được băm an toàn (`BCrypt.Net` hoặc `Argon2`) trước khi lưu vào MongoDB.
4. **Cấu trúc Code Clean & Tách biệt Trách nhiệm (SOC)**:
   - Controllers: Chỉ tiếp nhận request, validate model state cơ bản, gọi Services và trả về ActionResult.
   - Services: Chứa nghiệp vụ kinh doanh (Business Logic).
   - Repositories: Đảm nhiệm truy vấn dữ liệu trực tiếp với MongoDB.
5. **Frontend Modular & Type-Safe**:
   - Viết các UI components dạng functional component tái sử dụng.
   - Xử lý các trạng thái Loading, Error và Empty state rõ ràng cho trải nghiệm người dùng.

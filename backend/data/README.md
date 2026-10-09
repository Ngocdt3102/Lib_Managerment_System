# 📊 Hướng Dẫn Import Dữ Liệu Mẫu (Sample Data Import Guide)

Thư mục này chứa dữ liệu mẫu chuẩn dạng JSON (MongoDB Extended JSON format) cho 5 collections trong hệ thống:
1. `users.json`: Tài khoản người dùng (Admin, Thủ thư, Độc giả).
2. `categories.json`: Danh mục thể loại sách.
3. `books.json`: Danh sách các cuốn sách trong kho.
4. `borrowRecords.json`: Phiếu mượn / trả / quá hạn / hỏng sách.
5. `fines.json`: Danh sách phiếu phạt.

Tất cả các file dữ liệu đã được liên kết chặt chẽ qua mã **ObjectId** (`_id`, `userId`, `bookId`, `categoryId`, `borrowRecordId`).

---

## 🛠️ Cách 1: Import bằng lệnh `mongoimport` (Khuyên dùng - Nhanh nhất)

Mở **PowerShell** hoặc **Command Prompt** tại thư mục `backend/data` và chạy các câu lệnh sau:

```bash
# 1. Import danh mục người dùng
mongoimport --db LibManagementDb --collection users --file users.json --jsonArray --drop

# 2. Import danh mục thể loại sách
mongoimport --db LibManagementDb --collection categories --file categories.json --jsonArray --drop

# 3. Import kho sách
mongoimport --db LibManagementDb --collection books --file books.json --jsonArray --drop

# 4. Import lịch sử mượn/trả
mongoimport --db LibManagementDb --collection borrowRecords --file borrowRecords.json --jsonArray --drop

# 5. Import phiếu phạt
mongoimport --db LibManagementDb --collection fines --file fines.json --jsonArray --drop
```

> **Lưu ý**: Cờ `--drop` sẽ tự động xóa collection cũ (nếu có) trước khi nạp dữ liệu mới để tránh bị trùng lặp `_id`.

---

## 🖥️ Cách 2: Import bằng phần mềm MongoDB Compass (Giao diện trực quan)

1. Mở **MongoDB Compass** và kết nối tới database `mongodb://localhost:27017`.
2. Tạo mới hoặc chọn database tên `LibManagementDb`.
3. Tạo từng Collection tương ứng (`users`, `categories`, `books`, `borrowRecords`, `fines`).
4. Trong mỗi Collection, nhấn nút **Add Data** -> Chọn **Import JSON or CSV file**.
5. Chọn file `.json` tương ứng trong thư mục `backend/data/` và nhấn **Import**.

---

## 🔑 Thông Tin Tài Khoản Sau Khi Import Data Mẫu:

- **Quản trị viên (Admin)**: 
  - Username: `admin` | Password: `Admin@123`
- **Thủ thư (Librarian)**: 
  - Username: `librarian1` | Password: `Librarian@123`
  - Username: `librarian2` | Password: `Librarian@123`
- **Độc giả (Member)**: 
  - Username: `student01` | Password: `Member@123`
  - Username: `student02` | Password: `Member@123`
  - Username: `student03` | Password: `Member@123`
  - Username: `student04` | Password: `Member@123`

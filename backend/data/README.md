# 📊 Hướng Dẫn Import Bộ Dữ Liệu Mẫu Đầy Đủ (Rich Sample Dataset Guide)

Thư mục này chứa bộ dữ liệu mẫu quy mô lớn, chuẩn định dạng **MongoDB Extended JSON (v2)** cho 5 collections trong hệ thống **Lib_Management_System**:

1. **`categories.json`** (**10 Danh Mục**): Bao quát từ Công nghệ thông tin, Trí tuệ nhân tạo, An ninh mạng, Kinh tế, Tài chính, Kỹ năng sống, Văn học đến Ngoại ngữ, Khoa học vũ trụ và Lịch sử.
2. **`users.json`** (**25 Người Dùng**): 1 Admin (`admin`), 3 Thủ thư (`librarian1` đến `librarian3`) và 21 Độc giả sinh viên (`student01` đến `student21`).
3. **`books.json`** (**40 Cuốn Sách Nổi Tiếng**): Đầy đủ ISBN, NXB, năm xuất bản, ảnh bìa, vị trí kệ sách (`A1-01` đến `J1-02`) và tính toán số lượng khả dụng đồng bộ với các phiếu mượn.
4. **`borrowRecords.json`** (**35 Phiếu Mượn**): Mô phỏng đầy đủ các trạng thái thực tế:
   - `Returned`: 15 lượt đã hoàn trả sách đúng hạn / trễ hạn.
   - `Borrowed`: 10 lượt đang mượn còn trong thời hạn.
   - `Overdue`: 7 lượt mượn quá hạn chưa trả (kích hoạt cảnh báo phạt trên Dashboard).
   - `Lost`: 3 lượt làm hỏng / mất sách.
5. **`fines.json`** (**15 Phiếu Phạt**): 9 phiếu đã nộp tiền (`Paid`) và 6 phiếu đang chờ thu tiền (`Pending`).

---

## 🛠️ Cách 1: Import Nhanh Bằng Dòng Lệnh `mongoimport` (Khuyên Dùng)

Mở **PowerShell** hoặc **Terminal** tại thư mục `backend/data` và chạy 5 lệnh sau:

```bash
# 1. Import danh mục thể loại sách
mongoimport --db LibManagementDb --collection categories --file categories.json --jsonArray --drop

# 2. Import người dùng & phân quyền
mongoimport --db LibManagementDb --collection users --file users.json --jsonArray --drop

# 3. Import kho sách
mongoimport --db LibManagementDb --collection books --file books.json --jsonArray --drop

# 4. Import lịch sử mượn/trả
mongoimport --db LibManagementDb --collection borrowRecords --file borrowRecords.json --jsonArray --drop

# 5. Import danh sách phiếu phạt
mongoimport --db LibManagementDb --collection fines --file fines.json --jsonArray --drop
```

> **Lưu ý**: Cờ `--drop` sẽ tự động xóa collection cũ trước khi nạp mới để đảm bảo dữ liệu luôn sạch và không bị trùng lặp `_id`.

---

## 🐳 Cách 2: Import Khi Đang Chạy Hệ Thống Bằng Docker (Local hoặc Trên Cloud EC2)

Nếu bạn đang chạy MongoDB bên trong Docker container (`lib_mongodb`):

```bash
docker exec -i lib_mongodb mongoimport --db LibManagementDb --collection categories --file /dev/stdin --jsonArray --drop < categories.json
docker exec -i lib_mongodb mongoimport --db LibManagementDb --collection users --file /dev/stdin --jsonArray --drop < users.json
docker exec -i lib_mongodb mongoimport --db LibManagementDb --collection books --file /dev/stdin --jsonArray --drop < books.json
docker exec -i lib_mongodb mongoimport --db LibManagementDb --collection borrowRecords --file /dev/stdin --jsonArray --drop < borrowRecords.json
docker exec -i lib_mongodb mongoimport --db LibManagementDb --collection fines --file /dev/stdin --jsonArray --drop < fines.json
```

---

## 🖥️ Cách 3: Import Bằng MongoDB Compass (Giao Diện Trực Quan)

1. Mở **MongoDB Compass** và kết nối tới `mongodb://localhost:27017` (hoặc IP Cloud).
2. Chọn database **`LibManagementDb`**.
3. Chọn từng collection (`categories`, `users`, `books`, `borrowRecords`, `fines`).
4. Nhấn **Add Data** -> **Import JSON or CSV file** -> Chọn file `.json` tương ứng -> Bấm **Import**.

---

## 🔑 Danh Sách Tài Khoản Đăng Nhập Mẫu:

- **Quản trị viên (Admin)**: 
  - Username: `admin` | Password: `Admin@123`
- **Thủ thư (Librarians)**:
  - Username: `librarian1` / `librarian2` / `librarian3` | Password: `Librarian@123`
- **Độc giả (Members)**:
  - Username: `student01` đến `student20` | Password: `Member@123`
  - *(Tài khoản `student21` có trạng thái bị khóa để thử nghiệm tính năng vô hiệu hóa tài khoản).*

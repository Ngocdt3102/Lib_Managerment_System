# 🚀 Hướng Dẫn Triển Khai Quy Trình DevOps (Jenkins + Docker + GitHub)

> **Dự án**: Lib_Management_System  
> **Mục tiêu**: Tự động hóa hoàn toàn quy trình Tích hợp liên tục (CI) & Triển khai liên tục (CD) khi có sự thay đổi mã nguồn trên GitHub.

---

## 🏗️ Kiến Trúc Quy Trình CI/CD Pipeline

```text
[Developer] --(git push)--> [GitHub Repo] --(Webhook)--> [Jenkins Server]
                                                               │
┌──────────────────────────────────────────────────────────────┘
│ 1. Checkout Code từ GitHub
│ 2. Build & Test Backend (ASP.NET Core)
│ 3. Build & Test Frontend (React.js + Vite)
│ 4. Build Docker Images (backend:latest, frontend:latest)
│ 5. Push Docker Images lên Docker Hub Registry
└─> 6. Deploy / Restart Containers bằng Docker Compose trên Server
```

---

## 📋 BƯỚC 1: Chuẩn Bị Các File Cấu Hình Trong Mã Nguồn Dự Án

Hệ thống đã được cấu hình sẵn 5 file quan trọng sau:

1. **`backend/Dockerfile`**: Đóng gói ứng dụng ASP.NET Core Web API bằng Multi-stage build (.NET 10).
2. **`frontend/Dockerfile`**: Đóng gói ứng dụng React.js bundle tĩnh bằng Multi-stage build và phục vụ qua Nginx.
3. **`frontend/nginx.conf`**: Cấu hình Nginx Web Server hỗ trợ React Single Page App (SPA) và Reverse Proxy API request (`/api/`) tới Backend container.
4. **`docker-compose.yml`**: Điều phối 3 containers (`lib_mongodb`, `lib_backend`, `lib_frontend`) cùng chạy chung mạng `lib_network`.
5. **`Jenkinsfile`**: Kịch bản pipeline 6 giai đoạn điều khiển toàn bộ quy trình CI/CD.

---

## ⚙️ BƯỚC 2: Cấu Hình Trên Jenkins Server

### 2.1. Cài đặt các Plugin cần thiết trong Jenkins
Vào **Manage Jenkins** -> **Plugins** -> **Available Plugins** và cài đặt các plugin sau:
- **Git Plugin**
- **GitHub Integration Plugin**
- **Pipeline Plugin**
- **Credentials Binding Plugin**
- **Docker Pipeline Plugin**

### 2.2. Thêm Credentials đăng nhập Docker Hub vào Jenkins
1. Vào **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials (unrestricted)**.
2. Chọn **Add Credentials**:
   - **Kind**: `Username with password`
   - **Username**: Tài khoản Docker Hub của bạn
   - **Password**: Mật khẩu hoặc Personal Access Token (PAT) của Docker Hub
   - **ID**: `docker-hub-credentials` *(Khớp với biến `DOCKER_HUB_CREDENTIALS_ID` trong `Jenkinsfile`)*
3. Nhấn **Create**.

---

## 🔗 BƯỚC 3: Cấu Hình GitHub Webhook (Tự động kích hoạt Build khi Push code)

1. Mở Repository dự án trên **GitHub**.
2. Vào **Settings** -> **Webhooks** -> Chọn **Add webhook**.
3. Điền thông tin:
   - **Payload URL**: `http://<dia-chi-ip-jenkins>:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events would you like to trigger this webhook?**: Chọn `Just the push event`.
4. Nhấn **Add webhook**.

---

## 📦 BƯỚC 4: Tạo Jenkins Pipeline Job

1. Trên giao diện chính Jenkins, chọn **New Item**.
2. Nhập tên Job (ví dụ: `Lib_Management_System_Pipeline`) -> Chọn loại **Pipeline** -> Nhấn **OK**.
3. Cấu hình Job:
   - **Build Triggers**: Tích chọn `GitHub hook trigger for GITScm polling`.
   - **Pipeline Section**:
     - **Definition**: Chọn `Pipeline script from SCM`.
     - **SCM**: Chọn `Git`.
     - **Repository URL**: Điền đường dẫn Git của dự án (ví dụ: `https://github.com/user/Lib_Managerment_System.git`).
     - **Credentials**: Chọn Git Credentials nếu là private repository.
     - **Branch Specifier**: `*/main` hoặc `*/master`.
     - **Script Path**: `Jenkinsfile`.
4. Nhấn **Save**.

---

## 🧪 BƯỚC 5: Kiểm Thử Quy Trình CI/CD Tự Động

1. Tiến hành chỉnh sửa code trên máy cá nhân và push code lên GitHub:
   ```bash
   git add .
   git commit -m "feat: trigger DevOps CI/CD pipeline"
   git push origin main
   ```
2. **Kiểm tra kết quả**:
   - GitHub Webhook tự động phát tín hiệu tới Jenkins.
   - Jenkins tự động khởi tạo lượt Build mới, lần lượt chạy 6 Stages trong `Jenkinsfile`.
   - Docker Images được push lên Docker Hub.
   - Docker Compose tự động tái khởi động các Container trên Server với phiên bản code mới nhất.
   - Truy cập `http://localhost` (hoặc IP Server) để nghiệm thu ứng dụng!

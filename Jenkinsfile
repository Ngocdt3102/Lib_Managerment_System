pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKER_HUB_USER = 'dtngoc3103'
        BACKEND_IMAGE = "${DOCKER_HUB_USER}/lib-management-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/lib-management-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Source Code') {
            steps {
                echo '📦 Lấy mã nguồn mới nhất từ GitHub Repository...'
                checkout scm
            }
        }

        stage('2. Build & Test Backend') {
            steps {
                echo '⚙️ Biên dịch và chạy kiểm thử Backend ASP.NET Core...'
                dir('backend') {
                    bat 'dotnet build --configuration Release'
                }
            }
        }

        stage('3. Build & Test Frontend') {
            steps {
                echo '💻 Cài đặt dependencies và đóng gói Frontend React.js...'
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('4. Build Docker Images') {
            steps {
                echo '🐳 Xây dựng Docker Images cho Backend và Frontend...'
                bat "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
                bat "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend"
            }
        }

        stage('5. Push Images to Docker Hub') {
            steps {
                echo '🚀 Đẩy Docker Images lên Docker Hub Registry...'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat 'echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin'
                    bat "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    bat "docker push ${BACKEND_IMAGE}:latest"
                    bat "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    bat "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('6. Deploy System via Docker Compose') {
            steps {
                echo '🔄 Khởi chạy / Cập nhật Container trên Server bằng Docker Compose...'
                bat 'docker-compose down'
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        always {
            echo '🧹 dọn dẹp các tài nguyên tạm sau khi chạy Pipeline...'
        }
        success {
            echo '✅ CI/CD Pipeline đã chạy thành công hoàn tất triển khai!'
        }
        failure {
            echo '❌ CI/CD Pipeline gặp lỗi! Vui lòng kiểm tra Console Log trong Jenkins.'
        }
    }
}

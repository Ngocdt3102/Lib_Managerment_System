import React from 'react';
import { Result, Button, Tag, Space, Typography, Card } from 'antd';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Text, Paragraph } = Typography;

export const Forbidden: React.FC = () => {
  const { user, defaultPath, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Admin':
        return <Tag color="error" style={{ fontSize: 13, padding: '2px 10px' }}>Quản Trị Viên (Admin)</Tag>;
      case 'Librarian':
        return <Tag color="processing" style={{ fontSize: 13, padding: '2px 10px' }}>Thủ Thư (Librarian)</Tag>;
      case 'Member':
        return <Tag color="success" style={{ fontSize: 13, padding: '2px 10px' }}>Độc Giả (Member)</Tag>;
      default:
        return <Tag>Khách</Tag>;
    }
  };

  const getTargetTitle = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'Về Bảng Điều Khiển Quản Trị';
      case 'Librarian':
        return 'Về Trang Nghiệp Vụ Thủ Thư';
      case 'Member':
        return 'Về Trang Khám Phá Sách';
      default:
        return 'Về Trang Đăng Nhập';
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} className="animate-fade-in-up">
      <Card
        style={{
          maxWidth: 620,
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          textAlign: 'center',
          border: '1px solid #fee2e2',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <ShieldAlert size={42} />
          </div>
        </div>

        <Result
          status="403"
          title="403 - Giới Hạn Quyền Truy Cập"
          subTitle="Hệ thống đã chặn yêu cầu này vì tài khoản hiện tại không có thẩm quyền truy cập vào đường dẫn yêu cầu."
          extra={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#f8fafc', padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', width: '100%' }}>
                <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
                  Tài khoản đăng nhập: <strong>{user?.fullName || user?.username}</strong>
                </Text>
                <div>
                  <Text type="secondary" style={{ marginRight: 8, fontSize: 13 }}>Vai trò được cấp:</Text>
                  {getRoleBadge(user?.role)}
                </div>
              </div>

              <Paragraph style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                {user?.role === 'Member' && 'Độc giả không có quyền truy cập vào các trang quản lý của Thủ thư và Quản trị viên.'}
                {user?.role === 'Librarian' && 'Thủ thư không có quyền truy cập vào các module đặc quyền của Quản trị viên cấp cao.'}
              </Paragraph>

              <Space size="middle" style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowLeft size={16} />}
                  onClick={() => navigate(defaultPath)}
                  style={{
                    borderRadius: 8,
                    height: 44,
                    padding: '0 24px',
                    fontWeight: 600,
                  }}
                >
                  {getTargetTitle(user?.role)}
                </Button>

                <Button
                  size="large"
                  icon={<LogOut size={16} />}
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  style={{ borderRadius: 8, height: 44 }}
                >
                  Đăng Xuất
                </Button>
              </Space>
            </div>
          }
        />
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth, getDefaultRouteForRole } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const redirectUrl = searchParams.get('redirect');

  const onFinish = async (values: { usernameOrEmail: string; password: string }) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await login(values);
      message.success(`Xin chào ${user.fullName}! Đăng nhập thành công.`);
      
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        const targetRoute = getDefaultRouteForRole(user.role);
        navigate(targetRoute, { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    form.setFieldsValue({
      usernameOrEmail: u,
      password: p,
    });
    setErrorMessage(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow Decorations */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="animate-fade-in-up"
        style={{
          display: 'flex',
          maxWidth: 960,
          width: '100%',
          borderRadius: 20,
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Left Banner: Brand Info & Highlights */}
        <div
          style={{
            flex: '1 1 45%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
            padding: '48px 40px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                <BookOutlined />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>LibSmart</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Hệ Thống Quản Lý Thư Viện Hiện Đại</div>
              </div>
            </div>

            <Title level={3} style={{ color: '#ffffff', fontWeight: 700, marginBottom: 16 }}>
              Không Gian Tri Thức & Quản Trị Toàn Diện
            </Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 14, lineHeight: 1.6 }}>
              Giải pháp số hóa tra cứu, mượn trả sách thông minh với hệ thống phân quyền 3 cấp độc lập và giao diện chuẩn mực.
            </Paragraph>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                <CheckCircleOutlined style={{ color: '#67e8f9' }} />
                <span>Phân quyền rõ ràng: Quản Trị Viên • Thủ Thư • Độc Giả</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                <CheckCircleOutlined style={{ color: '#67e8f9' }} />
                <span>Tra cứu kho sách trực quan dạng Lưới thẻ & Bảng dữ liệu</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                <CheckCircleOutlined style={{ color: '#67e8f9' }} />
                <span>Theo dõi hạn trả, gia hạn online và tự động tính phí phạt</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.2)', fontSize: 12, opacity: 0.8 }}>
            © 2026 LibSmart Platform. Phiên bản tối ưu trải nghiệm UI/UX.
          </div>
        </div>

        {/* Right Form: Login inputs & Quick demo fill */}
        <div
          style={{
            flex: '1 1 55%',
            padding: '44px 40px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
              Đăng Nhập Hệ Thống
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Nhập thông tin tài khoản của bạn để tiếp tục
            </Text>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
              closable
              onClose={() => setErrorMessage(null)}
            />
          )}

          <Form form={form} name="login_form" onFinish={onFinish} layout="vertical" requiredMark={false}>
            <Form.Item
              name="usernameOrEmail"
              label={<span style={{ fontWeight: 600, fontSize: 13 }}>Tên đăng nhập hoặc Email</span>}
              rules={[{ required: true, message: 'Vui lòng nhập Tên đăng nhập hoặc Email!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Ví dụ: admin hoặc student01"
                size="large"
                style={{ borderRadius: 8, height: 44 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, fontSize: 13 }}>Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Nhập mật khẩu"
                size="large"
                style={{ borderRadius: 8, height: 44 }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: 8,
                  height: 44,
                  fontWeight: 600,
                  fontSize: 15,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                }}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>

          {/* Quick Demo Accounts for Easy Testing */}
          <Divider style={{ margin: '14px 0', fontSize: 12, color: '#94a3b8' }}>
            Tài Khoản Mẫu Để Kiểm Tra Phân Quyền
          </Divider>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className="quick-login-btn"
              onClick={() => handleQuickFill('admin', 'Admin@123')}
              title="admin / Admin@123"
            >
              <span style={{ fontSize: 14 }}>👑</span>
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontWeight: 600, fontSize: 11.5, color: '#e11d48' }}>Admin</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Quản trị</div>
              </div>
            </button>

            <button
              type="button"
              className="quick-login-btn"
              onClick={() => handleQuickFill('librarian1', 'Librarian@123')}
              title="librarian1 / Librarian@123"
            >
              <span style={{ fontSize: 14 }}>📚</span>
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontWeight: 600, fontSize: 11.5, color: '#0284c7' }}>Thủ Thư</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Nghiệp vụ</div>
              </div>
            </button>

            <button
              type="button"
              className="quick-login-btn"
              onClick={() => handleQuickFill('student01', 'Member@123')}
              title="student01 / Member@123"
            >
              <span style={{ fontSize: 14 }}>🎓</span>
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontWeight: 600, fontSize: 11.5, color: '#059669' }}>Độc Giả</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Tra cứu</div>
              </div>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Chưa có tài khoản độc giả?{' '}
              <Link to="/register" style={{ fontWeight: 600, color: '#2563eb' }}>
                Đăng ký ngay
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

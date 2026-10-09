import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, message, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        role: 'Member',
      });
      message.success('Đăng ký tài khoản độc giả thành công! Chào mừng bạn.');
      navigate('/member/catalog', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký thất bại, vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
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
      }}
    >
      <Card
        className="animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '12px 8px',
          border: '1px solid #334155',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 26,
              marginBottom: 12,
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)',
            }}
          >
            <BookOutlined />
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Đăng Ký Tài Khoản Độc Giả
          </Title>
          <Text type="secondary" style={{ fontSize: 13.5 }}>
            Gia nhập thư viện thông minh LibSmart để tra cứu và mượn sách
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

        <Form name="register_form" onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item
            name="fullName"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Họ và tên</span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Ví dụ: Nguyễn Văn A" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Tên đăng nhập</span>}
            rules={[{ required: true, message: 'Vui lòng chọn tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Ví dụ: nguyenvana" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Địa chỉ Email</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="example@university.edu.vn" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Số điện thoại (tùy chọn)</span>}
          >
            <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0912345678" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Mật khẩu</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Tối thiểu 6 ký tự" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
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
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderColor: '#059669',
              }}
            >
              Hoàn Tất Đăng Ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#059669' }}>
              Đăng nhập ngay
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

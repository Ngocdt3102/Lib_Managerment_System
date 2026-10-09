import React, { useState } from 'react';
import { Row, Col, Card, Form, Input, Button, Typography, Tag, message, Avatar, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export const Profile: React.FC = () => {
  const { user, updateUserLocally } = useAuth();
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  const onUpdateProfile = async (values: any) => {
    if (!user) return;
    try {
      setUpdating(true);
      const res = await authService.updateUser(user.id, {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
      });
      if (res.success && res.data) {
        updateUserLocally(res.data);
        message.success('Cập nhật thông tin cá nhân thành công!');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleDetails = (role?: string) => {
    switch (role) {
      case 'Admin':
        return {
          title: 'Quản Trị Viên Hệ Thống (Administrator)',
          color: 'red',
          permissions: [
            'Toàn quyền quản trị tài khoản người dùng và phân quyền Role',
            'Toàn quyền quản lý kho sách, thể loại và nhập xuất dữ liệu',
            'Giám sát mọi hoạt động mượn trả và tài chính toàn thư viện',
            'Cấu hình các tham số vận hành hệ thống',
          ],
        };
      case 'Librarian':
        return {
          title: 'Thủ Thư Thư Viện (Librarian)',
          color: 'blue',
          permissions: [
            'Quản lý kho sách: Thêm, sửa, cập nhật vị trí kệ và số lượng tồn',
            'Quản lý danh mục thể loại sách',
            'Xử lý hoàn trả sách, ghi nhận sách hỏng/mất và áp mức phạt bồi thường',
            'Thu tiền và xác nhận gạch nợ phiếu phạt của độc giả',
            'Tra cứu danh bạ độc giả để nhắc nhở trả sách',
          ],
        };
      default:
        return {
          title: 'Độc Giả Thư Viện (Member)',
          color: 'green',
          permissions: [
            'Tra cứu và tìm kiếm toàn bộ kho sách theo thời gian thực',
            'Đăng ký mượn sách trực tuyến nhanh chóng',
            'Theo dõi tiến độ hạn trả sách và gia hạn mượn online (+7 ngày)',
            'Tra cứu phiếu phạt cá nhân và lịch sử mượn trả',
          ],
        };
    }
  };

  const roleInfo = getRoleDetails(user?.role);

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
          👤 Hồ Sơ Tài Khoản Cá Nhân
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Thông tin chi tiết tài khoản và đặc quyền truy cập trong hệ thống LibSmart.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* User Card */}
        <Col xs={24} md={8}>
          <Card
            style={{
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Avatar
                size={88}
                style={{
                  backgroundColor: '#2563eb',
                  fontSize: 36,
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </div>

            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
              {user?.fullName}
            </Title>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
              @{user?.username}
            </Text>

            <div style={{ marginTop: 12 }}>
              <Tag color={roleInfo.color} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 16 }}>
                {roleInfo.title}
              </Tag>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div>
                <Text type="secondary">Địa chỉ Email:</Text>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{user?.email}</div>
              </div>
              <div>
                <Text type="secondary">Số điện thoại:</Text>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{user?.phoneNumber || 'Chưa cập nhật'}</div>
              </div>
              <div>
                <Text type="secondary">Trạng thái tài khoản:</Text>
                <div>
                  <Tag color={user?.isActive ? 'success' : 'error'}>
                    {user?.isActive ? 'Đang hoạt động' : 'Bị khóa'}
                  </Tag>
                </div>
              </div>
              <div>
                <Text type="secondary">Ngày tham gia:</Text>
                <div style={{ color: '#475569' }}>
                  {user?.createdAt ? dayjs(user.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Update Profile Form & Privileges */}
        <Col xs={24} md={16}>
          <Card
            title={<span style={{ fontWeight: 700 }}>⚙️ Cập Nhật Thông Tin Cá Nhân</span>}
            style={{
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              marginBottom: 24,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                fullName: user?.fullName,
                phoneNumber: user?.phoneNumber,
                email: user?.email,
                username: user?.username,
              }}
              onFinish={onUpdateProfile}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Tên đăng nhập">
                    <Input value={user?.username} disabled prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Địa chỉ Email">
                    <Input value={user?.email} disabled prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên đầy đủ" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phoneNumber" label="Số điện thoại liên lạc">
                    <Input prefix={<PhoneOutlined />} placeholder="Ví dụ: 0912345678" />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit" loading={updating} style={{ borderRadius: 8, height: 40, fontWeight: 600 }}>
                  Lưu Cập Nhật
                </Button>
              </div>
            </Form>
          </Card>

          {/* Role Access Scope card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyCertificateOutlined style={{ color: '#2563eb' }} />
                <span style={{ fontWeight: 700 }}>Phạm Vi Đặc Quyền & Bảo Mật Vai Trò</span>
              </div>
            }
            style={{
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Paragraph style={{ color: '#475569', fontSize: 13.5 }}>
              Tài khoản của bạn được cấp quyền hạn tương ứng theo tiêu chuẩn Role-Based Access Control (RBAC):
            </Paragraph>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {roleInfo.permissions.map((perm, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5 }}>
                  <CheckCircleOutlined style={{ color: '#059669', marginTop: 3 }} />
                  <span style={{ color: '#1e293b' }}>{perm}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

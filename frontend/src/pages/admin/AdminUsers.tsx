import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Space,
  Typography,
  Select,
  Switch,
  message,
  Popconfirm,
  Button,
  Card,
  Input,
  Modal,
  Form,
  Avatar,
  Row,
  Col,
  Tabs,
} from 'antd';
import {
  DeleteOutlined,
  UserOutlined,
  UserAddOutlined,
  SearchOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { authService } from '../../services/authService';
import type { User } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authService.getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await authService.updateUser(userId, { role: newRole as any });
      if (res.success) {
        message.success('Cập nhật phân quyền vai trò thành công!');
        fetchUsers();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật quyền thất bại!');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await authService.updateUser(userId, { isActive: !currentStatus });
      if (res.success) {
        message.success(`Đã ${!currentStatus ? 'mở khóa' : 'khóa'} tài khoản thành công!`);
        fetchUsers();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Thao tác thất bại!');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await authService.deleteUser(userId);
      if (res.success) {
        message.success('Xóa tài khoản người dùng thành công!');
        fetchUsers();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa tài khoản này!');
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      setSubmittingCreate(true);
      const res = await authService.register({
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        role: values.role,
      });
      if (res.success) {
        message.success(`Tạo tài khoản ${values.fullName} (${values.role}) thành công!`);
        setIsCreateModalOpen(false);
        form.resetFields();
        fetchUsers();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || err.message || 'Tạo tài khoản thất bại!');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesKeyword =
      u.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
      u.username.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email.toLowerCase().includes(keyword.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(keyword));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesKeyword && matchesRole;
  });

  const columns = [
    {
      title: 'Tài khoản người dùng',
      key: 'user',
      render: (_: any, record: User) => {
        let avatarBg = '#059669';
        if (record.role === 'Admin') avatarBg = '#e11d48';
        if (record.role === 'Librarian') avatarBg = '#0284c7';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar style={{ backgroundColor: avatarBg, fontWeight: 700 }} size={38}>
              {record.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{record.fullName}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                @{record.username} • {record.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => phone || <Text type="secondary">-</Text>,
    },
    {
      title: 'Vai trò (Role RBAC)',
      key: 'role',
      render: (_: any, record: User) => (
        <Select
          value={record.role}
          onChange={(newRole) => handleRoleChange(record.id, newRole)}
          style={{ width: 145 }}
        >
          <Option value="Admin">
            <Tag color="red" style={{ margin: 0, fontWeight: 600 }}>👑 Admin</Tag>
          </Option>
          <Option value="Librarian">
            <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>📚 Thủ Thư</Tag>
          </Option>
          <Option value="Member">
            <Tag color="green" style={{ margin: 0, fontWeight: 600 }}>🎓 Độc Giả</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      render: (_: any, record: User) => (
        <Space>
          <Switch
            checked={record.isActive}
            onChange={() => handleStatusToggle(record.id, record.isActive)}
            checkedChildren="Mở"
            unCheckedChildren="Khóa"
          />
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: User) => (
        <Popconfirm
          title="Xác nhận xóa tài khoản"
          description="Hành động này không thể hoàn tác! Bạn có chắc muốn xóa vĩnh viễn tài khoản này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button icon={<DeleteOutlined />} danger size="small" style={{ borderRadius: 6 }} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            👥 Quản Lý Người Dùng & Phân Quyền (RBAC)
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản trị tài khoản Quản trị viên, Thủ thư và Độc giả. Cấp quyền và kiểm soát bảo mật hệ thống.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} style={{ borderRadius: 8 }}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="large"
            onClick={() => {
              form.resetFields();
              form.setFieldsValue({ role: 'Librarian' });
              setIsCreateModalOpen(true);
            }}
            style={{ borderRadius: 8, background: '#e11d48', borderColor: '#e11d48', fontWeight: 600 }}
          >
            Tạo Tài Khoản Mới
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 20, border: '1px solid #e2e8f0' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm theo Tên, Username, Email, Số điện thoại..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Tabs
              activeKey={roleFilter}
              onChange={(k) => setRoleFilter(k)}
              style={{ marginBottom: -16 }}
              items={[
                { key: 'all', label: `Tất Cả (${users.length})` },
                { key: 'Admin', label: `Quản Trị (${users.filter((u) => u.role === 'Admin').length})` },
                { key: 'Librarian', label: `Thủ Thư (${users.filter((u) => u.role === 'Librarian').length})` },
                { key: 'Member', label: `Độc Giả (${users.filter((u) => u.role === 'Member').length})` },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      {/* Modal Tạo Tài Khoản Mới */}
      <Modal
        title={
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            ➕ Thêm Mới Tài Khoản Người Dùng & Phân Quyền
          </span>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submittingCreate}
        okText="Tạo Tài Khoản"
        cancelText="Hủy"
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser} requiredMark={false}>
          <Form.Item
            name="fullName"
            label={<span style={{ fontWeight: 600 }}>Họ và tên người dùng</span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Ví dụ: Lê Thị Thủ Thư" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="username"
                label={<span style={{ fontWeight: 600 }}>Tên đăng nhập</span>}
                rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Ví dụ: thuthu_a" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="role"
                label={<span style={{ fontWeight: 600 }}>Vai trò được phân quyền</span>}
                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
              >
                <Select style={{ borderRadius: 6 }}>
                  <Option value="Librarian">Thủ Thư (Librarian)</Option>
                  <Option value="Admin">Quản Trị Viên (Admin)</Option>
                  <Option value="Member">Độc Giả (Member)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 600 }}>Email</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="librarian@lib.com" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phoneNumber" label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}>
                <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0912345678" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>Mật khẩu khởi tạo</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Mật khẩu tài khoản" style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

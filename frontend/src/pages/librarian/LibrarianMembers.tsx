import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography, Input, Card, Button, Avatar } from 'antd';
import { UserOutlined, SearchOutlined, PhoneOutlined, MailOutlined, ReloadOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import type { User } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const LibrarianMembers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authService.getAllUsers();
      if (res.success) {
        // Only show Members to Librarian for catalog contact
        setUsers(res.data.filter((u) => u.role === 'Member'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
      u.username.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email.toLowerCase().includes(keyword.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(keyword))
  );

  const columns = [
    {
      title: 'Độc giả',
      key: 'name',
      render: (_: any, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ backgroundColor: '#0284c7' }} icon={<UserOutlined />}>
            {record.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{record.fullName}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      render: (_: any, record: User) => (
        <div style={{ fontSize: 13 }}>
          <div style={{ color: '#334155' }}>
            <MailOutlined style={{ marginRight: 6, color: '#94a3b8' }} /> {record.email}
          </div>
          {record.phoneNumber && (
            <div style={{ color: '#0284c7', marginTop: 2, fontWeight: 500 }}>
              <PhoneOutlined style={{ marginRight: 6 }} /> {record.phoneNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái tài khoản',
      key: 'status',
      render: (_: any, record: User) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Đang hoạt động' : 'Tài khoản bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            👥 Tra Cứu Danh Bạ Độc Giả
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Tra cứu thông tin liên lạc của sinh viên / độc giả khi cần đôn đốc trả sách hoặc hoàn thành phí phạt.
          </Text>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchUsers} style={{ borderRadius: 8 }}>
          Tải lại
        </Button>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 20, border: '1px solid #e2e8f0' }}>
        <Input
          placeholder="Tìm theo Tên độc giả, Tên đăng nhập, Email, Số điện thoại..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          style={{ maxWidth: 450, borderRadius: 8 }}
        />
      </Card>

      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

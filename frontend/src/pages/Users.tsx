import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Typography, Select, Switch, message, Popconfirm, Button } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { authService } from '../services/authService';
import type { User } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

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
        message.success('Cập nhật quyền thành công!');
        fetchUsers();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await authService.updateUser(userId, { isActive: !currentStatus });
      if (res.success) {
        message.success('Cập nhật trạng thái tài khoản thành công!');
        fetchUsers();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await authService.deleteUser(userId);
      if (res.success) {
        message.success('Xóa tài khoản thành công!');
        fetchUsers();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa tài khoản này!');
    }
  };

  const columns = [
    {
      title: 'Tài khoản',
      key: 'user',
      render: (_: any, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <div>
            <Text style={{ fontWeight: 600 }}>{record.fullName}</Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>@{record.username} | {record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Vai trò (Role)',
      key: 'role',
      render: (_: any, record: User) => (
        <Select
          value={record.role}
          onChange={(newRole) => handleRoleChange(record.id, newRole)}
          style={{ width: 130 }}
        >
          <Option value="Admin">
            <Tag color="red">Admin</Tag>
          </Option>
          <Option value="Librarian">
            <Tag color="blue">Librarian</Tag>
          </Option>
          <Option value="Member">
            <Tag color="green">Member</Tag>
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
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: User) => (
        <Popconfirm title="Xóa tài khoản" description="Bạn có chắc chắn muốn xóa tài khoản này?" onConfirm={() => handleDelete(record.id)}>
          <Button icon={<DeleteOutlined />} danger type="text" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>
        👥 Quản Lý Tài Khoản Người Dùng
      </Title>

      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </div>
  );
};

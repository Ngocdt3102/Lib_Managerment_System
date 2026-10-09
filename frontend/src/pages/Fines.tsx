import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Typography, message, Popconfirm } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { fineService } from '../services/fineService';
import type { Fine } from '../types';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const Fines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(false);
  const { isLibrarian } = useAuth();

  useEffect(() => {
    fetchFines();
  }, [isLibrarian]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      if (isLibrarian) {
        const res = await fineService.getAllFines();
        if (res.success) setFines(res.data);
      } else {
        const res = await fineService.getMyFines();
        if (res.success) setFines(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id: string) => {
    try {
      const res = await fineService.payFine(id);
      if (res.success) {
        message.success('Xác nhận nộp tiền phạt thành công!');
        fetchFines();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xử lý thất bại!');
    }
  };

  const columns = [
    {
      title: 'Độc giả',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (text: string) => <Text style={{ fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Sách liên quan',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
    },
    {
      title: 'Lý do phạt',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Số tiền phạt',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ color: '#d4380d', fontWeight: 600 }}>{amount.toLocaleString('vi-VN')} VNĐ</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'Paid') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Đã nộp tiền</Tag>;
        }
        return <Tag color="volcano" icon={<ClockCircleOutlined />}>Chưa nộp tiền</Tag>;
      },
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (date?: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
    },
    ...(isLibrarian
      ? [
          {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Fine) => (
              <Space>
                {record.status === 'Pending' && (
                  <Popconfirm
                    title="Xác nhận thu tiền"
                    description={`Xác nhận độc giả đã nộp đủ ${record.amount.toLocaleString('vi-VN')} VNĐ?`}
                    onConfirm={() => handlePay(record.id)}
                  >
                    <Button type="primary" size="small" icon={<DollarOutlined />}>
                      Thu tiền phạt
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>
        💰 Quản Lý Phiếu Phạt
      </Title>

      <Table columns={columns} dataSource={fines} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </div>
  );
};

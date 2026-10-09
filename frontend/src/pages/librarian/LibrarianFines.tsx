import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Typography, message, Popconfirm, Card, Row, Col, Tabs } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, BookOutlined } from '@ant-design/icons';
import { fineService } from '../../services/fineService';
import type { Fine } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const LibrarianFines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await fineService.getAllFines();
      if (res.success) {
        setFines(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id: string) => {
    try {
      setProcessingId(id);
      const res = await fineService.payFine(id);
      if (res.success) {
        message.success('Xác nhận thu tiền phạt và gạch nợ thành công!');
        fetchFines();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xử lý thất bại!');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingFines = fines.filter((f) => f.status === 'Pending');
  const paidFines = fines.filter((f) => f.status === 'Paid');

  const totalPendingAmount = pendingFines.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidAmount = paidFines.reduce((acc, curr) => acc + curr.amount, 0);

  const getFilteredFines = () => {
    if (activeTab === 'pending') return pendingFines;
    if (activeTab === 'paid') return paidFines;
    return fines;
  };

  const columns = [
    {
      title: 'Độc giả nộp phạt',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (text: string) => <Text style={{ fontWeight: 700, color: '#0f172a' }}>{text}</Text>,
    },
    {
      title: 'Cuốn sách liên quan',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
      render: (title: string) => (
        <Space>
          <BookOutlined style={{ color: '#0284c7' }} />
          <span>{title}</span>
        </Space>
      ),
    },
    {
      title: 'Lý do xử phạt',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => <Tag color="orange">{reason}</Tag>,
    },
    {
      title: 'Số tiền phạt',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Fine) => (
        <span
          style={{
            color: record.status === 'Pending' ? '#dc2626' : '#059669',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {amount.toLocaleString('vi-VN')} VNĐ
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'Paid') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Đã thu tiền</Tag>;
        }
        return <Tag color="volcano" icon={<ClockCircleOutlined />} className="pulse-badge">Chưa nộp</Tag>;
      },
    },
    {
      title: 'Thời gian nộp',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (date?: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : <Text type="secondary">-</Text>),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Fine) => (
        <Space>
          {record.status === 'Pending' && (
            <Popconfirm
              title="Xác nhận thu tiền"
              description={`Xác nhận độc giả đã nộp đủ ${record.amount.toLocaleString('vi-VN')} VNĐ vào quỹ thư viện?`}
              onConfirm={() => handlePay(record.id)}
              okText="Đã thu tiền"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                size="small"
                loading={processingId === record.id}
                icon={<DollarOutlined />}
                style={{ borderRadius: 6, background: '#059669', borderColor: '#059669' }}
              >
                Thu tiền phạt
              </Button>
            </Popconfirm>
          )}
          {record.status === 'Paid' && <span style={{ fontSize: 12, color: '#94a3b8' }}>Đã hoàn tất</span>}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            💰 Quản Lý Thu Phí Phạt Thư Viện
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Ghi nhận và xử lý thanh toán các khoản tiền phạt quá hạn và bồi thường sách hỏng/mất.
          </Text>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchFines} style={{ borderRadius: 8 }}>
          Làm mới
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #ef4444' }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>TỔNG PHÍ PHẠT CHỜ THU</Text>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
              {totalPendingAmount.toLocaleString('vi-VN')} <span style={{ fontSize: 13 }}>VNĐ</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {pendingFines.length} phiếu phạt đang tồn đọng
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #059669' }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>TỔNG TIỀN PHẠT ĐÃ THU</Text>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#059669', marginTop: 4 }}>
              {totalPaidAmount.toLocaleString('vi-VN')} <span style={{ fontSize: 13 }}>VNĐ</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {paidFines.length} phiếu phạt đã quyết toán thành công
            </div>
          </div>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          items={[
            { key: 'pending', label: `Chờ Thu Tiền (${pendingFines.length})` },
            { key: 'paid', label: `Đã Quyết Toán (${paidFines.length})` },
            { key: 'all', label: `Tất Cả Phiếu Phạt (${fines.length})` },
          ]}
          style={{ marginBottom: 16 }}
        />

        <Table columns={columns} dataSource={getFilteredFines()} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

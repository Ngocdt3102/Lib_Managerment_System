import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tag, Typography, Alert } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, BookOutlined } from '@ant-design/icons';
import { fineService } from '../../services/fineService';
import type { Fine } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const MemberFines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyFines();
  }, []);

  const fetchMyFines = async () => {
    try {
      setLoading(true);
      const res = await fineService.getMyFines();
      if (res.success) {
        setFines(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingFines = fines.filter((f) => f.status === 'Pending');
  const paidFines = fines.filter((f) => f.status === 'Paid');

  const totalPendingAmount = pendingFines.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidAmount = paidFines.reduce((acc, curr) => acc + curr.amount, 0);

  const columns = [
    {
      title: 'Cuốn sách liên quan',
      key: 'bookTitle',
      render: (_: any, record: Fine) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOutlined style={{ fontSize: 20, color: '#2563eb' }} />
          <Text style={{ fontWeight: 600, color: '#0f172a' }}>{record.bookTitle}</Text>
        </div>
      ),
    },
    {
      title: 'Lý do phát sinh phạt',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => <span style={{ color: '#475569' }}>{reason}</span>,
    },
    {
      title: 'Số tiền phạt',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Fine) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: record.status === 'Pending' ? '#dc2626' : '#059669',
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
          return (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Đã nộp tiền
            </Tag>
          );
        }
        return (
          <Tag color="volcano" icon={<ClockCircleOutlined />} className="pulse-badge">
            Chưa nộp tiền
          </Tag>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'dates',
      render: (_: any, record: Fine) => (
        <div style={{ fontSize: 12 }}>
          <div>Phát sinh: {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</div>
          {record.paidAt && (
            <div style={{ color: '#059669', marginTop: 2 }}>
              Nộp lúc: {dayjs(record.paidAt).format('DD/MM/YYYY HH:mm')}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
          💰 Phiếu Phạt & Lệ Phí Của Tôi
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Theo dõi các khoản tiền phạt phát sinh do mượn quá hạn hoặc làm hư hỏng sách.
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  TỔNG TIỀN PHẠT CẦN NỘP
                </Text>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
                  {totalPendingAmount.toLocaleString('vi-VN')}{' '}
                  <span style={{ fontSize: 14, fontWeight: 600 }}>VNĐ</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {pendingFines.length} phiếu phạt đang chờ thanh toán
                </div>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  fontSize: 22,
                }}
              >
                <DollarOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  ĐÃ NỘP HOÀN TẤT
                </Text>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  {totalPaidAmount.toLocaleString('vi-VN')}{' '}
                  <span style={{ fontSize: 14, fontWeight: 600 }}>VNĐ</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {paidFines.length} phiếu phạt đã xử lý xong
                </div>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  fontSize: 22,
                }}
              >
                <CheckCircleOutlined />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {totalPendingAmount > 0 && (
        <Alert
          message={
            <span>
              <strong>Hướng dẫn nộp phạt:</strong> Độc giả vui lòng mang tiền mặt hoặc quét mã QR nộp phí trực tiếp tại quầy làm việc của <strong>Thủ Thư Thư Viện</strong>. Sau khi thanh toán, thủ thư sẽ xác nhận gạch nợ trên hệ thống.
            </span>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      <Card
        style={{
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table columns={columns} dataSource={fines} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
      </Card>
    </div>
  );
};

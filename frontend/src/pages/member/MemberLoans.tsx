import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Tag,
  Typography,
  Tabs,
  Space,
  message,
  Progress,
  Alert,
} from 'antd';
import {
  ReadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RedoOutlined,
  BookOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { borrowService } from '../../services/borrowService';
import type { BorrowRecord } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const MemberLoans: React.FC = () => {
  const [loans, setLoans] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [extendingId, setExtendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getMyLoans();
      if (res.success) {
        setLoans(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (loanId: string) => {
    try {
      setExtendingId(loanId);
      const res = await borrowService.extendLoan(loanId, 7);
      if (res.success) {
        message.success('Gia hạn mượn sách thành công thêm 7 ngày!');
        fetchMyLoans();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gia hạn phiếu mượn này!');
    } finally {
      setExtendingId(null);
    }
  };

  // Stat calculations
  const activeLoans = loans.filter((l) => l.status === 'Borrowed' && !l.returnDate && !dayjs().isAfter(dayjs(l.dueDate)));
  const overdueLoans = loans.filter(
    (l) => !l.returnDate && l.status !== 'Returned' && l.status !== 'Lost' && (l.status === 'Overdue' || dayjs().isAfter(dayjs(l.dueDate)))
  );
  const returnedLoans = loans.filter((l) => l.status === 'Returned' || !!l.returnDate);

  // Filtered loans based on tab
  const getFilteredLoans = () => {
    switch (activeTab) {
      case 'active':
        return activeLoans;
      case 'overdue':
        return overdueLoans;
      case 'returned':
        return returnedLoans;
      default:
        return loans;
    }
  };

  const columns = [
    {
      title: 'Cuốn sách',
      key: 'book',
      render: (_: any, record: BorrowRecord) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.bookCoverUrl ? (
            <img
              src={record.bookCoverUrl}
              alt={record.bookTitle}
              style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 6 }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 60,
                borderRadius: 6,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <BookOutlined style={{ fontSize: 22 }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{record.bookTitle}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Mã phiếu: #{record.id.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date: string) => (
        <span style={{ fontSize: 13, color: '#334155' }}>
          <CalendarOutlined style={{ marginRight: 6, color: '#94a3b8' }} />
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Hạn trả & Tiến độ',
      key: 'dueDate',
      render: (_: any, record: BorrowRecord) => {
        if (record.status === 'Returned') {
          return (
            <div>
              <div style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
                Đã trả ngày {dayjs(record.returnDate).format('DD/MM/YYYY')}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Hạn gốc: {dayjs(record.dueDate).format('DD/MM/YYYY')}</div>
            </div>
          );
        }

        const now = dayjs();
        const due = dayjs(record.dueDate);
        const isOverdue = now.isAfter(due);
        const daysDiff = due.diff(now, 'day');

        if (isOverdue) {
          const overdueDays = now.diff(due, 'day') || 1;
          return (
            <div>
              <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 13 }}>
                <WarningOutlined style={{ marginRight: 4 }} /> Quá hạn {overdueDays} ngày
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Hạn chót: {due.format('DD/MM/YYYY')}</div>
            </div>
          );
        }

        let progressPercent = 70;
        let progressColor = '#2563eb';
        if (daysDiff <= 2) {
          progressColor = '#f59e0b';
        }

        return (
          <div style={{ width: 140 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: daysDiff <= 2 ? '#d97706' : '#2563eb' }}>
                Còn {daysDiff} ngày
              </span>
              <span style={{ color: '#94a3b8' }}>{due.format('DD/MM')}</span>
            </div>
            <Progress
              percent={progressPercent}
              showInfo={false}
              size="small"
              strokeColor={progressColor}
            />
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: BorrowRecord) => {
        if (record.status === 'Returned' || !!record.returnDate) {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Đã hoàn trả</Tag>;
        }
        if (record.status === 'Lost') {
          return <Tag color="red">Hỏng / Mất sách</Tag>;
        }
        const isOverdue = record.status === 'Overdue' || dayjs().isAfter(dayjs(record.dueDate));
        if (isOverdue) {
          return (
            <Tag color="volcano" icon={<WarningOutlined />} className="pulse-badge">
              Quá hạn
            </Tag>
          );
        }
        return <Tag color="blue" icon={<ClockCircleOutlined />}>Đang mượn</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: BorrowRecord) => {
        const isOverdue = !record.returnDate && (record.status === 'Overdue' || dayjs().isAfter(dayjs(record.dueDate)));
        const canExtend = record.status === 'Borrowed' && !record.returnDate && !isOverdue;
        return (
          <Space>
            {canExtend && (
              <Button
                size="small"
                icon={<RedoOutlined />}
                loading={extendingId === record.id}
                onClick={() => handleExtend(record.id)}
                style={{ borderRadius: 6, fontWeight: 500 }}
              >
                Gia hạn (+7 ngày)
              </Button>
            )}
            {(record.status === 'Returned' || !!record.returnDate) && (
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Hoàn tất</span>
            )}
            {isOverdue && !record.returnDate && (
              <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Cần trả gấp</span>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
          📖 Sách Của Tôi & Lịch Sử Mượn Trả
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Theo dõi tiến độ mượn, hạn trả sách và gia hạn thời gian mượn trực tuyến.
        </Text>
      </div>

      {/* Stat Widgets */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  ĐANG MƯỢN TRONG TAY
                </Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                  {activeLoans.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>cuốn</span>
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  fontSize: 20,
                }}
              >
                <ReadOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  SÁCH QUÁ HẠN CẦN TRẢ
                </Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
                  {overdueLoans.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>cuốn</span>
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  fontSize: 20,
                }}
              >
                <WarningOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  ĐÃ HOÀN TRẢ THÀNH CÔNG
                </Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  {returnedLoans.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>lượt</span>
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  fontSize: 20,
                }}
              >
                <CheckCircleOutlined />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {overdueLoans.length > 0 && (
        <Alert
          message={
            <span>
              <strong>Cảnh báo quá hạn:</strong> Bạn có {overdueLoans.length} cuốn sách đã quá hạn trả! Vui lòng mang sách đến quầy thư viện để hoàn trả và thanh toán phí phạt quá hạn.
            </span>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      {/* Loan Records Table */}
      <Card
        style={{
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          items={[
            { key: 'all', label: `Tất Cả Phiếu Mượn (${loans.length})` },
            { key: 'active', label: `Đang Mượn (${activeLoans.length})` },
            { key: 'overdue', label: `Quá Hạn (${overdueLoans.length})` },
            { key: 'returned', label: `Đã Trả (${returnedLoans.length})` },
          ]}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={getFilteredLoans()}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

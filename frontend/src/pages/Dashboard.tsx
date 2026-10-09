import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import { BookOutlined, SolutionOutlined, WarningOutlined, DollarOutlined, TrophyOutlined } from '@ant-design/icons';
import { statsService } from '../services/statsService';
import type { DashboardStats, TopBook } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await statsService.getOverview();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" description="Đang tải dữ liệu thống kê..." />
      </div>
    );
  }

  const recentLoanColumns = [
    {
      title: 'Tên sách',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
      render: (text: string) => <Text style={{ fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Độc giả',
      dataIndex: 'userFullName',
      key: 'userFullName',
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hạn trả',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        let text = 'Đang mượn';
        if (status === 'Overdue') {
          color = 'volcano';
          text = 'Quá hạn';
        } else if (status === 'Returned') {
          color = 'green';
          text = 'Đã trả';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const topBookColumns = [
    {
      title: 'Sách',
      key: 'title',
      render: (_: any, record: TopBook) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.coverImageUrl ? (
            <img src={record.coverImageUrl} alt={record.title} style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4 }} />
          ) : (
            <BookOutlined style={{ fontSize: 28, color: '#1677ff' }} />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{record.title}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.author}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượt mượn',
      dataIndex: 'borrowCount',
      key: 'borrowCount',
      render: (count: number) => (
        <Tag color="magenta" icon={<TrophyOutlined />}>
          {count} lượt
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>
        📊 Dashboard Thống Kê Tổng Quan
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ background: '#e6f4ff', borderRadius: 8 }}>
            <Statistic title="Tổng Số Sách Kho" value={stats?.totalBooks || 0} prefix={<BookOutlined />} styles={{ content: { color: '#0958d9' } }} />
            <Text type="secondary">Khả dụng: {stats?.availableCopies || 0} / {stats?.totalCopies || 0} bản</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ background: '#f6ffed', borderRadius: 8 }}>
            <Statistic title="Đang Được Mượn" value={stats?.activeLoans || 0} prefix={<SolutionOutlined />} styles={{ content: { color: '#389e0d' } }} />
            <Text type="secondary">Tổng số độc giả: {stats?.totalMembers || 0}</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ background: '#fff2e8', borderRadius: 8 }}>
            <Statistic title="Mượn Quá Hạn" value={stats?.overdueLoans || 0} prefix={<WarningOutlined />} styles={{ content: { color: '#d4380d' } }} />
            <Text type="secondary">Cần xử lý nhắc trả</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ background: '#fffb8f', borderRadius: 8 }}>
            <Statistic
              title="Doanh Thu Phí Phạt"
              value={stats?.totalFineCollected || 0}
              suffix="VNĐ"
              prefix={<DollarOutlined />}
              styles={{ content: { color: '#d4b106' } }}
            />
            <Text type="secondary">Chờ nộp: {(stats?.totalPendingFines || 0).toLocaleString('vi-VN')} VNĐ</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="🔄 Lượt Mượn Sách Mới Nhất" variant="borderless" style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Table
              dataSource={stats?.recentLoans || []}
              columns={recentLoanColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="🏆 Top Sách Được Mượn Nhiều Nhất" variant="borderless" style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Table
              dataSource={stats?.topBorrowedBooks || []}
              columns={topBookColumns}
              rowKey="bookId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

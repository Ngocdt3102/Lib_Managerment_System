import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tag, Typography, Button, Spin, Modal, Form, Checkbox, InputNumber, Input, message, Space } from 'antd';
import {
  BookOutlined,
  SolutionOutlined,
  WarningOutlined,
  DollarOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { statsService } from '../../services/statsService';
import { borrowService, type ReturnBookParams } from '../../services/borrowService';
import type { DashboardStats, TopBook, RecentLoan } from '../../types';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const LibrarianDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<RecentLoan | null>(null);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

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

  const handleReturnSubmit = async (values: any) => {
    if (!selectedLoan) return;
    try {
      setReturnSubmitting(true);
      const params: ReturnBookParams = {
        notes: values.notes,
        isDamagedOrLost: values.isDamagedOrLost || false,
        penaltyAmount: values.penaltyAmount || 0,
        penaltyReason: values.penaltyReason,
      };
      const res = await borrowService.returnBook(selectedLoan.id, params);
      if (res.success) {
        message.success('Xử lý hoàn trả sách thành công!');
        setSelectedLoan(null);
        form.resetFields();
        fetchStats();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xử lý trả sách!');
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#64748b' }}>Đang nạp dữ liệu thống kê nghiệp vụ...</div>
      </div>
    );
  }

  const recentLoanColumns = [
    {
      title: 'Tên sách',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
      render: (text: string) => <Text style={{ fontWeight: 600, color: '#0f172a' }}>{text}</Text>,
    },
    {
      title: 'Độc giả mượn',
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
      render: (date: string) => {
        const isOverdue = dayjs().isAfter(dayjs(date));
        return (
          <span style={{ color: isOverdue ? '#ef4444' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
            {dayjs(date).format('DD/MM/YYYY')}
            {isOverdue && ' (Quá hạn)'}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'Returned') return <Tag color="green">Đã trả</Tag>;
        if (status === 'Overdue') return <Tag color="volcano" className="pulse-badge">Quá hạn</Tag>;
        return <Tag color="blue">Đang mượn</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: RecentLoan) => {
        if (record.status !== 'Returned' && record.status !== 'Lost') {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectedLoan(record);
                form.resetFields();
              }}
              style={{ borderRadius: 6 }}
            >
              Thu hồi sách
            </Button>
          );
        }
        return <span style={{ color: '#94a3b8', fontSize: 12 }}>Đã xong</span>;
      },
    },
  ];

  const topBookColumns = [
    {
      title: 'Sách thịnh hành',
      key: 'title',
      render: (_: any, record: TopBook) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.coverImageUrl ? (
            <img src={record.coverImageUrl} alt={record.title} style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4 }} />
          ) : (
            <BookOutlined style={{ fontSize: 24, color: '#0284c7' }} />
          )}
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.title}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{record.author}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Lượt mượn',
      dataIndex: 'borrowCount',
      key: 'borrowCount',
      render: (count: number) => (
        <Tag color="cyan" icon={<TrophyOutlined />} style={{ fontWeight: 600 }}>
          {count} lượt
        </Tag>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            📊 Bàn Làm Việc Nghiệp Vụ Thủ Thư
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Theo dõi tình trạng lưu thông sách, phiếu mượn quá hạn và xử lý nghiệp vụ mượn trả.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchStats} style={{ borderRadius: 8 }}>
            Làm mới
          </Button>
          <Button
            type="primary"
            style={{ borderRadius: 8, background: '#0284c7', borderColor: '#0284c7' }}
            onClick={() => navigate('/librarian/borrows')}
          >
            Vào sổ Mượn / Trả
          </Button>
        </Space>
      </div>

      {/* 4 Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>TỔNG ĐẦU SÁCH KHO</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0284c7', marginTop: 4 }}>
                  {stats?.totalBooks || 0}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Khả dụng: {stats?.availableCopies || 0} / {stats?.totalCopies || 0} cuốn
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <BookOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>SÁCH ĐANG CHO MƯỢN</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  {stats?.activeLoans || 0}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Độc giả đang lưu hành sách
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <SolutionOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>SÁCH QUÁ HẠN CẦN THU</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
                  {stats?.overdueLoans || 0}
                </div>
                <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2, fontWeight: 600 }}>
                  Cần liên hệ nhắc trả
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <WarningOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>PHÍ PHẠT CHỜ THU</Text>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                  {(stats?.totalPendingFines || 0).toLocaleString('vi-VN')} <span style={{ fontSize: 13 }}>VNĐ</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Đã thu: {(stats?.totalFineCollected || 0).toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <DollarOutlined />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Two Columns */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={15}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>🔄 Lượt Mượn Sách Mới Nhất Hệ Thống</span>
                <Button type="link" size="small" onClick={() => navigate('/librarian/borrows')}>
                  Xem tất cả <ArrowRightOutlined />
                </Button>
              </div>
            }
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <Table
              dataSource={stats?.recentLoans || []}
              columns={recentLoanColumns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            title={<span style={{ fontWeight: 700 }}>🏆 Sách Được Mượn Nhiều Nhất</span>}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <Table
              dataSource={stats?.topBorrowedBooks || []}
              columns={topBookColumns}
              rowKey="bookId"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Return Modal */}
      <Modal
        title="📥 Xử Lý Hoàn Trả Sách Nhanh"
        open={!!selectedLoan}
        onCancel={() => setSelectedLoan(null)}
        onOk={() => form.submit()}
        confirmLoading={returnSubmitting}
        okText="Xác Nhận Đã Nhận Lại Sách"
        cancelText="Đóng"
      >
        {selectedLoan && (
          <Form form={form} layout="vertical" onFinish={handleReturnSubmit}>
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
              <div><strong>Cuốn sách:</strong> {selectedLoan.bookTitle}</div>
              <div style={{ marginTop: 4 }}><strong>Độc giả:</strong> {selectedLoan.userFullName}</div>
              <div style={{ marginTop: 4 }}><strong>Hạn trả:</strong> {dayjs(selectedLoan.dueDate).format('DD/MM/YYYY')}</div>
            </div>

            {dayjs().isAfter(dayjs(selectedLoan.dueDate)) && (
              <div style={{ padding: 12, background: '#fff2e8', border: '1px solid #ffbb96', borderRadius: 6, marginBottom: 16 }}>
                <Text type="danger" style={{ fontWeight: 600 }}>
                  ⚠️ Phiếu mượn đã quá hạn! Hệ thống tự động tính toán phí phạt quá hạn.
                </Text>
              </div>
            )}

            <Form.Item name="isDamagedOrLost" valuePropName="checked">
              <Checkbox>Sách bị hư hỏng hoặc mất (Áp mức phạt vi phạm)</Checkbox>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) => prev.isDamagedOrLost !== cur.isDamagedOrLost}
            >
              {({ getFieldValue }) =>
                getFieldValue('isDamagedOrLost') ? (
                  <>
                    <Form.Item name="penaltyAmount" label="Số tiền phạt vi phạm (VNĐ)" rules={[{ required: true, message: 'Nhập số tiền phạt!' }]}>
                      <InputNumber min={5000} step={5000} style={{ width: '100%' }} placeholder="Ví dụ: 50000" />
                    </Form.Item>
                    <Form.Item name="penaltyReason" label="Lý do phạt" rules={[{ required: true, message: 'Nhập lý do!' }]}>
                      <Input placeholder="Ví dụ: Rách bìa, gãy gáy sách..." />
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú hoàn trả">
              <Input.TextArea rows={2} placeholder="Tình trạng nhận lại sách..." />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

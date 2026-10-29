import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Modal,
  Form,
  Checkbox,
  InputNumber,
  Input,
  message,
  Tabs,
  Card,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RedoOutlined,
  BookOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { borrowService, type ReturnBookParams } from '../../services/borrowService';
import type { BorrowRecord } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const LibrarianBorrows: React.FC = () => {
  const [loans, setLoans] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<BorrowRecord | null>(null);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [extendingId, setExtendingId] = useState<string | null>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchLoans();
  }, [activeTab]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getAllLoans();
      if (res.success) {
        setLoans(res.data);
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
      setSubmittingReturn(true);
      const params: ReturnBookParams = {
        notes: values.notes,
        isDamagedOrLost: values.isDamagedOrLost || false,
        penaltyAmount: values.penaltyAmount || 0,
        penaltyReason: values.penaltyReason,
      };
      const res = await borrowService.returnBook(selectedLoan.id, params);
      if (res.success) {
        message.success('Ghi nhận hoàn trả sách thành công!');
        setIsReturnModalOpen(false);
        form.resetFields();
        setSelectedLoan(null);
        fetchLoans();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xử lý hoàn trả thất bại!');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleExtend = async (id: string) => {
    try {
      setExtendingId(id);
      const res = await borrowService.extendLoan(id, 7);
      if (res.success) {
        message.success('Gia hạn mượn sách thành công thêm 7 ngày!');
        fetchLoans();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gia hạn phiếu mượn này!');
    } finally {
      setExtendingId(null);
    }
  };

  const activeLoans = loans.filter((l) => l.status === 'Borrowed' && !l.returnDate && !dayjs().isAfter(dayjs(l.dueDate)));
  const overdueLoans = loans.filter(
    (l) => !l.returnDate && l.status !== 'Returned' && l.status !== 'Lost' && (l.status === 'Overdue' || dayjs().isAfter(dayjs(l.dueDate)))
  );
  const returnedLoans = loans.filter((l) => l.status === 'Returned' || !!l.returnDate);
  const lostLoans = loans.filter((l) => l.status === 'Lost');

  const getFilteredLoans = () => {
    switch (activeTab) {
      case 'active':
        return activeLoans;
      case 'overdue':
        return overdueLoans;
      case 'returned':
        return returnedLoans;
      case 'lost':
        return lostLoans;
      default:
        return loans;
    }
  };

  const columns = [
    {
      title: 'Cuốn sách',
      key: 'book',
      render: (_: any, record: BorrowRecord) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {record.bookCoverUrl ? (
            <img
              src={record.bookCoverUrl}
              alt={record.bookTitle}
              style={{ width: 38, height: 52, objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            <div
              style={{
                width: 38,
                height: 52,
                borderRadius: 4,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <BookOutlined style={{ fontSize: 20 }} />
            </div>
          )}
          <div>
            <Text style={{ fontWeight: 700, color: '#0f172a' }}>{record.bookTitle}</Text>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: #{record.id.slice(-6).toUpperCase()}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Độc giả mượn',
      key: 'user',
      render: (_: any, record: BorrowRecord) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{record.userFullName}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>@{record.userName}</div>
        </div>
      ),
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hạn trả',
      key: 'dueDate',
      render: (_: any, record: BorrowRecord) => {
        const isOverdue = !record.returnDate && (record.status === 'Overdue' || dayjs().isAfter(dayjs(record.dueDate)));
        return (
          <span style={{ color: isOverdue ? '#dc2626' : '#1e293b', fontWeight: isOverdue ? 700 : 400 }}>
            {dayjs(record.dueDate).format('DD/MM/YYYY')}
            {isOverdue && <WarningOutlined style={{ marginLeft: 6, color: '#dc2626' }} />}
          </span>
        );
      },
    },
    {
      title: 'Ngày trả thực tế',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date?: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : <Text type="secondary">-</Text>),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: BorrowRecord) => {
        if (record.status === 'Returned' || !!record.returnDate) {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Đã trả</Tag>;
        }
        if (record.status === 'Lost') {
          return <Tag color="red">Hỏng/Mất</Tag>;
        }
        if (record.status === 'Overdue' || dayjs().isAfter(dayjs(record.dueDate))) {
          return (
            <Tag color="volcano" icon={<WarningOutlined />} className="pulse-badge">
              Quá hạn {record.estimatedFine ? `(Phạt ~${record.estimatedFine.toLocaleString('vi-VN')}đ)` : ''}
            </Tag>
          );
        }
        return <Tag color="blue" icon={<ClockCircleOutlined />}>Đang mượn</Tag>;
      },
    },
    {
      title: 'Hành động nghiệp vụ',
      key: 'action',
      render: (_: any, record: BorrowRecord) => (
        <Space size="small">
          {!record.returnDate && record.status !== 'Returned' && record.status !== 'Lost' && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setSelectedLoan(record);
                  form.resetFields();
                  setIsReturnModalOpen(true);
                }}
                style={{ borderRadius: 6, background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
              >
                Nhận trả sách
              </Button>
              <Button
                icon={<RedoOutlined />}
                size="small"
                loading={extendingId === record.id}
                onClick={() => handleExtend(record.id)}
                style={{ borderRadius: 6 }}
              >
                +7d
              </Button>
            </>
          )}
          {(record.status === 'Returned' || !!record.returnDate) && (
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Đã đóng phiếu</span>
          )}
          {record.status === 'Lost' && (
            <span style={{ fontSize: 12, color: '#ef4444' }}>Đã lập biên bản mất</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            📋 Quản Lý Nghiệp Vụ Mượn & Trả Sách
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Theo dõi danh sách mượn toàn thư viện, duyệt hoàn trả, gia hạn và lập biên bản phạt.
          </Text>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchLoans} style={{ borderRadius: 8 }}>
          Làm mới dữ liệu
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            { key: 'all', label: `Tất Cả (${loans.length})` },
            { key: 'active', label: `Đang Mượn (${activeLoans.length})` },
            { key: 'overdue', label: `Quá Hạn (${overdueLoans.length})` },
            { key: 'returned', label: `Đã Hoàn Trả (${returnedLoans.length})` },
            { key: 'lost', label: `Hỏng / Mất (${lostLoans.length})` },
          ]}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={getFilteredLoans()}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal Xử Lý Trả Sách */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 16 }}>📥 Xác Nhận Hoàn Trả Sách</span>}
        open={isReturnModalOpen}
        onCancel={() => setIsReturnModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submittingReturn}
        okText="Xác Nhận Đã Nhận Lại Sách"
        cancelText="Đóng"
        width={560}
      >
        {selectedLoan && (
          <Form form={form} layout="vertical" onFinish={handleReturnSubmit}>
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div><strong>Cuốn sách:</strong> {selectedLoan.bookTitle}</div>
              <div style={{ marginTop: 4 }}><strong>Độc giả mượn:</strong> {selectedLoan.userFullName} (@{selectedLoan.userName})</div>
              <div style={{ marginTop: 4 }}><strong>Hạn trả ban đầu:</strong> {dayjs(selectedLoan.dueDate).format('DD/MM/YYYY')}</div>
            </div>

            {dayjs().isAfter(dayjs(selectedLoan.dueDate)) && (
              <div style={{ padding: 12, background: '#fff2e8', border: '1px solid #ffbb96', borderRadius: 8, marginBottom: 16 }}>
                <Text type="danger" style={{ fontWeight: 700 }}>
                  ⚠️ Phiếu mượn đã quá hạn! Hệ thống sẽ tự động phát sinh phiếu phạt quá hạn theo số ngày trễ.
                </Text>
              </div>
            )}

            <Form.Item name="isDamagedOrLost" valuePropName="checked">
              <Checkbox>Sách bị làm hỏng hoặc mất trang (Phát sinh phạt vi phạm quy chế)</Checkbox>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) => prev.isDamagedOrLost !== cur.isDamagedOrLost}
            >
              {({ getFieldValue }) =>
                getFieldValue('isDamagedOrLost') ? (
                  <div style={{ background: '#fef2f2', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid #fecdd3' }}>
                    <Form.Item
                      name="penaltyAmount"
                      label="Số tiền phạt vi phạm (VNĐ)"
                      rules={[{ required: true, message: 'Nhập số tiền phạt!' }]}
                    >
                      <InputNumber min={5000} step={5000} style={{ width: '100%', borderRadius: 6 }} placeholder="Ví dụ: 50000" />
                    </Form.Item>

                    <Form.Item
                      name="penaltyReason"
                      label="Lý do xử phạt"
                      rules={[{ required: true, message: 'Nhập lý do vi phạm!' }]}
                    >
                      <Input placeholder="Ví dụ: Rách bìa, vẽ bẩn trang sách..." style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </div>
                ) : null
              }
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú khi tiếp nhận">
              <Input.TextArea rows={2} placeholder="Tình trạng sách khi độc giả mang trả..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Typography, Modal, Form, Checkbox, InputNumber, Input, message, Tabs } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, RedoOutlined } from '@ant-design/icons';
import { borrowService, type ReturnBookParams } from '../services/borrowService';
import type { BorrowRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const Borrows: React.FC = () => {
  const [loans, setLoans] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<BorrowRecord | null>(null);

  const [form] = Form.useForm();
  const { isLibrarian } = useAuth();

  useEffect(() => {
    fetchLoans();
  }, [activeTab, isLibrarian]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      if (isLibrarian && activeTab === 'all') {
        const res = await borrowService.getAllLoans();
        if (res.success) setLoans(res.data);
      } else {
        const res = await borrowService.getMyLoans();
        if (res.success) setLoans(res.data);
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
      message.error(err.response?.data?.message || 'Xử lý thất bại!');
    }
  };

  const handleExtend = async (id: string) => {
    try {
      const res = await borrowService.extendLoan(id, 7);
      if (res.success) {
        message.success('Gia hạn mượn sách thành công thêm 7 ngày!');
        fetchLoans();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gia hạn!');
    }
  };

  const columns = [
    {
      title: 'Cuốn sách',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
      render: (text: string) => <Text style={{ fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Độc giả',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (text: string, record: BorrowRecord) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>@{record.userName}</div>
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
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string, record: BorrowRecord) => {
        const isOverdue = record.status === 'Borrowed' && dayjs().isAfter(dayjs(date));
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
            {dayjs(date).format('DD/MM/YYYY')}
            {isOverdue && <WarningOutlined style={{ marginLeft: 6 }} />}
          </span>
        );
      },
    },
    {
      title: 'Ngày trả thực tế',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date?: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: BorrowRecord) => {
        if (status === 'Returned') return <Tag color="green" icon={<CheckCircleOutlined />}>Đã trả</Tag>;
        if (status === 'Lost') return <Tag color="red">Hỏng/Mất sách</Tag>;
        if (dayjs().isAfter(dayjs(record.dueDate))) {
          return (
            <Tag color="volcano" icon={<WarningOutlined />}>
              Quá hạn ({record.estimatedFine ? `${record.estimatedFine.toLocaleString('vi-VN')} VNĐ` : ''})
            </Tag>
          );
        }
        return <Tag color="blue" icon={<ClockCircleOutlined />}>Đang mượn</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: BorrowRecord) => (
        <Space size="small">
          {record.status !== 'Returned' && record.status !== 'Lost' && (
            <>
              {isLibrarian && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    setSelectedLoan(record);
                    form.resetFields();
                    setIsReturnModalOpen(true);
                  }}
                >
                  Xử lý trả sách
                </Button>
              )}
              <Button icon={<RedoOutlined />} size="small" onClick={() => handleExtend(record.id)}>
                Gia hạn (+7d)
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>
        📋 Quản Lý Mượn & Trả Sách
      </Title>

      {isLibrarian ? (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            { key: 'all', label: 'Tất Cả Phiếu Mượn Thư Viện' },
            { key: 'my', label: 'Phiếu Mượn Cá Nhân Của Tôi' },
          ]}
        />
      ) : null}

      <Table columns={columns} dataSource={loans} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      {/* Modal Xử Lý Trả Sách */}
      <Modal
        title="📥 Xử Lý Hoàn Trả Sách"
        open={isReturnModalOpen}
        onCancel={() => setIsReturnModalOpen(false)}
        onOk={() => form.submit()}
        okText="Xác Nhận Hoàn Trả"
        cancelText="Hủy"
      >
        {selectedLoan && (
          <Form form={form} layout="vertical" onFinish={handleReturnSubmit}>
            <p>
              <strong>Cuốn sách:</strong> {selectedLoan.bookTitle}
            </p>
            <p>
              <strong>Độc giả:</strong> {selectedLoan.userFullName}
            </p>

            {dayjs().isAfter(dayjs(selectedLoan.dueDate)) && (
              <div style={{ padding: 12, background: '#fff2e8', border: '1px solid #ffbb96', borderRadius: 6, marginBottom: 16 }}>
                <Text type="danger" style={{ fontWeight: 600 }}>
                  ⚠️ Phiếu mượn đã quá hạn! Hệ thống tự động phát sinh phí phạt quá hạn.
                </Text>
              </div>
            )}

            <Form.Item name="isDamagedOrLost" valuePropName="checked">
              <Checkbox>Sách bị làm hỏng hoặc bị mất (Phát sinh phạt vi phạm)</Checkbox>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.isDamagedOrLost !== currentValues.isDamagedOrLost}
            >
              {({ getFieldValue }) =>
                getFieldValue('isDamagedOrLost') ? (
                  <>
                    <Form.Item name="penaltyAmount" label="Số tiền phạt vi phạm (VNĐ)" rules={[{ required: true, message: 'Nhập số tiền phạt!' }]}>
                      <InputNumber min={10000} step={10000} style={{ width: '100%' }} placeholder="Ví dụ: 100000" />
                    </Form.Item>

                    <Form.Item name="penaltyReason" label="Lý do phạt" rules={[{ required: true, message: 'Nhập lý do vi phạm!' }]}>
                      <Input placeholder="Ví dụ: Rách trang bìa, mất sách..." />
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú hoàn trả">
              <Input.TextArea rows={2} placeholder="Tình trạng sách khi nhận lại..." />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

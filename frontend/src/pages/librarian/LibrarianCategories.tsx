import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Typography, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { categoryService, type CreateCategoryParams } from '../../services/categoryService';
import type { Category } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const LibrarianCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: CreateCategoryParams) => {
    try {
      setSubmitting(true);
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory.id, values);
        if (res.success) {
          message.success('Cập nhật thể loại thành công!');
        }
      } else {
        const res = await categoryService.createCategory(values);
        if (res.success) {
          message.success('Thêm thể loại sách mới thành công!');
        }
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await categoryService.deleteCategory(id);
      if (res.success) {
        message.success('Xóa danh mục thành công!');
        fetchCategories();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa danh mục này!');
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    form.setFieldsValue(cat);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Tên thể loại sách',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: '#f0f9ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
            }}
          >
            <AppstoreOutlined />
          </div>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Mô tả chi tiết',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => <span style={{ color: '#475569' }}>{desc || 'Chưa có mô tả'}</span>,
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
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{ borderRadius: 6, background: '#0284c7', borderColor: '#0284c7' }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa danh mục"
            description="Bạn có chắc muốn xóa danh mục này? Hãy chắc chắn không còn sách nào thuộc danh mục."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            📂 Danh Mục Thể Loại Sách
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản lý các nhóm phân loại tài liệu khoa học, công nghệ, văn học trong thư viện.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories} style={{ borderRadius: 8 }}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={openCreateModal}
            style={{ borderRadius: 8, background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
          >
            Thêm Danh Mục
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {editingCategory ? '✏️ Chỉnh Sửa Danh Mục' : '➕ Thêm Danh Mục Sách Mới'}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText={editingCategory ? 'Lưu Cập Nhật' : 'Tạo Danh Mục'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate} requiredMark={false}>
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Tên thể loại sách</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Ví dụ: Khoa Học Máy Tính" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item name="description" label={<span style={{ fontWeight: 600 }}>Mô tả ngắn gọn</span>}>
            <Input.TextArea rows={3} placeholder="Mô tả phạm vi các cuốn sách thuộc nhóm này..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

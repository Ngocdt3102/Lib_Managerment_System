import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { categoryService, type CreateCategoryParams } from '../services/categoryService';
import type { Category } from '../types';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const { isLibrarian } = useAuth();

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
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory.id, values);
        if (res.success) {
          message.success('Cập nhật danh mục thành công!');
        }
      } else {
        const res = await categoryService.createCategory(values);
        if (res.success) {
          message.success('Thêm danh mục mới thành công!');
        }
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra!');
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
      message.error(err.response?.data?.message || 'Không thể xóa danh mục!');
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <AppstoreOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    ...(isLibrarian
      ? [
          {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Category) => (
              <Space size="middle">
                <Button
                  icon={<EditOutlined />}
                  type="text"
                  onClick={() => {
                    setEditingCategory(record);
                    form.setFieldsValue(record);
                    setIsModalOpen(true);
                  }}
                />
                <Popconfirm title="Xóa danh mục" description="Bạn có chắc chắn muốn xóa danh mục này?" onConfirm={() => handleDelete(record.id)}>
                  <Button icon={<DeleteOutlined />} danger type="text" />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>
          📂 Danh Mục Thể Loại Sách
        </Title>
        {isLibrarian && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setEditingCategory(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Thêm Danh Mục
          </Button>
        )}
      </div>

      <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Sách Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingCategory ? 'Lưu Cập Nhật' : 'Thêm Danh Mục'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
            <Input placeholder="Ví dụ: Công Nghệ Thông Tin" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả danh mục">
            <Input.TextArea rows={3} placeholder="Mô tả các cuốn sách thuộc thể loại này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

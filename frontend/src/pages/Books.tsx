import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, Tag, Modal, Form, InputNumber, Typography, message, Drawer, Image, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, BookOutlined, SolutionOutlined } from '@ant-design/icons';
import { bookService, type CreateBookParams } from '../services/bookService';
import { categoryService } from '../services/categoryService';
import { borrowService } from '../services/borrowService';
import type { Book, Category } from '../types';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

export const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const [borrowDays, setBorrowDays] = useState(14);
  const [borrowNotes, setBorrowNotes] = useState('');

  const [form] = Form.useForm();
  const { isLibrarian, user } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, pageSize, keyword, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await bookService.getBooks({
        keyword,
        categoryId: selectedCategory,
        page,
        pageSize,
      });
      if (res.success && res.data) {
        setBooks(res.data.items);
        setTotal(res.data.totalCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: CreateBookParams) => {
    try {
      if (editingBook) {
        const res = await bookService.updateBook(editingBook.id, values);
        if (res.success) {
          message.success('Cập nhật thông tin sách thành công!');
        }
      } else {
        const res = await bookService.createBook(values);
        if (res.success) {
          message.success('Thêm sách mới thành công!');
        }
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingBook(null);
      fetchBooks();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đã có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await bookService.deleteBook(id);
      if (res.success) {
        message.success('Xóa sách thành công!');
        fetchBooks();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa sách này!');
    }
  };

  const handleBorrowSubmit = async () => {
    if (!borrowingBook) return;
    try {
      const res = await borrowService.createBorrow({
        bookId: borrowingBook.id,
        borrowDays,
        notes: borrowNotes,
      });
      if (res.success) {
        message.success('Gửi yêu cầu mượn sách thành công!');
        setIsBorrowModalOpen(false);
        setBorrowingBook(null);
        fetchBooks();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể mượn sách!');
    }
  };

  const columns = [
    {
      title: 'Sách',
      key: 'title',
      render: (_: any, record: Book) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.coverImageUrl ? (
            <Image src={record.coverImageUrl} width={40} height={56} style={{ objectFit: 'cover', borderRadius: 4 }} />
          ) : (
            <BookOutlined style={{ fontSize: 32, color: '#1677ff' }} />
          )}
          <div>
            <div style={{ fontWeight: 600, color: '#262626' }}>{record.title}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Tác giả: {record.author} | ISBN: {record.isbn}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (cat: string) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: 'Khả dụng',
      key: 'copies',
      render: (_: any, record: Book) => (
        <Tag color={record.availableCopies > 0 ? 'green' : 'red'}>
          {record.availableCopies} / {record.totalCopies} cuốn
        </Tag>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Book) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} type="text" onClick={() => setDetailBook(record)}>
            Chi tiết
          </Button>

          {record.availableCopies > 0 && (
            <Button
              icon={<SolutionOutlined />}
              type="primary"
              ghost
              size="small"
              onClick={() => {
                setBorrowingBook(record);
                setIsBorrowModalOpen(true);
              }}
            >
              Mượn Sách
            </Button>
          )}

          {isLibrarian && (
            <>
              <Button
                icon={<EditOutlined />}
                type="text"
                onClick={() => {
                  setEditingBook(record);
                  form.setFieldsValue(record);
                  setIsModalOpen(true);
                }}
              />
              <Popconfirm title="Xóa sách" description="Bạn có chắc chắn muốn xóa cuốn sách này?" onConfirm={() => handleDelete(record.id)}>
                <Button icon={<DeleteOutlined />} danger type="text" />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>
          📚 Kho Sách Thư Viện
        </Title>
        {isLibrarian && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setEditingBook(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Thêm Sách Mới
          </Button>
        )}
      </div>

      <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }}>
        <Input
          placeholder="Tìm kiếm theo Tiêu đề, Tác giả, ISBN..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Select
          placeholder="Lọc theo Danh mục"
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val)}
          style={{ width: 200 }}
          allowClear
        >
          {categories.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.name}
            </Option>
          ))}
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      {/* Modal Thêm/Sửa Sách */}
      <Modal
        title={editingBook ? 'Chỉnh Sửa Thông Tin Sách' : 'Thêm Sách Mới Về Kho'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingBook ? 'Lưu Cập Nhật' : 'Thêm Sách'}
        cancelText="Hủy Bỏ"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
          <Form.Item name="title" label="Tiêu đề sách" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sách!' }]}>
            <Input placeholder="Ví dụ: Clean Code" />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="author" label="Tác giả" rules={[{ required: true, message: 'Vui lòng nhập tác giả!' }]} style={{ flex: 1 }}>
              <Input placeholder="Ví dụ: Robert C. Martin" />
            </Form.Item>
            <Form.Item name="isbn" label="Mã ISBN" rules={[{ required: true, message: 'Vui lòng nhập ISBN!' }]} style={{ flex: 1 }}>
              <Input placeholder="Ví dụ: 9780132350884" />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="categoryId" label="Danh mục sách" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]} style={{ flex: 1 }}>
              <Select placeholder="Chọn danh mục">
                {categories.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="totalCopies" label="Số lượng bản tổng" rules={[{ required: true, message: 'Nhập số lượng!' }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="publisher" label="Nhà xuất bản" style={{ flex: 1 }}>
              <Input placeholder="Prentice Hall" />
            </Form.Item>
            <Form.Item name="publishYear" label="Năm xuất bản" style={{ flex: 1 }}>
              <InputNumber min={1900} max={2030} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="location" label="Vị trí kệ" style={{ flex: 1 }}>
              <Input placeholder="Kệ A1-01" />
            </Form.Item>
          </Space>

          <Form.Item name="coverImageUrl" label="URL Ảnh Bìa">
            <Input placeholder="https://example.com/cover.jpg" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả tóm tắt">
            <Input.TextArea rows={3} placeholder="Mô tả tóm tắt nội dung cuốn sách..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Đăng Ký Mượn Sách */}
      <Modal
        title="📖 Đăng Ký Mượn Sách"
        open={isBorrowModalOpen}
        onCancel={() => setIsBorrowModalOpen(false)}
        onOk={handleBorrowSubmit}
        okText="Xác Nhận Mượn"
        cancelText="Hủy"
      >
        {borrowingBook && (
          <div style={{ marginTop: 16 }}>
            <p>
              <strong>Cuốn sách:</strong> {borrowingBook.title}
            </p>
            <p>
              <strong>Người mượn:</strong> {user?.fullName} (@{user?.username})
            </p>
            <div style={{ marginBottom: 16 }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>Số ngày mượn kiến nghị:</Text>
              <Select value={borrowDays} onChange={(val) => setBorrowDays(val)} style={{ width: '100%' }}>
                <Option value={7}>7 ngày</Option>
                <Option value={14}>14 ngày (Mặc định)</Option>
                <Option value={21}>21 ngày</Option>
                <Option value={30}>30 ngày</Option>
              </Select>
            </div>
            <div>
              <Text style={{ display: 'block', marginBottom: 8 }}>Ghi chú thêm:</Text>
              <Input.TextArea rows={2} value={borrowNotes} onChange={(e) => setBorrowNotes(e.target.value)} placeholder="Ghi chú mục đích mượn..." />
            </div>
          </div>
        )}
      </Modal>

      {/* Drawer Xem Chi Tiết Sách */}
      <Drawer title="Chi Tiết Cuốn Sách" placement="right" onClose={() => setDetailBook(null)} open={!!detailBook} size={450}>
        {detailBook && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {detailBook.coverImageUrl && (
              <div style={{ textAlign: 'center' }}>
                <Image src={detailBook.coverImageUrl} width={180} style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </div>
            )}
            <div>
              <Title level={4}>{detailBook.title}</Title>
              <Text type="secondary">Tác giả: {detailBook.author}</Text>
            </div>
            <div>
              <p>
                <strong>Mã ISBN:</strong> {detailBook.isbn}
              </p>
              <p>
                <strong>Danh mục:</strong> <Tag color="blue">{detailBook.categoryName}</Tag>
              </p>
              <p>
                <strong>Nhà xuất bản:</strong> {detailBook.publisher} ({detailBook.publishYear})
              </p>
              <p>
                <strong>Vị trí kệ:</strong> {detailBook.location}
              </p>
              <p>
                <strong>Số lượng tồn khả dụng:</strong> {detailBook.availableCopies} / {detailBook.totalCopies} cuốn
              </p>
            </div>
            <div>
              <Text style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                Mô tả nội dung:
              </Text>
              <p style={{ color: '#595959', lineHeight: 1.6 }}>{detailBook.description || 'Chưa có mô tả chi tiết'}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  Typography,
  message,
  Image,
  Popconfirm,
  Card,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { bookService, type CreateBookParams } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import type { Book, Category } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

export const LibrarianBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detailBook, setDetailBook] = useState<Book | null>(null);

  const [form] = Form.useForm();

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
      setSubmitting(true);
      if (editingBook) {
        const res = await bookService.updateBook(editingBook.id, values);
        if (res.success) {
          message.success('Cập nhật thông tin sách thành công!');
        }
      } else {
        const res = await bookService.createBook(values);
        if (res.success) {
          message.success('Thêm sách mới vào kho thành công!');
        }
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingBook(null);
      fetchBooks();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Thao tác thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await bookService.deleteBook(id);
      if (res.success) {
        message.success('Xóa sách khỏi kho thành công!');
        fetchBooks();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa cuốn sách này!');
    }
  };

  const openCreateModal = () => {
    setEditingBook(null);
    form.resetFields();
    form.setFieldsValue({
      totalCopies: 5,
      publishYear: new Date().getFullYear(),
      location: 'Kệ A1-01',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    form.setFieldsValue(book);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Cuốn sách',
      key: 'title',
      render: (_: any, record: Book) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.coverImageUrl ? (
            <img
              src={record.coverImageUrl}
              alt={record.title}
              style={{ width: 42, height: 58, objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            <div
              style={{
                width: 42,
                height: 58,
                borderRadius: 4,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <BookOutlined style={{ fontSize: 24 }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{record.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Tác giả: <strong>{record.author}</strong> | ISBN: {record.isbn}
            </div>
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
      title: 'Tồn kho',
      key: 'copies',
      render: (_: any, record: Book) => (
        <div>
          <Tag color={record.availableCopies > 0 ? 'green' : 'red'}>
            Khả dụng: {record.availableCopies} / {record.totalCopies}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Vị trí kệ',
      dataIndex: 'location',
      key: 'location',
      render: (loc: string) => <Tag color="geekblue">{loc}</Tag>,
    },
    {
      title: 'Xuất bản',
      key: 'pub',
      render: (_: any, record: Book) => (
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {record.publisher || 'N/A'} ({record.publishYear || 'N/A'})
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Book) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetailBook(record)}
            style={{ borderRadius: 6 }}
          />
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{ borderRadius: 6, background: '#0284c7', borderColor: '#0284c7' }}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa cuốn sách này khỏi kho thư viện?"
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
            📚 Quản Lý Kho Sách Thư Viện
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản trị danh mục sách, cập nhật số lượng tồn, vị trí kệ và hình ảnh bìa.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchBooks} style={{ borderRadius: 8 }}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={openCreateModal}
            style={{ borderRadius: 8, background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
          >
            Thêm Sách Mới
          </Button>
        </Space>
      </div>

      {/* Filter Card */}
      <Card style={{ borderRadius: 12, marginBottom: 20, border: '1px solid #e2e8f0' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Tìm theo Tiêu đề, Tác giả, ISBN..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Tất cả danh mục thể loại"
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              allowClear
              style={{ width: '100%', borderRadius: 8 }}
            >
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={books}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showTotal: (tot) => `Tổng cộng ${tot} cuốn sách`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {editingBook ? '✏️ Chỉnh Sửa Thông Tin Sách' : '➕ Thêm Sách Mới Vào Kho'}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText={editingBook ? 'Lưu Thay Đổi' : 'Thêm Vào Kho'}
        cancelText="Hủy"
        width={680}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate} requiredMark={false}>
          <Form.Item
            name="title"
            label={<span style={{ fontWeight: 600 }}>Tiêu đề sách</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
          >
            <Input placeholder="Ví dụ: Thiết Kế Hệ Thống Toàn Tập" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="author"
                label={<span style={{ fontWeight: 600 }}>Tác giả</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tác giả!' }]}
              >
                <Input placeholder="Ví dụ: Alex Xu" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="isbn"
                label={<span style={{ fontWeight: 600 }}>Mã ISBN</span>}
                rules={[{ required: true, message: 'Vui lòng nhập ISBN!' }]}
              >
                <Input placeholder="978-0132350884" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="categoryId"
                label={<span style={{ fontWeight: 600 }}>Danh mục thể loại</span>}
                rules={[{ required: true, message: 'Vui lòng chọn thể loại!' }]}
              >
                <Select placeholder="Chọn thể loại" style={{ borderRadius: 6 }}>
                  {categories.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="totalCopies"
                label={<span style={{ fontWeight: 600 }}>Tổng số lượng bản nhập kho</span>}
                rules={[{ required: true, message: 'Nhập số lượng!' }]}
              >
                <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="publisher" label={<span style={{ fontWeight: 600 }}>Nhà xuất bản</span>}>
                <Input placeholder="NXB Thông Tin" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="publishYear" label={<span style={{ fontWeight: 600 }}>Năm xuất bản</span>}>
                <InputNumber min={1900} max={2030} style={{ width: '100%', borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="location" label={<span style={{ fontWeight: 600 }}>Vị trí kệ sách</span>}>
                <Input placeholder="Kệ A1-02" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="coverImageUrl" label={<span style={{ fontWeight: 600 }}>URL Hình ảnh bìa</span>}>
            <Input placeholder="https://example.com/cover.jpg" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="description" label={<span style={{ fontWeight: 600 }}>Tóm tắt nội dung</span>}>
            <Input.TextArea rows={3} placeholder="Mô tả nội dung tóm tắt cuốn sách..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Book Detail Modal */}
      <Modal
        title="Chi Tiết Sách"
        open={!!detailBook}
        onCancel={() => setDetailBook(null)}
        footer={[
          <Button key="close" onClick={() => setDetailBook(null)}>
            Đóng
          </Button>,
        ]}
      >
        {detailBook && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {detailBook.coverImageUrl && (
              <div style={{ textAlign: 'center' }}>
                <Image src={detailBook.coverImageUrl} width={140} style={{ borderRadius: 6 }} />
              </div>
            )}
            <div>
              <Title level={4} style={{ margin: 0 }}>{detailBook.title}</Title>
              <Text type="secondary">Tác giả: {detailBook.author}</Text>
            </div>
            <div>
              <p><strong>ISBN:</strong> {detailBook.isbn}</p>
              <p><strong>Thể loại:</strong> <Tag color="blue">{detailBook.categoryName}</Tag></p>
              <p><strong>Vị trí kệ:</strong> {detailBook.location}</p>
              <p><strong>Tồn kho:</strong> {detailBook.availableCopies} khả dụng / {detailBook.totalCopies} tổng</p>
              <p><strong>Nhà XB:</strong> {detailBook.publisher} ({detailBook.publishYear})</p>
              <p><strong>Mô tả:</strong> {detailBook.description || 'Chưa có mô tả'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

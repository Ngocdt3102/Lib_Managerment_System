import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Drawer,
  Image,
  message,
  Spin,
  Empty,
  Pagination,
  Radio,
  Checkbox,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { borrowService } from '../../services/borrowService';
import type { Book, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const MemberCatalog: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const [borrowDays, setBorrowDays] = useState(14);
  const [borrowNotes, setBorrowNotes] = useState('');
  const [borrowSubmitting, setBorrowSubmitting] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, pageSize, keyword, selectedCategory, onlyAvailable]);

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
        let items = res.data.items;
        if (onlyAvailable) {
          items = items.filter((b) => b.availableCopies > 0);
        }
        setBooks(items);
        setTotal(res.data.totalCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowSubmit = async () => {
    if (!borrowingBook) return;
    try {
      setBorrowSubmitting(true);
      const res = await borrowService.createBorrow({
        bookId: borrowingBook.id,
        borrowDays,
        notes: borrowNotes,
      });
      if (res.success) {
        message.success(
          `Đăng ký mượn "${borrowingBook.title}" thành công! Hạn trả: ${dayjs().add(borrowDays, 'day').format('DD/MM/YYYY')}. Vui lòng đến nhận sách tại ${borrowingBook.location}.`
        );
        setBorrowingBook(null);
        setBorrowNotes('');
        fetchBooks();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể đăng ký mượn sách!');
    } finally {
      setBorrowSubmitting(false);
    }
  };

  const calculatedDueDate = dayjs().add(borrowDays, 'day').format('DD/MM/YYYY');

  return (
    <div className="animate-fade-in-up">
      {/* Page Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 24,
          boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
            📚 Khám Phá Kho Sách Thư Viện
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 14 }}>
            Tra cứu hơn {total} đầu sách, tài liệu giáo trình và đăng ký mượn sách trực tuyến nhanh chóng.
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Tag color="cyan" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
            Độc giả: {user?.fullName}
          </Tag>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={10} lg={8}>
            <Input
              placeholder="Tìm theo Tiêu đề, Tác giả, ISBN..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col xs={24} sm={12} md={7} lg={6}>
            <Select
              placeholder="Tất cả danh mục thể loại"
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              allowClear
              size="large"
              style={{ width: '100%', borderRadius: 8 }}
            >
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={6} md={4} lg={4}>
            <Checkbox
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              style={{ fontWeight: 500 }}
            >
              Chỉ sách còn sẵn
            </Checkbox>
          </Col>

          <Col xs={12} sm={6} md={3} lg={3} style={{ textAlign: 'right' }}>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="grid" title="Xem dạng lưới thẻ">
                <AppstoreOutlined />
              </Radio.Button>
              <Radio.Button value="table" title="Xem dạng bảng">
                <UnorderedListOutlined />
              </Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
      </Card>

      {/* Book List Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#64748b' }}>Đang tìm kiếm kho sách...</div>
        </div>
      ) : books.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 0' }}>
          <Empty description="Không tìm thấy cuốn sách nào phù hợp với bộ lọc tìm kiếm hiện tại." />
        </Card>
      ) : viewMode === 'grid' ? (
        <Row gutter={[20, 20]}>
          {books.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                <div className="book-card-item">
                  {/* Book Cover Image */}
                  <div className="book-card-cover-container">
                    {book.coverImageUrl ? (
                      <img src={book.coverImageUrl} alt={book.title} className="book-card-cover" />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <BookOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                        <div style={{ fontSize: 11, marginTop: 4 }}>Không có ảnh bìa</div>
                      </div>
                    )}

                    {/* Availability Tag overlay */}
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      {isAvailable ? (
                        <Tag color="success" style={{ fontWeight: 600, borderRadius: 12, padding: '2px 8px' }}>
                          <CheckCircleOutlined /> Còn {book.availableCopies} cuốn
                        </Tag>
                      ) : (
                        <Tag color="error" style={{ fontWeight: 600, borderRadius: 12, padding: '2px 8px' }}>
                          <CloseCircleOutlined /> Hết sách
                        </Tag>
                      )}
                    </div>

                    {/* Category pill */}
                    <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                      <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500, fontSize: 11 }}>
                        {book.categoryName}
                      </Tag>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Tooltip title={book.title}>
                      <Title
                        level={5}
                        ellipsis={{ rows: 2 }}
                        style={{
                          margin: '0 0 6px',
                          fontWeight: 700,
                          fontSize: 15,
                          minHeight: 42,
                          color: '#0f172a',
                        }}
                      >
                        {book.title}
                      </Title>
                    </Tooltip>

                    <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 8, display: 'block' }}>
                      <UserOutlined style={{ marginRight: 6 }} /> {book.author}
                    </Text>

                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
                      <EnvironmentOutlined style={{ marginRight: 4, color: '#2563eb' }} />
                      Vị trí: <strong>{book.location || 'Kho trung tâm'}</strong>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                      <Button
                        style={{ flex: 1, borderRadius: 8 }}
                        icon={<EyeOutlined />}
                        onClick={() => setDetailBook(book)}
                      >
                        Chi tiết
                      </Button>

                      <Button
                        type="primary"
                        style={{
                          flex: 1,
                          borderRadius: 8,
                          backgroundColor: isAvailable ? '#2563eb' : '#94a3b8',
                          borderColor: isAvailable ? '#2563eb' : '#94a3b8',
                          fontWeight: 600,
                        }}
                        disabled={!isAvailable}
                        icon={<ThunderboltOutlined />}
                        onClick={() => {
                          setBorrowingBook(book);
                          setBorrowDays(14);
                          setBorrowNotes('');
                        }}
                      >
                        Mượn ngay
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* Table View */
        <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Cuốn sách</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Thể loại</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Vị trí kệ</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Tình trạng</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {b.coverImageUrl ? (
                          <img
                            src={b.coverImageUrl}
                            alt={b.title}
                            style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 6 }}
                          />
                        ) : (
                          <BookOutlined style={{ fontSize: 32, color: '#2563eb' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            Tác giả: {b.author} | ISBN: {b.isbn}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Tag color="blue">{b.categoryName}</Tag>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{b.location}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Tag color={b.availableCopies > 0 ? 'green' : 'red'}>
                        {b.availableCopies > 0 ? `Còn ${b.availableCopies}/${b.totalCopies} cuốn` : 'Hết sách'}
                      </Tag>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Space>
                        <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailBook(b)}>
                          Xem
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          disabled={b.availableCopies <= 0}
                          onClick={() => {
                            setBorrowingBook(b);
                            setBorrowDays(14);
                            setBorrowNotes('');
                          }}
                        >
                          Mượn sách
                        </Button>
                      </Space>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
          showTotal={(total) => `Tổng cộng ${total} cuốn sách`}
        />
      </div>

      {/* Modal Đăng Ký Mượn Sách */}
      <Modal
        title="📖 Xác Nhận Đăng Ký Mượn Sách"
        open={!!borrowingBook}
        onCancel={() => setBorrowingBook(null)}
        onOk={handleBorrowSubmit}
        confirmLoading={borrowSubmitting}
        okText="Xác Nhận Mượn Sách"
        cancelText="Đóng"
        width={520}
      >
        {borrowingBook && (
          <div style={{ padding: '12px 0' }}>
            <div
              style={{
                display: 'flex',
                gap: 16,
                background: '#f8fafc',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                marginBottom: 20,
              }}
            >
              {borrowingBook.coverImageUrl && (
                <img
                  src={borrowingBook.coverImageUrl}
                  alt={borrowingBook.title}
                  style={{ width: 60, height: 84, objectFit: 'cover', borderRadius: 6 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{borrowingBook.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Tác giả: {borrowingBook.author}</div>
                <div style={{ fontSize: 12, color: '#2563eb', marginTop: 4, fontWeight: 500 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  Vị trí kệ nhận sách: {borrowingBook.location}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Chọn thời gian mượn:
              </Text>
              <Radio.Group
                value={borrowDays}
                onChange={(e) => setBorrowDays(e.target.value)}
                style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}
              >
                <Radio.Button value={7} style={{ textAlign: 'center', borderRadius: 8 }}>
                  7 ngày
                </Radio.Button>
                <Radio.Button value={14} style={{ textAlign: 'center', borderRadius: 8 }}>
                  14 ngày
                </Radio.Button>
                <Radio.Button value={21} style={{ textAlign: 'center', borderRadius: 8 }}>
                  21 ngày
                </Radio.Button>
                <Radio.Button value={30} style={{ textAlign: 'center', borderRadius: 8 }}>
                  30 ngày
                </Radio.Button>
              </Radio.Group>
            </div>

            {/* Calculated Due Date banner */}
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <CalendarOutlined style={{ fontSize: 20, color: '#059669' }} />
              <div>
                <div style={{ fontSize: 12, color: '#065f46' }}>Hạn trả dự kiến:</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#047857' }}>
                  {calculatedDueDate} (Thời hạn {borrowDays} ngày)
                </div>
              </div>
            </div>

            <div>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Ghi chú mượn (nếu có):</Text>
              <Input.TextArea
                rows={2}
                placeholder="Nhập ghi chú phục vụ học tập, nghiên cứu..."
                value={borrowNotes}
                onChange={(e) => setBorrowNotes(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Drawer Chi Tiết Sách */}
      <Drawer
        title={<span style={{ fontWeight: 700, fontSize: 16 }}>Chi Tiết Sách Thư Viện</span>}
        placement="right"
        onClose={() => setDetailBook(null)}
        open={!!detailBook}
        size={460}
      >
        {detailBook && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {detailBook.coverImageUrl && (
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={detailBook.coverImageUrl}
                  alt={detailBook.title}
                  width={180}
                  style={{ borderRadius: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                />
              </div>
            )}

            <div>
              <Tag color="blue">{detailBook.categoryName}</Tag>
              <Title level={4} style={{ marginTop: 8, marginBottom: 4, fontWeight: 700 }}>
                {detailBook.title}
              </Title>
              <Text style={{ fontSize: 14, color: '#64748b' }}>Tác giả: {detailBook.author}</Text>
            </div>

            <div
              style={{
                background: '#f8fafc',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 13.5,
              }}
            >
              <div>
                <strong>Mã ISBN:</strong> {detailBook.isbn}
              </div>
              <div>
                <strong>Nhà xuất bản:</strong> {detailBook.publisher || 'N/A'} ({detailBook.publishYear || 'N/A'})
              </div>
              <div>
                <strong>Vị trí kệ sách:</strong> <Tag color="geekblue">{detailBook.location}</Tag>
              </div>
              <div>
                <strong>Số lượng khả dụng:</strong>{' '}
                <Tag color={detailBook.availableCopies > 0 ? 'green' : 'red'}>
                  {detailBook.availableCopies} / {detailBook.totalCopies} cuốn
                </Tag>
              </div>
            </div>

            <div>
              <Text style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Mô tả tóm tắt:</Text>
              <Paragraph style={{ color: '#475569', lineHeight: 1.7, fontSize: 13.5 }}>
                {detailBook.description || 'Cuốn sách này hiện chưa có nội dung mô tả chi tiết.'}
              </Paragraph>
            </div>

            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                size="large"
                block
                disabled={detailBook.availableCopies <= 0}
                icon={<ThunderboltOutlined />}
                onClick={() => {
                  const b = detailBook;
                  setDetailBook(null);
                  setBorrowingBook(b);
                  setBorrowDays(14);
                  setBorrowNotes('');
                }}
                style={{ borderRadius: 8, height: 44, fontWeight: 600 }}
              >
                {detailBook.availableCopies > 0 ? 'Đăng Ký Mượn Cuốn Sách Này' : 'Hiện Đã Hết Sách Trong Kho'}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

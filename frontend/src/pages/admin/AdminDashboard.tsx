import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Typography, Button, Spin, Progress, Space } from 'antd';
import {
  SafetyCertificateOutlined,
  TeamOutlined,
  BookOutlined,
  SolutionOutlined,
  DollarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { statsService } from '../../services/statsService';
import { authService } from '../../services/authService';
import type { DashboardStats, User } from '../../types';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        statsService.getOverview(),
        authService.getAllUsers(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#64748b' }}>Đang nạp bảng điều khiển Quản trị viên...</div>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const librarianCount = users.filter((u) => u.role === 'Librarian').length;
  const memberCount = users.filter((u) => u.role === 'Member').length;
  const activeUserCount = users.filter((u) => u.isActive).length;

  const totalCopies = stats?.totalCopies || 1;
  const borrowedPercent = Math.round(((stats?.activeLoans || 0) / totalCopies) * 100);

  return (
    <div className="animate-fade-in-up">
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 24,
          boxShadow: '0 10px 20px -5px rgba(225, 29, 72, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <SafetyCertificateOutlined style={{ fontSize: 24, color: '#fecdd3' }} />
            <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#fecdd3' }}>
              Trung Tâm Quản Trị Hệ Thống
            </span>
          </div>
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
            🏛️ Bảng Điều Khiển Quản Trị Viên (Admin)
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 14 }}>
            Giám sát vận hành toàn bộ thư viện: Quản lý tài khoản, kiểm soát kho sách và báo cáo tài chính.
          </Text>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAdminData}
            style={{ borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/admin/users')}
            style={{ borderRadius: 8, background: '#ffffff', color: '#be123c', fontWeight: 700, border: 'none' }}
          >
            Quản Lý Người Dùng
          </Button>
        </Space>
      </div>

      {/* 4 Primary System Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #e11d48' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>TỔNG TÀI KHOẢN</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#e11d48', marginTop: 4 }}>
                  {users.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>người</span>
                </div>
                <div style={{ fontSize: 12, color: '#059669', marginTop: 2, fontWeight: 600 }}>
                  {activeUserCount} tài khoản đang hoạt động
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <TeamOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>QUY MÔ KHO SÁCH</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0284c7', marginTop: 4 }}>
                  {stats?.totalBooks || 0} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>đầu sách</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Tổng bản: {stats?.totalCopies || 0} cuốn
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
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>LƯỢT MƯỢN ĐANG CHẠY</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  {stats?.activeLoans || 0} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>phiếu</span>
                </div>
                <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2, fontWeight: 600 }}>
                  Quá hạn: {stats?.overdueLoans || 0} phiếu
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <SolutionOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" style={{ borderLeft: '4px solid #d97706' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>DOANH THU PHÍ PHẠT</Text>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                  {(stats?.totalFineCollected || 0).toLocaleString('vi-VN')} <span style={{ fontSize: 13 }}>VNĐ</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Chờ nộp: {(stats?.totalPendingFines || 0).toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <DollarOutlined />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Role Breakdown & Circulation status */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ fontWeight: 700 }}>👥 Cơ Cấu Người Dùng & Phân Quyền (RBAC)</span>}
            extra={<Button type="link" onClick={() => navigate('/admin/users')}>Chi tiết</Button>}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><Tag color="red">👑 Quản Trị Viên (Admin)</Tag></span>
                  <strong>{adminCount} tài khoản</strong>
                </div>
                <Progress percent={Math.round((adminCount / users.length) * 100) || 5} strokeColor="#e11d48" showInfo={false} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><Tag color="blue">📚 Thủ Thư (Librarian)</Tag></span>
                  <strong>{librarianCount} tài khoản</strong>
                </div>
                <Progress percent={Math.round((librarianCount / users.length) * 100) || 10} strokeColor="#0284c7" showInfo={false} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><Tag color="green">🎓 Độc Giả (Member)</Tag></span>
                  <strong>{memberCount} tài khoản</strong>
                </div>
                <Progress percent={Math.round((memberCount / users.length) * 100) || 85} strokeColor="#059669" showInfo={false} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={<span style={{ fontWeight: 700 }}>📊 Tỷ Lệ Lưu Thông Kho Sách</span>}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Tỷ lệ sách đang được mượn</span>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>
                    {stats?.activeLoans} / {stats?.totalCopies} cuốn ({borrowedPercent}%)
                  </span>
                </div>
                <Progress percent={borrowedPercent} strokeColor="#2563eb" />
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>
                  <strong>Thực trạng khả dụng:</strong>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Sách trên kệ</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>{stats?.availableCopies} cuốn</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Đang lưu hành</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{stats?.activeLoans} cuốn</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Bị trễ hạn</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{stats?.overdueLoans} cuốn</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Administrative Links */}
      <Card
        title={<span style={{ fontWeight: 700 }}>⚡ Phím Tắt Nghiệp Vụ Quản Trị</span>}
        style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Button block size="large" onClick={() => navigate('/admin/users')} style={{ borderRadius: 8, height: 48, fontWeight: 600 }}>
              👥 Quản Lý Người Dùng & Quyền
            </Button>
          </Col>
          <Col xs={24} sm={6}>
            <Button block size="large" onClick={() => navigate('/admin/books')} style={{ borderRadius: 8, height: 48, fontWeight: 600 }}>
              📚 Giám Sát Kho Sách
            </Button>
          </Col>
          <Col xs={24} sm={6}>
            <Button block size="large" onClick={() => navigate('/admin/categories')} style={{ borderRadius: 8, height: 48, fontWeight: 600 }}>
              📂 Quản Lý Thể Loại
            </Button>
          </Col>
          <Col xs={24} sm={6}>
            <Button block size="large" onClick={() => navigate('/admin/borrows')} style={{ borderRadius: 8, height: 48, fontWeight: 600 }}>
              🔄 Giám Sát Mượn / Trả
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

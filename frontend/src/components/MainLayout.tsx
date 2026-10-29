import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Tooltip } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  BookOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  DollarOutlined,
  TeamOutlined,
  CompassOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Role-based menu items (strictly separated!)
  const getMenuItems = () => {
    if (isAdmin) {
      return [
        {
          key: '/admin/dashboard',
          icon: <DashboardOutlined style={{ fontSize: 16 }} />,
          label: 'Tổng Quan Hệ Thống',
        },
        {
          key: '/admin/users',
          icon: <TeamOutlined style={{ fontSize: 16 }} />,
          label: 'Quản Lý Người Dùng & Quyền',
        },
        {
          key: '/admin/books',
          icon: <BookOutlined style={{ fontSize: 16 }} />,
          label: 'Giám Sát Kho Sách',
        },
        {
          key: '/admin/categories',
          icon: <AppstoreOutlined style={{ fontSize: 16 }} />,
          label: 'Quản Lý Thể Loại',
        },
        {
          key: '/admin/borrows',
          icon: <SolutionOutlined style={{ fontSize: 16 }} />,
          label: 'Giám Sát Mượn / Trả',
        },
        {
          key: '/admin/fines',
          icon: <DollarOutlined style={{ fontSize: 16 }} />,
          label: 'Báo Cáo Phí Phạt',
        },
        {
          type: 'divider' as const,
        },
        {
          key: '/profile',
          icon: <UserOutlined style={{ fontSize: 16 }} />,
          label: 'Hồ Sơ Quản Trị Viên',
        },
      ];
    }

    if (isLibrarian) {
      return [
        {
          key: '/librarian/dashboard',
          icon: <DashboardOutlined style={{ fontSize: 16 }} />,
          label: 'Bàn Làm Việc Thủ Thư',
        },
        {
          key: '/librarian/books',
          icon: <BookOutlined style={{ fontSize: 16 }} />,
          label: 'Quản Lý Kho Sách',
        },
        {
          key: '/librarian/categories',
          icon: <AppstoreOutlined style={{ fontSize: 16 }} />,
          label: 'Danh Mục Thể Loại',
        },
        {
          key: '/librarian/borrows',
          icon: <SolutionOutlined style={{ fontSize: 16 }} />,
          label: 'Xử Lý Mượn & Trả Sách',
        },
        {
          key: '/librarian/fines',
          icon: <DollarOutlined style={{ fontSize: 16 }} />,
          label: 'Thu Phí Phạt & Bồi Thường',
        },
        {
          key: '/librarian/members',
          icon: <TeamOutlined style={{ fontSize: 16 }} />,
          label: 'Tra Cứu Độc Giả',
        },
        {
          type: 'divider' as const,
        },
        {
          key: '/profile',
          icon: <UserOutlined style={{ fontSize: 16 }} />,
          label: 'Hồ Sơ Thủ Thư',
        },
      ];
    }

    // Default: Member (Độc giả)
    return [
      {
        key: '/member/catalog',
        icon: <CompassOutlined style={{ fontSize: 16 }} />,
        label: 'Khám Phá Thư Viện',
      },
      {
        key: '/member/my-loans',
        icon: <ReadOutlined style={{ fontSize: 16 }} />,
        label: 'Sách Đang Mượn & Lịch Sử',
      },
      {
        key: '/member/my-fines',
        icon: <DollarOutlined style={{ fontSize: 16 }} />,
        label: 'Phiếu Phạt Của Tôi',
      },
      {
        type: 'divider' as const,
      },
      {
        key: '/profile',
        icon: <UserOutlined style={{ fontSize: 16 }} />,
        label: 'Hồ Sơ Độc Giả',
      },
    ];
  };

  const getRoleConfig = (role?: string) => {
    switch (role) {
      case 'Admin':
        return {
          title: 'Quản Trị Viên',
          color: '#e11d48',
          bg: '#fff1f2',
          icon: <SafetyCertificateOutlined />,
          badgeClass: 'admin',
        };
      case 'Librarian':
        return {
          title: 'Thủ Thư',
          color: '#0284c7',
          bg: '#f0f9ff',
          icon: <BookOutlined />,
          badgeClass: 'librarian',
        };
      default:
        return {
          title: 'Độc Giả',
          color: '#059669',
          bg: '#ecfdf5',
          icon: <ReadOutlined />,
          badgeClass: 'member',
        };
    }
  };

  const roleConfig = getRoleConfig(user?.role);

  const userMenuItems = [
    {
      key: 'user-header',
      label: (
        <div style={{ padding: '8px 12px', minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{user?.fullName}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>@{user?.username}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{user?.email}</div>
          <div>
            <span className={`role-pill ${roleConfig.badgeClass}`}>
              {roleConfig.icon} {roleConfig.title}
            </span>
          </div>
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ tài khoản',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất hệ thống',
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sider Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        collapsedWidth={80}
        theme="light"
        style={{
          borderRight: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          boxShadow: '1px 0 6px 0 rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 68,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid #e2e8f0',
            gap: 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 20,
              flexShrink: 0,
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
            }}
          >
            <BookOutlined />
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                LibSmart
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                {isAdmin ? 'Quản Trị Hệ Thống' : isLibrarian ? 'Cổng Nghiệp Vụ' : 'Thư Viện Trực Tuyến'}
              </div>
            </div>
          )}
        </div>

        {/* Role Identity Tag in Sidebar */}
        {!collapsed && (
          <div style={{ padding: '12px 16px 4px' }}>
            <div
              style={{
                background: roleConfig.bg,
                border: `1px solid ${roleConfig.color}30`,
                padding: '8px 12px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ color: roleConfig.color, fontSize: 16 }}>{roleConfig.icon}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Phân quyền hiện tại</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: roleConfig.color, lineHeight: 1.2 }}>
                  {roleConfig.title}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Sidebar Navigation Menu */}
        <div style={{ padding: '8px 0', overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            onClick={({ key }) => navigate(key)}
            style={{
              borderRight: 0,
              fontWeight: 500,
              fontSize: 13.5,
            }}
          />
        </div>
      </Sider>

      {/* Main Container */}
      <Layout style={{ background: '#f8fafc' }}>
        {/* Top Header */}
        <Header
          className="glass-header"
          style={{
            padding: '0 24px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Left: Collapse toggle + Breadcrumb hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tooltip title={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: 18,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                }}
              />
            </Tooltip>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Hệ Thống Thư Viện</span>
              <span style={{ color: '#cbd5e1' }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                {isAdmin ? 'Quản Trị Viên' : isLibrarian ? 'Nghiệp Vụ Thủ Thư' : 'Độc Giả'}
              </span>
            </div>
          </div>

          {/* Right: Role indicator badge + User profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                background: 'rgba(16, 185, 129, 0.08)',
                borderRadius: 20,
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: 12,
                fontWeight: 600,
                color: '#059669',
              }}
              className="md-flex"
            >
              <span className="status-dot status-dot-green" style={{ margin: 0 }} />
              <span>Hệ thống trực tuyến</span>
            </div>

            <span className={`role-pill ${roleConfig.badgeClass}`}>
              {roleConfig.icon} {roleConfig.title}
            </span>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '4px 10px',
                  borderRadius: 30,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: roleConfig.color,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                  size={32}
                >
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <div style={{ display: 'none', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{user?.fullName}</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>{user?.fullName}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content Body */}
        <Content
          style={{
            margin: '24px 28px',
            minHeight: 'calc(100vh - 116px)',
          }}
        >
          <div className="animate-fade-in-up">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Forbidden } from './pages/Forbidden';
import { NotFound } from './pages/NotFound';
import { Profile } from './pages/Profile';

// Member Pages
import { MemberCatalog } from './pages/member/MemberCatalog';
import { MemberLoans } from './pages/member/MemberLoans';
import { MemberFines } from './pages/member/MemberFines';

// Librarian Pages
import { LibrarianDashboard } from './pages/librarian/LibrarianDashboard';
import { LibrarianBooks } from './pages/librarian/LibrarianBooks';
import { LibrarianCategories } from './pages/librarian/LibrarianCategories';
import { LibrarianBorrows } from './pages/librarian/LibrarianBorrows';
import { LibrarianFines } from './pages/librarian/LibrarianFines';
import { LibrarianMembers } from './pages/librarian/LibrarianMembers';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminBooks } from './pages/admin/AdminBooks';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminBorrows } from './pages/admin/AdminBorrows';
import { AdminFines } from './pages/admin/AdminFines';

// Smart Redirector based on user role
const SmartRedirect: React.FC<{
  type: 'root' | 'dashboard' | 'books' | 'borrows' | 'fines' | 'categories' | 'users';
}> = ({ type }) => {
  const { user, defaultPath, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (type === 'root' || type === 'dashboard') {
    return <Navigate to={defaultPath} replace />;
  }

  if (type === 'books') {
    if (user.role === 'Admin') return <Navigate to="/admin/books" replace />;
    if (user.role === 'Librarian') return <Navigate to="/librarian/books" replace />;
    return <Navigate to="/member/catalog" replace />;
  }

  if (type === 'borrows') {
    if (user.role === 'Admin') return <Navigate to="/admin/borrows" replace />;
    if (user.role === 'Librarian') return <Navigate to="/librarian/borrows" replace />;
    return <Navigate to="/member/my-loans" replace />;
  }

  if (type === 'fines') {
    if (user.role === 'Admin') return <Navigate to="/admin/fines" replace />;
    if (user.role === 'Librarian') return <Navigate to="/librarian/fines" replace />;
    return <Navigate to="/member/my-fines" replace />;
  }

  if (type === 'categories') {
    if (user.role === 'Admin') return <Navigate to="/admin/categories" replace />;
    if (user.role === 'Librarian') return <Navigate to="/librarian/categories" replace />;
    return <Navigate to="/403" replace />;
  }

  if (type === 'users') {
    if (user.role === 'Admin') return <Navigate to="/admin/users" replace />;
    return <Navigate to="/403" replace />;
  }

  return <Navigate to={defaultPath} replace />;
};

export const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorPrimary: '#2563eb',
          borderRadius: 8,
          colorTextHeading: '#0f172a',
          colorText: '#334155',
        },
      }}
    >
      <AntdApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/404" element={<NotFound />} />

              {/* Smart Root Redirect */}
              <Route path="/" element={<SmartRedirect type="root" />} />

              {/* Protected Routes inside MainLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Common Account Profile */}
                  <Route path="/profile" element={<Profile />} />

                  {/* Legacy & Shortcut Routes redirected by Role */}
                  <Route path="/dashboard" element={<SmartRedirect type="dashboard" />} />
                  <Route path="/books" element={<SmartRedirect type="books" />} />
                  <Route path="/catalog" element={<SmartRedirect type="books" />} />
                  <Route path="/borrows" element={<SmartRedirect type="borrows" />} />
                  <Route path="/my-loans" element={<SmartRedirect type="borrows" />} />
                  <Route path="/fines" element={<SmartRedirect type="fines" />} />
                  <Route path="/my-fines" element={<SmartRedirect type="fines" />} />
                  <Route path="/categories" element={<SmartRedirect type="categories" />} />
                  <Route path="/users" element={<SmartRedirect type="users" />} />

                  {/* MEMBER (Độc giả) PORTAL - Strictly for Member (and Admin) */}
                  <Route element={<ProtectedRoute roles={['Member', 'Admin']} />}>
                    <Route path="/member/catalog" element={<MemberCatalog />} />
                    <Route path="/member/my-loans" element={<MemberLoans />} />
                    <Route path="/member/my-fines" element={<MemberFines />} />
                  </Route>

                  {/* LIBRARIAN (Thủ thư) PORTAL - Strictly for Librarian (and Admin) */}
                  {/* Users/Members CANNOT view these pages! */}
                  <Route element={<ProtectedRoute roles={['Librarian', 'Admin']} />}>
                    <Route path="/librarian/dashboard" element={<LibrarianDashboard />} />
                    <Route path="/librarian/books" element={<LibrarianBooks />} />
                    <Route path="/librarian/categories" element={<LibrarianCategories />} />
                    <Route path="/librarian/borrows" element={<LibrarianBorrows />} />
                    <Route path="/librarian/fines" element={<LibrarianFines />} />
                    <Route path="/librarian/members" element={<LibrarianMembers />} />
                  </Route>

                  {/* ADMIN (Quản trị viên) PORTAL - STRICTLY FOR ADMIN ONLY */}
                  {/* Neither Members nor Librarians can access! */}
                  <Route element={<ProtectedRoute roles={['Admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/books" element={<AdminBooks />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                    <Route path="/admin/borrows" element={<AdminBorrows />} />
                    <Route path="/admin/fines" element={<AdminFines />} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback to 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;

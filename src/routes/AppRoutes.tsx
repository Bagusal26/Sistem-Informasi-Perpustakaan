import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { AdminLayout } from '../components/layout/AdminLayout';
import { MemberLayout } from '../components/layout/MemberLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Admin Pages
import { DashboardPage } from '../pages/admin/DashboardPage';
import { BooksPage } from '../pages/admin/BooksPage';
import { BookCreatePage } from '../pages/admin/BookCreatePage';
import { BookEditPage } from '../pages/admin/BookEditPage';
import { MembersPage } from '../pages/admin/MembersPage';
import { MemberCreatePage } from '../pages/admin/MemberCreatePage';
import { MemberEditPage } from '../pages/admin/MemberEditPage';
import { BorrowingsPage } from '../pages/admin/BorrowingsPage';
import { ReportsPage } from '../pages/admin/ReportsPage';

// Member Pages
import { CatalogPage } from '../pages/member/CatalogPage';
import { BookDetailPage } from '../pages/member/BookDetailPage';
import { ActiveBorrowingsPage } from '../pages/member/ActiveBorrowingsPage';
import { BorrowingHistoryPage } from '../pages/member/BorrowingHistoryPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Root redirect berdasarkan status login dan role */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : role === 'admin' ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/member/catalog" replace />
          )
        }
      />

      {/* Public / Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Direct /profile shortcut based on role */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {role === 'admin' ? (
              <Navigate to="/admin/profile" replace />
            ) : (
              <Navigate to="/member/profile" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/create" element={<BookCreatePage />} />
        <Route path="books/edit/:id" element={<BookEditPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/create" element={<MemberCreatePage />} />
        <Route path="members/edit/:id" element={<MemberEditPage />} />
        <Route path="borrowings" element={<BorrowingsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Member Protected Routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRole="member">
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/member/catalog" replace />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="books/:id" element={<BookDetailPage />} />
        <Route path="borrowings" element={<ActiveBorrowingsPage />} />
        <Route path="history" element={<BorrowingHistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

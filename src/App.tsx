/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { ToastContainer } from './components/ui/Toast';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <LibraryProvider>
          <AuthProvider>
            <AppRoutes />
            <ToastContainer />
          </AuthProvider>
        </LibraryProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

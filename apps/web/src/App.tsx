import { BrowserRouter, Route, Routes, Navigate } from 'react-router';
import { NuqsAdapter } from 'nuqs/adapters/react-router';
import LoginPage from './pages/login/LoginPage';
import AppLayout from './ui/layouts/AppLayout';
import GenresPage from './pages/genres/GenresPage';
import AuthorsPage from './pages/authors/AuthorsPage';
import PublishersPage from './pages/publishers/PublishersPage';
import BooksPage from './pages/books/BooksPage';
import BookDetailPage from './pages/books/BookDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <NuqsAdapter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/genres" replace />} />
            <Route path="/genres" element={<GenresPage />} />
            <Route path="/authors" element={<AuthorsPage />} />
            <Route path="/publishers" element={<PublishersPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:slug" element={<BookDetailPage />} />
          </Route>
        </Routes>
      </NuqsAdapter>
    </BrowserRouter>
  );
}

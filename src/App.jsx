import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import { WHATSAPP } from './constants/theme';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"         element={<HomePage />} />
          <Route path="/boutique" element={<ProductsPage />} />
          <Route path="/contact"  element={<ContactPage />} />
          <Route path="/admin"    element={<AdminPage />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* Bouton WhatsApp flottant */}
      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Commander via WhatsApp"
        className="fixed right-5 bottom-5 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1fbd5a] text-white font-bold text-sm px-4 py-3 rounded-full shadow-lg shadow-[#25D366]/40 hover:-translate-y-0.5 transition-all duration-200 md:px-5"
      >
        <i className="bi bi-whatsapp text-xl leading-none" aria-hidden="true" />
        <span className="hidden sm:inline tracking-wide">Commander</span>
      </a>
    </>
  );
}

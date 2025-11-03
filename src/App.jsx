import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import SpecificationsList from './components/SpecificationsList';
import SpecificationDetail from './components/SpecificationDetail';
import QuotesList from './components/Quotes/QuotesList';
import QuoteDetail from './components/Quotes/QuoteDetail';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="specifications" element={<SpecificationsList />} />
          <Route path="specifications/:id" element={<SpecificationDetail />} />
          <Route path="quotes" element={<QuotesList />} />
          <Route path="quotes/:id" element={<QuoteDetail />} />
          <Route path="quotes/:id/edit" element={<QuoteDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Auth from './components/Auth.jsx';
import Layout from './components/Layout/Layout.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import SpecificationsList from './components/SpecificationsList.jsx';
import SpecificationDetail from './components/SpecificationDetail.jsx';
import QuotesList from './components/Quotes/QuotesList.jsx';
import QuoteDetail from './components/Quotes/QuoteDetail.jsx';
import InvoicesList from './components/Invoices/InvoicesList.jsx';
import InvoiceDetail from './components/Invoices/InvoiceDetail.jsx';
import ContractsList from './components/Contracts/ContractsList.jsx';
import ContractDetail from './components/Contracts/ContractDetail.jsx';
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
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="invoices/:id/edit" element={<InvoiceDetail />} />
          <Route path="contracts" element={<ContractsList />} />
          <Route path="contracts/:id" element={<ContractDetail />} />
          <Route path="contracts/:id/edit" element={<ContractDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

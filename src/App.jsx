import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import SpecificationsList from './components/SpecificationsList';
import SpecificationDetail from './components/SpecificationDetail';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [selectedSpecification, setSelectedSpecification] = useState(null);

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

  if (selectedSpecification) {
    return (
      <SpecificationDetail
        specification={selectedSpecification}
        onBack={() => setSelectedSpecification(null)}
      />
    );
  }

  return <SpecificationsList onSelectSpecification={setSelectedSpecification} />;
}

export default App;

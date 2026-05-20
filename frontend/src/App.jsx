import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProjectBoard from './components/ProjectBoard';
import Spinner from './components/Spinner';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState('login'); // 'login' or 'register'
  const [selectedProject, setSelectedProject] = useState(null);

  if (loading) {
    return <Spinner fullPage />;
  }

  // Auth Guard
  if (!user) {
    if (view === 'register') {
      return <Register onNavigate={setView} />;
    }
    return <Login onNavigate={setView} />;
  }

  // Authenticated View
  if (selectedProject) {
    return (
      <div className="app-container">
        <ProjectBoard
          user={user}
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onDeleteProject={() => setSelectedProject(null)}
          onUpdateProject={(updatedProj) => setSelectedProject(updatedProj)}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Dashboard
        user={user}
        onLogout={logout}
        onSelectProject={setSelectedProject}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

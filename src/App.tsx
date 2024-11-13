import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Workspace } from './pages/Workspace';
import { MyAccount } from './pages/MyAccount'; // Assurez-vous que le chemin est correct
import { Login } from './pages/Login'; // Assurez-vous que le chemin est correct
import { SignupFlow } from './pages/SignupFlow';
import supabase from './config/configdb';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        navigate('/workspace');
      }
    });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/workspace" element={isAuthenticated ? <Workspace /> : <Navigate to="/login" />} />
      <Route path="/myaccount" element={isAuthenticated ? <MyAccount username="user123" profileImage="image.png" onBack={() => {}} onSave={() => {}} /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login onLogin={() => {}} />} />
      <Route path="/signup/*" element={<SignupFlow onBack={() => navigate('/login')} />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
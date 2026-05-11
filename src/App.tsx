import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleForm from './pages/VehicleForm';
import VehicleDetail from './pages/VehicleDetail';
import Records from './pages/Records';
import RecordForm from './pages/RecordForm';
import Login from './pages/Login';
import Register from './pages/Register';
import { api } from './api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!api.isLoggedIn()) {
      setChecking(false);
      return;
    }
    api.getMe()
      .then(() => setAuthenticated(true))
      .catch(() => {
        api.logout();
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/vehicles/new" element={<VehicleForm />} />
                  <Route path="/vehicles/:id" element={<VehicleDetail />} />
                  <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
                  <Route path="/records" element={<Records />} />
                  <Route path="/records/new" element={<RecordForm />} />
                  <Route path="/records/:id/edit" element={<RecordForm />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

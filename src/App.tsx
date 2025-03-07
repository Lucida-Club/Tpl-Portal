import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductWidget from './pages/ProductWidget';
import BrandWidget from './pages/BrandWidget';
import MapWidget from './pages/MapWidget';
import SystemsOptions from './pages/SystemsOptions';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './store/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-100">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Navigate to="/product-widget" replace />} />
                      <Route path="/product-widget" element={<ProductWidget />} />
                      <Route path="/brand-widget" element={<BrandWidget />} />
                      <Route path="/brand-map" element={<MapWidget />} />
                      <Route path="/systems" element={<SystemsOptions />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductWidget from './pages/ProductWidget';
import BrandWidget from './pages/BrandWidget';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/product-widget" replace />} />
            <Route path="/product-widget" element={<ProductWidget />} />
            <Route path="/brand-widget" element={<BrandWidget />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
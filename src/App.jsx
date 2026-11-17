import { Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/layout';
import ComponentShowcase from './pages/ComponentShowcase';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<ComponentShowcase />} />
          {/* Future routes will be added here */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

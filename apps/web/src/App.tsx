import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { PageTurnContainer } from './components/PageTurnContainer';
import websiteLogo from './assets/website-logo.svg';

import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import Submit from './pages/Submit';
import Read from './pages/Read';
import Moderate from './pages/Moderate';
import ModeratorLogin from './pages/ModeratorLogin';
import ApplyModerator from './pages/ApplyModerator';
import About from './pages/About';
import Community from './pages/Community';
import Room from './pages/Room';
import Search from './pages/Search';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import PaymentVerify from './pages/PaymentVerify';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app-shell">
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        
        <main className="app-main">
          <header className="mobile-header">
            <img src={websiteLogo} alt="Curious Bright" style={{ height: 34, width: 'auto' }} />
            <button 
              onClick={() => setIsSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-ink)' }}
            >
              <i className="bx bx-menu"></i>
            </button>
          </header>
          
          <PageTurnContainer>
            <Routes>
              <Route path="/" element={<Navigate to="/browse" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/read/:id" element={<Read />} />
              <Route path="/moderate" element={<Moderate />} />
              <Route path="/mod-login" element={<ModeratorLogin />} />
              <Route path="/apply-moderator" element={<ApplyModerator />} />
              <Route path="/about" element={<About />} />
              <Route path="/community" element={<Community />} />
              <Route path="/room/:id" element={<Room />} />
              <Route path="/search" element={<Search />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/payment/verify" element={<PaymentVerify />} />
            </Routes>
          </PageTurnContainer>
        </main>
      </div>
    </Router>
  );
}

export default App;

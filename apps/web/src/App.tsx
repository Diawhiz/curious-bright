import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import Submit from './pages/Submit';
import Read from './pages/Read';
import Moderate from './pages/Moderate';
import Community from './pages/Community';
import Room from './pages/Room';
import Search from './pages/Search';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/browse" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/read/:id" element={<Read />} />
            <Route path="/moderate" element={<Moderate />} />
            <Route path="/community" element={<Community />} />
            <Route path="/room/:id" element={<Room />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

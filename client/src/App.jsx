import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import BuildEditor from './features/builds/BuildEditor'; 
import CommunityHub from './features/community/CommunityHub';
import Register from './features/auth/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor" element={<BuildEditor />} /> 
          <Route path="/community" element={<CommunityHub />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
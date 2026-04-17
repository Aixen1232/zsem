import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AutoTest from './pages/AutoTest';
import SingleQuestion from './pages/SingleQuestion';
import AllQuestions from './pages/AllQuestions';
import Practical from './pages/Practical';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Ładowanie...</div>;
  }
  
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/test/auto" element={
            <PrivateRoute>
              <AutoTest />
            </PrivateRoute>
          } />
          <Route path="/test/single" element={
            <PrivateRoute>
              <SingleQuestion />
            </PrivateRoute>
          } />
          <Route path="/questions/all" element={
            <PrivateRoute>
              <AllQuestions />
            </PrivateRoute>
          } />
          <Route path="/practical" element={
            <PrivateRoute>
              <Practical />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

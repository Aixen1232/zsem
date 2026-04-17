import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [testHistory, setTestHistory] = useState([]);

  useEffect(() => {
    loadCategories();
    loadTestHistory();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
    }
  };

  const loadTestHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tests/history');
      setTestHistory(response.data);
    } catch (error) {
      console.error('Błąd pobierania historii:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">INF 0.2 - Egzaminy</div>
        <div className="nav-user">
          <span>Witaj, {user?.username}</span>
          <button onClick={handleLogout} className="btn-logout">Wyloguj</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Panel główny</h1>
        
        <div className="actions-grid">
          <div className="action-card">
            <h3>📝 Test automatyczny</h3>
            <p>Generuj losowy test z określoną liczbą pytań</p>
            <Link to="/test/auto" className="btn-primary">Rozpocznij test</Link>
          </div>

          <div className="action-card">
            <h3>❓ Po jednym pytaniu</h3>
            <p>Trenuj w trybie pojedynczych pytań</p>
            <Link to="/test/single" className="btn-primary">Rozpocznij</Link>
          </div>

          <div className="action-card">
            <h3>📚 Lista wszystkich pytań</h3>
            <p>Przeglądaj pytania z odpowiedziami</p>
            <Link to="/questions/all" className="btn-primary">Zobacz pytania</Link>
          </div>

          <div className="action-card">
            <h3>🔧 Testy praktyczne</h3>
            <p>Zadania praktyczne z linkami</p>
            <Link to="/practical" className="btn-primary">Zobacz zadania</Link>
          </div>
        </div>

        <div className="history-section">
          <h2>📊 Historia testów</h2>
          {testHistory.length === 0 ? (
            <p>Brak zapisanych testów</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Typ testu</th>
                  <th>Liczba pytań</th>
                  <th>Poprawne odpowiedzi</th>
                  <th>Wynik</th>
                </tr>
              </thead>
              <tbody>
                {testHistory.map(test => (
                  <tr key={test.id}>
                    <td>{new Date(test.created_at).toLocaleDateString('pl-PL')}</td>
                    <td>{test.test_type}</td>
                    <td>{test.total_questions}</td>
                    <td>{test.correct_answers}</td>
                    <td className={`score ${test.score >= 50 ? 'good' : 'bad'}`}>
                      {test.score.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="categories-section">
          <h2>📁 Kategorie</h2>
          <div className="categories-list">
            {categories.map(cat => (
              <div key={cat.id} className="category-item">
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

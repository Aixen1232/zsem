import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Practical.css';

const Practical = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadPracticalQuestions();
  }, []);

  const loadPracticalQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions/practical');
      setQuestions(response.data);
    } catch (error) {
      console.error('Błąd pobierania zadań praktycznych:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="practical-container">
      <nav className="navbar">
        <div className="nav-brand">INF 0.2 - Testy Praktyczne</div>
        <button onClick={handleLogout} className="btn-logout">Wyloguj</button>
      </nav>

      <div className="practical-content">
        <h1>Zadania Praktyczne</h1>
        
        <div className="info-box">
          <p>📌 Poniżej znajdziesz linki do zadań praktycznych z egzaminów INF.02. Kliknij w link, aby przejść do zadania.</p>
        </div>

        {questions.length === 0 ? (
          <div className="no-questions">
            <p>Brak zadań praktycznych w bazie.</p>
            <Link to="/dashboard" className="btn-secondary">Powrót do dashboardu</Link>
          </div>
        ) : (
          <div className="practical-list">
            {questions.map((question, index) => (
              <div key={question.id} className="practical-card">
                <div className="practical-number">{index + 1}</div>
                <div className="practical-info">
                  <h3>{question.question_text}</h3>
                  {question.practical_link && (
                    <a 
                      href={question.practical_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="practical-btn"
                    >
                      🔗 Przejdź do zadania
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="external-links">
          <h2>Inne przydatne linki:</h2>
          <ul>
            <li>
              <a href="https://www.praktycznyegzamin.pl/ee08/praktyka/" target="_blank" rel="noopener noreferrer">
                PraktycznyEgzamin.pl - Zadania praktyczne EE.08
              </a>
            </li>
            <li>
              <a href="https://www.praktycznyegzamin.pl/inf02/praktyka/" target="_blank" rel="noopener noreferrer">
                PraktycznyEgzamin.pl - Zadania praktyczne INF.02
              </a>
            </li>
            <li>
              <a href="https://kwalifikacje.oke.krakow.pl/" target="_blank" rel="noopener noreferrer">
                OKE Kraków - Materiały egzaminacyjne
              </a>
            </li>
          </ul>
        </div>

        <Link to="/dashboard" className="btn-secondary back-btn">Powrót do dashboardu</Link>
      </div>
    </div>
  );
};

export default Practical;

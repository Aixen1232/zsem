import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AllQuestions.css';

const AllQuestions = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCorrectAnswers, setShowCorrectAnswers] = useState({});

  useEffect(() => {
    loadCategories();
    loadQuestions();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
    }
  };

  const loadQuestions = async (categoryId = null) => {
    try {
      const url = categoryId 
        ? `http://localhost:5000/api/questions/all?categoryId=${categoryId}`
        : 'http://localhost:5000/api/questions/all';
      
      const response = await axios.get(url);
      setQuestions(response.data);
      setShowCorrectAnswers({});
    } catch (error) {
      console.error('Błąd pobierania pytań:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    if (categoryId) {
      loadQuestions(categoryId);
    } else {
      loadQuestions();
    }
  };

  const checkAnswer = (questionId, selectedAnswer) => {
    setShowCorrectAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const isCorrect = (question, selectedAnswer) => {
    return question.correct_answer === selectedAnswer;
  };

  return (
    <div className="all-questions-container">
      <nav className="navbar">
        <div className="nav-brand">INF 0.2 - Wszystkie pytania</div>
        <button onClick={handleLogout} className="btn-logout">Wyloguj</button>
      </nav>

      <div className="questions-content">
        <div className="filters">
          <label>Filtruj po kategorii:</label>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Wszystkie kategorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="questions-list">
          {questions.length === 0 ? (
            <p>Brak pytań do wyświetlenia</p>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <div className="question-header">
                  <span className="question-number">{index + 1}.</span>
                  <span className="question-category">
                    {categories.find(c => c.id === question.category_id)?.name || 'Inne'}
                  </span>
                </div>

                <h3 className="question-text">{question.question_text}</h3>

                {question.is_practical && question.practical_link && (
                  <a href={question.practical_link} target="_blank" rel="noopener noreferrer" className="practical-link">
                    🔗 Link do zadania praktycznego
                  </a>
                )}

                <div className="options-list">
                  {[
                    { key: 'a', text: question.option_a },
                    { key: 'b', text: question.option_b },
                    { key: 'c', text: question.option_c },
                    { key: 'd', text: question.option_d }
                  ].map(option => {
                    const isSelected = showCorrectAnswers[question.id] === option.key;
                    const correct = isCorrect(question, option.key);
                    
                    let optionClass = 'option-item';
                    if (showCorrectAnswers[question.id]) {
                      if (correct) {
                        optionClass += ' correct';
                      } else if (isSelected && !correct) {
                        optionClass += ' incorrect';
                      }
                    }

                    return (
                      <button
                        key={option.key}
                        className={optionClass}
                        onClick={() => checkAnswer(question.id, option.key)}
                      >
                        <span className="option-letter">{option.key.toUpperCase()}</span>
                        {option.text}
                        {showCorrectAnswers[question.id] && correct && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <Link to="/dashboard" className="btn-secondary back-btn">Powrót do dashboardu</Link>
      </div>
    </div>
  );
};

export default AllQuestions;

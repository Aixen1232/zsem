import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './SingleQuestion.css';

const SingleQuestion = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/questions/random', {
        count: 100
      });
      
      if (response.data.length === 0) {
        alert('Brak pytań w bazie!');
        return;
      }

      setQuestions(response.data);
      setCurrentIndex(0);
      setStats({ correct: 0, incorrect: 0 });
    } catch (error) {
      console.error('Błąd pobierania pytań:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const selectAnswer = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = async () => {
    if (!selectedAnswer) return;

    try {
      const response = await axios.post('http://localhost:5000/api/questions/check', {
        questionId: questions[currentIndex].id,
        answer: selectedAnswer
      });

      setIsCorrect(response.data.correct);
      setShowResult(true);

      setStats(prev => ({
        correct: prev.correct + (response.data.correct ? 1 : 0),
        incorrect: prev.incorrect + (response.data.correct ? 0 : 1)
      }));
    } catch (error) {
      console.error('Błąd sprawdzania odpowiedzi:', error);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      // Koniec puli pytań, załaduj nowe
      loadQuestions();
    }
  };

  if (questions.length === 0) {
    return (
      <div className="single-container">
        <nav className="navbar">
          <div className="nav-brand">INF 0.2 - Po jednym pytaniu</div>
          <button onClick={handleLogout} className="btn-logout">Wyloguj</button>
        </nav>
        <div className="loading">Ładowanie pytań...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="single-container">
      <nav className="navbar">
        <div className="nav-brand">INF 0.2 - Pytanie {currentIndex + 1}</div>
        <div className="nav-stats">
          <span className="stat-correct">✓ {stats.correct}</span>
          <span className="stat-incorrect">✗ {stats.incorrect}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">Wyloguj</button>
      </nav>

      <div className="question-card">
        <div className="progress-info">
          <span>Pytanie {currentIndex + 1} z {questions.length}</span>
          <div className="progress-bar-mini">
            <div 
              className="progress-fill-mini" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <h2 className="question-text">{currentQuestion.question_text}</h2>

        <div className="options">
          {[
            { key: 'a', text: currentQuestion.option_a },
            { key: 'b', text: currentQuestion.option_b },
            { key: 'c', text: currentQuestion.option_c },
            { key: 'd', text: currentQuestion.option_d }
          ].map(option => {
            let optionClass = 'option-btn';
            
            if (showResult) {
              if (option.key === currentQuestion.correct_answer) {
                optionClass += ' correct-answer';
              } else if (option.key === selectedAnswer && !isCorrect) {
                optionClass += ' wrong-answer';
              }
            } else if (selectedAnswer === option.key) {
              optionClass += ' selected';
            }

            return (
              <button
                key={option.key}
                className={optionClass}
                onClick={() => selectAnswer(option.key)}
                disabled={showResult}
              >
                <span className="option-letter">{option.key.toUpperCase()}</span>
                {option.text}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? '✓ Poprawna odpowiedź!' : `✗ Błędna odpowiedź. Prawidłowa to: ${currentQuestion.correct_answer.toUpperCase()}`}
          </div>
        )}

        <div className="action-buttons">
          {!showResult ? (
            <button
              className="btn-primary btn-check"
              onClick={checkAnswer}
              disabled={!selectedAnswer}
            >
              Sprawdź odpowiedź
            </button>
          ) : (
            <button
              className="btn-primary btn-next"
              onClick={nextQuestion}
            >
              Następne pytanie
            </button>
          )}
        </div>

        <Link to="/dashboard" className="btn-secondary back-link">Powrót do dashboardu</Link>
      </div>
    </div>
  );
};

export default SingleQuestion;

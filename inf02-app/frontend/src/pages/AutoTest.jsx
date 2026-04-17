import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AutoTest.css';

const AutoTest = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [questionCount, setQuestionCount] = useState(40);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.filter(c => c.name !== 'Testy praktyczne'));
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startTest = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/questions/random', {
        count: questionCount,
        categoryId: selectedCategory || null
      });
      
      if (response.data.length === 0) {
        alert('Brak pytań w wybranej kategorii!');
        return;
      }

      setQuestions(response.data);
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResults(false);
      setTestFinished(false);
    } catch (error) {
      console.error('Błąd pobierania pytań:', error);
      alert('Błąd podczas rozpoczynania testu');
    }
  };

  const selectAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishTest = async () => {
    try {
      // Sprawdź odpowiedzi
      const results = [];
      for (const question of questions) {
        const userAnswer = answers[question.id];
        if (userAnswer) {
          const response = await axios.post('http://localhost:5000/api/questions/check', {
            questionId: question.id,
            answer: userAnswer
          });
          results.push({
            questionId: question.id,
            userAnswer,
            is_correct: response.data.correct
          });
        }
      }

      // Zapisz wynik testu
      await axios.post('http://localhost:5000/api/tests/save', {
        testType: 'Automatyczny',
        totalQuestions: questions.length,
        results
      });

      setShowResults(true);
      setTestFinished(true);
    } catch (error) {
      console.error('Błąd zapisywania testu:', error);
      alert('Błąd podczas zapisywania wyniku');
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id]) {
        // Tymczasowo zakładamy, że sprawdzimy później
        correct++;
      }
    });
    return questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;
  };

  if (!testStarted) {
    return (
      <div className="autotest-container">
        <nav className="navbar">
          <div className="nav-brand">INF 0.2 - Test Automatyczny</div>
          <button onClick={handleLogout} className="btn-logout">Wyloguj</button>
        </nav>

        <div className="setup-card">
          <h1>Konfiguracja testu</h1>
          
          <div className="form-group">
            <label>Liczba pytań:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="form-group">
            <label>Kategoria (opcjonalnie):</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Wszystkie kategorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button onClick={startTest} className="btn-primary btn-large">
            Rozpocznij test
          </button>

          <Link to="/dashboard" className="btn-secondary">Powrót do dashboardu</Link>
        </div>
      </div>
    );
  }

  if (showResults) {
    const answeredCount = Object.keys(answers).length;
    const score = (answeredCount / questions.length) * 100;

    return (
      <div className="autotest-container">
        <nav className="navbar">
          <div className="nav-brand">INF 0.2 - Wyniki testu</div>
          <button onClick={handleLogout} className="btn-logout">Wyloguj</button>
        </nav>

        <div className="results-card">
          <h1>Wyniki testu</h1>
          
          <div className="score-display">
            <div className="score-circle">
              <span>{score.toFixed(1)}%</span>
            </div>
            <p>Odpowiedziano na {answeredCount} z {questions.length} pytań</p>
          </div>

          <div className="actions">
            <button onClick={startTest} className="btn-primary">Spróbuj ponownie</button>
            <Link to="/dashboard" className="btn-secondary">Powrót do dashboardu</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="autotest-container">
      <nav className="navbar">
        <div className="nav-brand">INF 0.2 - Pytanie {currentQuestionIndex + 1} z {questions.length}</div>
        <button onClick={handleLogout} className="btn-logout">Wyloguj</button>
      </nav>

      <div className="question-card">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <h2 className="question-text">{currentQuestion.question_text}</h2>

        <div className="options">
          {[
            { key: 'a', text: currentQuestion.option_a },
            { key: 'b', text: currentQuestion.option_b },
            { key: 'c', text: currentQuestion.option_c },
            { key: 'd', text: currentQuestion.option_d }
          ].map(option => (
            <button
              key={option.key}
              className={`option-btn ${currentAnswer === option.key ? 'selected' : ''}`}
              onClick={() => selectAnswer(option.key)}
            >
              <span className="option-letter">{option.key.toUpperCase()}</span>
              {option.text}
            </button>
          ))}
        </div>

        <div className="navigation">
          <button 
            onClick={prevQuestion} 
            className="btn-secondary"
            disabled={currentQuestionIndex === 0}
          >
            Poprzednie
          </button>
          
          <button 
            onClick={nextQuestion} 
            className="btn-primary"
            disabled={!currentAnswer}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Zakończ test' : 'Następne'}
          </button>
        </div>

        <div className="question-numbers">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              className={`num-btn ${idx === currentQuestionIndex ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
              onClick={() => setCurrentQuestionIndex(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoTest;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

app.use(cors());
app.use(express.json());

// Middleware do weryfikacji tokena
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Brak tokena' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Nieprawidłowy token' });
    }
    req.user = user;
    next();
  });
};

// Rejestracja
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Wymagane pola: username i password' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);

    res.status(201).json({ message: 'Użytkownik utworzony', userId: result.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Logowanie
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Wymagane pola: username i password' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Pobieranie wszystkich kategorii
app.get('/api/categories', authenticateToken, (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Pobieranie losowych pytań
app.post('/api/questions/random', authenticateToken, (req, res) => {
  try {
    const { count, categoryId } = req.body;
    const questionCount = count || 40;

    let questions;
    if (categoryId) {
      questions = db.prepare(`
        SELECT * FROM questions 
        WHERE category_id = ? AND is_practical = 0
        ORDER BY RANDOM() 
        LIMIT ?
      `).all(categoryId, questionCount);
    } else {
      questions = db.prepare(`
        SELECT * FROM questions 
        WHERE is_practical = 0
        ORDER BY RANDOM() 
        LIMIT ?
      `).all(questionCount);
    }

    // Usuwamy poprawną odpowiedź z wyniku, żeby nie było podpowiedzi
    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      category_id: q.category_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      is_practical: q.is_practical
    }));

    res.json(sanitizedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Pobieranie wszystkich pytań (tryb nauki)
app.get('/api/questions/all', authenticateToken, (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let questions;
    if (categoryId) {
      questions = db.prepare('SELECT * FROM questions WHERE category_id = ?').all(categoryId);
    } else {
      questions = db.prepare('SELECT * FROM questions').all();
    }

    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      category_id: q.category_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      is_practical: q.is_practical,
      practical_link: q.practical_link
    }));

    res.json(sanitizedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Pobieranie pojedynczego pytania z odpowiedzią (do trybu po jednym pytaniu)
app.get('/api/questions/:id', authenticateToken, (req, res) => {
  try {
    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Pytanie nie znalezione' });
    }

    res.json({
      id: question.id,
      category_id: question.category_id,
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      is_practical: question.is_practical,
      practical_link: question.practical_link
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Sprawdzanie odpowiedzi
app.post('/api/questions/check', authenticateToken, (req, res) => {
  try {
    const { questionId, answer } = req.body;
    
    const question = db.prepare('SELECT correct_answer FROM questions WHERE id = ?').get(questionId);
    
    if (!question) {
      return res.status(404).json({ error: 'Pytanie nie znalezione' });
    }

    const isCorrect = question.correct_answer === answer;
    res.json({ correct: isCorrect, correctAnswer: question.correct_answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Zapisywanie wyniku testu
app.post('/api/tests/save', authenticateToken, (req, res) => {
  try {
    const { testType, totalQuestions, results } = req.body;
    
    const correctAnswers = results.filter(r => r.is_correct).length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const testResult = db.prepare(`
      INSERT INTO tests (user_id, test_type, total_questions, correct_answers, score)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, testType, totalQuestions, correctAnswers, score);

    const insertTestResult = db.prepare(`
      INSERT INTO test_results (test_id, question_id, user_answer, is_correct)
      VALUES (?, ?, ?, ?)
    `);

    for (const result of results) {
      insertTestResult.run(testResult.lastInsertRowid, result.questionId, result.userAnswer, result.is_correct ? 1 : 0);
    }

    res.json({ message: 'Test zapisany', testId: testResult.lastInsertRowid, score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Pobieranie historii testów użytkownika
app.get('/api/tests/history', authenticateToken, (req, res) => {
  try {
    const tests = db.prepare(`
      SELECT * FROM tests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json(tests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Pobieranie pytań praktycznych
app.get('/api/questions/practical', authenticateToken, (req, res) => {
  try {
    const questions = db.prepare('SELECT * FROM questions WHERE is_practical = 1').all();
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

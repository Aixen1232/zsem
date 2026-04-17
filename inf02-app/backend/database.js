const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'examdb.sqlite');
const db = new Database(dbPath);

// Włączanie kluczy obcych
db.pragma('foreign_keys = ON');

// Tworzenie tabel
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    is_practical INTEGER DEFAULT 0,
    practical_link TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    test_type TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    score REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER,
    question_id INTEGER,
    user_answer TEXT,
    is_correct INTEGER,
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );
`);

// Sprawdzenie czy kategorie już istnieją
const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get();

if (existingCategories.count === 0) {
  // Dodawanie kategorii
  const categories = [
    'Sieci komputerowe',
    'Systemy operacyjne',
    'Bazy danych',
    'Bezpieczeństwo IT',
    'Sprzęt komputerowy',
    'Programowanie',
    'Testy praktyczne'
  ];

  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  for (const cat of categories) {
    insertCategory.run(cat);
  }

  // Przykładowe pytania (można rozbudować o pełną listę ze strony)
  const sampleQuestions = [
    {
      category: 'Sieci komputerowe',
      question: 'Jaki protokół jest używany do przesyłania stron WWW?',
      options: { a: 'FTP', b: 'HTTP', c: 'SMTP', d: 'POP3' },
      correct: 'b',
      isPractical: 0
    },
    {
      category: 'Sieci komputerowe',
      question: 'Która klasa adresu IP zawiera najwięcej hostów?',
      options: { a: 'Klasa A', b: 'Klasa B', c: 'Klasa C', d: 'Klasa D' },
      correct: 'a',
      isPractical: 0
    },
    {
      category: 'Systemy operacyjne',
      question: 'Jaka komenda w Linux służy do zmiany katalogu?',
      options: { a: 'ls', b: 'pwd', c: 'cd', d: 'mkdir' },
      correct: 'c',
      isPractical: 0
    },
    {
      category: 'Bazy danych',
      question: 'Które polecenie SQL służy do pobierania danych?',
      options: { a: 'INSERT', b: 'UPDATE', c: 'DELETE', d: 'SELECT' },
      correct: 'd',
      isPractical: 0
    },
    {
      category: 'Bezpieczeństwo IT',
      question: 'Co oznacza skrót SSL?',
      options: { a: 'Secure Socket Layer', b: 'Simple Socket Layer', c: 'Secure System Layer', d: 'Simple System Layer' },
      correct: 'a',
      isPractical: 0
    },
    {
      category: 'Sprzęt komputerowy',
      question: 'Jaki element komputera odpowiada za przetwarzanie danych?',
      options: { a: 'RAM', b: 'CPU', c: 'GPU', d: 'HDD' },
      correct: 'b',
      isPractical: 0
    },
    {
      category: 'Programowanie',
      question: 'Który język jest używany do tworzenia stron internetowych po stronie klienta?',
      options: { a: 'Python', b: 'Java', c: 'JavaScript', d: 'C#' },
      correct: 'c',
      isPractical: 0
    },
    {
      category: 'Testy praktyczne',
      question: 'Skonfiguruj adresację IP w sieci lokalnej',
      options: { a: 'Zadanie praktyczne', b: 'Zadanie praktyczne', c: 'Zadanie praktyczne', d: 'Zadanie praktyczne' },
      correct: 'a',
      isPractical: 1,
      practicalLink: 'https://www.praktycznyegzamin.pl/ee08/praktyka/'
    },
    {
      category: 'Testy praktyczne',
      question: 'Zainstaluj i skonfiguruj serwer WWW',
      options: { a: 'Zadanie praktyczne', b: 'Zadanie praktyczne', c: 'Zadanie praktyczne', d: 'Zadanie praktyczne' },
      correct: 'a',
      isPractical: 1,
      practicalLink: 'https://www.praktycznyegzamin.pl/ee08/praktyka/'
    }
  ];

  const insertQuestion = db.prepare(`
    INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, is_practical, practical_link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const getCategory = db.prepare('SELECT id FROM categories WHERE name = ?');

  for (const q of sampleQuestions) {
    const category = getCategory.get(q.category);
    if (category) {
      insertQuestion.run(
        category.id,
        q.question,
        q.options.a,
        q.options.b,
        q.options.c,
        q.options.d,
        q.correct,
        q.isPractical,
        q.practicalLink || null
      );
    }
  }

  console.log('Baza danych została zainicjalizowana z przykładowymi danymi.');
} else {
  console.log('Baza danych już istnieje.');
}

module.exports = db;

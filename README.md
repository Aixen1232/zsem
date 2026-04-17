# Aplikacja Egzaminacyjna INF.02

Kompleksowa aplikacja webowa wspierająca przygotowanie do egzaminu zawodowego **INF.02** (Administracja i eksploatacja systemów komputerowych, urządzeń peryferyjnych i lokalnych sieci komputerowych).

## 🚀 Funkcje

- **System logowania i rejestracji**: Bezpieczne konta użytkowników z hashowaniem haseł.
- **Lokalna baza danych**: Wykorzystanie SQLite dla łatwego uruchomienia bez konieczności instalacji zewnętrznych serwerów SQL.
- **Tryby nauki**:
  - **Generator testów**: Losowa pula pytań (domyślnie 40, konfigurowalna).
  - **Tryb po jednym pytaniu**: Nauka w tempie użytkownika z natychmiastową informacją zwrotną.
  - **Przegląd pytań**: Lista wszystkich pytań z możliwością sprawdzenia odpowiedzi po kliknięciu.
- **Historia wyników**: Zapisywanie i przeglądanie rezultatów z przeprowadzonych testów.
- **Responsywny design**: Działa na komputerach, tabletach i telefonach (TailwindCSS).
- **Wsparcie dla środowisk**: Działa zarówno lokalnie, jak i na zewnętrznych serwerach (produkcyjnych).

## 🛠️ Technologie

- **Frontend**: React, TailwindCSS, Axios.
- **Backend**: Node.js, Express.
- **Baza danych**: SQLite (lokalny plik `exam.db`).
- **Autentykacja**: JWT (JSON Web Tokens), bcryptjs.

## 📋 Wymagania

- Node.js (wersja 14 lub nowsza)
- npm lub yarn

## ⚙️ Instalacja i Uruchomienie

### 1. Klonowanie repozytorium / Przygotowanie folderu
Upewnij się, że znajdujesz się w głównym folderze projektu (`/workspace`).

### 2. Instalacja zależności
Zainstaluj pakiety dla backendu i frontendu:

```bash
# Instalacja zależnośći backendu
cd backend
npm install

# Instalacja zależności frontendu
cd ../frontend
npm install
cd ..
```

### 3. Inicjalizacja bazy danych
Utwórz bazę danych i wypełnij ją przykładowymi pytaniami:

```bash
cd backend
node init-db.js
cd ..
```
*Po tym kroku w folderze `backend` powinien pojawić się plik `exam.db`.*

### 4. Konfiguracja środowiska (Opcjonalne)
W folderze `backend` możesz utworzyć plik `.env`, aby zmienić domyślne ustawienia:

```env
PORT=5000
JWT_SECRET=twoje_tajne_haslo_jwt
NODE_ENV=development
```
*Jeśli plik nie istnieje, aplikacja użyje bezpiecznych wartości domyślnych.*

### 5. Uruchomienie aplikacji

Aplikację można uruchomić na dwa sposoby:

#### Opcja A: Tryb deweloperski (dwa terminale)
Uruchom backend i frontend osobno, aby mieć dostęp do hot-reloadu podczas programowania.

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```
Serwer API będzie dostępny pod adresem `http://localhost:5000`.

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```
Aplikacja otworzy się w przeglądarce pod adresem `http://localhost:3000`. Frontend jest skonfigurowany tak, aby przekazywać żądania API do backendu przez proxy.

#### Opcja B: Tryb produkcyjny (jeden proces)
Jeśli chcesz uruchomić gotową aplikację jako całość (np. na serwerze):

1. Zbuduj frontend:
   ```bash
   cd frontend
   npm run build
   cd ..
   ```
2. Uruchom serwer:
   ```bash
   cd backend
   npm start
   ```
   Aplikacja będzie dostępna pod adresem serwera (domyślnie `http://localhost:5000`). Backend będzie serwował statyczne pliki frontendu.

## 🌍 Wdrożenie na serwer zewnętrzny

Aplikacja jest gotowa do wdrożenia na dowolnym serwerze VPS lub hostingu obsługującym Node.js.

1. **Wgraj pliki**: Prześlij cały folder projektu na serwer.
2. **Zainstaluj zależności**: Wykonaj `npm install` w folderach `backend` i `frontend`.
3. **Zbuduj frontend**: Wykonaj `npm run build` w folderze `frontend`.
4. **Zainicjuj bazę**: Uruchom `node init-db.js` w folderze `backend`.
5. **Konfiguracja**: Ustaw zmienne środowiskowe (np. `PORT`, `JWT_SECRET`) w panelu hostingu lub pliku `.env`.
6. **Uruchom**: Użyj menedżera procesu, np. **PM2**, aby utrzymać aplikację przy życiu:
   ```bash
   pm2 start backend/server.js --name inf02-app
   ```

## 📂 Struktura projektu

```
/workspace
├── backend/
│   ├── server.js        # Główny plik serwera
│   ├── init-db.js       # Skrypt inicjalizujący bazę
│   ├── exam.db          # Plik bazy danych SQLite (generowany)
│   ├── routes/          # Trasy API (auth, questions, tests)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Komponenty React
│   │   ├── pages/       # Widoki (Login, Dashboard, Test)
│   │   └── App.js       # Główny komponent
│   ├── build/           # Zbudowana wersja produkcyjna
│   └── package.json
└── README.md
```

## 🔒 Bezpieczeństwo

- Hasła są hashowane algorytmem **bcrypt** przed zapisem do bazy.
- Komunikacja między frontendem a backendem zabezpieczona tokenami **JWT**.
- **Ważne**: W wersji produkcyjnej zawsze używaj silnego, losowego hasła dla `JWT_SECRET` oraz włącz HTTPS.

## 📝 Uwagi dotyczące pytań

Aktualnie baza zawiera zestaw przykładowych pytań. Aby dodać pełną bazę pytań ze strony `praktycznyegzamin.pl`:
1. Należy przygotować plik JSON z danymi (tytuł, treść pytania, opcje, poprawna odpowiedź, kategoria).
2. Zmodyfikować plik `backend/init-db.js`, aby wczytywał dane z tego pliku zamiast przykładowych wpisów.
3. Ze względu na prawa autorskie i techniczne ograniczenia scrapingu, automatyczne pobieranie nie zostało zawarte w kodzie źródłowym.

## 🤝 Contributing

Projekt jest otwarty na rozwój. Zachęcamy do dodawania nowych funkcji, poprawek błędów czy uzupełniania bazy pytań.

## 📄 Licencja

Projekt przeznaczony do celów edukacyjnych.
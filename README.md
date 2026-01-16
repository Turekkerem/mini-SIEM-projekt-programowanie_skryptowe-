# 📘 Dokumentacja Techniczna Projektu miniSIEM

Projekt to system klasy SIEM (Security Information and Event Management) służący do monitorowania bezpieczeństwa serwerów Linux i Windows. System pobiera logi, analizuje je pod kątem ataków (Brute Force) i wyświetla alerty w panelu webowym.

---

## 📂 1. Pliki Startowe i Konfiguracyjne (Root)

Pliki znajdujące się w głównym katalogu projektu. Odpowiadają za uruchamianie środowiska.

### `run.py`
**Opis:** Główny punkt wejścia (Entry Point) aplikacji.
*   **`create_app()`**: Funkcja (zdefiniowana w `app/__init__.py`), która tworzy instancję aplikacji Flask.
*   **`app.run(host='0.0.0.0', debug=True)`**: Uruchamia serwer developerski dostępny w sieci lokalnej (`0.0.0.0`) z włączonym trybem debugowania (automatyczny restart po zmianie kodu).
*   **Zastosowanie:** Uruchamiasz ten plik komendą `python run.py`, aby włączyć stronę www.

### `config.py`
**Opis:** Klasa przechowująca ustawienia aplikacji.
*   **`SQLALCHEMY_DATABASE_URI`**: Wskazuje lokalizację pliku bazy danych SQLite (domyślnie `instance/lab7.db`).
*   **`STORAGE_FOLDER`**: Ścieżka do folderu `storage/`, gdzie zapisywane są surowe logi w formacie Parquet.
*   **`SSH_...`**: Domyślne dane uwierzytelniające (user/pass/key) używane do łączenia się z serwerami Linux.


---

## 🗄️ 2. Modele Danych i Baza (`app/models.py`)

Definicje tabel w bazie danych (ORM SQLAlchemy).

### Klasa `User`
Tabela użytkowników uprawnionych do logowania.
*   **`password_hash`**: Przechowuje hasło w formie zaszyfrowanej (nie tekst jawny).
*   **`role`**: Określa uprawnienia użytkownika (`admin` - pełny dostęp, `user` - tylko podgląd).
*   **Funkcje:**
    *   `set_password()`: Zamienia hasło na hash (biblioteka `werkzeug`).
    *   `check_password()`: Porównuje podane hasło z hashem w bazie.

### Klasa `Host`
Tabela monitorowanych maszyn.
*   **`ip_address`, `hostname`**: Dane adresowe serwera.
*   **`os_type`**: `LINUX` lub `WINDOWS` (decyduje o sposobie pobierania logów).

### Klasa `LogSource`
Status pobierania logów dla danego hosta.
*   **`last_fetch`**: Znacznik czasu ostatniego pobrania. System pobiera tylko logi nowsze niż ta data, aby uniknąć duplikatów.

### Klasa `Alert`
Tabela incydentów bezpieczeństwa (wynik analizy SIEM).
*   **`severity`**: Poziom zagrożenia (`INFO`, `WARNING`, `CRITICAL`).
*   **`message`**.

### Klasa `IPRegistry` (Threat Intel)
Baza reputacji adresów IP.
*   **`status`**: `TRUSTED` (zaufany), `BANNED` (zablokowany), `UNKNOWN` (nowy).
*   **Zastosowanie:** Służy do oznaczania ataków jako krytyczne, jeśli pochodzą ze znanych, złośliwych adresów IP.

---

## 🎮 3. Kontrolery i Widoki (`app/blueprints/`)

Obsługa zapytań HTTP i renderowanie stron.

### `auth.py`
Obsługa uwierzytelniania.
*   **`login()`**: Waliduje dane z formularza, sprawdza hasło i tworzy sesję użytkownika (`login_user`).
*   **`logout()`**: Niszczy sesję użytkownika.

### `ui.py`
Frontend aplikacji (HTML).
*   **`admin_required`**: Dekorator, który sprawdza pole `role` użytkownika. Jeśli nie jest adminem, zwraca błąd 403.
*   **`index()`**: Wyświetla Dashboard (`index.html`).
*   **`config()`**: Wyświetla Panel Administracyjny (`config.html`). Wymaga roli admina.

### `api/hosts.py`
Backendowe API (zwraca JSON dla JavaScriptu).
*   **`get_hosts() / add_host()`**: Zarządzanie listą maszyn (CRUD).
*   **`fetch_logs(host_id)`**: **Kluczowa funkcja systemu**.
    1.  Rozpoznaje system operacyjny hosta.
    2.  Uruchamia `LogCollector` do pobrania zdarzeń.
    3.  Zapisuje je przez `DataManager` (plik .parquet).
    4.  Uruchamia `LogAnalyzer` w celu wykrycia zagrożeń.
    5.  Zwraca liczbę znalezionych alertów.

---

## ⚙️ 4. Logika Biznesowa (`app/services/`)

Moduły wykonujące operacje w tle (SSH, analiza danych, pliki).

### `remote_client.py`
Klient SSH (Linux).
*   **`__enter__ / __exit__`**: Obsługa "Context Managera" (otwieranie i zamykanie połączenia automatycznie).
*   **`run(command)`**: Wykonuje komendy powłoki Bash na zdalnym serwerze i zwraca wynik.
*   **Zastosowanie:** Pobieranie logów z Linuxa, sprawdzanie zużycia RAM/CPU.

### `win_client.py`
Klient PowerShell (Windows).
*   **`run_ps(cmd)`**: Uruchamia proces PowerShell na lokalnej maszynie Windows, wykonuje skrypt i przechwytuje wynik (stdout).
*   **Zastosowanie:** Pobieranie zdarzeń z Dziennika Zdarzeń Windows (Event Log).

### `log_collector.py`
Parser logów (Normalizacja danych).
*   **`get_linux_logs()`**: Pobiera surowy JSON z `journalctl`, używa **Regex** do wyciągnięcia IP atakującego i nazwy użytkownika.
*   **`get_windows_logs()`**: Filtruje Event ID 4625 (błąd logowania) i konwertuje XML na ustrukturyzowany format JSON.

### `data_manager.py`
Obsługa magazynu plików (Storage).
*   **`save_logs_to_parquet()`**: Zapisuje listę słowników do pliku w formacie **Parquet** (wydajniejszy niż CSV). Używa biblioteki `pandas`.
*   **`load_logs()`**: Wczytuje plik z dysku do pamięci w celu analizy.

### `log_analyzer.py`
Silnik analizy zagrożeń (SIEM Engine).
*   **`analyze_parquet()`**:
    1.  Wczytuje logi.
    2.  Filtruje tylko zdarzenia typu `FAILED_LOGIN`.
    3.  Sprawdza IP w tabeli `IPRegistry`.
    4.  Jeśli IP ma status `BANNED` -> Generuje alert `CRITICAL`.
    5.  Zapisuje alerty w bazie danych.

---

## 🖥️ 5. Frontend - JavaScript (`app/static/js/`)

Logika działająca w przeglądarce użytkownika.

### `main.js`
Router frontendu.
*   Wykrywa aktualną stronę (`/` lub `/config`) i uruchamia odpowiednie skrypty inicjalizujące.

### `api.js`
Warstwa komunikacji z serwerem.
*   Zawiera funkcje typu `fetchHosts`, `createIP`, `fetchAlerts`.
*   Wysyła zapytania HTTP do `api/hosts.py` i obsługuje błędy sieciowe.

### `dashboard.js`
Logika widoku głównego (`index.html`).
*   Pobiera listę hostów i rysuje tabelę.
*   Obsługuje przyciski "Status" (monitoring live) i "Logi" (uruchomienie analizy).
*   Odświeża tabelę alertów.

### `admin.js`
Logika panelu administratora (`config.html`).
*   Obsługuje formularze dodawania/edycji hostów i adresów IP.
*   Obsługuje okna modalne (wyskakujące okienka edycji).

---
## Problemy i Historia Rozwiązań (Known Issues & Troubleshooting)

Poniższa sekcja opisuje napotkane problemy techniczne, ich obecny status oraz zastosowane rozwiązania lub obejścia.

### 1. Strefy Czasowe (Timezones)
- **Status:** ❌ **Nierozwiązany** (Błąd nadal występuje)
- **Opis:** Wyświetlany w aplikacji czas jest przesunięty o godzinę do przodu względem czasu rzeczywistego.
- **Diagnoza:** Prawdopodobnie wynika to z różnicy między czasem serwera (UTC) a czasem lokalnym klienta, lub błędnej konfiguracji `timezone` w obiekcie `datetime` Pythona/Bazy danych.

### 2. Implementacja `@admin_required`
- **Status:** ✅ **Naprawiony**
- **Opis:** Początkowo dekorator był źle zaimplementowany (zwracał funkcję zamiast wyniku) oraz używany w złej kolejności w plikach widoków.
- **Rozwiązanie:** Poprawiono strukturę dekoratora w `auth.py` i ustalono właściwą kolejność w `ui.py`: `@route` -> `@login_required` -> `@admin_required`.

### 3. Logi IP (Banned vs Trusted) i Pliki Parquet
- **Status:** ⚠️ **Niestabilny** (Działa, ale błędy wracają)
- **Opis:** System czasami błędnie wyświetla statusy adresów IP lub pokazuje je podwójnie. Wynika to z duplikowania wpisów w bazie opartej na plikach `.parquet`.
- **Analiza Techniczna i Rozwiązanie:**
    - **Przyczyna:** Pliki Parquet nie obsługują natywnie unikalności kluczy (jak bazy SQL). Jeśli skrypt dopisuje dane ("append") bez wcześniejszego sprawdzenia, powstają duplikaty wierszy. Pandas wczytuje je wszystkie, co myli logikę frontendu.
    - **Sugerowana poprawka (Fix):**
        1. **Deduplikacja przy odczycie (Frontend):** Zanim wyświetlisz dane, usuń duplikaty w Pandas:
           ```python
           threats = threats.drop_duplicates(subset=['timestamp', 'source_ip', 'alert_type'])
           [...]
           existing_alert = Alert.query.filter_by(
                host_id=host_id,
                source_ip=ip,
                alert_type=row['alert_type'],
                timestamp=row.get('timestamp')
            ).first()

            if existing_alert:
                # Jeśli alert już jest w bazie, pomijamy ten obrót pętli
                continue
            [...]

           ```

### 4. Środowisko Wirtualne (Vagrant)
- **Status:** ✅ **Naprawiony** (Zmiana podejścia)
- **Opis:** Wirtualizacja przy użyciu Vagranta powodowała zawieszanie się systemu.
- **Rozwiązanie:** Przejście na bezpośrednie połączenie SSH z maszyną oraz wykorzystanie mostkowanej karty sieciowej (Bridged Adapter).

### 5. Dark Mode (JavaScript Blocking)
- **Status:** ✅ **Naprawiony**
- **Opis:** Kod odpowiedzialny za tryb ciemny w `main.js` był wykonywany w sposób blokujący, co powodowało, że strona nie renderowała się poprawnie do momentu zakończenia skryptu.
- **Rozwiązanie:** Zmodyfikowano sposób ładowania skryptu/obsługi zdarzeń, dzięki czemu `dark_mode` działa płynnie i nie zamraża interfejsu.
### 6. Odpalenie Powershella jako admina
- **Status:** ✅ **Naprawiony**
- **Opis:** Mieliśmy sytuację w której siedzieliśmy około 40 minut i sprawdzaliśmy czemu nie ma pobieranych logów -  w konsoli pisało że błąd "PS Error:" , dopiero potem domyśliliśmy się że aby otworyć dziennik zdarzeń Security potrzeba uprawnień Administratora. *Dla usprawiedliwienia była godzina 1:30 - spokojnie ,nie wczoraj w nocy a 4 dni temu*
document.addEventListener('DOMContentLoaded', function() {
    
    const btn = document.getElementById("darkModeBtn");
    const body = document.body;
    
    // Funkcja pomocnicza do zmiany ikony i tekstu
    function updateButton(isDark) {
        if (isDark) {
            btn.innerHTML = '<i class="bi bi-sun"></i> Tryb jasny';
            btn.classList.remove('btn-outline-light');
            btn.classList.add('btn-outline-warning'); // Opcjonalnie: zmiana koloru obramowania
        } else {
            btn.innerHTML = '<i class="bi bi-moon-stars"></i> Tryb ciemny';
            btn.classList.remove('btn-outline-warning');
            btn.classList.add('btn-outline-light');
        }
    }

    // 1. Sprawdź zapisane ustawienie przy starcie strony
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        updateButton(true);
    }

    // 2. Obsługa kliknięcia
    if (btn) {
        btn.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            
            // Sprawdzamy czy klasa została dodana
            const isDarkMode = body.classList.contains("dark-mode");

            if (isDarkMode) {
                localStorage.setItem("theme", "dark");
                updateButton(true);
            } else {
                localStorage.setItem("theme", "light");
                updateButton(false);
            }
        });
    }
});
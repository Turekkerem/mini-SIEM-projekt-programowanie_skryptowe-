document.addEventListener('DOMContentLoaded', function() {
    
    const btn = document.getElementById("darkModeBtn");
    const body = document.body;
    
    
    function updateButton(isDark) {
        if (isDark) {
            btn.innerHTML = '<i class="bi bi-sun"></i> Tryb jasny';
            btn.classList.remove('btn-outline-light');
            btn.classList.add('btn-outline-warning'); 
            btn.innerHTML = '<i class="bi bi-moon-stars"></i> Tryb ciemny';
            btn.classList.remove('btn-outline-warning');
            btn.classList.add('btn-outline-light');
        }
    }

    
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        updateButton(true);
    }

    
    if (btn) {
        btn.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            
            
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
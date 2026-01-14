import { initDashboard } from './dashboard.js';
import { initAdmin } from './admin.js';


// Obsługa Dark Mode
function initDarkMode() {
    const btn = document.getElementById("darkModeBtn");
    const body = document.body;
    
    // Sprawdź zapisane ustawienie
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
    }

    btn.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        
        // Zapisz do localStorage
        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });
    setAttribute(name, value)
}



function main() {
    
    const path = window.location.pathname;

    if (path === '/' || path === '/index') {
        console.log("Inicjalizacja Dashboardu");
        initDashboard();
    } 
    else if (path === '/config') {
        console.log("Inicjalizacja Panelu Admina");
        initAdmin();
    }
}

main();
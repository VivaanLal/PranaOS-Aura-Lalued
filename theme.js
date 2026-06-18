document.addEventListener('DOMContentLoaded', () => {
    let navbar = document.getElementById('navbar');
    let hamburgerBtn = document.getElementById('hamburger-btn');
    let navMenu = document.getElementById('nav-menu');

    if (navbar && hamburgerBtn && navMenu) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        });
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    let themeBtn = document.getElementById('theme-toggle');
    let html = document.documentElement;

    function setTheme(t) {
        html.setAttribute('data-theme', t);
        if (themeBtn) themeBtn.textContent = t === 'light' ? '☀️' : '🌙';
        localStorage.setItem('pranaos-theme', t);
        document.querySelectorAll('input[type="range"]').forEach(inp => {
            let min = parseFloat(inp.min) || 0;
            let max = parseFloat(inp.max) || 100;
            let val = parseFloat(inp.value) || 0;
            let pct = ((val - min) / (max - min)) * 100;
            inp.style.background = `linear-gradient(to right, var(--accent-emerald) 0%, var(--accent-cyan) ${pct}%, var(--bg-elevated) ${pct}%)`;
        });
    }

    if (!localStorage.getItem('pranaos-theme-reset')) {
        localStorage.removeItem('pranaos-theme');
        localStorage.setItem('pranaos-theme-reset', 'true');
    }
    let saved = localStorage.getItem('pranaos-theme');
    if (!saved) {
        let h = new Date().getHours();
        saved = (h >= 18 || h < 6) ? 'dark' : 'light';
    }
    setTheme(saved);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            let cur = html.getAttribute('data-theme') || 'dark';
            setTheme(cur === 'dark' ? 'light' : 'dark');
        });
    }
});

// ─── Navbar scroll & hamburger ──────────────
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

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

    // ─── Theme Toggle ────────────────────────────
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        if (themeToggleBtn) {
            themeToggleBtn.textContent = theme === 'light' ? '☀️' : '🌙';
        }
        localStorage.setItem('pranaos-theme', theme);

        // Re-apply slider track fills (colors change per theme) - for dash.html
        document.querySelectorAll('input[type="range"]').forEach(input => {
            const min = parseFloat(input.min) || 0;
            const max = parseFloat(input.max) || 100;
            const val = parseFloat(input.value) || 0;
            const pct = ((val - min) / (max - min)) * 100;
            input.style.background = `linear-gradient(to right, var(--accent-emerald) 0%, var(--accent-cyan) ${pct}%, var(--bg-elevated) ${pct}%)`;
        });
    }

    // Restore saved theme
    const savedTheme = localStorage.getItem('pranaos-theme') || 'dark';
    if (savedTheme === 'light') setTheme('light');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme') || 'dark';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
});

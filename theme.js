
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
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        if (themeToggleBtn) {
            themeToggleBtn.textContent = theme === 'light' ? '☀️' : '🌙';
        }
        localStorage.setItem('pranaos-theme', theme);
        document.querySelectorAll('input[type="range"]').forEach(input => {
            const min = parseFloat(input.min) || 0;
            const max = parseFloat(input.max) || 100;
            const val = parseFloat(input.value) || 0;
            const pct = ((val - min) / (max - min)) * 100;
            input.style.background = `linear-gradient(to right, var(--accent-emerald) 0%, var(--accent-cyan) ${pct}%, var(--bg-elevated) ${pct}%)`;
        });
    }
    if (!localStorage.getItem('pranaos-theme-reset')) {
        localStorage.removeItem('pranaos-theme');
        localStorage.setItem('pranaos-theme-reset', 'true');
    }
    let savedTheme = localStorage.getItem('pranaos-theme');
    if (!savedTheme) {
        const hour = new Date().getHours();
        savedTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
    }
    if (savedTheme === 'light') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme') || 'dark';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const particleContainer = document.getElementById('particles');
    if (particleContainer) {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animationDuration = (8 + Math.random() * 15) + 's';
            p.style.animationDelay = Math.random() * 10 + 's';
            p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
            p.style.opacity = 0;
            const colors = ['var(--accent-emerald)', 'var(--accent-cyan)', 'var(--accent-violet)'];
            p.style.background = colors[Math.floor(Math.random() * 3)];
            particleContainer.appendChild(p);
        }
    }
    const revObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.rv, .rv-s, .rv-l, .rv-r').forEach(el => revObs.observe(el));
});
